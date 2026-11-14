import { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import type { Student } from '../../types/database';
import { useLanguage } from '../../context/LanguageContext';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentAdded?: (student: Student) => void;
}

const GRADE_CHOICES = [
  { value: 7, he: 'ז', en: '7' },
  { value: 8, he: 'ח', en: '8' },
  { value: 9, he: 'ט', en: '9' },
  { value: 10, he: 'י', en: '10' },
  { value: 11, he: 'יא', en: '11' },
  { value: 12, he: 'יב', en: '12' },
];

export default function AddStudentModal({ isOpen, onClose, onStudentAdded }: AddStudentModalProps) {
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [className, setClassName] = useState('');
  const [grade, setGrade] = useState<number>(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, lang } = useLanguage();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !studentId.trim() || !className.trim()) {
      setError(lang === 'he' ? 'נא למלא את כל שדות פרטי התלמיד (כולל כיתת אם).' : 'Please fill in all student information fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const newStudent: Omit<Student, 'id'> = {
      fullName: fullName.trim(),
      studentId: studentId.trim().toUpperCase(),
      className: className.trim().toUpperCase(),
      grade: Number(grade) || 7,
      activeRentalsCount: 0,
    };

    try {
      if (isFirebaseConfigured && db) {
        const docRef = await addDoc(collection(db, 'students'), newStudent);
        onStudentAdded?.({ id: docRef.id, ...newStudent });
      } else {
        const fakeId = 'stu-' + Date.now();
        onStudentAdded?.({ id: fakeId, ...newStudent });
      }

      setFullName('');
      setStudentId('');
      setClassName('');
      setGrade(7);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || (lang === 'he' ? 'שגיאה ברישום התלמיד ב-Firestore.' : 'Failed to save student record to Firestore.'));
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
              <h3 className="text-sm font-semibold text-[#1C1917] tracking-[-0.01em]">
                {t.enrollStudentTitle}
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5">
                {t.enrollStudentSub}
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.06em] text-[#78716C] mb-1.5">
              {t.fullNameLabel} <span className="text-[#991B1B]">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={lang === 'he' ? 'למשל: עידו אביבי' : 'e.g. Eleanor Vance'}
              className="w-full h-10 px-3.5 bg-white border border-[#E7E5E4] rounded-md text-base sm:text-sm text-[#1C1917] placeholder:text-[#78716C]/70 shadow-xs focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.06em] text-[#78716C] mb-1.5">
              {t.matriculationIdLabel} <span className="text-[#991B1B]">*</span>
            </label>
            <input
              type="text"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder={lang === 'he' ? 'למשל: 221608623' : 'e.g. 2026-4091'}
              className="w-full h-10 px-3.5 bg-white border border-[#E7E5E4] rounded-md text-base sm:text-sm font-mono text-[#1C1917] placeholder:text-[#78716C]/70 shadow-xs focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all uppercase"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.06em] text-[#78716C] mb-1.5">
                {t.classHomeroomLabel} <span className="text-[#991B1B]">*</span>
              </label>
              <input
                type="text"
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder={lang === 'he' ? 'למשל: ח-1, י-2' : 'e.g. 10-A, 11-Honors'}
                className="w-full h-10 px-3.5 bg-white border border-[#E7E5E4] rounded-md text-base sm:text-sm font-mono text-[#1C1917] placeholder:text-[#78716C]/70 shadow-xs focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all uppercase"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.06em] text-[#78716C] mb-1.5">
                {t.studentGradeLabel}
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full h-10 px-3 bg-white border border-[#E7E5E4] rounded-md text-base sm:text-sm text-[#1C1917] shadow-xs focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all"
              >
                {GRADE_CHOICES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {lang === 'he' ? g.he : `Grade ${g.en}`}
                  </option>
                ))}
              </select>
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
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 text-xs font-medium text-[#FAF8F5] bg-[#1C1917] hover:bg-[#292524] rounded-md transition-colors cursor-pointer disabled:opacity-60 shadow-card min-h-[38px] sm:min-h-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t.registeringButton}
                </>
              ) : (
                t.confirmEnrollStudent
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
