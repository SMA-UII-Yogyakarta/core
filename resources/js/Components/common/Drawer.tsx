import type { ReactNode } from "react";
import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/Components/ui/Button";

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    onSubmit?: (e?: React.FormEvent) => void;
    submitLabel?: string;
    loading?: boolean;
    width?: "sm" | "md" | "lg" | "xl";
}

const widthClasses = {
    sm: "max-w-sm", // 384px
    md: "max-w-md", // 448px
    lg: "max-w-lg", // 512px
    xl: "max-w-2xl", // 672px
};

export default function Drawer({
    open,
    onClose,
    title,
    children,
    onSubmit,
    submitLabel = "Simpan",
    loading = false,
    width = "md",
}: DrawerProps) {
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

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                    />

                    {/* Sliding Drawer Container */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
                        className={`relative w-screen ${widthClasses[width]} bg-surface shadow-2xl flex flex-col h-full z-10 border-l border-border`}
                    >
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between p-5 border-b border-border select-none shrink-0 bg-surface">
                            <h2 className="text-[16px] font-bold text-text-primary font-inter">{title}</h2>
                            <button
                                onClick={onClose}
                                className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                                type="button"
                                aria-label="Tutup"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        {onSubmit ? (
                            <form onSubmit={handleSubmitClick} className="flex-1 flex flex-col min-h-0">
                                <div className="flex-1 overflow-y-auto p-5 space-y-4">{children}</div>
                                {/* Drawer Footer */}
                                <div className="flex items-center justify-end gap-3 p-5 border-t border-border select-none shrink-0 bg-surface">
                                    <Button type="button" variant="ghost" onClick={onClose}>
                                        Batal
                                    </Button>
                                    <Button type="submit" loading={loading}>
                                        {submitLabel}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex-1 overflow-y-auto p-5">{children}</div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
