import type { ReactNode, SelectHTMLAttributes } from "react";
import Button from "@/Components/ui/Button";
import { FaSearch } from "react-icons/fa";

interface FilterOption {
    value: string;
    label: string;
}

interface FilterSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: FilterOption[];
}

function FilterSelect({
    label,
    options,
    className = "",
    ...props
}: FilterSelectProps) {
    return (
        <div className="w-full sm:w-auto">
            <label className="block text-[13px] text-text-muted font-inter mb-1">
                {label}
            </label>
            <select
                className={`w-full sm:w-auto border border-border rounded-xl px-3 py-2 text-[14px] font-inter text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:outline-none ${className}`}
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
    label: string;
    value?: string;
    onChange?: (value: string) => void;
}

function FilterDate({ label, value, onChange }: FilterDateProps) {
    return (
        <div className="w-full sm:w-auto">
            <label className="block text-[13px] text-text-muted font-inter mb-1">
                {label}
            </label>
            <input
                type="date"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                className="w-full sm:w-auto border border-border rounded-xl px-3 py-2 text-[14px] font-inter text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
        </div>
    );
}

interface FilterSearchProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    placeholder?: string;
}

function FilterSearch({
    value,
    onChange,
    onSubmit,
    placeholder = "Cari data...",
}: FilterSearchProps) {
    return (
        <form
            onSubmit={onSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 w-full sm:w-auto"
        >
            <div className="w-full sm:w-auto">
                <label className="block text-[13px] text-text-muted font-inter mb-1">
                    Pencarian
                </label>
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-inactive text-sm pointer-events-none" />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full sm:w-auto pl-10 pr-4 py-2 border border-border rounded-xl text-[14px] font-inter text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-text-inactive"
                    />
                </div>
            </div>
            <Button type="submit" variant="ghost" size="sm">
                Cari
            </Button>
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
            className={`px-4 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
                active
                    ? "bg-accent text-primary"
                    : "bg-muted text-text-muted hover:bg-border"
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

export default function FilterBar({
    children,
    className = "",
}: FilterBarProps) {
    return (
        <section
            className={`bg-surface border border-border rounded-xl shadow-dropdown p-[15px_20px] ${className}`}
        >
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-end">
                {children}
            </div>
        </section>
    );
}

FilterBar.Select = FilterSelect;
FilterBar.Date = FilterDate;
FilterBar.Search = FilterSearch;
FilterBar.Pill = FilterPill;
