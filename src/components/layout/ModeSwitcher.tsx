import { BookOpen, UserSquare2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

type Mode = 'book' | 'student';

interface ModeSwitcherProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function ModeSwitcher({ mode, onModeChange }: ModeSwitcherProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex items-center p-1 bg-[#F3EFEA] border border-[#E7E5E4] rounded-lg">
      <button
        onClick={() => onModeChange('book')}
        className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium tracking-[-0.01em] transition-all duration-150 cursor-pointer min-h-[36px] sm:min-h-0 ${
          mode === 'book'
            ? 'bg-white text-[#1C1917] border border-[#E7E5E4] font-semibold shadow-[0_1px_3px_rgba(28,25,23,0.06)]'
            : 'text-[#78716C] hover:text-[#1C1917] hover:bg-white/40'
        }`}
      >
        <BookOpen className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.5] ${mode === 'book' ? 'text-[#1C1917]' : 'text-[#78716C]'}`} />
        <span className="truncate">{t.searchByBook}</span>
      </button>

      <button
        onClick={() => onModeChange('student')}
        className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium tracking-[-0.01em] transition-all duration-150 cursor-pointer min-h-[36px] sm:min-h-0 ${
          mode === 'student'
            ? 'bg-white text-[#1C1917] border border-[#E7E5E4] font-semibold shadow-[0_1px_3px_rgba(28,25,23,0.06)]'
            : 'text-[#78716C] hover:text-[#1C1917] hover:bg-white/40'
        }`}
      >
        <UserSquare2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.5] ${mode === 'student' ? 'text-[#1C1917]' : 'text-[#78716C]'}`} />
        <span className="truncate">{t.searchByStudent}</span>
      </button>
    </div>
  );
}
