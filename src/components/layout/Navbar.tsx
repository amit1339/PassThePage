import { useState } from 'react';
import { UserPlus, BookPlus, Database, Check, Languages } from 'lucide-react';
import { populateFirestoreWithSeedData } from '../../lib/dbSeeder';
import { useLanguage } from '../../context/LanguageContext';
import logoIcon from '../../assets/icon.jpg';

interface NavbarProps {
  onOpenAddBook: () => void;
  onOpenAddStudent: () => void;
  stats: {
    booksCount: number;
    studentsCount: number;
    activeRentalsCount: number;
  };
}

export default function Navbar({ onOpenAddBook, onOpenAddStudent, stats }: NavbarProps) {
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const { lang, toggleLang, t } = useLanguage();

  const handleSeedDatabase = async () => {
    if (seeding) return;
    const confirm = window.confirm(
      lang === 'he'
        ? 'האם להזין נתוני דוגמה של ספרי לימוד, תלמידים והשאלות למסד הנתונים בענן?'
        : 'Populate your live Firebase Firestore with realistic textbook curriculum, students, and rentals?'
    );
    if (!confirm) return;

    setSeeding(true);
    try {
      await populateFirestoreWithSeedData();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 4000);
    } catch (err: any) {
      alert('Error populating Firestore: ' + (err?.message || err));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/80 backdrop-blur-md border-b border-[#E7E5E4]">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <img
              src={logoIcon}
              alt="PassThePage"
              className="h-11 sm:h-12 w-auto object-contain mix-blend-multiply select-none"
            />
          </div>

          {/* Center: Refined Metrics Pill */}
          <div className="flex items-center">
            <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 bg-white border border-[#E7E5E4] rounded-md text-xs font-mono shadow-[0_1px_3px_rgba(28,25,23,0.04)]">
              {/* Titles Metric */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#1C1917]">{stats.booksCount}</span>
                <span className="bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-1.5 py-0.2 rounded text-[11px] font-medium">
                  {t.titlesMetric(stats.booksCount)}
                </span>
              </div>

              <div className="h-3 w-px bg-[#E7E5E4]" />

              {/* Students Metric */}
              <div className="flex items-center gap-1">
                <span className="font-semibold text-[#1C1917]">{stats.studentsCount}</span>
                <span className="text-[#78716C]">{t.studentsMetric(stats.studentsCount)}</span>
              </div>

              <div className="h-3 w-px bg-[#E7E5E4]" />

              {/* Issued Metric */}
              <div className="flex items-center gap-1">
                <span className="font-semibold text-[#B45309]">{stats.activeRentalsCount}</span>
                <span className="text-[#78716C]">{t.issuedMetric(stats.activeRentalsCount)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Language Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher Button */}
            <button
              onClick={toggleLang}
              title={lang === 'en' ? 'החלף לעברית' : 'Switch to English'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#1C1917] hover:bg-[#F3EFEA] bg-white border border-[#E7E5E4] rounded-md transition-all duration-150 cursor-pointer shadow-[0_1px_3px_rgba(28,25,23,0.04)]"
            >
              <Languages className="w-3.5 h-3.5 stroke-[1.5] text-[#78716C]" />
              <span className="font-sans font-semibold">{t.languageButton}</span>
            </button>

            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              title="Populate live Firestore with demo school dataset"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#78716C] hover:text-[#1C1917] bg-white hover:bg-[#F3EFEA] border border-[#E7E5E4] rounded-md transition-all duration-150 cursor-pointer shadow-[0_1px_3px_rgba(28,25,23,0.04)]"
            >
              {seedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#059669] stroke-[1.5]" />
                  <span className="text-[#065F46]">{t.seededText}</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>{seeding ? t.seedingText : t.seedDbButton}</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenAddStudent}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1C1917] bg-white hover:bg-[#F3EFEA] border border-[#E7E5E4] rounded-md transition-all duration-150 cursor-pointer shadow-[0_1px_3px_rgba(28,25,23,0.04)]"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#78716C] stroke-[1.5]" />
              <span>{t.enrollStudentButton}</span>
            </button>

            <button
              onClick={onOpenAddBook}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FAF8F5] bg-[#1C1917] hover:bg-[#292524] border border-[#1C1917] rounded-md transition-all duration-150 cursor-pointer shadow-[0_1px_3px_rgba(28,25,23,0.06)]"
            >
              <BookPlus className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>{t.addBookButton}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
