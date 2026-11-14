import { useState } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, CheckCircle2, Barcode, Calendar } from 'lucide-react';
import type { Rental } from '../../types/database';
import { useLanguage } from '../../context/LanguageContext';

interface ClassGroupAccordionProps {
  className: string;
  rentals: Rental[];
  onMarkReturned: (rentalId: string) => void;
}

export default function ClassGroupAccordion({
  className: cls,
  rentals,
  onMarkReturned,
}: ClassGroupAccordionProps) {
  const [open, setOpen] = useState(true);
  const [returningId, setReturningId] = useState<string | null>(null);
  const { t, lang, isRtl } = useLanguage();

  const handleReturn = async (rentalId: string) => {
    setReturningId(rentalId);
    try {
      await onMarkReturned(rentalId);
    } finally {
      setReturningId(null);
    }
  };

  const [gradePart, sectionPart] = cls.split('-');

  return (
    <div className="bg-white border border-[#E7E5E4] rounded-lg overflow-hidden transition-colors shadow-card">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3.5 sm:px-5 py-3 sm:py-3.5 bg-[#FAF8F5] hover:bg-[#F3EFEA] transition-colors border-b border-[#E7E5E4] text-start cursor-pointer"
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="text-[#78716C] shrink-0">
            {open ? (
              <ChevronDown className="w-4 h-4 stroke-[1.5]" />
            ) : isRtl ? (
              <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
            ) : (
              <ChevronRight className="w-4 h-4 stroke-[1.5]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-semibold text-[#1C1917] tracking-[-0.01em]">
                {sectionPart ? t.gradeAndClass(gradePart, sectionPart) : t.cohort(cls)}
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono px-1.5 sm:px-2 py-0.2 rounded-md bg-[#FAF8F5] text-[#78716C] border border-[#E7E5E4]">
                {cls}
              </span>
            </div>
          </div>
        </div>

        {/* Refined Count Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] sm:text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            {t.copiesOut(rentals.length)}
          </span>
        </div>
      </button>

      {/* Student Rows Table */}
      {open && (
        <div className="divide-y divide-[#E7E5E4] bg-white">
          {rentals.map((r) => {
            const initials = r.studentName
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('');

            return (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between px-3.5 sm:px-5 py-3 gap-2.5 sm:gap-3 hover:bg-[#F3EFEA] transition-colors"
              >
                {/* Student Info */}
                <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-[#FAF8F5] border border-[#E7E5E4] text-[#1C1917] flex items-center justify-center text-xs font-mono font-medium shrink-0 mt-0.5 sm:mt-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1C1917] truncate tracking-[-0.01em]">
                      {r.studentName}
                    </p>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap text-xs">
                      <span className="font-mono text-[10px] sm:text-[11px] text-[#78716C] bg-[#FAF8F5] px-1.5 py-0.2 rounded border border-[#E7E5E4]">
                        {t.studentIdLabel} {r.studentSchoolId}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] sm:text-[11px] text-[#1C1917] bg-[#FEF3C7] px-1.5 py-0.2 rounded border border-[#FDE68A]">
                        <Barcode className="w-3 h-3 text-[#B45309] stroke-[1.5]" />
                        {r.copyBarcode}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-[#78716C] font-mono inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#78716C] stroke-[1.5]" />
                        {t.issuedDateLabel}{' '}
                        {r.rentedAt?.toDate
                          ? r.rentedAt.toDate().toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : lang === 'he' ? 'לאחרונה' : 'Recent'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Return Action */}
                <div className="flex items-center justify-end shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => handleReturn(r.id)}
                    disabled={returningId === r.id}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1 text-xs font-medium text-[#065F46] bg-[#ECFDF5] hover:bg-[#A7F3D0]/60 border border-[#A7F3D0] rounded-md transition-colors cursor-pointer disabled:opacity-50 min-h-[36px] sm:min-h-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>{returningId === r.id ? t.returningLabel : t.markReturnedButton}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
