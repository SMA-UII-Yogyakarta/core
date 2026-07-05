import { type ButtonHTMLAttributes } from 'react';
import type { IconType } from 'react-icons';

export type ButtonVariant =
  | 'detail'       // variant 1 — bg-background, text-primary, border
  | 'edit'         // variant 2 — bg-amber-50, text-amber-600
  | 'filter'       // variant 3 — bg-surface, border, text-secondary
  | 'delete'       // variant 4 — bg-danger-light, text-danger
  | 'import'       // variant 5 — bg-accent, text-text-primary
  | 'add'          // variant 6 — bg-primary, text-white
  | 'primary'      // tambahan: solid primary
  | 'secondary';   // tambahan: outline

export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconType;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  detail:
    'bg-background text-primary border border-border hover:bg-primary-light active:bg-primary-light',
  edit:
    'bg-amber-50 text-amber-600 border border-warning-border hover:bg-warning-light active:bg-warning-light',
  filter:
    'bg-surface text-text-secondary border border-border',
  delete:
    'bg-danger-light text-danger border border-danger-border',
  import:
    'bg-accent text-text-primary',
  add:
    'bg-primary text-white hover:bg-primary/90 active:bg-primary/80',
  primary:
    'bg-primary text-white hover:bg-primary/90 active:bg-primary/80',
  secondary:
    'bg-background text-primary border border-border hover:bg-surface active:bg-surface',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-[10px] py-[6px] text-xs gap-[5px]',
  md: 'px-[15px] py-[8px] text-xs gap-[6px]',
  lg: 'px-6 py-3 text-sm gap-2',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold rounded-md
        transition-colors duration-150 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5" />
      ) : null}
      {children && <span>{children}</span>}
    </button>
  );
}
