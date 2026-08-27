import type { ReactNode } from "react";
import { useEffect } from "react";
import Button from "@/Components/ui/Button";
import type { ButtonVariant } from "@/types/component";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: ReactNode;
    onSubmit?: (e?: React.FormEvent) => void;
    submitLabel?: string;
    submitVariant?: ButtonVariant;
    loading?: boolean;
    disabled?: boolean;
    width?: "sm" | "md" | "lg";
    className?: string;
}

const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
};

export default function Modal({
    open,
    onClose,
    title,
    subtitle,
    children,
    onSubmit,
    submitLabel = "Simpan",
    submitVariant = "primary",
    loading = false,
    disabled = false,
    width = "md",
    className = "",
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
                className={`relative bg-surface rounded-xl shadow-modal w-full ${widthClasses[width]} max-h-[90vh] overflow-y-auto ${className}`}
            >
                <div className="p-5 border-b border-border">
                    <h2 className="text-[16px] font-bold text-text-primary font-inter">{title}</h2>
                    {subtitle && (
                        <p className="text-sm text-text-muted mt-1">{subtitle}</p>
                    )}
                </div>
                <div className="p-5">{children}</div>
                {onSubmit && (
                    <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
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
