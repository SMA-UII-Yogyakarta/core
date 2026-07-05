import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { FaInbox } from 'react-icons/fa';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon?: IconType;
  title?: string;
  description?: string;
  action?: EmptyStateAction;
  children?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon = FaInbox,
  title = 'Belum ada data',
  description,
  action,
  children,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-16 h-16 mb-5 rounded-full bg-background flex items-center justify-center">
        <Icon className="w-7 h-7 text-text-muted" />
      </div>

      <h3 className="text-sm font-bold text-text-primary mb-1">{title}</h3>

      {description && (
        <p className="text-xs text-text-muted max-w-sm mb-4">{description}</p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}

      {children}
    </div>
  );
}
