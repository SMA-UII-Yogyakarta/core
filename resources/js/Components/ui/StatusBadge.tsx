import Badge from './Badge';

export type StatusType =
  | 'present'
  | 'late'
  | 'absent'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'inactive'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'default' }> = {
  present:  { label: 'Hadir',   variant: 'success' },
  late:     { label: 'Terlambat', variant: 'warning' },
  absent:   { label: 'Alpha',   variant: 'danger' },
  pending:  { label: 'Menunggu', variant: 'warning' },
  approved: { label: 'Disetujui', variant: 'success' },
  rejected: { label: 'Ditolak', variant: 'danger' },
  active:   { label: 'Aktif',   variant: 'success' },
  inactive: { label: 'Nonaktif', variant: 'danger' },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] ?? {
    label: status,
    variant: 'default' as const,
  };

  return (
    <Badge variant={config.variant} size="sm" className={className}>
      {config.label}
    </Badge>
  );
}
