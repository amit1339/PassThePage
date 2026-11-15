import * as XLSX from 'xlsx';
import { collection, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { seedRentals, seedStudents } from './seedData';
import type { Rental, Student } from '../types/database';

function formatDate(val: any): string {
  if (!val) return '';
  let d: Date | null = null;
  if (val.toDate && typeof val.toDate === 'function') {
    d = val.toDate();
  } else if (val instanceof Date) {
    d = val;
  } else if (typeof val === 'object' && val.seconds !== undefined) {
    d = new Date(val.seconds * 1000);
  } else if (typeof val === 'string' || typeof val === 'number') {
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) d = parsed;
  }

  if (!d || isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export async function exportBorrowingsToExcel(): Promise<{ count: number; filename: string }> {
  let rentals: Rental[] = [];
  let students: Student[] = [];

  if (isFirebaseConfigured && db) {
    try {
      const [rentalsSnap, studentsSnap] = await Promise.all([
        getDocs(collection(db, 'rentals')),
        getDocs(collection(db, 'students')),
      ]);

      rentals = rentalsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Rental));
      students = studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Student));
    } catch (err) {
      console.error('Error fetching data from Firestore for Excel export:', err);
      // Fallback to seeds if network error
      rentals = seedRentals;
      students = seedStudents;
    }
  } else {
    rentals = seedRentals;
    students = seedStudents;
  }

  // Create student lookup map by ID and docId for fast reconciliation
  const studentMapById = new Map<string, Student>();
  students.forEach((s) => {
    if (s.id) studentMapById.set(s.id, s);
    if (s.studentId) studentMapById.set(s.studentId.toUpperCase(), s);
  });

  // Prepare table rows
  const rows: Array<{
    'שם תלמיד': string;
    'ת.ז. תלמיד': string;
    'שם ספר': string;
    'כיתה': string;
    'תאריך השאלה': string;
    'תאריך החזרה': string | null;
  }> = [];

  rentals.forEach((r) => {
    const student =
      (r.studentDocId ? studentMapById.get(r.studentDocId) : undefined) ||
      (r.studentSchoolId ? studentMapById.get(r.studentSchoolId.toUpperCase()) : undefined);

    const studentName = r.studentName || student?.fullName || 'לא צוין';
    const studentId = r.studentSchoolId || student?.studentId || '';
    const className = r.className || student?.className || '';
    const bookTitle = r.bookTitle || 'ספר לא מזוהה';
    const issueDateStr = formatDate(r.rentedAt);
    const returnDateStr = r.returnedAt ? formatDate(r.returnedAt) : null;

    rows.push({
      'שם תלמיד': studentName,
      'ת.ז. תלמיד': studentId,
      'שם ספר': bookTitle,
      'כיתה': className,
      'תאריך השאלה': issueDateStr,
      'תאריך החזרה': returnDateStr,
    });
  });

  // Group by student ID: sort primarily by student ID, then by issue date
  rows.sort((a, b) => {
    const idA = String(a['ת.ז. תלמיד'] || '').trim();
    const idB = String(b['ת.ז. תלמיד'] || '').trim();
    const idComp = idA.localeCompare(idB, undefined, { numeric: true });
    if (idComp !== 0) return idComp;

    const dateA = a['תאריך השאלה'] || '';
    const dateB = b['תאריך השאלה'] || '';
    return dateA.localeCompare(dateB);
  });

  // Create Excel worksheet
  const ws = XLSX.utils.json_to_sheet(rows);

  // Set Right-to-Left sheet view for Hebrew
  ws['!views'] = [{ rightToLeft: true }];

  // Set column widths
  ws['!cols'] = [
    { wch: 24 }, // שם תלמיד
    { wch: 16 }, // ת.ז. תלמיד
    { wch: 32 }, // שם ספר
    { wch: 12 }, // כיתה
    { wch: 16 }, // תאריך השאלה
    { wch: 16 }, // תאריך החזרה
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'השאלות תלמידים');

  const now = new Date();
  const dateSuffix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const filename = `דוח_השאלות_תלמידים_${dateSuffix}.xlsx`;

  XLSX.writeFile(wb, filename);

  return { count: rows.length, filename };
}
