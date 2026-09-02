import type { ReactNode } from "react";
import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import Button from "@/Components/ui/Button";
import Tooltip from "@/Components/ui/Tooltip";
import TruncatedText from "@/Components/ui/TruncatedText";
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 sm:p-6 overflow-hidden">
            {/* Backdrop Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Centered Modal Card Container */}
            <div
                className={`relative bg-surface rounded-2xl shadow-modal w-full ${widthClasses[width]} my-auto max-h-[85dvh] sm:max-h-[90dvh] flex flex-col border border-border animate-in fade-in zoom-in-95 duration-150 z-10 ${className}`}
                role="dialog"
                aria-modal="true"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border shrink-0 gap-3 min-h-[52px]">
                    <div className="min-w-0 flex-1 pr-1">
                        <TruncatedText
                            as="h2"
                            text={title}
                            className="text-[15px] sm:text-[16px] font-bold text-text-primary font-inter leading-tight"
                            tooltipPosition="bottom"
                        />
                        {subtitle && (
                            <TruncatedText
                                as="p"
                                text={subtitle}
                                className="text-[11px] sm:text-[12px] text-text-muted mt-0.5 leading-tight block"
                                tooltipPosition="bottom"
                            />
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {headerRight}
                        <Tooltip content="Tutup" position="bottom">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-muted flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                                aria-label="Tutup modal"
                                dusk="modal-close-btn"
                                data-testid="modal-close-btn"
                            >
                                <FiX className="w-4 h-4" />
                            </button>
                        </Tooltip>
                    </div>
                </div>

                {/* Modal Body with Isolated Vertical Scroll */}
                <div
                    className={`p-4 sm:p-5 overflow-y-auto overscroll-contain flex-1 min-h-0 ${bodyClassName}`}
                >
                    {children}
                </div>

                {/* Optional Submit Footer */}
                {onSubmit && (
                    <div className="flex items-center justify-end gap-2.5 px-4 sm:px-5 py-3 border-t border-border shrink-0 bg-surface rounded-b-2xl">
                        <Button
                            variant="secondary"
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
