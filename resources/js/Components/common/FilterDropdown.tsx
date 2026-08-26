import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterOption {
    value: string;
    label: string;
}

interface FilterDropdownProps {
    open: boolean;
    onClose: () => void;
    trigger: React.ReactNode;
    options: FilterOption[];
    value: string | string[];
    onChange: (value: string) => void;
    multiSelect?: boolean;
    align?: "left" | "right";
    minWidth?: number;
}

export default function FilterDropdown({
    open,
    onClose,
    trigger,
    options,
    value,
    onChange,
    multiSelect = false,
    align = "left",
    minWidth = 300,
}: FilterDropdownProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const [positioned, setPositioned] = useState(false);

    useEffect(() => {
        if (!open) return;
        const handleMouseDown = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [open, onClose]);

    useEffect(() => {
        if (!open || !triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const dropdownWidth = minWidth;
        const gap = 8;

        let left = align === "right" ? rect.right - dropdownWidth : rect.left;
        left = Math.max(gap, Math.min(left, window.innerWidth - dropdownWidth - gap));

        let top = rect.bottom + gap;
        if (top + 300 > window.innerHeight) {
            top = rect.top - gap;
        }

        setPos({ top, left });
        setPositioned(true);
    }, [open, align, minWidth]);

    const isSelected = (optValue: string) =>
        Array.isArray(value) ? value.includes(optValue) : value === optValue;

    return (
        <div ref={containerRef} className="relative">
            <div ref={triggerRef}>{trigger}</div>
            <AnimatePresence>
                {open && positioned && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.1 }}
                        style={{ top: pos.top, left: pos.left, minWidth }}
                        className="fixed z-50 max-h-[calc(100vh-32px)] overflow-y-auto bg-surface border border-border rounded-xl shadow-dropdown py-1"
                    >
                        {options.map((opt) => {
                            const selected = isSelected(opt.value);
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        if (!multiSelect) onClose();
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors ${
                                        selected
                                            ? "text-primary font-medium bg-primary/5"
                                            : "text-text-primary hover:bg-background"
                                    }`}
                                >
                                    <span className={`w-4 text-center ${selected ? "text-primary" : "text-transparent"}`}>
                                        ✓
                                    </span>
                                    {opt.label}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
