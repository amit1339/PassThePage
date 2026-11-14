import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, BookOpen, X, Filter, Edit3, ArrowRight, ArrowLeft, CornerDownLeft } from 'lucide-react';
import { useBookRentals } from '../../hooks/useBookRentals';
import ClassGroupAccordion from './ClassGroupAccordion';
import EditBookModal from '../forms/EditBookModal';
import type { Book } from '../../types/database';
import { useLanguage } from '../../context/LanguageContext';

const SUBJECT_SPINE_COLORS: Record<string, string> = {
  Science: 'bg-emerald-600',
  Mathematics: 'bg-[#B45309]',
  History: 'bg-stone-700',
  English: 'bg-[#0F2342]',
  Geography: 'bg-teal-600',
  Literature: 'bg-[#9E2A2B]',
  'Computer Science': 'bg-indigo-700',
  Languages: 'bg-amber-700',
  Arts: 'bg-purple-700',
};

export default function BookSearchView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, isRtl } = useLanguage();

  const {
    books,
    filteredBooks,
    selectedBook,
    setSelectedBook,
    groupedRentals,
    rentals,
    loading,
    markReturned,
  } = useBookRentals(debouncedQuery);

  // Debounce search (150ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
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

  const classNames = useMemo(() => Object.keys(groupedRentals), [groupedRentals]);

  const displayRentals = useMemo(() => {
    if (!classFilter) return groupedRentals;
    return { [classFilter]: groupedRentals[classFilter] || [] };
  }, [groupedRentals, classFilter]);

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setSearchQuery(book.title);
    setShowDropdown(false);
    setClassFilter(null);
  };

  const clearSelection = () => {
    setSelectedBook(null);
    setSearchQuery('');
    setClassFilter(null);
    inputRef.current?.focus();
  };

  const handleBookUpdated = (updatedBook: Book) => {
    setSelectedBook(updatedBook);
  };

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
              if (!e.target.value) setSelectedBook(null);
            }}
            onFocus={() => {
              if (!selectedBook && searchQuery) setShowDropdown(true);
            }}
            placeholder={t.searchBookPlaceholder}
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
        {showDropdown && !selectedBook && filteredBooks.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full mt-1.5 w-full bg-white border border-[#E7E5E4] rounded-lg shadow-card-hover overflow-hidden z-30 divide-y divide-[#E7E5E4]"
          >
            {filteredBooks.slice(0, 6).map((book) => (
              <button
                key={book.id}
                onClick={() => handleSelectBook(book)}
                className="w-full flex items-center justify-between p-3.5 hover:bg-[#F3EFEA] transition-colors text-start cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-1.5 h-8 rounded-full ${
                      SUBJECT_SPINE_COLORS[book.subject] || 'bg-[#B45309]'
                    } shrink-0`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1C1917] group-hover:text-[#B45309] truncate transition-colors">
                      {book.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-[#78716C]">
                      <span className="font-mono text-[11px]">{book.isbn}</span>
                      <span>·</span>
                      <span className="text-[11px]">{book.gradeLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#78716C] border border-[#E7E5E4]">
                    {book.subject}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Book Header Card (Warm Paper Index Card Aesthetic) */}
      {selectedBook && (
        <div className="bg-white border border-[#E7E5E4] rounded-lg p-6 shadow-card">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-16 rounded bg-[#FAF8F5] border border-[#E7E5E4] flex flex-col items-center justify-center text-[#1C1917] shrink-0 relative overflow-hidden`}
              >
                <div
                  className={`absolute start-0 top-0 bottom-0 w-1 ${
                    SUBJECT_SPINE_COLORS[selectedBook.subject] || 'bg-[#B45309]'
                  }`}
                />
                <BookOpen className="w-5 h-5 stroke-[1.5] text-[#1C1917]" />
                <span className="text-[9px] font-mono tracking-wider text-[#78716C] mt-1 uppercase">
                  LIB
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#B45309] border border-[#E7E5E4]">
                    {selectedBook.subject}
                  </span>
                  <span className="text-xs text-[#78716C] font-mono">
                    {selectedBook.gradeLevel}
                  </span>
                </div>

                <h2 className="font-editorial text-[22px] sm:text-[24px] font-semibold text-[#1C1917] tracking-[-0.02em] leading-snug mt-1.5">
                  {selectedBook.title}
                </h2>

                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span className="text-xs font-mono text-[#1C1917] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E7E5E4]">
                    ISBN: {selectedBook.isbn}
                  </span>
                  <span className="text-xs text-[#78716C] font-mono">
                    ID: {selectedBook.id}
                  </span>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#1C1917] bg-white hover:bg-[#F3EFEA] border border-[#E7E5E4] rounded-md transition-colors cursor-pointer shadow-card"
                  >
                    <Edit3 className="w-3.5 h-3.5 stroke-[1.5] text-[#78716C]" />
                    <span>{t.updateDetails}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Circulation Metrics */}
            <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-[#E7E5E4] shrink-0">
              <div className="text-start md:text-end">
                <div className="text-2xl font-mono font-semibold text-[#1C1917] leading-none">
                  {rentals.length}
                  <span className="text-[#78716C] text-sm font-normal">
                    {' '}
                    / {selectedBook.totalCopies}
                  </span>
                </div>
                <p className="text-[11px] text-[#78716C] uppercase tracking-[0.06em] mt-1 font-mono">
                  {t.copiesCirculation}
                </p>
              </div>

              <div className="mt-2.5 text-end">
                <span className="text-[11px] font-mono text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#A7F3D0]">
                  {t.availableInStorage(Math.max(0, selectedBook.totalCopies - rentals.length))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Cohort Filter Chips */}
      {selectedBook && classNames.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.06em] text-[#78716C] me-1">
            <Filter className="w-3 h-3 stroke-[1.5]" />
            <span>{t.classFilter}</span>
          </div>

          <button
            onClick={() => setClassFilter(null)}
            className={`px-3 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
              classFilter === null
                ? 'bg-[#1C1917] text-[#FAF8F5] font-medium'
                : 'bg-white text-[#78716C] hover:bg-[#F3EFEA] hover:text-[#1C1917] border border-[#E7E5E4]'
            }`}
          >
            {t.allClasses(rentals.length)}
          </button>

          {classNames.map((cls) => (
            <button
              key={cls}
              onClick={() => setClassFilter(cls === classFilter ? null : cls)}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                classFilter === cls
                  ? 'bg-[#1C1917] text-[#FAF8F5] font-medium'
                  : 'bg-white text-[#78716C] hover:bg-[#F3EFEA] hover:text-[#1C1917] border border-[#E7E5E4]'
              }`}
            >
              {cls} ({groupedRentals[cls].length})
            </button>
          ))}
        </div>
      )}

      {/* Class Group Accordions */}
      {selectedBook && !loading && (
        <div className="space-y-3">
          {Object.entries(displayRentals).map(([cls, classRentals]) => (
            <ClassGroupAccordion
              key={cls}
              className={cls}
              rentals={classRentals}
              onMarkReturned={markReturned}
            />
          ))}

          {Object.keys(displayRentals).length === 0 && (
            <div className="bg-white border border-[#E7E5E4] rounded-lg p-10 text-center shadow-card">
              <BookOpen className="w-6 h-6 stroke-[1.5] text-[#78716C] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#1C1917]">
                {t.allCopiesInInventory}
              </p>
              <p className="text-xs text-[#78716C] mt-0.5">
                {t.noActiveBorrowings}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ACTIONABLE LAUNCHPAD: Instead of a giant blank box, display Quick-Access Curriculum Textbooks */}
      {!selectedBook && !searchQuery && (
        <div className="bg-white border border-[#E7E5E4] rounded-lg p-6 shadow-card">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E7E5E4]">
            <div>
              <h3 className="font-semibold text-sm text-[#1C1917] tracking-tight">
                {t.quickAccessTitles}
              </h3>
              <p className="text-xs text-[#78716C] font-sans mt-0.5">
                {t.quickAccessTitlesSub}
              </p>
            </div>
            <span className="text-xs font-mono text-[#78716C] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E7E5E4]">
              {t.titlesCataloged(books.length)}
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {books.slice(0, 6).map((book) => {
              const spineColor = SUBJECT_SPINE_COLORS[book.subject] || 'bg-[#B45309]';
              return (
                <button
                  key={book.id}
                  onClick={() => handleSelectBook(book)}
                  className="group relative flex flex-col justify-between p-4 bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E7E5E4] hover:border-[#D6D3D1] rounded-lg text-start transition-all duration-150 cursor-pointer shadow-xs hover:shadow-card"
                >
                  <div>
                    {/* Spine strip & Subject */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${spineColor}`} />
                        <span className="text-[11px] font-mono uppercase tracking-[0.04em] text-[#78716C]">
                          {book.subject}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#78716C]">
                        {book.gradeLevel}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-[#1C1917] group-hover:text-[#B45309] line-clamp-1 transition-colors">
                      {book.title}
                    </h4>

                    <p className="text-[11px] font-mono text-[#78716C] mt-1">
                      {book.isbn}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E7E5E4] text-xs">
                    <span className="font-mono text-[11px] text-[#065F46] bg-[#ECFDF5] px-1.5 py-0.2 rounded border border-[#A7F3D0]">
                      {book.availableCopies} {t.availShort}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1C1917]">
                      {t.viewRoster}
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
      {!selectedBook && searchQuery && filteredBooks.length === 0 && (
        <div className="bg-white border border-[#E7E5E4] rounded-lg p-10 text-center shadow-card">
          <BookOpen className="w-6 h-6 stroke-[1.5] text-[#78716C] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#1C1917]">
            {t.noBooksMatch(searchQuery)}
          </p>
          <p className="text-xs text-[#78716C] mt-1">
            {t.tryExactIsbn}
          </p>
        </div>
      )}

      {/* Edit Book Modal */}
      <EditBookModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        book={selectedBook}
        onBookUpdated={handleBookUpdated}
      />
    </div>
  );
}
