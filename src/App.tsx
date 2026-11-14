import { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import ModeSwitcher from './components/layout/ModeSwitcher';
import BookSearchView from './components/search/BookSearchView';
import StudentSearchView from './components/search/StudentSearchView';
import AddBookModal from './components/forms/AddBookModal';
import AddStudentModal from './components/forms/AddStudentModal';
import { isFirebaseConfigured, db } from './lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { seedBooks, seedStudents, seedRentals } from './lib/seedData';
import { ShieldAlert } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

type Mode = 'book' | 'student';

export default function App() {
  const [mode, setMode] = useState<Mode>('book');
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const { t } = useLanguage();

  // Stats state - dynamic from Firebase DB
  const [stats, setStats] = useState({
    booksCount: isFirebaseConfigured ? 0 : seedBooks.length,
    studentsCount: isFirebaseConfigured ? 0 : seedStudents.length,
    activeRentalsCount: isFirebaseConfigured ? 0 : seedRentals.length,
  });

  // Track live real-time counts from Firestore collections
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const handleErr = (err: any) => {
      console.warn('Firestore snapshot error:', err);
      if (err?.code === 'permission-denied') {
        setPermissionError(true);
      }
    };

    const unsubBooks = onSnapshot(
      collection(db, 'books'),
      (snap) => {
        setStats((prev) => ({ ...prev, booksCount: snap.size }));
        setPermissionError(false);
      },
      handleErr
    );

    const unsubStudents = onSnapshot(
      collection(db, 'students'),
      (snap) => {
        setStats((prev) => ({ ...prev, studentsCount: snap.size }));
        setPermissionError(false);
      },
      handleErr
    );

    const unsubRentals = onSnapshot(
      collection(db, 'rentals'),
      (snap) => {
        const activeCount = snap.docs.filter((d) => d.data().status === 'active').length;
        setStats((prev) => ({ ...prev, activeRentalsCount: activeCount }));
        setPermissionError(false);
      },
      handleErr
    );

    return () => {
      unsubBooks();
      unsubStudents();
      unsubRentals();
    };
  }, []);

  // Keyboard shortcut listener: Cmd/Ctrl + K focus search, Tab switch mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('input[type="text"]');
        input?.focus();
      }
      if (
        e.key === 'Tab' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        setMode((prev) => (prev === 'book' ? 'student' : 'book'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] flex flex-col font-sans transition-colors duration-150">
      <Navbar
        onOpenAddBook={() => setIsAddBookOpen(true)}
        onOpenAddStudent={() => setIsAddStudentOpen(true)}
        stats={stats}
      />

      <main className="flex-1 max-w-[1120px] w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-8">
        {/* Firestore Security Rules Alert Banner */}
        {permissionError && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] text-[#1C1917] shadow-card">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="p-1.5 rounded-md bg-[#FDE68A]/60 text-[#B45309] shrink-0 mt-0.5">
                <ShieldAlert className="w-4 h-4 stroke-[1.5]" />
              </div>
              <div className="text-xs sm:text-sm space-y-2">
                <p className="font-semibold text-sm text-[#1C1917]">
                  {t.securityRulesTitle}
                </p>
                <p className="text-[#78716C] leading-relaxed">
                  {t.securityRulesNotice}
                </p>
                <div className="bg-white p-3 rounded-md border border-[#E7E5E4] font-mono text-xs text-[#1C1917] select-all shadow-card overflow-x-auto">
                  <p className="font-sans font-medium mb-1 text-[11px] text-[#78716C] uppercase tracking-[0.06em]">
                    {t.quickFixRules}
                  </p>
                  <code>{`rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`}</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty Database Notice */}
        {!permissionError && isFirebaseConfigured && stats.booksCount === 0 && (
          <div className="mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-lg bg-white border border-[#E7E5E4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card">
            <div>
              <p className="font-semibold text-sm text-[#1C1917]">
                {t.databaseEmptyTitle}
              </p>
              <p className="text-xs text-[#78716C] mt-0.5">
                {t.databaseEmptyNotice}
              </p>
            </div>
          </div>
        )}

        {/* Operational Header with Editorial Serif Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3.5 sm:pb-4 border-b border-[#E7E5E4]">
          <div>
            <h1 className="font-editorial text-[22px] sm:text-[28px] font-semibold text-[#1C1917] tracking-[-0.02em] leading-tight">
              {t.circLedgerTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] mt-1 font-sans">
              {t.circLedgerSubtitle}
            </p>
          </div>

          <div className="w-full sm:w-auto">
            <ModeSwitcher mode={mode} onModeChange={setMode} />
          </div>
        </div>

        {/* Active Search & Circulation Workspace */}
        <div className="transition-all duration-150">
          {mode === 'book' ? <BookSearchView /> : <StudentSearchView />}
        </div>
      </main>

      {/* Global Modals for adding Books and Students */}
      <AddBookModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
      />
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
      />

      {/* Refined Footer with Pulsing Emerald Status Dot */}
      <footer className="border-t border-[#E7E5E4] py-5 text-center text-xs text-[#78716C] font-mono">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span>{t.footerText}</span>
          <div className="inline-flex items-center gap-1.5 bg-white border border-[#E7E5E4] px-2 py-0.5 rounded-md shadow-card">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[#1C1917] font-medium font-sans text-[11px]">
              {t.firestoreLiveBadge}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
