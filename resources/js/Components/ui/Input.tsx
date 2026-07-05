import type { InputHTMLAttributes } from 'react';
import type { IconType } from 'react-icons';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: IconType;
}

export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col w-full gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-text-secondary"
        >
          {label}
        </label>
      )}

      <div className="relative w-full">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-3.5 h-3.5 text-text-muted" />
          </div>
        )}

        <input
          id={inputId}
          className={`
            w-full h-10 px-3 py-[11px] bg-surface
            border rounded-md text-xs font-primary
            placeholder:text-text-placeholder text-text-primary
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            disabled:bg-background disabled:cursor-not-allowed
            ${error ? 'border-danger' : 'border-border-input'}
            ${Icon ? 'pl-10' : ''}
            ${className}
          `.trim()}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs text-danger mt-0.5">{error}</p>
      )}
    </div>
  );
}
