import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: string;
}

export default function Input({
    label,
    error,
    icon,
    className = "",
    ...props
}: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-[13px] font-medium text-primary mb-1.5 font-inter">
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
                        ${className}`}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-[12px] text-danger font-inter">
                    {error}
                </p>
            )}
        </div>
    );
}
