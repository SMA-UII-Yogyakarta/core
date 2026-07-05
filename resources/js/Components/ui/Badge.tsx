import type { ReactNode } from 'react';

export type BadgeVariant = 'default' | 'success' | 'danger' | 'warning';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-danger text-white',
  success: 'bg-success text-white',
  danger: 'bg-danger text-white',
  warning: 'bg-amber-500 text-white',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'min-w-[16px] h-4 text-[10px] px-[4px]',
  md: 'min-w-[24px] h-6 text-xs px-[6px]',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-bold leading-none
        rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.trim()}
    >
      {children}
    </span>
  );
}
