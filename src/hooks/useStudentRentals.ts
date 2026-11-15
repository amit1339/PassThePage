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
import { seedStudents, seedRentals, seedBooks } from '../lib/seedData';
import { isGradeEligible } from '../lib/gradeUtils';
import type { Student, Rental, Book } from '../types/database';

export function useStudentRentals(searchQuery: string) {
  const [students, setStudents] = useState<Student[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  // Load students — only seed when Firebase is NOT configured
  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setStudents(seedStudents);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      collection(db, 'students'),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Student));
        setStudents(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to students:', err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  // Keep selectedStudent synced with latest student data
  useEffect(() => {
    if (selectedStudent) {
      const latest = students.find((s) => s.id === selectedStudent.id);
      if (
        latest &&
        (latest.fullName !== selectedStudent.fullName ||
          latest.studentId !== selectedStudent.studentId ||
          latest.className !== selectedStudent.className ||
          latest.grade !== selectedStudent.grade ||
          latest.activeRentalsCount !== selectedStudent.activeRentalsCount)
      ) {
        setSelectedStudent(latest);
      }
    }
  }, [students, selectedStudent]);

  // Load books for the assign modal
  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setAllBooks(seedBooks);
      return;
    }

    const unsub = onSnapshot(
      collection(db, 'books'),
      (snap) => {
        setAllBooks(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Book)));
      },
      (err) => {
        console.error('Error listening to books:', err);
      }
    );
    return unsub;
  }, []);

  // Filter students by search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  // Load rentals for selected student
  useEffect(() => {
    if (!selectedStudent) {
      setRentals([]);
      return;
    }

    if (!isFirebaseConfigured || !db) {
      const studentRentals = seedRentals.filter(
        (r) => r.studentDocId === selectedStudent.id
      );
      setRentals(studentRentals);
      return;
    }

    const q = query(
      collection(db, 'rentals'),
      where('studentDocId', '==', selectedStudent.id)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRentals(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Rental)));
      },
      (err) => {
        console.error('Error listening to student rentals:', err);
      }
    );
    return unsub;
  }, [selectedStudent]);

  // Return a book
  const returnBook = useCallback(
    async (rentalId: string) => {
      if (!isFirebaseConfigured || !db) {
        setRentals((prev) =>
          prev.map((r) =>
            r.id === rentalId
              ? { ...r, status: 'returned', returnedAt: Timestamp.now() }
              : r
          )
        );
        return;
      }
      await updateDoc(doc(db, 'rentals', rentalId), {
        status: 'returned',
        returnedAt: Timestamp.now(),
      });

      if (selectedStudent) {
        try {
          await updateDoc(doc(db, 'students', selectedStudent.id), {
            activeRentalsCount: Math.max(0, (selectedStudent.activeRentalsCount || 1) - 1),
          });
        } catch (e) {
          console.warn('Could not decrement count:', e);
        }
      }
    },
    [selectedStudent]
  );

  // Assign a book to the selected student
  const assignBook = useCallback(
    async (bookId: string, copyBarcode: string, issueDate?: string | Date) => {
      if (!selectedStudent) return;

      const book = allBooks.find((b) => b.id === bookId);
      if (!book) return;

      const check = isGradeEligible(selectedStudent.grade, book.gradeLevel);
      if (!check.eligible) {
        throw new Error(check.reason || `Grade ${selectedStudent.grade} students cannot borrow Grade ${check.bookGrade} textbooks.`);
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
        bookId: book.id,
        bookTitle: book.title,
        bookIsbn: book.isbn || '',
        copyBarcode,
        studentDocId: selectedStudent.id,
        studentSchoolId: selectedStudent.studentId,
        studentName: selectedStudent.fullName,
        className: selectedStudent.className,
        rentedAt: rentTimestamp,
        dueDate: Timestamp.fromDate(dueDateObj),
        returnedAt: null,
        status: 'active',
      };

      if (!isFirebaseConfigured || !db) {
        const fakeId = 'rent-new-' + Date.now();
        setRentals((prev) => [...prev, { id: fakeId, ...newRental }]);
        return;
      }

      await addDoc(collection(db, 'rentals'), newRental);

      try {
        await updateDoc(doc(db, 'students', selectedStudent.id), {
          activeRentalsCount: (selectedStudent.activeRentalsCount || 0) + 1,
        });
        if (typeof book.availableCopies === 'number') {
          await updateDoc(doc(db, 'books', book.id), {
            availableCopies: Math.max(0, book.availableCopies - 1),
          });
        }
      } catch (e) {
        console.warn('Could not update counts on assign:', e);
      }
    },
    [selectedStudent, allBooks]
  );

  const activeRentals = useMemo(
    () => rentals.filter((r) => r.status === 'active'),
    [rentals]
  );

  const returnedRentals = useMemo(
    () =>
      rentals
        .filter((r) => r.status === 'returned')
        .sort((a, b) => {
          const timeA = a.returnedAt?.seconds || 0;
          const timeB = b.returnedAt?.seconds || 0;
          return timeB - timeA;
        }),
    [rentals]
  );

  // Update student details
  const updateStudent = useCallback(
    async (studentDocId: string, updatedData: Partial<Student>) => {
      if (!isFirebaseConfigured || !db) {
        setStudents((prev) =>
          prev.map((s) => (s.id === studentDocId ? { ...s, ...updatedData } : s))
        );
        if (selectedStudent?.id === studentDocId) {
          setSelectedStudent((prev) => (prev ? { ...prev, ...updatedData } : null));
        }
        return;
      }
      await updateDoc(doc(db, 'students', studentDocId), updatedData);
      if (selectedStudent?.id === studentDocId) {
        setSelectedStudent((prev) => (prev ? { ...prev, ...updatedData } : null));
      }
    },
    [selectedStudent]
  );

  // Delete student from directory
  const deleteStudent = useCallback(
    async (studentDocId: string) => {
      if (!isFirebaseConfigured || !db) {
        setStudents((prev) => prev.filter((s) => s.id !== studentDocId));
        if (selectedStudent?.id === studentDocId) {
          setSelectedStudent(null);
        }
        return;
      }
      await deleteDoc(doc(db, 'students', studentDocId));
      if (selectedStudent?.id === studentDocId) {
        setSelectedStudent(null);
      }
    },
    [selectedStudent]
  );

  return {
    students,
    filteredStudents,
    selectedStudent,
    setSelectedStudent,
    rentals: activeRentals,
    activeRentals,
    returnedRentals,
    allStudentRentals: rentals,
    loading,
    returnBook,
    assignBook,
    updateStudent,
    deleteStudent,
    books: allBooks,
  };
}
