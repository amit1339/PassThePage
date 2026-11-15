import { useState, useEffect } from 'react';
import { X, Edit3, Loader2, Trash2 } from 'lucide-react';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { seedStudents } from '../../lib/seedData';
import type { Student } from '../../types/database';
import { useLanguage } from '../../context/LanguageContext';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onStudentUpdated?: (updatedStudent: Student) => void;
  onDelete?: (studentId: string) => void;
}

const GRADE_CHOICES = [
  { value: 7, he: 'ז', en: '7' },
  { value: 8, he: 'ח', en: '8' },
  { value: 9, he: 'ט', en: '9' },
  { value: 10, he: 'י', en: '10' },
  { value: 11, he: 'יא', en: '11' },
  { value: 12, he: 'יב', en: '12' },
];

export default function EditStudentModal({
  isOpen,
  onClose,
  student,
  onStudentUpdated,
  onDelete,
}: EditStudentModalProps) {
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [className, setClassName] = useState('');
  const [grade, setGrade] = useState<number>(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, lang } = useLanguage();

  useEffect(() => {
    if (student) {
      setFullName(student.fullName || '');
      setStudentId(student.studentId || '');
      setClassName(student.className || '');
      setGrade(student.grade || 7);
      setError(null);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    const cleanId = studentId.trim().toUpperCase();
    const cleanClass = className.trim().toUpperCase();

    if (!cleanName || !cleanId || !cleanClass) {
      setError(lang === 'he' ? 'נא למלא את כל שדות פרטי התלמיד.' : 'Please fill in all student details.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Duplicate ID check if ID changed
    if (cleanId !== (student.studentId || '').trim().toUpperCase()) {
      if (isFirebaseConfigured && db) {
        try {
          const q = query(collection(db, 'students'), where('studentId', '==', cleanId));
          const snap = await getDocs(q);
          const duplicate = snap.docs.find((d) => d.id !== student.id);
          if (duplicate) {
            setError(t.duplicateStudentIdError(cleanId, (duplicate.data() as Student).fullName));
            setIsSubmitting(false);
            return;
          }
        } catch (err: any) {
          console.warn('Error checking duplicate student ID:', err);
        }
      } else {
        const duplicate = seedStudents.find(
          (s) => s.id !== student.id && s.studentId.toUpperCase() === cleanId
        );
        if (duplicate) {
          setError(t.duplicateStudentIdError(cleanId, duplicate.fullName));
          setIsSubmitting(false);
          return;
        }
      }
    }

    const updatedData: Partial<Student> = {
      fullName: cleanName,
      studentId: cleanId,
      className: cleanClass,
      grade: Number(grade) || 7,
    };

    try {
      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'students', student.id), updatedData);
      }

      onStudentUpdated?.({ ...student, ...updatedData });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || (lang === 'he' ? 'שגיאה בעדכון פרטי התלמיד ב-Firestore.' : 'Failed to update student profile.'));
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
              <Edit3 className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1C1917] tracking-[-0.01em]">
                {t.editStudentTitle}
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5">
                {t.editStudentSub(student.fullName)}
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

        {/* Form Body */}
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
              placeholder={lang === 'he' ? 'שם פרטי ושם משפחה' : 'e.g. David Cohen'}
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
              placeholder="312456789"
              className="w-full h-10 px-3.5 bg-white border border-[#E7E5E4] rounded-md text-base sm:text-sm font-mono text-[#1C1917] placeholder:text-[#78716C]/70 shadow-xs focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all uppercase"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.06em] text-[#78716C] mb-1.5">
                {t.classHomeroomLabel} <span className="text-[#991B1B]">*</span>
              </label>
              <input
                type="text"
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder={lang === 'he' ? 'למשל: י-1, ח-3' : 'e.g. 10-A, 8-B'}
                className="w-full h-10 px-3.5 bg-white border border-[#E7E5E4] rounded-md text-base sm:text-sm font-mono text-[#1C1917] placeholder:text-[#78716C]/70 shadow-xs focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all uppercase"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-[0.06em] text-[#78716C] mb-1.5">
                {t.studentGradeLabel} <span className="text-[#991B1B]">*</span>
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full h-10 px-3 bg-white border border-[#E7E5E4] rounded-md text-base sm:text-sm font-mono text-[#1C1917] shadow-xs focus:outline-none focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 transition-all"
              >
                {GRADE_CHOICES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {lang === 'he' ? `שכבה ${g.he}` : `Grade ${g.en}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-[#E7E5E4]">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      t.confirmDeleteStudent(student.fullName, student.activeRentalsCount || 0)
                    )
                  ) {
                    onDelete(student.id);
                    onClose();
                  }
                }}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-medium text-[#991B1B] bg-white hover:bg-[#FEF2F2] border border-[#FECACA] rounded-md transition-colors cursor-pointer shadow-xs min-h-[38px] sm:min-h-0"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>{t.deleteStudentButton}</span>
              </button>
            )}

            <div className="flex items-center gap-2.5 ms-auto">
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
                    {t.updatingButton}
                  </>
                ) : (
                  t.saveChangesButton
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
