import { useRef, useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterPopoverProps {
    open: boolean;
    onClose: () => void;
    trigger: ReactNode;
    children: ReactNode;
    align?: "left" | "right";
    offsetX?: number;
    offsetY?: number;
}

export default function FilterPopover({
    open,
    onClose,
    trigger,
    children,
    align = "left",
    offsetX = 0,
    offsetY = 0,
}: FilterPopoverProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ top: 0, left: 0, maxHeight: 400 });
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
        const popoverWidth = 380;
        const gap = 8;

        let left = align === "right" ? rect.right - popoverWidth : rect.left;
        left += offsetX;
        left = Math.max(gap, Math.min(left, window.innerWidth - popoverWidth - gap));

        const top = rect.bottom + gap + offsetY;
        const availableBelow = window.innerHeight - top - gap;
        const maxHeight = Math.max(200, availableBelow);

        setPos({ top, left, maxHeight });
        setPositioned(true);
    }, [open, align, offsetX, offsetY]);

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
                        style={{ top: pos.top, left: pos.left, maxHeight: pos.maxHeight }}
                        className="fixed z-50 min-w-[380px] overflow-y-auto bg-surface border border-border rounded-xl shadow-dropdown p-4"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
