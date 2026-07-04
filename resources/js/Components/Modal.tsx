import type { ReactNode } from "react";
import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import Button from "@/Components/ui/Button";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    onSubmit?: (e?: React.FormEvent) => void;
    submitLabel?: string;
    loading?: boolean;
    width?: "sm" | "md" | "lg";
}

const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
};

export default function Modal({
    open,
    onClose,
    title,
    children,
    onSubmit,
    submitLabel = "Simpan",
    loading = false,
    width = "md",
}: ModalProps) {
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

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div
                className={`relative bg-surface rounded-xl shadow-modal w-full ${widthClasses[width]} max-h-[90vh] overflow-y-auto`}
            >
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <h2 className="text-[16px] font-bold text-text-primary font-inter">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-primary transition-colors"
                        type="button"
                    >
                        <FaTimes className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-5">{children}</div>
                {onSubmit && (
                    <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
                        <Button variant="ghost" onClick={onClose}>
                            Batal
                        </Button>
                        <Button onClick={() => onSubmit?.()} loading={loading}>
                            {submitLabel}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
