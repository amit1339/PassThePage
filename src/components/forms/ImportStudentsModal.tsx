import { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  Check,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { seedStudents } from '../../lib/seedData';
import type { Student } from '../../types/database';
import { useLanguage } from '../../context/LanguageContext';
import { HEBREW_LETTER_TO_GRADE, HEBREW_GRADE_LETTERS } from '../../lib/gradeUtils';

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentsImported?: (students: Student[]) => void;
}

interface ParsedStudentRow {
  studentId: string;
  fullName: string;
  grade: number;
  className: string;
  rawGradeStr: string;
}

export default function ImportStudentsModal({
  isOpen,
  onClose,
  onStudentsImported,
}: ImportStudentsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedStudents, setParsedStudents] = useState<ParsedStudentRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, lang } = useLanguage();

  if (!isOpen) return null;

  const resetState = () => {
    setFile(null);
    setParsedStudents([]);
    setError(null);
    setIsImporting(false);
    setImportedCount(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processWorkbookBuffer = (buffer: ArrayBuffer) => {
    try {
      const wb = XLSX.read(buffer, { type: 'array' });
      const studentsFound: ParsedStudentRow[] = [];

      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        if (!ws) continue;

        const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
        if (!data || data.length === 0) continue;

        // Detect header row index
        let headerRowIdx = -1;
        const colMap: {
          id?: number;
          firstName?: number;
          lastName?: number;
          fullName?: number;
          grade?: number;
          classSection?: number;
          className?: number;
        } = {};

        for (let i = 0; i < Math.min(10, data.length); i++) {
          const row = data[i];
          if (!Array.isArray(row)) continue;

          const rowStr = row.map((c) => String(c ?? '').trim().toLowerCase());
          const hasId = rowStr.some(
            (c) =>
              c.includes('ת.ז') ||
              c.includes('ת"ז') ||
              c.includes('תז') ||
              c.includes('תעודת זהות') ||
              c === 'id'
          );
          const hasName = rowStr.some((c) => c.includes('שם') || c.includes('name'));

          if (hasId && hasName) {
            headerRowIdx = i;
            row.forEach((col, idx) => {
              const colClean = String(col ?? '').trim();
              const lower = colClean.toLowerCase();

              if (
                colClean.includes('ת.ז') ||
                colClean.includes('ת"ז') ||
                colClean.includes('תז') ||
                colClean.includes('תעודת זהות') ||
                lower === 'id' ||
                lower === 'student id'
              ) {
                colMap.id = idx;
              } else if (colClean.includes('שם משפחה') || lower.includes('last name')) {
                colMap.lastName = idx;
              } else if (colClean.includes('שם פרטי') || lower.includes('first name')) {
                colMap.firstName = idx;
              } else if (
                colClean === 'שם' ||
                colClean === 'שם מלא' ||
                lower === 'name' ||
                lower === 'full name'
              ) {
                colMap.fullName = idx;
              } else if (
                colClean === 'כיתה' ||
                colClean.includes('שכבה') ||
                lower.includes('grade')
              ) {
                colMap.grade = idx;
              } else if (
                colClean.includes('מקבילה') ||
                colClean.includes('מספר כיתה') ||
                colClean.includes('כיתת אם') ||
                lower.includes('section') ||
                lower.includes('class')
              ) {
                colMap.classSection = idx;
              } else if (colClean.includes('שם כיתה')) {
                colMap.className = idx;
              }
            });
            break;
          }
        }

        if (headerRowIdx === -1 || colMap.id === undefined) {
          continue;
        }

        // Determine default grade from sheet name if applicable (e.g. 'שכבה ח')
        let sheetGrade: number | null = null;
        for (const [letter, gNum] of Object.entries(HEBREW_LETTER_TO_GRADE)) {
          if (sheetName.includes(letter)) {
            sheetGrade = gNum;
            break;
          }
        }

        // Parse student rows
        for (let r = headerRowIdx + 1; r < data.length; r++) {
          const row = data[r];
          if (!Array.isArray(row) || row.length === 0) continue;

          const rawId = colMap.id !== undefined ? row[colMap.id] : null;
          if (rawId === undefined || rawId === null || String(rawId).trim() === '') continue;

          const studentId = String(rawId).trim().toUpperCase();

          let fullName = '';
          if (colMap.firstName !== undefined && colMap.lastName !== undefined) {
            const fn = String(row[colMap.firstName] ?? '').trim();
            const ln = String(row[colMap.lastName] ?? '').trim();
            fullName = [fn, ln].filter(Boolean).join(' ');
          } else if (colMap.fullName !== undefined) {
            fullName = String(row[colMap.fullName] ?? '').trim();
          }

          if (!fullName) continue;

          // Grade resolution
          let grade = sheetGrade || 8;
          let rawGradeStr =
            colMap.grade !== undefined ? String(row[colMap.grade] ?? '').trim() : '';

          if (rawGradeStr) {
            const cleanLetter = rawGradeStr.replace(/["'״׳]/g, '').trim();
            if (cleanLetter in HEBREW_LETTER_TO_GRADE) {
              grade = HEBREW_LETTER_TO_GRADE[cleanLetter];
            } else {
              const num = parseInt(rawGradeStr, 10);
              if (num >= 1 && num <= 12) {
                grade = num;
              }
            }
          }

          // ClassName resolution (e.g. ח-1)
          let className = '';
          if (colMap.className !== undefined && row[colMap.className]) {
            className = String(row[colMap.className]).trim();
          } else {
            const gradeLetter =
              HEBREW_GRADE_LETTERS[grade] || (rawGradeStr ? rawGradeStr : String(grade));
            const rawSection =
              colMap.classSection !== undefined
                ? String(row[colMap.classSection] ?? '').trim()
                : '';
            if (rawSection) {
              className = `${gradeLetter}-${rawSection}`;
            } else {
              className = gradeLetter;
            }
          }

          studentsFound.push({
            studentId,
            fullName,
            grade,
            className,
            rawGradeStr: rawGradeStr || HEBREW_GRADE_LETTERS[grade] || String(grade),
          });
        }
      }

      // Deduplicate by studentId within the file
      const uniqueStudents: ParsedStudentRow[] = [];
      const seenIdsInFile = new Set<string>();
      for (const s of studentsFound) {
        const idKey = s.studentId.toUpperCase();
        if (!seenIdsInFile.has(idKey)) {
          seenIdsInFile.add(idKey);
          uniqueStudents.push(s);
        }
      }

      if (uniqueStudents.length === 0) {
        setError(t.invalidExcelFormat);
        setParsedStudents([]);
      } else {
        setError(null);
        setParsedStudents(uniqueStudents);
      }
    } catch (err: any) {
      console.error('Error reading excel file:', err);
      setError(err?.message || (lang === 'he' ? 'שגיאה בפענוח קובץ האקסל.' : 'Failed to parse Excel file.'));
      setParsedStudents([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setIsParsing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (buffer) {
        processWorkbookBuffer(buffer);
      } else {
        setIsParsing(false);
        setError(t.invalidExcelFormat);
      }
    };
    reader.onerror = () => {
      setIsParsing(false);
      setError(lang === 'he' ? 'קריאת הקובץ נכשלה.' : 'Error reading file.');
    };
    reader.readAsArrayBuffer(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    setFile(droppedFile);
    setIsParsing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (buffer) {
        processWorkbookBuffer(buffer);
      } else {
        setIsParsing(false);
        setError(t.invalidExcelFormat);
      }
    };
    reader.readAsArrayBuffer(droppedFile);
  };

  const handleImport = async () => {
    if (parsedStudents.length === 0) return;

    setIsImporting(true);
    setError(null);

    try {
      const newStudentsToSave: Omit<Student, 'id'>[] = parsedStudents.map((p) => ({
        studentId: p.studentId,
        fullName: p.fullName,
        grade: p.grade,
        className: p.className,
        activeRentalsCount: 0,
      }));

      // Check existing database records to prevent duplicate students
      const existingStudentIds = new Set<string>();
      if (isFirebaseConfigured && db) {
        try {
          const snap = await getDocs(collection(db, 'students'));
          snap.docs.forEach((d) => {
            const sid = (d.data().studentId || '').toString().trim().toUpperCase();
            if (sid) existingStudentIds.add(sid);
          });
        } catch (e) {
          console.warn('Error reading existing students for duplicate check:', e);
        }
      } else {
        seedStudents.forEach((s) => {
          if (s.studentId) existingStudentIds.add(s.studentId.toUpperCase());
        });
      }

      const filteredToSave = newStudentsToSave.filter(
        (s) => !existingStudentIds.has(s.studentId.toUpperCase())
      );

      if (filteredToSave.length === 0) {
        setError(
          lang === 'he'
            ? 'כל התלמידים בקובץ זה כבר קיימים במערכת (לא נוספו כפילויות).'
            : 'All students in this Excel file already exist in the system (no duplicates added).'
        );
        setIsImporting(false);
        return;
      }

      const savedStudents: Student[] = [];

      if (isFirebaseConfigured && db) {
        // Chunk into batches of 400 for Firestore limit (500 max operations per batch)
        const CHUNK_SIZE = 400;
        for (let i = 0; i < filteredToSave.length; i += CHUNK_SIZE) {
          const chunk = filteredToSave.slice(i, i + CHUNK_SIZE);
          const batch = writeBatch(db);

          for (const s of chunk) {
            const newDocRef = doc(collection(db, 'students'));
            batch.set(newDocRef, s);
            savedStudents.push({ id: newDocRef.id, ...s });
          }

          await batch.commit();
        }
      } else {
        // Local state simulated import
        filteredToSave.forEach((s, idx) => {
          savedStudents.push({ id: `stu-import-${Date.now()}-${idx}`, ...s });
        });
      }

      setImportedCount(savedStudents.length);
      onStudentsImported?.(savedStudents);
      setTimeout(() => {
        handleClose();
      }, 1800);
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err?.message || (lang === 'he' ? 'שגיאה בשמירת התלמידים ב-Firestore.' : 'Failed to import students.'));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1C1917]/40 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-2xl bg-white border border-[#E7E5E4] rounded-lg shadow-card-hover overflow-hidden z-10 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E7E5E4] bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-md bg-white border border-[#E7E5E4] flex items-center justify-center text-[#B45309] shrink-0">
              <FileSpreadsheet className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1C1917] tracking-[-0.01em]">
                {t.importExcelTitle}
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5">
                {t.importExcelSub}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFEA] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#991B1B] stroke-[1.5] shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {importedCount !== null && (
            <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] rounded-md flex items-center gap-2.5 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
              <span>{t.importSuccess(importedCount)}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          {importedCount === null && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E7E5E4] hover:border-[#B45309] rounded-lg p-6 sm:p-8 text-center cursor-pointer bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] transition-all group"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-white border border-[#E7E5E4] flex items-center justify-center text-[#78716C] group-hover:text-[#B45309] group-hover:border-[#FDE68A] transition-colors shadow-xs mb-3">
                  {isParsing ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#B45309]" />
                  ) : (
                    <UploadCloud className="w-6 h-6 stroke-[1.5]" />
                  )}
                </div>

                <p className="text-sm font-semibold text-[#1C1917]">
                  {isParsing
                    ? t.parsingExcel
                    : file
                    ? file.name
                    : t.dragOrClickExcel}
                </p>

                <p className="text-xs text-[#78716C] font-mono mt-1">
                  {t.sampleFileHint}
                </p>
              </div>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedStudents.length > 0 && importedCount === null && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#78716C]">
                  <Users className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span className="font-semibold text-[#1C1917]">
                    {t.previewStudentsTitle(parsedStudents.length)}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#78716C] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E7E5E4]">
                  {parsedStudents[0]?.className}
                </span>
              </div>

              <div className="border border-[#E7E5E4] rounded-md overflow-hidden max-h-60 overflow-y-auto bg-white">
                <table className="w-full text-xs text-start border-collapse">
                  <thead className="bg-[#FAF8F5] text-[#78716C] font-mono uppercase text-[10px] tracking-wider border-b border-[#E7E5E4] sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-start">#</th>
                      <th className="px-3 py-2 text-start">{t.studentIdLabel}</th>
                      <th className="px-3 py-2 text-start">{t.fullNameLabel}</th>
                      <th className="px-3 py-2 text-start">{t.studentGradeLabel}</th>
                      <th className="px-3 py-2 text-start">{t.classHomeroomLabel}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E5E4]">
                    {parsedStudents.map((st, i) => (
                      <tr key={st.studentId + i} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="px-3 py-1.5 font-mono text-[#78716C]">{i + 1}</td>
                        <td className="px-3 py-1.5 font-mono text-[#1C1917] font-medium">
                          {st.studentId}
                        </td>
                        <td className="px-3 py-1.5 text-[#1C1917] font-medium">{st.fullName}</td>
                        <td className="px-3 py-1.5 font-mono text-[#78716C]">
                          {lang === 'he'
                            ? HEBREW_GRADE_LETTERS[st.grade] || st.rawGradeStr
                            : `Grade ${st.grade}`}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-[#1C1917] bg-[#FAF8F5]/50">
                          {st.className}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-[#E7E5E4] bg-[#FAF8F5] shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isImporting}
            className="px-3.5 py-2 sm:py-1.5 text-xs font-medium text-[#78716C] hover:text-[#1C1917] bg-white hover:bg-[#F3EFEA] border border-[#E7E5E4] rounded-md transition-colors cursor-pointer shadow-card min-h-[38px] sm:min-h-0"
          >
            {t.cancelButton}
          </button>

          {parsedStudents.length > 0 && importedCount === null && (
            <button
              type="button"
              onClick={handleImport}
              disabled={isImporting}
              className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 text-xs font-medium text-[#FAF8F5] bg-[#1C1917] hover:bg-[#292524] rounded-md transition-colors cursor-pointer disabled:opacity-60 shadow-card min-h-[38px] sm:min-h-0"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.importingButton}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2]" />
                  <span>{t.importConfirmButton(parsedStudents.length)}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
