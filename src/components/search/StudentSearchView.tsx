import { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Plus,
  Calendar,
  CheckCircle2,
  Barcode,
  FileText,
  User,
  ArrowRight,
  ArrowLeft,
  CornerDownLeft,
} from 'lucide-react';
import { useStudentRentals } from '../../hooks/useStudentRentals';
import StatusBadge from '../ui/StatusBadge';
import AssignBookModal from './AssignBookModal';
import { useLanguage } from '../../context/LanguageContext';

export default function StudentSearchView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [returningId, setReturningId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, isRtl, lang } = useLanguage();

  const {
    students,
    filteredStudents,
    selectedStudent,
    setSelectedStudent,
    rentals,
    loading,
    returnBook,
    assignBook,
    books,
  } = useStudentRentals(debouncedQuery);

  // Debounce search (150ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Outside click close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelectStudent = (student: (typeof filteredStudents)[0]) => {
    setSelectedStudent(student);
    setSearchQuery(student.fullName);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setSelectedStudent(null);
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleReturn = async (rentalId: string) => {
    setReturningId(rentalId);
    try {
      await returnBook(rentalId);
    } finally {
      setReturningId(null);
    }
  };

  const gradeText = (g: number) => (lang === 'he' ? `שכבה ${g}` : `Grade ${g}`);

  return (
    <div className="space-y-6">
      {/* Search Bar with Taller py-3.5 Padding, Ambient Desk Shadow, and Warm Amber Focus Ring */}
      <div className="relative">
        <div className="relative">
          <div className="absolute start-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-[#78716C]">
            <Search className="w-4 h-4 stroke-[1.5]" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
              if (!e.target.value) setSelectedStudent(null);
            }}
            onFocus={() => {
              if (!selectedStudent && searchQuery) setShowDropdown(true);
            }}
            placeholder={t.searchStudentPlaceholder}
            className="w-full py-3.5 ps-11 pe-24 bg-white border border-[#E7E5E4] rounded-lg text-sm text-[#1C1917] placeholder:text-[#78716C]/70 shadow-card focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all duration-150"
          />

          <div className="absolute end-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery && (
              <button
                onClick={clearSelection}
                className="p-1 rounded text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#FAF8F5] border border-[#E7E5E4] rounded text-[10px] font-mono text-[#78716C] shadow-xs">
              {t.searchShortcut}
            </kbd>
          </div>
        </div>

        {/* Dropdown Live Search Results */}
        {showDropdown && !selectedStudent && filteredStudents.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full mt-1.5 w-full bg-white border border-[#E7E5E4] rounded-lg shadow-card-hover overflow-hidden z-30 divide-y divide-[#E7E5E4]"
          >
            {filteredStudents.slice(0, 8).map((student) => {
              const initials = student.fullName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('');

              return (
                <button
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-[#F3EFEA] transition-colors text-start cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-[#FAF8F5] border border-[#E7E5E4] text-[#1C1917] flex items-center justify-center text-xs font-mono font-medium shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1C1917] group-hover:text-[#B45309] truncate transition-colors">
                        {student.fullName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#78716C] font-mono">
                        <span className="text-[11px]">{t.studentIdLabel} {student.studentId}</span>
                        <span>·</span>
                        <span className="text-[11px]">{t.cohort(student.className)}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#78716C] border border-[#E7E5E4]">
                    {gradeText(student.grade)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Student Dossier Card */}
      {selectedStudent && (
        <div className="bg-white border border-[#E7E5E4] rounded-lg p-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-md bg-[#FAF8F5] border border-[#E7E5E4] text-[#1C1917] flex items-center justify-center text-sm font-mono font-medium shrink-0">
                {selectedStudent.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#1C1917] border border-[#E7E5E4]">
                    {t.studentDossier}
                  </span>
                  <span className="text-xs text-[#78716C] font-mono">
                    {gradeText(selectedStudent.grade)}
                  </span>
                </div>

                <h2 className="font-editorial text-[22px] sm:text-[24px] font-semibold text-[#1C1917] tracking-[-0.02em] leading-snug mt-1.5">
                  {selectedStudent.fullName}
                </h2>

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs font-mono text-[#1C1917] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E7E5E4]">
                    {t.studentIdLabel} {selectedStudent.studentId}
                  </span>
                  <span className="text-xs font-mono text-[#78716C] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E7E5E4]">
                    {t.cohort(selectedStudent.className)}
                  </span>
                </div>
              </div>
            </div>

            {/* Issued stats & issue action button */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-[#E7E5E4] shrink-0">
              <div className="text-start sm:text-end">
                <div className="text-2xl font-mono font-semibold text-[#B45309] leading-none">
                  {rentals.length}
                </div>
                <p className="text-[11px] text-[#78716C] uppercase tracking-[0.06em] mt-1 font-mono">
                  {t.activeRentalsHeld}
                </p>
              </div>

              <button
                onClick={() => setShowAssignModal(true)}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FAF8F5] bg-[#1C1917] hover:bg-[#292524] border border-[#1C1917] rounded-md transition-all duration-150 cursor-pointer shadow-card"
              >
                <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>{t.issueTextbookButton}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rented Books Circulation Ledger */}
      {selectedStudent && !loading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#78716C]">
              {t.activeCustodyRecord(rentals.length)}
            </h3>
          </div>

          {rentals.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-[#E7E5E4] rounded-lg p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-1.5 self-stretch rounded-full bg-[#B45309] shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-[#1C1917] truncate tracking-[-0.01em]">
                      {r.bookTitle}
                    </p>
                    <StatusBadge status={r.status} />
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#1C1917] bg-[#FAF8F5] px-1.5 py-0.2 rounded border border-[#E7E5E4]">
                      <Barcode className="w-3 h-3 text-[#B45309] stroke-[1.5]" />
                      {t.copyBarcodeLabel} {r.copyBarcode}
                    </span>
                    <span className="text-[11px] font-mono text-[#78716C]">
                      ISBN: {r.bookIsbn}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-[#78716C] flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-[#78716C] stroke-[1.5]" />
                      {t.checkedOut}{' '}
                      {r.rentedAt?.toDate
                        ? r.rentedAt.toDate().toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : lang === 'he' ? 'לאחרונה' : 'Recent'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#B45309]">
                      <Calendar className="w-3 h-3 text-[#B45309] stroke-[1.5]" />
                      {t.due}{' '}
                      {r.dueDate?.toDate
                        ? r.dueDate.toDate().toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : lang === 'he' ? 'סוף שנה' : 'End of Term'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end shrink-0">
                <button
                  onClick={() => handleReturn(r.id)}
                  disabled={returningId === r.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#065F46] bg-[#ECFDF5] hover:bg-[#A7F3D0]/60 border border-[#A7F3D0] rounded-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>{returningId === r.id ? t.returningBook : t.returnBook}</span>
                </button>
              </div>
            </div>
          ))}

          {rentals.length === 0 && (
            <div className="bg-white border border-[#E7E5E4] rounded-lg p-10 text-center shadow-card">
              <FileText className="w-6 h-6 stroke-[1.5] text-[#78716C] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#1C1917]">
                {t.noOutstandingLoans}
              </p>
              <p className="text-xs text-[#78716C] mt-0.5">
                {t.zeroBorrowed}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ACTIONABLE LAUNCHPAD: Instead of a giant blank box, display Quick-Access Student Records */}
      {!selectedStudent && !searchQuery && (
        <div className="bg-white border border-[#E7E5E4] rounded-lg p-6 shadow-card">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E7E5E4]">
            <div>
              <h3 className="font-semibold text-sm text-[#1C1917] tracking-tight">
                {t.quickAccessStudents}
              </h3>
              <p className="text-xs text-[#78716C] font-sans mt-0.5">
                {t.quickAccessStudentsSub}
              </p>
            </div>
            <span className="text-xs font-mono text-[#78716C] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E7E5E4]">
              {t.studentsEnrolledCount(students.length)}
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {students.slice(0, 6).map((student) => {
              const initials = student.fullName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('');

              return (
                <button
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  className="group relative flex flex-col justify-between p-4 bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E7E5E4] hover:border-[#D6D3D1] rounded-lg text-start transition-all duration-150 cursor-pointer shadow-xs hover:shadow-card"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-white border border-[#E7E5E4] text-[#1C1917] flex items-center justify-center text-xs font-mono font-medium shrink-0 shadow-xs">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-[#1C1917] group-hover:text-[#B45309] truncate transition-colors">
                        {student.fullName}
                      </h4>
                      <p className="text-[11px] font-mono text-[#78716C] mt-0.5">
                        {t.studentIdLabel} {student.studentId} · {t.cohort(student.className)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E7E5E4] text-xs">
                    <span className="font-mono text-[11px] text-[#B45309] bg-[#FEF3C7] px-1.5 py-0.2 rounded border border-[#FDE68A]">
                      {gradeText(student.grade)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1C1917]">
                      {t.viewDossier}
                      {isRtl ? (
                        <ArrowLeft className="w-3 h-3 stroke-[2] group-hover:-translate-x-0.5 transition-transform" />
                      ) : (
                        <ArrowRight className="w-3 h-3 stroke-[2] group-hover:translate-x-0.5 transition-transform" />
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Compact Keyboard Shortcut Hint Bar */}
          <div className="mt-5 pt-4 border-t border-[#E7E5E4] flex items-center justify-center gap-4 text-xs font-mono text-[#78716C] flex-wrap">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#FAF8F5] border border-[#E7E5E4] rounded text-[10px]">⌘K</kbd> {t.toSearch}
            </span>
            <span className="text-[#D6D3D1]">·</span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#FAF8F5] border border-[#E7E5E4] rounded text-[10px]">Tab</kbd> {t.toSwitchMode}
            </span>
            <span className="text-[#D6D3D1]">·</span>
            <span className="inline-flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" /> {t.toInspect}
            </span>
          </div>
        </div>
      )}

      {/* Search Not Found State */}
      {!selectedStudent && searchQuery && filteredStudents.length === 0 && (
        <div className="bg-white border border-[#E7E5E4] rounded-lg p-10 text-center shadow-card">
          <User className="w-6 h-6 stroke-[1.5] text-[#78716C] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#1C1917]">
            {t.noStudentsMatch(searchQuery)}
          </p>
          <p className="text-xs text-[#78716C] mt-1">
            {t.tryExactStudentId}
          </p>
        </div>
      )}

      {/* Assign Book Modal */}
      {selectedStudent && (
        <AssignBookModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onAssign={assignBook}
          books={books}
          studentName={selectedStudent.fullName}
          studentGrade={selectedStudent.grade}
        />
      )}
    </div>
  );
}
