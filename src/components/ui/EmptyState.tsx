import { BookOpen, Search, UserCheck } from 'lucide-react';

interface EmptyStateProps {
  type: 'search' | 'book' | 'student';
  message?: string;
}

export default function EmptyState({ type, message }: EmptyStateProps) {
  const icons = {
    search: Search,
    book: BookOpen,
    student: UserCheck,
  };

  const defaults = {
    search: 'Type a query in the search palette above...',
    book: 'Select a textbook title above to review class distributions.',
    student: 'Select a student record above to review active textbook loans.',
  };

  const Icon = icons[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-[#E6E4DD] rounded-lg">
      <div className="w-10 h-10 rounded-md bg-[#FAF9F6] border border-[#E6E4DD] flex items-center justify-center mb-3 text-[#526075]">
        <Icon className="w-5 h-5 stroke-[1.5]" />
      </div>
      <p className="text-sm font-medium text-[#0F2342] tracking-[-0.01em] max-w-md">
        {message || defaults[type]}
      </p>
      <p className="text-xs text-[#526075] font-mono mt-1">
        Use <kbd className="px-1.5 py-0.5 bg-[#FAF9F6] border border-[#E6E4DD] rounded text-[10px]">⌘K</kbd> to focus search
      </p>
    </div>
  );
}
