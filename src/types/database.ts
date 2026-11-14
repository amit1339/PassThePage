import type { Timestamp } from 'firebase/firestore';

export interface Book {
  id: string;
  title: string;
  author?: string; // Optional / deprecated as per user requirement
  isbn?: string; // Optional as per user requirement ("remove the isbn i dont need it")
  subject: string;
  gradeLevel: string;
  totalCopies: number;
  availableCopies: number;
  coverUrl?: string;
}

export interface Student {
  id: string;
  studentId: string;
  fullName: string;
  className: string;
  grade: number;
  activeRentalsCount: number;
}

export interface Rental {
  id: string;
  bookId: string;
  bookTitle: string;
  bookIsbn?: string;
  copyBarcode: string;
  studentDocId: string;
  studentSchoolId: string;
  studentName: string;
  className: string;
  rentedAt: Timestamp;
  dueDate: Timestamp;
  returnedAt: Timestamp | null;
  status: 'active' | 'returned' | 'overdue';
}
