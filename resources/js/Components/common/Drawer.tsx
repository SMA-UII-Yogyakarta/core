import type { ReactNode } from "react";
import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import Button from "@/Components/ui/Button";
import { useLanguage } from "@/Contexts/LanguageContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export interface DrawerProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    onSubmit?: (e?: React.FormEvent) => void;
    submitLabel?: string;
    loading?: boolean;
    width?: "sm" | "md" | "lg" | "xl";
    headerActions?: ReactNode;
    showFooter?: boolean;
}

const widthClasses = {
    sm: "sm:max-w-sm", // 384px
    md: "sm:max-w-md", // 448px
    lg: "sm:max-w-lg", // 512px
    xl: "sm:max-w-2xl", // 672px
};

export default function Drawer({
    open,
    onClose,
    title,
    description,
    children,
    onSubmit,
    submitLabel = "Simpan",
    loading = false,
    width = "md",
    headerActions,
    showFooter = true,
}: DrawerProps) {
    const { t } = useLanguage();
    const isDesktop = useMediaQuery("(min-width: 640px)");

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (open) window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [open, onClose]);

    const handleSubmitClick = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) onSubmit(e);
    };

    const handleDragEnd = (
        _: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo
    ) => {
        if (!isDesktop && (info.offset.y > 100 || info.velocity.y > 500)) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-stretch sm:justify-end">
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                    />

                    {/* Responsive Container: Bottom Sheet on Mobile (<640px), Side Drawer on Tablet & Desktop (>=640px) */}
                    <motion.div
                        initial={isDesktop ? { x: "100%" } : { y: "100%" }}
                        animate={isDesktop ? { x: 0 } : { y: 0 }}
                        exit={isDesktop ? { x: "100%" } : { y: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        drag={isDesktop ? false : "y"}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0.05, bottom: 0.4 }}
                        onDragEnd={handleDragEnd}
                        className={`relative w-full ${widthClasses[width]} bg-surface shadow-2xl z-10 flex flex-col
                            max-h-[92dvh] sm:max-h-full sm:h-full
                            rounded-t-3xl sm:rounded-t-none
                            border-t sm:border-t-0 sm:border-l border-border
                            focus:outline-none`}
                    >
                        {/* Mobile Drag Handle Pill */}
                        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing select-none">
                            <div className="w-12 h-1.5 rounded-full bg-border" />
                        </div>

                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-5 py-4 sm:p-5 border-b border-border select-none shrink-0 bg-surface gap-3">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-[16px] font-bold text-text-primary font-inter truncate">
                                    {title}
                                </h2>
                                {description && (
                                    <p className="text-[12px] text-text-muted mt-0.5 truncate">
                                        {description}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {headerActions}
                                <button
                                    onClick={onClose}
                                    className="text-text-muted hover:text-text-primary p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                                    type="button"
                                    aria-label={t("common.close") || "Tutup"}
                                    dusk="drawer-close-btn"
                                    data-testid="drawer-close-btn"
                                >
                                    <FiX className="w-5 h-5 sm:w-4 sm:h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Drawer Content */}
                        {onSubmit ? (
                            <form
                                onSubmit={handleSubmitClick}
                                className="flex-1 flex flex-col min-h-0 overflow-hidden"
                            >
                                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 overscroll-contain">
                                    {children}
                                </div>

                                {/* Sticky Footer (Only shown when showFooter is true) */}
                                {showFooter && (
                                    <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-border select-none shrink-0 bg-surface pb-safe">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={onClose}
                                            dusk="drawer-cancel-btn"
                                            data-testid="drawer-cancel-btn"
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            loading={loading}
                                            dusk="drawer-submit-btn"
                                            data-testid="drawer-submit-btn"
                                        >
                                            {submitLabel}
                                        </Button>
                                    </div>
                                )}
                            </form>
                        ) : (
                            <div className="flex-1 overflow-y-auto p-5 sm:p-6 pb-safe overscroll-contain">
                                {children}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
