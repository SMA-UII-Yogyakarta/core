import type { ReactNode } from "react";
import { useEffect } from "react";
import Button from "@/Components/ui/Button";
import type { ButtonVariant } from "@/types/component";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    headerRight?: ReactNode;
    children: ReactNode;
    onSubmit?: (e?: React.FormEvent) => void;
    submitLabel?: string;
    submitVariant?: ButtonVariant;
    loading?: boolean;
    disabled?: boolean;
    width?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
    className?: string;
    bodyClassName?: string;
}

const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
};

export default function Modal({
    open,
    onClose,
    title,
    subtitle,
    headerRight,
    children,
    onSubmit,
    submitLabel = "Simpan",
    submitVariant = "primary",
    loading = false,
    disabled = false,
    width = "md",
    className = "",
    bodyClassName = "",
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 sm:p-6 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
            <div
                className={`relative bg-surface rounded-2xl shadow-modal w-full ${widthClasses[width]} my-auto max-h-[90vh] flex flex-col border border-border animate-in fade-in zoom-in-95 duration-150 ${className}`}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-border shrink-0 gap-3">
                    <div className="min-w-0 flex-1 pr-1">
                        <h2 className="text-[15px] sm:text-[16px] font-bold text-text-primary font-inter truncate" title={title}>
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-[12px] text-text-muted mt-0.5 truncate">{subtitle}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                        {headerRight}
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-muted flex items-center justify-center transition-colors shrink-0 cursor-pointer text-[14px]"
                            aria-label="Tutup modal"
                            title="Tutup"
                        >
                            <i className="fas fa-times" />
                        </button>
                    </div>
                </div>

                {/* Modal Body with smooth vertical scroll */}
                <div className={`p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 ${bodyClassName}`}>{children}</div>

                {/* Optional Submit Footer */}
                {onSubmit && (
                    <div className="flex items-center justify-end gap-3 px-4 sm:px-5 py-3.5 border-t border-border shrink-0 bg-muted/20 rounded-b-2xl">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            dusk="modal-cancel-btn"
                            data-testid="modal-cancel-btn"
                        >
                            Batal
                        </Button>
                        <Button
                            variant={submitVariant}
                            onClick={() => onSubmit?.()}
                            loading={loading}
                            disabled={disabled}
                            dusk="modal-submit-btn"
                            data-testid="modal-submit-btn"
                        >
                            {submitLabel}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
