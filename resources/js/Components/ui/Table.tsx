import type { ReactNode } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaInbox,
  FaExclamationCircle,
} from 'react-icons/fa';

export interface Column<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => ReactNode;
  sortable?: boolean;
}

interface TableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  error?: string | null;
  onRetry?: () => void;
  onSelectionChange?: (selected: number[]) => void;
  className?: string;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-12 bg-background animate-pulse rounded-lg"
        />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center py-12 text-text-muted">
      <FaInbox className="w-12 h-12 mb-4" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-danger-light border border-danger-border rounded-lg p-4 flex items-start gap-3">
      <FaExclamationCircle className="text-danger mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-bold text-danger">Gagal memuat data</p>
        <p className="text-xs text-text-secondary mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-semibold text-primary hover:underline shrink-0"
        >
          Coba lagi
        </button>
      )}
    </div>
  );
}

export default function Table<T extends { id: number | string }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'Belum ada data',
  error = null,
  onRetry,
  className = '',
}: TableProps<T>) {

  /* ===== Loading State ===== */
  if (loading) return <LoadingSkeleton />;

  /* ===== Error State ===== */
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  /* ===== Empty State ===== */
  if (!data || data.length === 0) return <EmptyState message={emptyMessage} />;

  /* ===== Data View ===== */
  return (
    <div className={`overflow-x-auto rounded-lg border border-border ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-background border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-surface divide-y divide-border">
          {data.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-background/50 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-text-primary">
                  {col.render
                    ? col.render((row as any)[col.key], row)
                    : (row as any)[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ===== Pagination sub-component ===== */
interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginationProps {
  links: PaginationLink[];
  className?: string;
}

export function Pagination({ links, className = '' }: PaginationProps) {
  if (!links || links.length <= 1) return null;

  return (
    <div
      className={`flex items-center justify-center gap-1 mt-4 ${className}`}
    >
      {links.map((link, i) => {
        const isDisabled = !link.url;
        const isActive = link.active;

        return (
          <a
            key={i}
            href={link.url ?? '#'}
            className={`
              inline-flex items-center justify-center min-w-[36px] h-9
              px-3 text-xs font-medium rounded-md transition-colors
              ${isActive
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-background'
              }
              ${isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
            `.trim()}
            {...(isDisabled ? { tabIndex: -1 } : {})}
          >
            {link.label === 'pagination.previous' ? (
              <FaChevronLeft className="w-3 h-3" />
            ) : link.label === 'pagination.next' ? (
              <FaChevronRight className="w-3 h-3" />
            ) : (
              link.label
            )}
          </a>
        );
      })}
    </div>
  );
}

export { LoadingSkeleton, EmptyState, ErrorState };
