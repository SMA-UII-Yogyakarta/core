import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Label from "./Label";
import FormError from "./FormError";

interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectInputProps {
    label?: string;
    error?: string;
    description?: string;
    placeholder?: string;
    options: SelectOption[];
    value?: string | number | null;
    onChange?: (value: string | number | null) => void;
    className?: string;
    disabled?: boolean;
}

export default function SelectInput({
    label,
    error,
    description,
    placeholder = "-- Pilih --",
    options,
    value,
    onChange,
    className = "",
    disabled = false,
}: SelectInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    const filteredOptions = useMemo(
        () => options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase())),
        [options, searchQuery],
    );

    const close = useCallback(() => {
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(-1);
    }, []);

    const openDropdown = () => {
        setIsOpen(true);
        const idx = filteredOptions.findIndex((opt) => opt.value === value);
        setHighlightedIndex(idx >= 0 ? idx : 0);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                close();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [close]);

    useEffect(() => {
        if (isOpen) {
            searchInputRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (optionsRef.current) {
            const highlighted = optionsRef.current.children[highlightedIndex] as HTMLElement;
            highlighted?.scrollIntoView({ block: "nearest" });
        }
    }, [highlightedIndex]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                e.preventDefault();
                openDropdown();
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((i) => Math.max(i - 1, 0));
                break;
            case "Enter":
                e.preventDefault();
                if (filteredOptions[highlightedIndex]) {
                    onChange?.(filteredOptions[highlightedIndex].value);
                    close();
                }
                break;
            case "Escape":
                e.preventDefault();
                close();
                break;
        }
    };

    const handleSelect = (val: string | number) => {
        onChange?.(val);
        close();
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.(null);
        close();
    };

    return (
        <div className={`w-full ${className}`} ref={containerRef}>
            {label && <Label>{label}</Label>}
            <div className="relative">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && (isOpen ? close() : openDropdown())}
                    onKeyDown={handleKeyDown}
                    className={`w-full flex items-center justify-between px-4 py-2.5 border rounded-lg text-[14px] font-inter text-left bg-surface
                        focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${error ? "border-danger ring-1 ring-danger/40" : "border-border"}
                        ${isOpen ? "ring-2 ring-primary/40 border-transparent" : ""}`}
                >
                    <span className={selectedOption ? "text-text-primary" : "text-text-inactive"}>
                        {selectedOption?.label || placeholder}
                    </span>
                    <div className="flex items-center gap-1">
                        {selectedOption && !disabled && (
                            <span
                                onClick={handleClear}
                                className="text-text-muted hover:text-text-primary cursor-pointer px-1"
                            >
                                ×
                            </span>
                        )}
                        <svg
                            className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute w-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-50">
                        <div className="px-3 py-2 border-b border-border">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setHighlightedIndex(0);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Cari..."
                                className="w-full bg-transparent text-[14px] text-text-primary placeholder:text-text-inactive focus:outline-none font-inter"
                            />
                        </div>
                        <div ref={optionsRef} className="max-h-60 overflow-auto py-1">
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-2 text-[14px] text-text-inactive font-inter">
                                    Tidak ada data
                                </div>
                            ) : (
                                filteredOptions.map((opt, index) => (
                                    <div
                                        key={opt.value}
                                        onClick={() => handleSelect(opt.value)}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                        className={`px-3 py-2 text-[14px] font-inter cursor-pointer ${
                                            opt.value === value
                                                ? "bg-primary/20 text-primary font-medium"
                                                : "text-text-primary hover:bg-primary/10"
                                        } ${index === highlightedIndex ? "ring-2 ring-primary/40 ring-inset" : ""}`}
                                    >
                                        {opt.label}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            {description && !error && <p className="mt-1 text-[12px] text-text-muted font-inter">{description}</p>}
            <FormError message={error} />
        </div>
    );
}
