import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
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
        (r) => r.studentDocId === selectedStudent.id && r.status === 'active'
      );
      setRentals(studentRentals);
      return;
    }

    const q = query(
      collection(db, 'rentals'),
      where('studentDocId', '==', selectedStudent.id),
      where('status', '==', 'active')
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
        setRentals((prev) => prev.filter((r) => r.id !== rentalId));
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
    async (bookId: string, copyBarcode: string) => {
      if (!selectedStudent) return;

      const book = allBooks.find((b) => b.id === bookId);
      if (!book) return;

      const check = isGradeEligible(selectedStudent.grade, book.gradeLevel);
      if (!check.eligible) {
        throw new Error(check.reason || `Grade ${selectedStudent.grade} students cannot borrow Grade ${check.bookGrade} textbooks.`);
      }

      const newRental: Omit<Rental, 'id'> = {
        bookId: book.id,
        bookTitle: book.title,
        bookIsbn: book.isbn,
        copyBarcode,
        studentDocId: selectedStudent.id,
        studentSchoolId: selectedStudent.studentId,
        studentName: selectedStudent.fullName,
        className: selectedStudent.className,
        rentedAt: Timestamp.now(),
        dueDate: Timestamp.fromDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
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

  return {
    students,
    filteredStudents,
    selectedStudent,
    setSelectedStudent,
    rentals,
    loading,
    returnBook,
    assignBook,
    books: allBooks,
  };
}
