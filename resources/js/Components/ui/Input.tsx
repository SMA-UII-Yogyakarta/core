import type { InputHTMLAttributes, KeyboardEvent } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: string;
    numeric?: boolean;
    description?: string;
    inputClassName?: string;
}

const allowedNumericKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
];

export default function Input({
    label,
    error,
    icon,
    numeric = false,
    description,
    className = "",
    inputClassName = "",
    onKeyDown,
    ...props
}: InputProps) {
    const handleNumericKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (allowedNumericKeys.includes(e.key)) return;
        if (e.ctrlKey || e.metaKey) return;
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
        onKeyDown?.(e);
    };

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-primary mb-1.5 font-inter">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">
                        <i className={`fas ${icon}`} />
                    </span>
                )}
                <input
                    className={`w-full px-4 py-2.5 border border-border rounded-lg
                        text-[14px] text-text-primary font-inter bg-surface
                        placeholder:text-text-inactive
                        focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent
                        ${icon ? "pl-10" : ""}
                        ${error ? "border-danger ring-1 ring-danger/40" : ""}
                        ${inputClassName}`}
                    onKeyDown={numeric ? handleNumericKeyDown : onKeyDown}
                    {...props}
                />
            </div>
            {description && !error && (
                <p className="mt-1 text-[12px] text-text-muted font-inter">
                    {description}
                </p>
            )}
            {error && (
                <p className="mt-1 text-[12px] text-danger font-inter">
                    {error}
                </p>
            )}
        </div>
    );
}
