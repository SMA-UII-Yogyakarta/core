import type { ReactNode } from "react";
import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/Contexts/LanguageContext";

interface BottomSheetProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: ReactNode;
}

export default function BottomSheet({
    open,
    onClose,
    title,
    subtitle,
    children,
}: BottomSheetProps) {
    const { t } = useLanguage();
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

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 overflow-hidden flex items-end lg:items-center justify-center">
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                    />

                    {/* Sliding Bottom Sheet Container */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
                        className="relative w-full max-h-[80vh] bg-surface shadow-2xl rounded-t-2xl z-10 flex flex-col lg:max-w-md"
                    >
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-3 pb-1 shrink-0">
                            <div className="w-10 h-1 rounded-full bg-border" />
                        </div>

                        {/* Header */}
                        {title && (
                            <div className="flex items-center justify-between px-5 pb-3 border-b border-border select-none shrink-0">
                                <div>
                                    <h2 className="text-[16px] font-bold text-text-primary font-inter">{title}</h2>
                                    {subtitle && (
                                        <p className="text-[12px] text-text-muted mt-0.5">{subtitle}</p>
                                    )}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                                    type="button"
                                    aria-label={t("common.close")}
                                >
                                    <FiX className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-5">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
