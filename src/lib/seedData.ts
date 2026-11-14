import { Timestamp } from 'firebase/firestore';
import type { Book, Student, Rental } from '../types/database';

// ── Realistic School Book Data ──────────────────────────────────────
export const seedBooks: Book[] = [
  {
    id: 'book-001',
    title: 'Campbell Biology',
    author: 'Lisa A. Urry',
    isbn: '978-0-13-518838-0',
    subject: 'Science',
    gradeLevel: '10th Grade',
    totalCopies: 45,
    availableCopies: 12,
    coverUrl: '',
  },
  {
    id: 'book-002',
    title: 'Calculus: Early Transcendentals',
    author: 'James Stewart',
    isbn: '978-1-285-74155-0',
    subject: 'Mathematics',
    gradeLevel: '11th Grade',
    totalCopies: 40,
    availableCopies: 8,
    coverUrl: '',
  },
  {
    id: 'book-003',
    title: 'A People\'s History of the United States',
    author: 'Howard Zinn',
    isbn: '978-0-06-083865-2',
    subject: 'History',
    gradeLevel: '10th Grade',
    totalCopies: 38,
    availableCopies: 15,
    coverUrl: '',
  },
  {
    id: 'book-004',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0-7432-7356-5',
    subject: 'English',
    gradeLevel: '9th Grade',
    totalCopies: 50,
    availableCopies: 20,
    coverUrl: '',
  },
  {
    id: 'book-005',
    title: 'Physics: Principles with Applications',
    author: 'Douglas C. Giancoli',
    isbn: '978-0-321-62592-2',
    subject: 'Science',
    gradeLevel: '11th Grade',
    totalCopies: 35,
    availableCopies: 5,
    coverUrl: '',
  },
  {
    id: 'book-006',
    title: 'World Geography: Building a Global Perspective',
    author: 'Thomas J. Baerwald',
    isbn: '978-0-13-335916-5',
    subject: 'Geography',
    gradeLevel: '9th Grade',
    totalCopies: 42,
    availableCopies: 18,
    coverUrl: '',
  },
  {
    id: 'book-007',
    title: 'Chemistry: The Central Science',
    author: 'Theodore L. Brown',
    isbn: '978-0-13-441423-2',
    subject: 'Science',
    gradeLevel: '10th Grade',
    totalCopies: 44,
    availableCopies: 10,
    coverUrl: '',
  },
  {
    id: 'book-008',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0-06-112008-4',
    subject: 'English',
    gradeLevel: '10th Grade',
    totalCopies: 48,
    availableCopies: 22,
    coverUrl: '',
  },
];

// ── Realistic Student Data ──────────────────────────────────────────
export const seedStudents: Student[] = [
  { id: 'stu-001', studentId: '2026-1001', fullName: 'Maya Lin', className: '10-A', grade: 10, activeRentalsCount: 3 },
  { id: 'stu-002', studentId: '2026-1002', fullName: 'Ethan Morales', className: '10-A', grade: 10, activeRentalsCount: 2 },
  { id: 'stu-003', studentId: '2026-1003', fullName: 'Priya Sharma', className: '10-A', grade: 10, activeRentalsCount: 4 },
  { id: 'stu-004', studentId: '2026-1004', fullName: 'James O\'Brien', className: '10-A', grade: 10, activeRentalsCount: 2 },
  { id: 'stu-005', studentId: '2026-1005', fullName: 'Aisha Patel', className: '10-B', grade: 10, activeRentalsCount: 3 },
  { id: 'stu-006', studentId: '2026-1006', fullName: 'Lucas Chen', className: '10-B', grade: 10, activeRentalsCount: 2 },
  { id: 'stu-007', studentId: '2026-1007', fullName: 'Sofia Rodriguez', className: '10-B', grade: 10, activeRentalsCount: 3 },
  { id: 'stu-008', studentId: '2026-1008', fullName: 'Noah Kim', className: '10-B', grade: 10, activeRentalsCount: 1 },
  { id: 'stu-009', studentId: '2026-2001', fullName: 'Isabella Nguyen', className: '9-A', grade: 9, activeRentalsCount: 2 },
  { id: 'stu-010', studentId: '2026-2002', fullName: 'Liam Jackson', className: '9-A', grade: 9, activeRentalsCount: 3 },
  { id: 'stu-011', studentId: '2026-2003', fullName: 'Emma Davis', className: '9-A', grade: 9, activeRentalsCount: 2 },
  { id: 'stu-012', studentId: '2026-2004', fullName: 'Oliver Tanaka', className: '9-B', grade: 9, activeRentalsCount: 2 },
  { id: 'stu-013', studentId: '2026-2005', fullName: 'Zara Ahmed', className: '9-B', grade: 9, activeRentalsCount: 3 },
  { id: 'stu-014', studentId: '2026-2006', fullName: 'Daniel Park', className: '9-B', grade: 9, activeRentalsCount: 1 },
  { id: 'stu-015', studentId: '2026-3001', fullName: 'Hannah Sullivan', className: '11-A', grade: 11, activeRentalsCount: 4 },
  { id: 'stu-016', studentId: '2026-3002', fullName: 'Alexander Volkov', className: '11-A', grade: 11, activeRentalsCount: 3 },
  { id: 'stu-017', studentId: '2026-3003', fullName: 'Chloe Martinez', className: '11-A', grade: 11, activeRentalsCount: 2 },
  { id: 'stu-018', studentId: '2026-3004', fullName: 'Ryan Thompson', className: '11-A', grade: 11, activeRentalsCount: 3 },
];

// ── Helper to create Timestamps from days offset ────────────────────
function daysAgo(days: number): Timestamp {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return Timestamp.fromDate(d);
}

function daysFromNow(days: number): Timestamp {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return Timestamp.fromDate(d);
}

// ── Rental Seed Data ────────────────────────────────────────────────
export const seedRentals: Rental[] = [
  // ── Campbell Biology (book-001) rentals ──
  { id: 'rent-001', bookId: 'book-001', bookTitle: 'Campbell Biology', bookIsbn: '978-0-13-518838-0', copyBarcode: 'BIO-001', studentDocId: 'stu-001', studentSchoolId: '2026-1001', studentName: 'Maya Lin', className: '10-A', rentedAt: daysAgo(30), dueDate: daysFromNow(60), returnedAt: null, status: 'active' },
  { id: 'rent-002', bookId: 'book-001', bookTitle: 'Campbell Biology', bookIsbn: '978-0-13-518838-0', copyBarcode: 'BIO-002', studentDocId: 'stu-002', studentSchoolId: '2026-1002', studentName: 'Ethan Morales', className: '10-A', rentedAt: daysAgo(28), dueDate: daysFromNow(62), returnedAt: null, status: 'active' },
  { id: 'rent-003', bookId: 'book-001', bookTitle: 'Campbell Biology', bookIsbn: '978-0-13-518838-0', copyBarcode: 'BIO-003', studentDocId: 'stu-003', studentSchoolId: '2026-1003', studentName: 'Priya Sharma', className: '10-A', rentedAt: daysAgo(25), dueDate: daysFromNow(65), returnedAt: null, status: 'active' },
  { id: 'rent-004', bookId: 'book-001', bookTitle: 'Campbell Biology', bookIsbn: '978-0-13-518838-0', copyBarcode: 'BIO-004', studentDocId: 'stu-005', studentSchoolId: '2026-1005', studentName: 'Aisha Patel', className: '10-B', rentedAt: daysAgo(30), dueDate: daysFromNow(60), returnedAt: null, status: 'active' },
  { id: 'rent-005', bookId: 'book-001', bookTitle: 'Campbell Biology', bookIsbn: '978-0-13-518838-0', copyBarcode: 'BIO-005', studentDocId: 'stu-006', studentSchoolId: '2026-1006', studentName: 'Lucas Chen', className: '10-B', rentedAt: daysAgo(29), dueDate: daysFromNow(61), returnedAt: null, status: 'active' },
  { id: 'rent-006', bookId: 'book-001', bookTitle: 'Campbell Biology', bookIsbn: '978-0-13-518838-0', copyBarcode: 'BIO-006', studentDocId: 'stu-007', studentSchoolId: '2026-1007', studentName: 'Sofia Rodriguez', className: '10-B', rentedAt: daysAgo(27), dueDate: daysFromNow(63), returnedAt: null, status: 'active' },

  // ── Calculus (book-002) rentals ──
  { id: 'rent-007', bookId: 'book-002', bookTitle: 'Calculus: Early Transcendentals', bookIsbn: '978-1-285-74155-0', copyBarcode: 'CALC-001', studentDocId: 'stu-015', studentSchoolId: '2026-3001', studentName: 'Hannah Sullivan', className: '11-A', rentedAt: daysAgo(20), dueDate: daysFromNow(70), returnedAt: null, status: 'active' },
  { id: 'rent-008', bookId: 'book-002', bookTitle: 'Calculus: Early Transcendentals', bookIsbn: '978-1-285-74155-0', copyBarcode: 'CALC-002', studentDocId: 'stu-016', studentSchoolId: '2026-3002', studentName: 'Alexander Volkov', className: '11-A', rentedAt: daysAgo(20), dueDate: daysFromNow(70), returnedAt: null, status: 'active' },
  { id: 'rent-009', bookId: 'book-002', bookTitle: 'Calculus: Early Transcendentals', bookIsbn: '978-1-285-74155-0', copyBarcode: 'CALC-003', studentDocId: 'stu-017', studentSchoolId: '2026-3003', studentName: 'Chloe Martinez', className: '11-A', rentedAt: daysAgo(18), dueDate: daysFromNow(72), returnedAt: null, status: 'active' },
  { id: 'rent-010', bookId: 'book-002', bookTitle: 'Calculus: Early Transcendentals', bookIsbn: '978-1-285-74155-0', copyBarcode: 'CALC-004', studentDocId: 'stu-018', studentSchoolId: '2026-3004', studentName: 'Ryan Thompson', className: '11-A', rentedAt: daysAgo(15), dueDate: daysFromNow(75), returnedAt: null, status: 'active' },

  // ── History (book-003) rentals ──
  { id: 'rent-011', bookId: 'book-003', bookTitle: "A People's History of the United States", bookIsbn: '978-0-06-083865-2', copyBarcode: 'HIST-001', studentDocId: 'stu-001', studentSchoolId: '2026-1001', studentName: 'Maya Lin', className: '10-A', rentedAt: daysAgo(35), dueDate: daysFromNow(55), returnedAt: null, status: 'active' },
  { id: 'rent-012', bookId: 'book-003', bookTitle: "A People's History of the United States", bookIsbn: '978-0-06-083865-2', copyBarcode: 'HIST-002', studentDocId: 'stu-004', studentSchoolId: '2026-1004', studentName: "James O'Brien", className: '10-A', rentedAt: daysAgo(33), dueDate: daysFromNow(57), returnedAt: null, status: 'active' },
  { id: 'rent-013', bookId: 'book-003', bookTitle: "A People's History of the United States", bookIsbn: '978-0-06-083865-2', copyBarcode: 'HIST-003', studentDocId: 'stu-005', studentSchoolId: '2026-1005', studentName: 'Aisha Patel', className: '10-B', rentedAt: daysAgo(30), dueDate: daysFromNow(60), returnedAt: null, status: 'active' },

  // ── The Great Gatsby (book-004) rentals ──
  { id: 'rent-014', bookId: 'book-004', bookTitle: 'The Great Gatsby', bookIsbn: '978-0-7432-7356-5', copyBarcode: 'ENG-001', studentDocId: 'stu-009', studentSchoolId: '2026-2001', studentName: 'Isabella Nguyen', className: '9-A', rentedAt: daysAgo(14), dueDate: daysFromNow(76), returnedAt: null, status: 'active' },
  { id: 'rent-015', bookId: 'book-004', bookTitle: 'The Great Gatsby', bookIsbn: '978-0-7432-7356-5', copyBarcode: 'ENG-002', studentDocId: 'stu-010', studentSchoolId: '2026-2002', studentName: 'Liam Jackson', className: '9-A', rentedAt: daysAgo(14), dueDate: daysFromNow(76), returnedAt: null, status: 'active' },
  { id: 'rent-016', bookId: 'book-004', bookTitle: 'The Great Gatsby', bookIsbn: '978-0-7432-7356-5', copyBarcode: 'ENG-003', studentDocId: 'stu-011', studentSchoolId: '2026-2003', studentName: 'Emma Davis', className: '9-A', rentedAt: daysAgo(12), dueDate: daysFromNow(78), returnedAt: null, status: 'active' },
  { id: 'rent-017', bookId: 'book-004', bookTitle: 'The Great Gatsby', bookIsbn: '978-0-7432-7356-5', copyBarcode: 'ENG-004', studentDocId: 'stu-012', studentSchoolId: '2026-2004', studentName: 'Oliver Tanaka', className: '9-B', rentedAt: daysAgo(10), dueDate: daysFromNow(80), returnedAt: null, status: 'active' },
  { id: 'rent-018', bookId: 'book-004', bookTitle: 'The Great Gatsby', bookIsbn: '978-0-7432-7356-5', copyBarcode: 'ENG-005', studentDocId: 'stu-013', studentSchoolId: '2026-2005', studentName: 'Zara Ahmed', className: '9-B', rentedAt: daysAgo(10), dueDate: daysFromNow(80), returnedAt: null, status: 'active' },

  // ── Physics (book-005) rentals ──
  { id: 'rent-019', bookId: 'book-005', bookTitle: 'Physics: Principles with Applications', bookIsbn: '978-0-321-62592-2', copyBarcode: 'PHY-001', studentDocId: 'stu-015', studentSchoolId: '2026-3001', studentName: 'Hannah Sullivan', className: '11-A', rentedAt: daysAgo(22), dueDate: daysFromNow(68), returnedAt: null, status: 'active' },
  { id: 'rent-020', bookId: 'book-005', bookTitle: 'Physics: Principles with Applications', bookIsbn: '978-0-321-62592-2', copyBarcode: 'PHY-002', studentDocId: 'stu-016', studentSchoolId: '2026-3002', studentName: 'Alexander Volkov', className: '11-A', rentedAt: daysAgo(22), dueDate: daysFromNow(68), returnedAt: null, status: 'active' },
  { id: 'rent-021', bookId: 'book-005', bookTitle: 'Physics: Principles with Applications', bookIsbn: '978-0-321-62592-2', copyBarcode: 'PHY-003', studentDocId: 'stu-018', studentSchoolId: '2026-3004', studentName: 'Ryan Thompson', className: '11-A', rentedAt: daysAgo(20), dueDate: daysFromNow(70), returnedAt: null, status: 'active' },

  // ── Geography (book-006) rentals ──
  { id: 'rent-022', bookId: 'book-006', bookTitle: 'World Geography: Building a Global Perspective', bookIsbn: '978-0-13-335916-5', copyBarcode: 'GEO-001', studentDocId: 'stu-009', studentSchoolId: '2026-2001', studentName: 'Isabella Nguyen', className: '9-A', rentedAt: daysAgo(25), dueDate: daysFromNow(65), returnedAt: null, status: 'active' },
  { id: 'rent-023', bookId: 'book-006', bookTitle: 'World Geography: Building a Global Perspective', bookIsbn: '978-0-13-335916-5', copyBarcode: 'GEO-002', studentDocId: 'stu-013', studentSchoolId: '2026-2005', studentName: 'Zara Ahmed', className: '9-B', rentedAt: daysAgo(25), dueDate: daysFromNow(65), returnedAt: null, status: 'active' },
  { id: 'rent-024', bookId: 'book-006', bookTitle: 'World Geography: Building a Global Perspective', bookIsbn: '978-0-13-335916-5', copyBarcode: 'GEO-003', studentDocId: 'stu-014', studentSchoolId: '2026-2006', studentName: 'Daniel Park', className: '9-B', rentedAt: daysAgo(20), dueDate: daysFromNow(70), returnedAt: null, status: 'active' },

  // ── Chemistry (book-007) rentals ──
  { id: 'rent-025', bookId: 'book-007', bookTitle: 'Chemistry: The Central Science', bookIsbn: '978-0-13-441423-2', copyBarcode: 'CHEM-001', studentDocId: 'stu-003', studentSchoolId: '2026-1003', studentName: 'Priya Sharma', className: '10-A', rentedAt: daysAgo(28), dueDate: daysFromNow(62), returnedAt: null, status: 'active' },
  { id: 'rent-026', bookId: 'book-007', bookTitle: 'Chemistry: The Central Science', bookIsbn: '978-0-13-441423-2', copyBarcode: 'CHEM-002', studentDocId: 'stu-007', studentSchoolId: '2026-1007', studentName: 'Sofia Rodriguez', className: '10-B', rentedAt: daysAgo(26), dueDate: daysFromNow(64), returnedAt: null, status: 'active' },
  { id: 'rent-027', bookId: 'book-007', bookTitle: 'Chemistry: The Central Science', bookIsbn: '978-0-13-441423-2', copyBarcode: 'CHEM-003', studentDocId: 'stu-008', studentSchoolId: '2026-1008', studentName: 'Noah Kim', className: '10-B', rentedAt: daysAgo(24), dueDate: daysFromNow(66), returnedAt: null, status: 'active' },

  // ── To Kill a Mockingbird (book-008) rentals ──
  { id: 'rent-028', bookId: 'book-008', bookTitle: 'To Kill a Mockingbird', bookIsbn: '978-0-06-112008-4', copyBarcode: 'ENG2-001', studentDocId: 'stu-001', studentSchoolId: '2026-1001', studentName: 'Maya Lin', className: '10-A', rentedAt: daysAgo(40), dueDate: daysFromNow(50), returnedAt: null, status: 'active' },
  { id: 'rent-029', bookId: 'book-008', bookTitle: 'To Kill a Mockingbird', bookIsbn: '978-0-06-112008-4', copyBarcode: 'ENG2-002', studentDocId: 'stu-004', studentSchoolId: '2026-1004', studentName: "James O'Brien", className: '10-A', rentedAt: daysAgo(38), dueDate: daysFromNow(52), returnedAt: null, status: 'active' },
  { id: 'rent-030', bookId: 'book-008', bookTitle: 'To Kill a Mockingbird', bookIsbn: '978-0-06-112008-4', copyBarcode: 'ENG2-003', studentDocId: 'stu-010', studentSchoolId: '2026-2002', studentName: 'Liam Jackson', className: '9-A', rentedAt: daysAgo(35), dueDate: daysFromNow(55), returnedAt: null, status: 'active' },
  { id: 'rent-031', bookId: 'book-008', bookTitle: 'To Kill a Mockingbird', bookIsbn: '978-0-06-112008-4', copyBarcode: 'ENG2-004', studentDocId: 'stu-011', studentSchoolId: '2026-2003', studentName: 'Emma Davis', className: '9-A', rentedAt: daysAgo(35), dueDate: daysFromNow(55), returnedAt: null, status: 'active' },

  // ── Extra rentals for Priya Sharma (showing more books per student) ──
  { id: 'rent-032', bookId: 'book-003', bookTitle: "A People's History of the United States", bookIsbn: '978-0-06-083865-2', copyBarcode: 'HIST-004', studentDocId: 'stu-003', studentSchoolId: '2026-1003', studentName: 'Priya Sharma', className: '10-A', rentedAt: daysAgo(32), dueDate: daysFromNow(58), returnedAt: null, status: 'active' },
  { id: 'rent-033', bookId: 'book-008', bookTitle: 'To Kill a Mockingbird', bookIsbn: '978-0-06-112008-4', copyBarcode: 'ENG2-005', studentDocId: 'stu-003', studentSchoolId: '2026-1003', studentName: 'Priya Sharma', className: '10-A', rentedAt: daysAgo(30), dueDate: daysFromNow(60), returnedAt: null, status: 'active' },

  // ── Extra rentals for Hannah Sullivan (11-A heavy reader) ──
  { id: 'rent-034', bookId: 'book-003', bookTitle: "A People's History of the United States", bookIsbn: '978-0-06-083865-2', copyBarcode: 'HIST-005', studentDocId: 'stu-015', studentSchoolId: '2026-3001', studentName: 'Hannah Sullivan', className: '11-A', rentedAt: daysAgo(25), dueDate: daysFromNow(65), returnedAt: null, status: 'active' },
  { id: 'rent-035', bookId: 'book-008', bookTitle: 'To Kill a Mockingbird', bookIsbn: '978-0-06-112008-4', copyBarcode: 'ENG2-006', studentDocId: 'stu-015', studentSchoolId: '2026-3001', studentName: 'Hannah Sullivan', className: '11-A', rentedAt: daysAgo(20), dueDate: daysFromNow(70), returnedAt: null, status: 'active' },

  // ── Extra for Alexander Volkov ──
  { id: 'rent-036', bookId: 'book-007', bookTitle: 'Chemistry: The Central Science', bookIsbn: '978-0-13-441423-2', copyBarcode: 'CHEM-004', studentDocId: 'stu-016', studentSchoolId: '2026-3002', studentName: 'Alexander Volkov', className: '11-A', rentedAt: daysAgo(18), dueDate: daysFromNow(72), returnedAt: null, status: 'active' },

  // ── Extra for Liam Jackson ──
  { id: 'rent-037', bookId: 'book-006', bookTitle: 'World Geography: Building a Global Perspective', bookIsbn: '978-0-13-335916-5', copyBarcode: 'GEO-004', studentDocId: 'stu-010', studentSchoolId: '2026-2002', studentName: 'Liam Jackson', className: '9-A', rentedAt: daysAgo(18), dueDate: daysFromNow(72), returnedAt: null, status: 'active' },

  // ── Extra for Zara Ahmed ──
  { id: 'rent-038', bookId: 'book-008', bookTitle: 'To Kill a Mockingbird', bookIsbn: '978-0-06-112008-4', copyBarcode: 'ENG2-007', studentDocId: 'stu-013', studentSchoolId: '2026-2005', studentName: 'Zara Ahmed', className: '9-B', rentedAt: daysAgo(15), dueDate: daysFromNow(75), returnedAt: null, status: 'active' },

  // ── Extra for Ryan Thompson ──
  { id: 'rent-039', bookId: 'book-008', bookTitle: 'To Kill a Mockingbird', bookIsbn: '978-0-06-112008-4', copyBarcode: 'ENG2-008', studentDocId: 'stu-018', studentSchoolId: '2026-3004', studentName: 'Ryan Thompson', className: '11-A', rentedAt: daysAgo(12), dueDate: daysFromNow(78), returnedAt: null, status: 'active' },

  // ── Ethan Morales second book ──
  { id: 'rent-040', bookId: 'book-007', bookTitle: 'Chemistry: The Central Science', bookIsbn: '978-0-13-441423-2', copyBarcode: 'CHEM-005', studentDocId: 'stu-002', studentSchoolId: '2026-1002', studentName: 'Ethan Morales', className: '10-A', rentedAt: daysAgo(22), dueDate: daysFromNow(68), returnedAt: null, status: 'active' },

  // ── Sofia Rodriguez third book ──
  { id: 'rent-041', bookId: 'book-003', bookTitle: "A People's History of the United States", bookIsbn: '978-0-06-083865-2', copyBarcode: 'HIST-006', studentDocId: 'stu-007', studentSchoolId: '2026-1007', studentName: 'Sofia Rodriguez', className: '10-B', rentedAt: daysAgo(28), dueDate: daysFromNow(62), returnedAt: null, status: 'active' },

  // ── Aisha Patel third book ──
  { id: 'rent-042', bookId: 'book-007', bookTitle: 'Chemistry: The Central Science', bookIsbn: '978-0-13-441423-2', copyBarcode: 'CHEM-006', studentDocId: 'stu-005', studentSchoolId: '2026-1005', studentName: 'Aisha Patel', className: '10-B', rentedAt: daysAgo(20), dueDate: daysFromNow(70), returnedAt: null, status: 'active' },

  // ── Chloe Martinez second book ──
  { id: 'rent-043', bookId: 'book-005', bookTitle: 'Physics: Principles with Applications', bookIsbn: '978-0-321-62592-2', copyBarcode: 'PHY-004', studentDocId: 'stu-017', studentSchoolId: '2026-3003', studentName: 'Chloe Martinez', className: '11-A', rentedAt: daysAgo(18), dueDate: daysFromNow(72), returnedAt: null, status: 'active' },
];
