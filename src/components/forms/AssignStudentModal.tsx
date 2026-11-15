import { useState, useMemo, useEffect } from 'react';
import { X, UserPlus, Barcode, Check, ShieldAlert, Filter, Calendar, AlertTriangle, Users } from 'lucide-react';
import type { Book, Student, Rental } from '../../types/database';
import { isGradeEligible, formatGradeText, formatGradeLetter, extractGradeNumber } from '../../lib/gradeUtils';
import { useLanguage } from '../../context/LanguageContext';

interface AssignStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (student: Student, copyBarcode: string, issueDate?: string) => Promise<void> | void;
  book: Book;
  students: Student[];
  existingBookRentals?: Rental[];
}

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AssignStudentModal({
  isOpen,
  onClose,
  onAssign,
  book,
  students,
  existingBookRentals = [],
}: AssignStudentModalProps) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [copyBarcode, setCopyBarcode] = useState('');
  const [issueDate, setIssueDate] = useState(() => getTodayString());
  const [studentSearch, setStudentSearch] = useState('');
  const [showOnlyEligible, setShowOnlyEligible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t, lang } = useLanguage();

  const bookGradeNum = useMemo(() => extractGradeNumber(book.gradeLevel), [book.gradeLevel]);

  // Set default barcode when modal opens or book changes
  useEffect(() => {
    if (isOpen && book) {
      const prefix = (book.subject || 'LIB').slice(0, 3).toUpperCase();
      const rand = Math.floor(100 + Math.random() * 900);
      setCopyBarcode(`${prefix}-${rand}`);
      setIssueDate(getTodayString());
      setSelectedStudentId('');
      setStudentSearch('');
      setError(null);
    }
  }, [isOpen, book]);

  // Set of student IDs who already hold an active copy of this book
  const activeStudentIdsForThisBook = useMemo(() => {
    const set = new Set<string>();
    existingBookRentals.forEach((r) => {
      if (r.status === 'active') {
        if (r.studentDocId) set.add(r.studentDocId);
        if (r.studentSchoolId) set.add(r.studentSchoolId);
      }
    });
    return set;
  }, [existingBookRentals]);

  // Compute eligibility for each student
  const studentsWithEligibility = useMemo(() => {
    return students.map((s) => {
      const eligibility = isGradeEligible(s.grade, book.gradeLevel);
      const alreadyHasCopy = activeStudentIdsForThisBook.has(s.id) || activeStudentIdsForThisBook.has(s.studentId);
      return {
        student: s,
        alreadyHasCopy,
        ...eligibility,
      };
    });
  }, [students, book.gradeLevel, activeStudentIdsForThisBook]);

  // Filter students by query and eligibility toggle
  const filteredStudents = useMemo(() => {
    return studentsWithEligibility.filter(({ student, eligible }) => {
      if (bookGradeNum && showOnlyEligible && !eligible) return false;
      if (!studentSearch.trim()) return true;
      const q = studentSearch.toLowerCase();
      return (
        student.fullName.toLowerCase().includes(q) ||
        student.studentId.toLowerCase().includes(q) ||
        student.className.toLowerCase().includes(q)
      );
    });
  }, [studentsWithEligibility, bookGradeNum, showOnlyEligible, studentSearch]);

  const selectedItem = useMemo(
    () => studentsWithEligibility.find((item) => item.student.id === selectedStudentId),
    [studentsWithEligibility, selectedStudentId]
  );

  if (!isOpen || !book) return null;

  const handleSelectStudent = (student: Student, eligible: boolean, reason?: string) => {
    if (!eligible) {
      setError(
        reason ||
          (lang === 'he'
            ? `הגבלת מדיניות: תלמיד בשכבה ${formatGradeLetter(student.grade)} אינו רשאי לשאול ספר זה (${book.gradeLevel}).`
            : `Policy restriction: Grade ${student.grade} student cannot borrow this book (${book.gradeLevel}).`)
      );
      return;
    }

    setError(null);
    setSelectedStudentId(student.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !copyBarcode.trim()) {
      setError(lang === 'he' ? 'נא לבחור תלמיד ולהזין ברקוד עותק.' : 'Please select a student and provide a copy barcode.');
      return;
    }

    if (selectedItem && !selectedItem.eligible) {
      setError(
        selectedItem.reason ||
          (lang === 'he'
            ? `אי-התאמת שכבה: תלמיד בשכבה ${formatGradeLetter(selectedItem.student.grade)} אינו רשאי לשאול ספר המיועד לשכבה ${formatGradeLetter(selectedItem.bookGrade)}.`
            : `Grade mismatch: A student in Grade ${selectedItem.student.grade} cannot borrow a textbook meant for Grade ${selectedItem.bookGrade}.`)
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAssign(selectedItem!.student, copyBarcode.trim().toUpperCase(), issueDate);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || (lang === 'he' ? 'שגיאה בביצוע ההשאלה.' : 'Failed to issue textbook rental.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div
        className="fixed inset-0 bg-[#1C1917]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white border border-[#E7E5E4] rounded-lg shadow-card-hover overflow-hidden z-10 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E7E5E4] bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-md bg-white border border-[#E7E5E4] flex items-center justify-center text-[#1C1917] shrink-0">
              <UserPlus className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-[#1C1917] tracking-[-0.01em]">
                  {t.issueToStudentTitle}
                </h3>
                {bookGradeNum && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-medium">
                    {formatGradeText(bookGradeNum, lang)}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#78716C] mt-0.5 line-clamp-1">
                {t.issueToStudentSub(book.title)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFEA] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Selected Book Banner */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#F9F7F4] border-b border-[#E7E5E4] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-[#1C1917] truncate">{book.title}</span>
            <span className="font-mono text-[11px] text-[#78716C] bg-white px-1.5 py-0.2 rounded border border-[#E7E5E4] shrink-0">
              {book.subject}
            </span>
          </div>
          <div className="shrink-0 font-mono text-[11px]">
            <span className={book.availableCopies > 0 ? 'text-[#065F46]' : 'text-[#991B1B] font-semibold'}>
              {book.availableCopies} {t.availShort}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs rounded-md flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {book.availableCopies <= 0 && (
            <div className="p-2.5 bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs rounded-md flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{t.noCopiesAvailableWarning}</span>
            </div>
          )}

          {/* Student Search and Filters */}
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
              <label className="block text-[11px] font-mono uppercase tracking-[0.06em] text-[#78716C]">
                {t.selectStudentLabel} <span className="text-[#991B1B]">*</span>
              </label>

              {bookGradeNum && (
                <button
                  type="button"
                  onClick={() => setShowOnlyEligible(!showOnlyEligible)}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-[#B45309] hover:underline cursor-pointer"
                >
                  <Filter className="w-3 h-3 stroke-[1.5]" />
                  <span>
                    {showOnlyEligible
                      ? t.filterBookGradeOnly(formatGradeLetter(bookGradeNum))
                      : t.showingAllGrades}
                  </span>
                </button>
              )}
            </div>

            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder={t.searchStudentPlaceholder}
              className="w-full h-10 px-3.5 bg-white border border-[#E7E5E4] rounded-md text-base sm:text-sm text-[#1C1917] placeholder:text-[#78716C]/70 shadow-xs focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all mb-2"
            />

            {/* Students List */}
            <div className="border border-[#E7E5E4] rounded-md overflow-hidden max-h-52 overflow-y-auto divide-y divide-[#E7E5E4]">
              {filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#78716C]">
                  {t.noStudentsMatchFilter}
                </div>
              ) : (
                filteredStudents.slice(0, 1000).map(({ student, eligible, reason, alreadyHasCopy }) => {
                  const isSelected = selectedStudentId === student.id;
                  const initials = student.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('');

                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => handleSelectStudent(student, eligible, reason)}
                      className={`w-full flex items-center justify-between p-3 text-start transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#F3EFEA]'
                          : eligible
                          ? 'hover:bg-[#FAF8F5]'
                          : 'opacity-50 hover:bg-[#FEF2F2] cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-md border flex items-center justify-center text-xs font-mono font-medium shrink-0 ${
                            isSelected
                              ? 'bg-[#1C1917] text-white border-[#1C1917]'
                              : 'bg-white border-[#E7E5E4] text-[#1C1917]'
                          }`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-medium text-[#1C1917] truncate">
                              {student.fullName}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FAF8F5] text-[#78716C] border border-[#E7E5E4]">
                              {formatGradeText(student.grade, lang)}
                            </span>
                            <span className="text-[10px] font-mono text-[#78716C]">
                              ({student.className})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#78716C] font-mono mt-0.5">
                            <span>{t.studentIdLabel} {student.studentId}</span>
                            {alreadyHasCopy && (
                              <span className="text-[#B45309] bg-[#FEF3C7] px-1 rounded text-[10px] font-sans">
                                {t.alreadyBorrowedWarning}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ms-2">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[#1C1917] text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </div>
                        ) : !eligible ? (
                          <span className="text-[10px] font-mono text-[#991B1B] bg-[#FEF2F2] px-1.5 py-0.5 rounded border border-[#FECACA]">
                            {lang === 'he' ? 'לא תואם' : 'Ineligible'}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Student Confirmation Pill */}
          {selectedItem && (
            <div className="p-3 bg-[#FAF8F5] border border-[#E7E5E4] rounded-md text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#B45309] stroke-[1.5]" />
                <div>
                  <span className="font-semibold text-[#1C1917]">{selectedItem.student.fullName}</span>
                  <span className="text-[#78716C] font-mono text-[11px] ms-1.5">
                    ({formatGradeText(selectedItem.student.grade, lang)} · {selectedItem.student.className})
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#065F46] bg-[#ECFDF5] px-1.5 py-0.2 rounded border border-[#A7F3D0]">
                {t.gradeMatchTag(selectedItem.student.grade)}
              </span>
            </div>
          )}

          {/* Barcode & Issue Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Physical Copy Barcode */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.06em] text-[#78716C] mb-1.5">
                {t.barcodeStickerLabel} <span className="text-[#991B1B]">*</span>
              </label>
              <div className="relative">
                <div className="absolute start-3 top-1/2 -translate-y-1/2 text-[#78716C]">
                  <Barcode className="w-4 h-4 stroke-[1.5]" />
                </div>
                <input
                  type="text"
                  required
                  value={copyBarcode}
                  onChange={(e) => setCopyBarcode(e.target.value.toUpperCase())}
                  placeholder="SCI-101"
                  className="w-full h-10 ps-9 pe-3.5 bg-white border border-[#E7E5E4] rounded-md text-base sm:text-sm font-mono text-[#1C1917] placeholder:text-[#78716C]/70 shadow-xs focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all"
                />
              </div>
            </div>

            {/* Issue Date (Defaults to Today, Allows Earlier Dates) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-[0.06em] text-[#78716C]">
                  {t.issueDateLabel}
                </label>
                {issueDate !== getTodayString() && (
                  <button
                    type="button"
                    onClick={() => setIssueDate(getTodayString())}
                    className="text-[10px] font-mono text-[#B45309] hover:underline cursor-pointer"
                  >
                    {t.setTodayLabel}
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute start-3 top-1/2 -translate-y-1/2 text-[#78716C]">
                  <Calendar className="w-4 h-4 stroke-[1.5]" />
                </div>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full h-10 ps-9 pe-3 bg-white border border-[#E7E5E4] rounded-md text-base sm:text-sm font-mono text-[#1C1917] shadow-xs focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E7E5E4]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 sm:py-1.5 text-xs font-medium text-[#78716C] hover:text-[#1C1917] bg-white hover:bg-[#F3EFEA] border border-[#E7E5E4] rounded-md transition-colors cursor-pointer shadow-card min-h-[38px] sm:min-h-0"
            >
              {t.cancelButton}
            </button>
            <button
              type="submit"
              disabled={!selectedStudentId || isSubmitting}
              className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 text-xs font-medium text-[#FAF8F5] bg-[#1C1917] hover:bg-[#292524] rounded-md transition-colors cursor-pointer disabled:opacity-50 shadow-card min-h-[38px] sm:min-h-0"
            >
              <Check className="w-3.5 h-3.5 stroke-[2]" />
              <span>{isSubmitting ? t.issuingButton : t.completeIssuanceButton}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
