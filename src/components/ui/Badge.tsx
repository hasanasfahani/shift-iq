import type { ShiftStatus, ApplicationStatus } from '@/types';

type BadgeVariant = ShiftStatus | ApplicationStatus | 'info';

const variantClasses: Record<string, string> = {
  open:      'bg-[#DDF4EA] text-[#0F3D36]',
  filled:    'bg-[#FFF3D4] text-[#B45309]',
  completed: 'bg-[#DDF4EA] text-[#15594D]',
  cancelled: 'bg-[#F3F0FB] text-[#8B8299]',
  pending:   'bg-[#E9DEFF] text-[#7426E8]',
  accepted:  'bg-[#DDF4EA] text-[#15594D]',
  declined:  'bg-[#FFE4E4] text-red-700',
  withdrawn: 'bg-[#F3F0FB] text-[#8B8299]',
  no_show:   'bg-[#FFE4E4] text-red-700',
  info:      'bg-[#E9DEFF] text-[#7426E8]',
};

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
}

export default function Badge({ variant, label }: BadgeProps) {
  const cls = variantClasses[variant] ?? variantClasses.info;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
