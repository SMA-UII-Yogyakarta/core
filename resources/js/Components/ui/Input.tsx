import type { InputHTMLAttributes, KeyboardEvent, ReactNode } from "react";
import Label from "./Label";
import FormError from "./FormError";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: string;
    rightIcon?: ReactNode;
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
    ".",
    "-",
];

export default function Input({
    label,
    error,
    icon,
    rightIcon,
    numeric = false,
    description,
    className = "",
    inputClassName = "",
    onKeyDown,
    id,
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
            {label && <Label htmlFor={id}>{label}</Label>}
            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">
                        <i className={`fas ${icon}`} />
                    </span>
                )}
                <input
                    id={id}
                    className={`w-full h-10 px-3.5 border border-border rounded-xl
                        text-[13px] font-medium text-text-primary font-inter bg-surface
                        placeholder:text-text-inactive
                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-150
                        ${icon ? "pl-10" : ""}
                        ${rightIcon ? "pr-10" : ""}
                        ${error ? "border-danger ring-1 ring-danger/40" : ""}
                        ${inputClassName}`}
                    onKeyDown={numeric ? handleNumericKeyDown : onKeyDown}
                    {...props}
                />
                {rightIcon && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-sm">
                        {rightIcon}
                    </span>
                )}
            </div>
            {description && !error && <p className="mt-1 text-[12px] text-text-muted font-inter">{description}</p>}
            <FormError message={error} />
        </div>
    );
}
