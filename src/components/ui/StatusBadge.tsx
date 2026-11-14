import { useLanguage } from '../../context/LanguageContext';

interface StatusBadgeProps {
  status: 'active' | 'returned' | 'overdue';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useLanguage();

  const statusConfig: Record<
    string,
    { container: string; label: string }
  > = {
    active: {
      container: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
      label: t.statusActive,
    },
    returned: {
      container: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
      label: t.statusReturned,
    },
    overdue: {
      container: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
      label: t.statusOverdue,
    },
  };

  const conf = statusConfig[status] || statusConfig.active;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono tracking-tight border font-medium ${conf.container}`}
    >
      {conf.label}
    </span>
  );
}
