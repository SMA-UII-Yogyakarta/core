import type { SelectHTMLAttributes } from "react";

interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    className?: string;
}

export default function NativeSelect({ className = "", children, style = {}, ...props }: NativeSelectProps) {
    const customArrowStyle = {
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
        backgroundPosition: "right 10px center",
        backgroundSize: "12px 12px",
        backgroundRepeat: "no-repeat",
        ...style,
    };

    return (
        <select
            style={customArrowStyle}
            className={`h-10 w-full max-w-full truncate appearance-none border border-border rounded-xl pl-3.5 pr-8 text-[13px] font-medium font-inter text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-150 cursor-pointer ${className}`}
            {...props}
        >
            {children}
        </select>
    );
}
