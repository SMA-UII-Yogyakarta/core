import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

export interface SelectionActionButton {
    label: string;
    onClick: () => void;
    variant?: "danger" | "primary" | "secondary" | "accent";
    icon?: ReactNode;
    loading?: boolean;
    disabled?: boolean;
}

export interface MobileSelectionBarProps {
    count: number;
    countLabel?: string;
    onCancel: () => void;
    cancelLabel?: string;
    actions: SelectionActionButton[];
    className?: string;
    bottomOffsetClass?: string;
}

export default function MobileSelectionBar({
    count,
    countLabel = "Terpilih",
    onCancel,
    cancelLabel = "Batal",
    actions,
    className = "",
    bottomOffsetClass = "bottom-[5.25rem]",
}: MobileSelectionBarProps) {
    if (count <= 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`sm:hidden fixed left-4 right-4 z-[60] bg-primary text-white p-3 px-4 rounded-2xl shadow-xl flex items-center justify-between font-inter select-none ${bottomOffsetClass} ${className}`}
            >
                <span className="text-[13px] font-bold tracking-tight">
                    {count} {countLabel}
                </span>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-[12px] font-semibold text-white/80 hover:text-white px-2.5 py-1.5 rounded-lg active:bg-white/10 transition-colors cursor-pointer"
                    >
                        {cancelLabel}
                    </button>

                    {actions.map((act, index) => {
                        const variantClasses =
                            act.variant === "danger"
                                ? "bg-danger hover:bg-danger/90 text-white"
                                : act.variant === "accent"
                                  ? "bg-accent hover:brightness-95 text-primary"
                                  : act.variant === "secondary"
                                    ? "bg-white/15 hover:bg-white/25 text-white border border-white/20"
                                    : "bg-surface hover:bg-surface/90 text-primary";

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={act.onClick}
                                disabled={act.disabled || act.loading}
                                className={`h-8 text-[11.5px] px-3 font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${variantClasses}`}
                            >
                                {act.icon}
                                <span>{act.label}</span>
                            </button>
                        );
                    })}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
