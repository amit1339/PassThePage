import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { seedBooks, seedRentals, seedStudents } from '../lib/seedData';
import { isGradeEligible } from '../lib/gradeUtils';
import type { Book, Rental, Student } from '../types/database';

export function useBookRentals(searchQuery: string) {
  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  // Load books — only use seed data when Firebase is NOT configured
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setBooks(seedBooks);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      collection(db!, 'books'),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Book));
        setBooks(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to books:', err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  // Load students for assignment modal
  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setStudents(seedStudents);
      return;
    }

    const unsub = onSnapshot(
      collection(db, 'students'),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Student));
        setStudents(data);
      },
      (err) => {
        console.error('Error listening to students in useBookRentals:', err);
      }
    );
    return unsub;
  }, []);

  // Keep selectedBook updated if Firestore document changes
  useEffect(() => {
    if (selectedBook) {
      const latest = books.find((b) => b.id === selectedBook.id);
      if (
        latest &&
        (latest.title !== selectedBook.title ||
          latest.isbn !== selectedBook.isbn ||
          latest.totalCopies !== selectedBook.totalCopies ||
          latest.availableCopies !== selectedBook.availableCopies ||
          latest.subject !== selectedBook.subject ||
          latest.gradeLevel !== selectedBook.gradeLevel)
      ) {
        setSelectedBook(latest);
      }
    }
  }, [books, selectedBook]);

  // Filter books by search query
  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const q = searchQuery.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.subject.toLowerCase().includes(q) ||
        (b.isbn && b.isbn.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q))
    );
  }, [books, searchQuery]);

  // Load rentals for selected book
  useEffect(() => {
    if (!selectedBook) {
      setRentals([]);
      return;
    }

    if (!isFirebaseConfigured) {
      const bookRentals = seedRentals.filter(
        (r) => r.bookId === selectedBook.id && r.status === 'active'
      );
      setRentals(bookRentals);
      return;
    }

    const q = query(
      collection(db!, 'rentals'),
      where('bookId', '==', selectedBook.id),
      where('status', '==', 'active')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRentals(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Rental)));
      },
      (err) => {
        console.error('Error listening to book rentals:', err);
      }
    );
    return unsub;
  }, [selectedBook]);

  // Group rentals by className
  const groupedRentals = useMemo(() => {
    const grouped: Record<string, Rental[]> = {};
    rentals.forEach((r) => {
      if (!grouped[r.className]) grouped[r.className] = [];
      grouped[r.className].push(r);
    });
    const sorted: Record<string, Rental[]> = {};
    Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .forEach((k) => {
        sorted[k] = grouped[k];
      });
    return sorted;
  }, [rentals]);

  // Assign this selected book to a student
  const assignStudent = useCallback(
    async (student: Student, copyBarcode: string, issueDate?: string | Date) => {
      if (!selectedBook) return;

      const check = isGradeEligible(student.grade, selectedBook.gradeLevel);
      if (!check.eligible) {
        throw new Error(check.reason || `Grade ${student.grade} students cannot borrow Grade ${check.bookGrade} textbooks.`);
      }

      const alreadyActive = rentals.some(
        (r) =>
          (r.studentDocId === student.id || r.studentSchoolId === student.studentId) &&
          (r.status === 'active' || !r.returnedAt)
      );
      if (alreadyActive) {
        throw new Error('This student already holds an active copy of this textbook.');
      }

      let rentTimestamp: Timestamp;
      if (issueDate) {
        if (issueDate instanceof Date) {
          rentTimestamp = Timestamp.fromDate(issueDate);
        } else {
          const parsed = new Date(issueDate.includes('T') ? issueDate : `${issueDate}T12:00:00`);
          rentTimestamp = isNaN(parsed.getTime()) ? Timestamp.now() : Timestamp.fromDate(parsed);
        }
      } else {
        rentTimestamp = Timestamp.now();
      }

      const rentDateObj = rentTimestamp.toDate();
      const dueDateObj = new Date(rentDateObj.getTime() + 90 * 24 * 60 * 60 * 1000);

      const newRental: Omit<Rental, 'id'> = {
        bookId: selectedBook.id,
        bookTitle: selectedBook.title,
        bookIsbn: selectedBook.isbn || '',
        copyBarcode,
        studentDocId: student.id,
        studentSchoolId: student.studentId,
        studentName: student.fullName,
        className: student.className,
        rentedAt: rentTimestamp,
        dueDate: Timestamp.fromDate(dueDateObj),
        returnedAt: null,
        status: 'active',
      };

      if (!isFirebaseConfigured || !db) {
        const fakeId = 'rent-new-' + Date.now();
        setRentals((prev) => [...prev, { id: fakeId, ...newRental }]);
        setSelectedBook((prev) =>
          prev
            ? { ...prev, availableCopies: Math.max(0, (prev.availableCopies ?? prev.totalCopies) - 1) }
            : null
        );
        setBooks((prev) =>
          prev.map((b) =>
            b.id === selectedBook.id
              ? { ...b, availableCopies: Math.max(0, (b.availableCopies ?? b.totalCopies) - 1) }
              : b
          )
        );
        return;
      }

      await addDoc(collection(db, 'rentals'), newRental);

      try {
        await updateDoc(doc(db, 'students', student.id), {
          activeRentalsCount: (student.activeRentalsCount || 0) + 1,
        });
        if (typeof selectedBook.availableCopies === 'number') {
          await updateDoc(doc(db, 'books', selectedBook.id), {
            availableCopies: Math.max(0, selectedBook.availableCopies - 1),
          });
        }
      } catch (e) {
        console.warn('Could not update counts on assignStudent:', e);
      }
    },
    [selectedBook, rentals]
  );

  // Mark a rental as returned
  const markReturned = useCallback(
    async (rentalId: string) => {
      const targetRental = rentals.find((r) => r.id === rentalId);

      if (!isFirebaseConfigured || !db) {
        setRentals((prev) => prev.filter((r) => r.id !== rentalId));
        if (selectedBook) {
          setSelectedBook((prev) =>
            prev
              ? { ...prev, availableCopies: Math.min(prev.totalCopies, (prev.availableCopies ?? 0) + 1) }
              : null
          );
          setBooks((prev) =>
            prev.map((b) =>
              b.id === selectedBook.id
                ? { ...b, availableCopies: Math.min(b.totalCopies, (b.availableCopies ?? 0) + 1) }
                : b
            )
          );
        }
        return;
      }

      await updateDoc(doc(db, 'rentals', rentalId), {
        status: 'returned',
        returnedAt: Timestamp.now(),
      });

      if (selectedBook && typeof selectedBook.availableCopies === 'number') {
        try {
          await updateDoc(doc(db, 'books', selectedBook.id), {
            availableCopies: Math.min(selectedBook.totalCopies, selectedBook.availableCopies + 1),
          });
        } catch (e) {
          console.warn('Could not increment available copies on return:', e);
        }
      }

      if (targetRental?.studentDocId) {
        try {
          const studentDocRef = doc(db, 'students', targetRental.studentDocId);
          const studentDoc = students.find((s) => s.id === targetRental.studentDocId);
          if (studentDoc) {
            await updateDoc(studentDocRef, {
              activeRentalsCount: Math.max(0, (studentDoc.activeRentalsCount || 1) - 1),
            });
          }
        } catch (e) {
          console.warn('Could not decrement student count on return:', e);
        }
      }
    },
    [rentals, selectedBook, students]
  );

  // Delete a rental record (e.g. created by mistake)
  const deleteRental = useCallback(
    async (rentalId: string) => {
      const targetRental = rentals.find((r) => r.id === rentalId);
      const isActive = targetRental ? targetRental.status === 'active' || !targetRental.returnedAt : false;

      if (!isFirebaseConfigured || !db) {
        setRentals((prev) => prev.filter((r) => r.id !== rentalId));
        if (isActive && selectedBook) {
          setSelectedBook((prev) =>
            prev
              ? { ...prev, availableCopies: Math.min(prev.totalCopies, (prev.availableCopies ?? 0) + 1) }
              : null
          );
          setBooks((prev) =>
            prev.map((b) =>
              b.id === selectedBook.id
                ? { ...b, availableCopies: Math.min(b.totalCopies, (b.availableCopies ?? 0) + 1) }
                : b
            )
          );
        }
        return;
      }

      await deleteDoc(doc(db, 'rentals', rentalId));
      setRentals((prev) => prev.filter((r) => r.id !== rentalId));

      if (isActive) {
        if (selectedBook && typeof selectedBook.availableCopies === 'number') {
          try {
            await updateDoc(doc(db, 'books', selectedBook.id), {
              availableCopies: Math.min(selectedBook.totalCopies, selectedBook.availableCopies + 1),
            });
          } catch (e) {
            console.warn('Could not increment book available copies on delete rental:', e);
          }
        }

        if (targetRental?.studentDocId) {
          try {
            const studentDoc = students.find((s) => s.id === targetRental.studentDocId);
            if (studentDoc) {
              await updateDoc(doc(db, 'students', targetRental.studentDocId), {
                activeRentalsCount: Math.max(0, (studentDoc.activeRentalsCount || 1) - 1),
              });
            }
          } catch (e) {
            console.warn('Could not decrement student count on delete rental:', e);
          }
        }
      }
    },
    [rentals, selectedBook, students]
  );

  // Delete a book from catalog
  const deleteBook = useCallback(
    async (bookId: string) => {
      if (!isFirebaseConfigured || !db) {
        setBooks((prev) => prev.filter((b) => b.id !== bookId));
        if (selectedBook?.id === bookId) setSelectedBook(null);
        return;
      }
      await deleteDoc(doc(db, 'books', bookId));
      if (selectedBook?.id === bookId) setSelectedBook(null);
    },
    [selectedBook]
  );

  return {
    books,
    students,
    filteredBooks,
    selectedBook,
    setSelectedBook,
    rentals,
    groupedRentals,
    loading,
    markReturned,
    assignStudent,
    deleteRental,
    deleteBook,
  };
}
