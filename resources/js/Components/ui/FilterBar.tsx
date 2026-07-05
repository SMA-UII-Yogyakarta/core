import {
    type ReactNode,
    useState,
    type ChangeEvent,
    type KeyboardEvent,
} from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import type { IconType } from "react-icons";

interface FilterBarProps {
    children?: ReactNode;
    onSearch?: (query: string) => void;
    onReset?: () => void;
    searchPlaceholder?: string;
    heading?: string;
    headingIcon?: IconType;
    className?: string;
    /** Mobile variant: smaller inputs */
    mobile?: boolean;
}

export default function FilterBar({
    children,
    onSearch,
    onReset,
    searchPlaceholder = "Cari...",
    heading,
    headingIcon: HeadingIcon,
    className = "",
    mobile = false,
}: FilterBarProps) {
    const [searchValue, setSearchValue] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && onSearch) {
            onSearch(searchValue);
        }
    };

    const handleReset = () => {
        setSearchValue("");
        onReset?.();
    };

    return (
        <div
            className={`flex flex-col md:flex-row items-start md:items-center gap-3 ${className}`}
        >
            {heading && (
                <div className="flex items-center gap-2 shrink-0">
                    {HeadingIcon && (
                        <HeadingIcon className="w-4 h-4 text-primary" />
                    )}
                    <span className="font-brand font-bold text-xl text-primary">
                        {heading}
                    </span>
                </div>
            )}

            {onSearch && (
                <div className="relative w-full md:max-w-xs">
                    <FaSearch
                        className={`absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none ${
                            mobile ? "left-2.5 w-3 h-3" : "w-3.5 h-3.5"
                        }`}
                    />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setSearchValue(e.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        placeholder={searchPlaceholder}
                        className={`w-full bg-surface border border-border rounded-md text-xs text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                            mobile
                                ? "h-8 pl-8 pr-2.5 py-[5px]"
                                : "h-10 pl-9 pr-3 py-[11px]"
                        }`}
                    />
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {children}

                {onReset && (
                    <button
                        onClick={handleReset}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary bg-surface border border-border rounded-md hover:bg-background transition-colors ${
                            mobile ? "h-8 px-2.5 py-[4px]" : "px-3 py-[6px]"
                        }`}
                    >
                        <FaTimes className="w-3 h-3" />
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
}
