import { useState, useMemo } from 'react';
import { X, BookOpen, Plus, Barcode, Check, ShieldAlert, Filter } from 'lucide-react';
import type { Book } from '../../types/database';
import { isGradeEligible } from '../../lib/gradeUtils';
import { useLanguage } from '../../context/LanguageContext';

interface AssignBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (bookId: string, copyBarcode: string) => Promise<void> | void;
  books: Book[];
  studentName: string;
  studentGrade?: number;
}

export default function AssignBookModal({
  isOpen,
  onClose,
  onAssign,
  books,
  studentName,
  studentGrade,
}: AssignBookModalProps) {
  const [selectedBookId, setSelectedBookId] = useState('');
  const [copyBarcode, setCopyBarcode] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [showOnlyEligible, setShowOnlyEligible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t, lang } = useLanguage();

  // Compute eligibility for each book
  const booksWithEligibility = useMemo(() => {
    return books.map((b) => {
      const eligibility = isGradeEligible(studentGrade, b.gradeLevel);
      return {
        book: b,
        ...eligibility,
      };
    });
  }, [books, studentGrade]);

  const filteredBooks = useMemo(() => {
    return booksWithEligibility.filter(({ book, eligible }) => {
      if (showOnlyEligible && !eligible) return false;
      if (!bookSearch.trim()) return true;
      const q = bookSearch.toLowerCase();
      return (
        book.title.toLowerCase().includes(q) ||
        book.isbn.toLowerCase().includes(q) ||
        book.subject.toLowerCase().includes(q) ||
        book.gradeLevel.toLowerCase().includes(q)
      );
    });
  }, [booksWithEligibility, showOnlyEligible, bookSearch]);

  const selectedItem = useMemo(
    () => booksWithEligibility.find((item) => item.book.id === selectedBookId),
    [booksWithEligibility, selectedBookId]
  );

  if (!isOpen) return null;

  const handleSelectBook = (book: Book, eligible: boolean, reason?: string) => {
    if (!eligible) {
      setError(
        reason ||
          (lang === 'he'
            ? `הגבלת מדיניות: תלמיד בשכבה ${studentGrade} אינו יכול לשאול ספר זה (${book.gradeLevel}).`
            : `Policy Restriction: Grade ${studentGrade} students cannot borrow this book (${book.gradeLevel}).`)
      );
      return;
    }

    setError(null);
    setSelectedBookId(book.id);

    if (!copyBarcode) {
      const prefix = book.subject.slice(0, 3).toUpperCase();
      const rand = Math.floor(100 + Math.random() * 900);
      setCopyBarcode(`${prefix}-${rand}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !copyBarcode.trim()) return;

    if (selectedItem && !selectedItem.eligible) {
      setError(
        selectedItem.reason ||
          (lang === 'he'
            ? `אי-התאמת שכבה: תלמיד בשכבה ${studentGrade} אינו רשאי לשאול ספר המיועד לשכבה ${selectedItem.bookGrade}.`
            : `Grade mismatch: A student in Grade ${studentGrade} cannot borrow a textbook meant for Grade ${selectedItem.bookGrade}.`)
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAssign(selectedBookId, copyBarcode.trim().toUpperCase());
      setSelectedBookId('');
      setCopyBarcode('');
      setBookSearch('');
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
              <BookOpen className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-[#1C1917] tracking-[-0.01em]">
                  {t.issueRentalTitle}
                </h3>
                {studentGrade && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-medium">
                    {lang === 'he' ? `שכבה ${studentGrade}` : `Grade ${studentGrade}`}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#78716C] mt-0.5">
                {t.issueRentalSub(studentName)}
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs rounded-md flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-[#991B1B] stroke-[1.5] shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-[0.06em] text-[#78716C]">
                {t.selectBookLabel} <span className="text-[#991B1B]">*</span>
              </label>

              {studentGrade && (
                <button
                  type="button"
                  onClick={() => setShowOnlyEligible(!showOnlyEligible)}
                  className="text-[11px] font-mono text-[#B45309] hover:text-[#92400E] flex items-center gap-1 cursor-pointer"
                >
                  <Filter className="w-3 h-3 stroke-[1.5]" />
                  <span>{showOnlyEligible ? t.filterGradeOnly(studentGrade) : t.showingAllGrades}</span>
                </button>
              )}
            </div>

            <input
              type="text"
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              placeholder={t.searchBookPlaceholder}
              className="w-full h-10 px-3.5 bg-white border border-[#E7E5E4] rounded-md text-base sm:text-sm text-[#1C1917] placeholder:text-[#78716C]/70 shadow-xs focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all mb-2"
            />

            <div className="max-h-48 overflow-y-auto border border-[#E7E5E4] rounded-md divide-y divide-[#E7E5E4] bg-white">
              {filteredBooks.map(({ book, eligible, reason, bookGrade }) => {
                const isSelected = selectedBookId === book.id;
                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => handleSelectBook(book, eligible, reason)}
                    className={`w-full flex items-center justify-between p-3 text-start transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#F3EFEA] border-s-2 border-[#1C1917]'
                        : eligible
                        ? 'hover:bg-[#FAF8F5]'
                        : 'opacity-50 bg-[#FAF8F5] cursor-not-allowed'
                    }`}
                  >
                    <div className="min-w-0 pe-3">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-[#1C1917] truncate tracking-[-0.01em]">
                          {book.title}
                        </p>
                        {!eligible && bookGrade && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] shrink-0">
                            {t.gradeMismatchTag(bookGrade)}
                          </span>
                        )}
                        {eligible && bookGrade && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] shrink-0">
                            {t.gradeMatchTag(bookGrade)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-[#78716C] mt-0.5">
                        {book.isbn} · {book.subject}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#FAF8F5] text-[#78716C] border border-[#E7E5E4]">
                        {t.copiesOut(book.totalCopies)}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-[#1C1917] text-[#FAF8F5] flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredBooks.length === 0 && (
                <div className="p-4 text-center text-xs text-[#78716C] font-mono">
                  {showOnlyEligible && studentGrade
                    ? t.noEligibleBooksFound(studentGrade)
                    : t.noBooksInCatalog}
                </div>
              )}
            </div>
          </div>

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
                onChange={(e) => setCopyBarcode(e.target.value)}
                placeholder="e.g. BIO-042, CALC-109"
                className="w-full h-10 ps-9 pe-3.5 bg-white border border-[#E7E5E4] rounded-md text-base sm:text-sm font-mono uppercase text-[#1C1917] placeholder:text-[#78716C]/70 shadow-xs focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all"
              />
            </div>
          </div>

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
              disabled={!selectedBookId || !copyBarcode.trim() || isSubmitting || (selectedItem && !selectedItem.eligible)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 text-xs font-medium text-[#FAF8F5] bg-[#1C1917] hover:bg-[#292524] rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-card min-h-[38px] sm:min-h-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>{isSubmitting ? t.issuingButton : t.completeIssuanceButton}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
