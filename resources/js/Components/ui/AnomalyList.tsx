import EmptyState from './EmptyState';

interface AnomalyStudent {
  id: number;
  name: string;
  subtitle?: string;
}

interface AnomalyListProps {
  students: AnomalyStudent[];
  className?: string;
}

export default function AnomalyList({
  students,
  className = '',
}: AnomalyListProps) {
  if (students.length === 0) {
    return (
      <EmptyState
        title="Tidak ada anomali"
        description="Semua siswa tercatat hadir hari ini"
      />
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {students.map((student) => (
        <div
          key={student.id}
          className="bg-surface rounded-xl border border-border pt-[17px] pb-5 px-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-primary text-sm leading-4">
                {student.name}
              </span>
              <span className="text-xs text-text-muted">
                {student.subtitle ?? 'Belum ada kabar masuk'}
              </span>
            </div>

            <span className="bg-danger-light text-danger rounded-md px-2.5 py-1 text-xs font-bold leading-none whitespace-nowrap">
              ALPA
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
