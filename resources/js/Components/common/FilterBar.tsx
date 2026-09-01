import type { ReactNode, SelectHTMLAttributes } from "react";
import { FiSearch } from "react-icons/fi";

interface FilterOption {
    value: string;
    label: string;
}

interface FilterSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: FilterOption[];
}

function FilterSelect({ label, options, className = "", ...props }: FilterSelectProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 w-full sm:w-auto">
            {label && (
                <label className="text-[13px] font-bold text-text-secondary font-inter shrink-0">
                    {label}
                </label>
            )}
            <select
                className={`w-full sm:w-auto border border-border rounded-xl px-3.5 py-2 text-[13px] font-semibold font-inter text-text-primary bg-surface shadow-2xs hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer ${className}`}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

interface FilterDateProps {
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
}

function FilterDate({ label, value, onChange }: FilterDateProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 w-full sm:w-auto">
            {label && (
                <label className="text-[13px] font-bold text-text-secondary font-inter shrink-0">
                    {label}
                </label>
            )}
            <input
                type="date"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                className="w-full sm:w-auto border border-border rounded-xl px-3.5 py-2 text-[13px] font-semibold font-inter text-text-primary bg-surface shadow-2xs hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
            />
        </div>
    );
}

interface FilterSearchProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit?: (e: React.FormEvent) => void;
    placeholder?: string;
    label?: string;
}

function FilterSearch({ value, onChange, onSubmit, placeholder = "Cari data...", label }: FilterSearchProps) {
    return (
        <form
            onSubmit={(e) => {
                if (onSubmit) onSubmit(e);
                else e.preventDefault();
            }}
            className="flex flex-col sm:flex-row sm:items-center gap-1.5 w-full sm:w-auto"
        >
            {label && (
                <label className="text-[13px] font-bold text-text-secondary font-inter shrink-0">
                    {label}
                </label>
            )}
            <div className="relative w-full sm:w-64">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-xl text-[13px] font-medium font-inter text-text-primary bg-surface shadow-2xs hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-text-inactive transition-all"
                />
            </div>
        </form>
    );
}

interface FilterPillProps {
    label: string;
    active?: boolean;
    onClick?: () => void;
}

function FilterPill({ label, active, onClick }: FilterPillProps) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                active
                    ? "bg-primary text-white shadow-xs"
                    : "bg-surface border border-border text-text-muted hover:text-text-primary hover:bg-muted"
            }`}
            type="button"
        >
            {label}
        </button>
    );
}

interface FilterBarProps {
    children?: ReactNode;
    className?: string;
}

export default function FilterBar({ children, className = "" }: FilterBarProps) {
    return (
        <section className={`bg-surface border border-border rounded-xl shadow-dropdown p-[15px_20px] ${className}`}>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-end">{children}</div>
        </section>
    );
}

FilterBar.Select = FilterSelect;
FilterBar.Date = FilterDate;
FilterBar.Search = FilterSearch;
FilterBar.Pill = FilterPill;