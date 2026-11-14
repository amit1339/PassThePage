import { useState, useEffect } from 'react';
import { X, Edit3, Loader2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import type { Book } from '../../types/database';
import { useLanguage } from '../../context/LanguageContext';

interface EditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  onBookUpdated?: (updatedBook: Book) => void;
}

const SUBJECT_OPTIONS = [
  'Science',
  'Mathematics',
  'History',
  'English',
  'Geography',
  'Literature',
  'Computer Science',
  'Languages',
  'Arts',
];

export default function EditBookModal({ isOpen, onClose, book, onBookUpdated }: EditBookModalProps) {
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [subject, setSubject] = useState('Science');
  const [gradeLevel, setGradeLevel] = useState('10th Grade');
  const [totalCopies, setTotalCopies] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, lang } = useLanguage();

  useEffect(() => {
    if (book) {
      setTitle(book.title || '');
      setIsbn(book.isbn || '');
      setSubject(book.subject || 'Science');
      setGradeLevel(book.gradeLevel || '10th Grade');
      setTotalCopies(book.totalCopies || 30);
      setError(null);
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !isbn.trim()) {
      setError(lang === 'he' ? 'נא להזין שם ספר ומסת״ב (ISBN).' : 'Please provide a Book Title and ISBN.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const newTotalCopies = Math.max(1, Number(totalCopies) || 1);
    const currentlyRented = Math.max(0, (book.totalCopies || 0) - (book.availableCopies || 0));
    const newAvailableCopies = Math.max(0, newTotalCopies - currentlyRented);

    const updatedData: Partial<Book> = {
      title: title.trim(),
      isbn: isbn.trim().toUpperCase(),
      subject,
      gradeLevel: gradeLevel.trim() || 'General',
      totalCopies: newTotalCopies,
      availableCopies: newAvailableCopies,
    };

    try {
      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'books', book.id), updatedData);
      }

      onBookUpdated?.({ ...book, ...updatedData });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || (lang === 'he' ? 'שגיאה בעדכון פרטי הספר ב-Firestore.' : 'Failed to update textbook in Firestore.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-[#1C1917]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white border border-[#E7E5E4] rounded-lg shadow-card-hover overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E4] bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-white border border-[#E7E5E4] flex items-center justify-center text-[#1C1917]">
              <Edit3 className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1C1917] tracking-[-0.01em]">
                {t.editBookTitle}
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5">
                {t.editBookSub(book.title)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.06em] text-[#78716C] mb-1.5">
              {t.bookTitleLabel} <span className="text-[#991B1B]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Campbell Biology 12th Edition"
              className="w-full h-10 px-3.5 bg-white border border-[#E7E5E4] rounded-md text-sm text-[#1C1917] placeholder:text-[#78716C]/70 shadow-xs focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.06em] text-[#78716C] mb-1.5">
              {t.isbnLabel} <span className="text-[#991B1B]">*</span>
            </label>
            <input
              type="text"
              required
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="978-0-13-518838-0"
              className="w-full h-10 px-3.5 bg-white border border-[#E7E5E4] rounded-md text-sm font-mono text-[#1C1917] placeholder:text-[#78716C]/70 shadow-xs focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all uppercase"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.06em] text-[#78716C] mb-1.5">
                {t.subjectLabel}
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#E7E5E4] rounded-md text-sm text-[#1C1917] shadow-xs focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.06em] text-[#78716C] mb-1.5">
                {t.gradeLevelLabel}
              </label>
              <input
                type="text"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                placeholder="e.g. 10th Grade"
                className="w-full h-10 px-3 bg-white border border-[#E7E5E4] rounded-md text-sm text-[#1C1917] shadow-xs focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.06em] text-[#78716C] mb-1.5">
                {t.totalCopiesLabel}
              </label>
              <input
                type="number"
                min={1}
                value={totalCopies}
                onChange={(e) => setTotalCopies(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full h-10 px-3 bg-white border border-[#E7E5E4] rounded-md text-sm font-mono text-[#1C1917] shadow-xs focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E7E5E4]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-xs font-medium text-[#78716C] hover:text-[#1C1917] bg-white hover:bg-[#F3EFEA] border border-[#E7E5E4] rounded-md transition-colors cursor-pointer shadow-card"
            >
              {t.cancelButton}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#FAF8F5] bg-[#1C1917] hover:bg-[#292524] rounded-md transition-colors cursor-pointer disabled:opacity-60 shadow-card"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t.updatingButton}
                </>
              ) : (
                t.saveChangesButton
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
