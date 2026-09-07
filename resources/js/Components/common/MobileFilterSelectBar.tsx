import type { ReactNode } from "react";
import Checkbox from "@/Components/ui/Checkbox";
import SearchBar from "@/Components/ui/SearchBar";

export interface MobileFilterSelectBarProps {
    /** Number of selected items to display in the pill */
    selectedCount: number;
    /** Total number of items in the current scope to display in the pill */
    totalCount: number;
    /** Whether all items in current scope are selected */
    allSelected: boolean;
    /** Whether some items are selected (renders indeterminate dash on checkbox) */
    indeterminate?: boolean;
    /** Callback when the select-all pill is clicked */
    onToggleSelectAll: (nextSelected: boolean) => void;
    /** Current search input value */
    searchValue: string;
    /** Callback when search input value changes */
    onSearchChange: (value: string) => void;
    /** Callback when search is submitted (optional) */
    onSearch?: (value: string) => void;
    /** Search input placeholder */
    searchPlaceholder?: string;
    /** Prefix for selection pill (default: "Pilih") */
    labelPrefix?: string;
    /** Custom label renderer for the pill (optional) */
    renderLabel?: (selectedCount: number, totalCount: number) => ReactNode;
    /** Disabled state for pill and/or bar */
    disabled?: boolean;
    /** Additional CSS classes for the container */
    className?: string;
    /** Additional CSS classes for the search input */
    searchInputClassName?: string;
    /** Optional extra element to render on the right of the search bar */
    extraAction?: ReactNode;
}

export default function MobileFilterSelectBar({
    selectedCount,
    totalCount,
    allSelected,
    indeterminate = false,
    onToggleSelectAll,
    searchValue,
    onSearchChange,
    onSearch,
    searchPlaceholder = "Cari data...",
    labelPrefix = "Pilih",
    renderLabel,
    disabled = false,
    className = "",
    searchInputClassName = "",
    extraAction,
}: MobileFilterSelectBarProps) {
    const isPillDisabled = disabled || totalCount === 0;

    const label = renderLabel
        ? renderLabel(selectedCount, totalCount)
        : selectedCount > 0
          ? `${labelPrefix} (${selectedCount}/${totalCount})`
          : `${labelPrefix} (${totalCount})`;

    return (
        <div className={`flex items-center gap-2 select-none shrink-0 ${className}`}>
            {/* Select All Pill */}
            <button
                type="button"
                onClick={() => {
                    if (!isPillDisabled) {
                        onToggleSelectAll(!allSelected);
                    }
                }}
                disabled={isPillDisabled}
                aria-label={allSelected ? "Batalkan pilih semua" : "Pilih semua"}
                className={`flex items-center gap-1.5 h-10 px-2.5 bg-surface border border-border rounded-xl text-[12px] shrink-0 font-medium text-text-secondary shadow-xs transition-all focus:outline-none ${
                    isPillDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer active:scale-95 hover:bg-muted/30"
                }`}
            >
                <Checkbox
                    checked={allSelected}
                    indeterminate={indeterminate}
                    readOnly
                    disabled={isPillDisabled}
                    className="pointer-events-none"
                />
                <span className="whitespace-nowrap font-semibold text-[11.5px] cursor-pointer">
                    {label}
                </span>
            </button>

            {/* Search Bar */}
            <div className="flex-1 min-w-0">
                <SearchBar
                    value={searchValue}
                    onChange={onSearchChange}
                    onSearch={onSearch || onSearchChange}
                    placeholder={searchPlaceholder}
                    inputClassName={searchInputClassName}
                />
            </div>

            {/* Extra Action slot if provided */}
            {extraAction && <div className="shrink-0">{extraAction}</div>}
        </div>
    );
}
