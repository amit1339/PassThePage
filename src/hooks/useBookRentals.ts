import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { seedBooks, seedRentals } from '../lib/seedData';
import type { Book, Rental } from '../types/database';

export function useBookRentals(searchQuery: string) {
  const [books, setBooks] = useState<Book[]>([]);
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

  // Keep selectedBook updated if Firestore document changes
  useEffect(() => {
    if (selectedBook) {
      const latest = books.find((b) => b.id === selectedBook.id);
      if (
        latest &&
        (latest.title !== selectedBook.title ||
          latest.isbn !== selectedBook.isbn ||
          latest.totalCopies !== selectedBook.totalCopies ||
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

  // Mark a rental as returned
  const markReturned = useCallback(async (rentalId: string) => {
    if (!isFirebaseConfigured || !db) {
      setRentals((prev) => prev.filter((r) => r.id !== rentalId));
      return;
    }
    await updateDoc(doc(db, 'rentals', rentalId), {
      status: 'returned',
      returnedAt: Timestamp.now(),
    });
  }, []);

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
    filteredBooks,
    selectedBook,
    setSelectedBook,
    rentals,
    groupedRentals,
    loading,
    markReturned,
    deleteBook,
  };
}
