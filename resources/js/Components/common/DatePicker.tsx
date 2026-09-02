import { useState, useRef, useEffect, useMemo, useCallback } from "react";

interface DatePickerProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    label?: string;
    className?: string;
    disabled?: boolean;
    min?: string;
    max?: string;
}

const MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function isoToDisplay(iso: string): string {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

function displayToIso(display: string): string | null {
    const parts = display.split("/");
    if (parts.length !== 3) return null;
    const [d, m, y] = parts;
    if (d.length !== 2 || m.length !== 2 || y.length !== 4) return null;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    if (
        date.getDate() !== Number(d) ||
        date.getMonth() !== Number(m) - 1 ||
        date.getFullYear() !== Number(y)
    ) {
        return null;
    }
    return `${y}-${m}-${d}`;
}

function autoFormat(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function getSegmentAtCursor(cursorPos: number): "day" | "month" | "year" | null {
    if (cursorPos <= 1) return "day";
    if (cursorPos === 2 || cursorPos === 5) return null;
    if (cursorPos <= 4) return "month";
    return "year";
}

function incrementSegment(display: string, cursorPos: number, delta: number): string | null {
    const segment = getSegmentAtCursor(cursorPos);
    if (!segment) return null;

    const parts = display.split("/");
    if (parts.length !== 3) return null;
    let [d, m, y] = parts.map(Number);

    switch (segment) {
        case "day": {
            d += delta;
            const maxDays = new Date(y, m, 0).getDate();
            if (d < 1) d = maxDays;
            if (d > maxDays) d = 1;
            break;
        }
        case "month": {
            m += delta;
            if (m < 1) { m = 12; y -= 1; }
            if (m > 12) { m = 1; y += 1; }
            const maxDaysM = new Date(y, m, 0).getDate();
            if (d > maxDaysM) d = maxDaysM;
            break;
        }
        case "year": {
            y += delta;
            if (y < 1900) y = 1900;
            if (y > 2100) y = 2100;
            const maxDaysY = new Date(y, m, 0).getDate();
            if (d > maxDaysY) d = maxDaysY;
            break;
        }
    }

    const newDisplay = `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
    return displayToIso(newDisplay) ? newDisplay : null;
}

export default function DatePicker({
    value = "",
    onChange,
    placeholder = "dd/mm/yyyy",
    label,
    className = "",
    disabled = false,
    min,
    max,
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [draftValue, setDraftValue] = useState("");
    const [viewMonth, setViewMonth] = useState(() => {
        const d = value ? new Date(value) : new Date();
        return { month: d.getMonth() + 1, year: d.getFullYear() };
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const displayValue = isFocused ? draftValue : isoToDisplay(value);

    useEffect(() => {
        if (!isOpen) return;
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const commitValue = useCallback(
        (display: string) => {
            if (display === "") {
                setIsInvalid(false);
                onChange?.("");
                return;
            }
            const iso = displayToIso(display);
            if (iso) {
                if (min && iso < min) { setIsInvalid(true); return; }
                if (max && iso > max) { setIsInvalid(true); return; }
                setIsInvalid(false);
                onChange?.(iso);
            } else {
                setIsInvalid(true);
            }
        },
        [onChange, min, max],
    );

    const handleInputChange = (raw: string) => {
        const formatted = autoFormat(raw);
        setDraftValue(formatted);
        if (formatted.length === 10) commitValue(formatted);
    };

    const handleFocus = () => {
        if (disabled) return;
        setIsFocused(true);
        setDraftValue(isoToDisplay(value));
        setIsOpen(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
        commitValue(draftValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const cursorPos = inputRef.current?.selectionStart ?? 0;
            const delta = e.key === "ArrowUp" ? 1 : -1;
            const newDisplay = incrementSegment(draftValue, cursorPos, delta);
            if (newDisplay) {
                setDraftValue(newDisplay);
                commitValue(newDisplay);
                requestAnimationFrame(() => {
                    inputRef.current?.setSelectionRange(cursorPos, cursorPos);
                });
            }
            return;
        }
        if (e.key === "Enter") {
            e.preventDefault();
            if (isOpen) {
                commitValue(draftValue);
                setIsOpen(false);
            } else {
                setIsOpen(true);
            }
        }
        if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    const selectDay = (day: number) => {
        const iso = `${viewMonth.year}-${String(viewMonth.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        setDraftValue(isoToDisplay(iso));
        setIsInvalid(false);
        setIsOpen(false);
        setIsFocused(false);
        onChange?.(iso);
    };

    const goToday = () => {
        const now = new Date();
        const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        setDraftValue(isoToDisplay(iso));
        setIsInvalid(false);
        setIsOpen(false);
        setIsFocused(false);
        onChange?.(iso);
    };

    const clearValue = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDraftValue("");
        setIsInvalid(false);
        setIsFocused(false);
        onChange?.("");
    };

    const prevMonth = () => {
        setViewMonth((v) => {
            if (v.month === 1) return { month: 12, year: v.year - 1 };
            return { ...v, month: v.month - 1 };
        });
    };

    const nextMonth = () => {
        setViewMonth((v) => {
            if (v.month === 12) return { month: 1, year: v.year + 1 };
            return { ...v, month: v.month + 1 };
        });
    };

    const cells = useMemo(() => {
        const firstDay = new Date(viewMonth.year, viewMonth.month - 1, 1).getDay();
        const daysInMonth = new Date(viewMonth.year, viewMonth.month, 0).getDate();
        const grid: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) grid.push(null);
        for (let d = 1; d <= daysInMonth; d++) grid.push(d);
        return grid;
    }, [viewMonth.month, viewMonth.year]);

    const selectedIso = value || "";
    const today = new Date();

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-[13px] text-text-muted font-inter mb-1">{label}</label>
            )}

            <div className="relative flex items-center">
                <input
                    ref={inputRef}
                    type="text"
                    value={displayValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={10}
                    className={`w-[160px] h-10 border rounded-xl px-3.5 pr-16 text-[13px] font-medium text-text-primary bg-surface font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-150 ${
                        isInvalid ? "border-danger ring-1 ring-danger/40" : "border-border"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                />

                <div className="absolute right-1 flex items-center gap-0.5">
                    {value && !disabled && (
                        <button
                            type="button"
                            onClick={clearValue}
                            className="p-1 text-text-muted hover:text-text-primary transition-colors"
                            tabIndex={-1}
                        >
                            <i className="fas fa-times text-[10px]" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        className="p-1 text-text-muted hover:text-text-primary transition-colors"
                        tabIndex={-1}
                    >
                        <i className="fas fa-calendar text-[12px]" />
                    </button>
                </div>
            </div>

            {isInvalid && displayValue && (
                <p className="text-[11px] text-danger mt-1">Format: dd/mm/yyyy</p>
            )}

            {isOpen && !disabled && (
                <div className="absolute z-50 mt-1 bg-surface border border-border rounded-xl shadow-dropdown p-3 w-[280px]">
                    <div className="flex items-center justify-between mb-3">
                        <button type="button" onClick={prevMonth} className="p-1 hover:bg-muted rounded-lg transition-colors">
                            <i className="fas fa-chevron-left text-[11px] text-text-muted" />
                        </button>
                        <span className="text-[13px] font-bold text-text-primary">
                            {MONTH_NAMES[viewMonth.month - 1]} {viewMonth.year}
                        </span>
                        <button type="button" onClick={nextMonth} className="p-1 hover:bg-muted rounded-lg transition-colors">
                            <i className="fas fa-chevron-right text-[11px] text-text-muted" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 mb-1">
                        {DAY_LABELS.map((d, i) => (
                            <div
                                key={d}
                                className={`text-center text-[10px] font-bold py-1 select-none ${
                                    i === 0 ? "text-danger" : "text-text-muted"
                                }`}
                            >
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-y-0.5">
                        {cells.map((day, idx) => {
                            if (!day) return <div key={`empty-${idx}`} className="h-7" />;

                            const iso = `${viewMonth.year}-${String(viewMonth.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                            const isToday =
                                day === today.getDate() &&
                                viewMonth.month === today.getMonth() + 1 &&
                                viewMonth.year === today.getFullYear();
                            const isSelected = selectedIso === iso;
                            const isDisabled =
                                (min && iso < min) || (max && iso > max);

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => !isDisabled && selectDay(day)}
                                    disabled={!!isDisabled}
                                    className={`h-7 flex items-center justify-center text-[12px] rounded-lg transition-colors ${
                                        isDisabled
                                            ? "text-text-muted/40 cursor-not-allowed"
                                            : isSelected
                                              ? "bg-primary text-white font-bold"
                                              : isToday
                                                ? "bg-primary/10 text-primary font-bold"
                                                : "text-text-primary hover:bg-muted"
                                    }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-2 pt-2 border-t border-border flex justify-center">
                        <button
                            type="button"
                            onClick={goToday}
                            className="text-[11px] text-primary font-semibold hover:underline"
                        >
                            Hari ini
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
