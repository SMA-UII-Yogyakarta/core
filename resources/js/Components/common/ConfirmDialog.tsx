import type { ReactNode } from "react";
import Modal from "./Modal";
import Button from "../ui/Button";
import { FiTrash2, FiAlertTriangle, FiHelpCircle } from "react-icons/fi";

export type ConfirmDialogVariant = "danger" | "warning" | "primary";

export interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ConfirmDialogVariant;
    loading?: boolean;
    dusk?: string;
}

const variantConfig: Record<
    ConfirmDialogVariant,
    {
        icon: ReactNode;
        iconBg: string;
        iconBorder: string;
        iconColor: string;
        buttonVariant: "danger" | "primary" | "secondary";
    }
> = {
    danger: {
        icon: <FiTrash2 className="w-6 h-6 stroke-[2.2]" />,
        iconBg: "bg-danger/10",
        iconBorder: "border-danger/20",
        iconColor: "text-danger",
        buttonVariant: "danger",
    },
    warning: {
        icon: <FiAlertTriangle className="w-6 h-6 stroke-[2.2]" />,
        iconBg: "bg-amber-500/10",
        iconBorder: "border-amber-500/20",
        iconColor: "text-amber-600",
        buttonVariant: "primary",
    },
    primary: {
        icon: <FiHelpCircle className="w-6 h-6 stroke-[2.2]" />,
        iconBg: "bg-primary/10",
        iconBorder: "border-primary/20",
        iconColor: "text-primary",
        buttonVariant: "primary",
    },
};

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Konfirmasi",
    cancelLabel = "Batal",
    variant = "danger",
    loading = false,
    dusk = "confirm-dialog",
}: ConfirmDialogProps) {
    const config = variantConfig[variant];

    return (
        <Modal open={open} onClose={onClose} title={title} width="sm">
            <div className="flex flex-col items-center text-center pt-2 pb-1 font-inter select-none" dusk={dusk}>
                {/* Modern Icon Container */}
                <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3.5 border ${config.iconBg} ${config.iconBorder} ${config.iconColor} shadow-2xs`}
                >
                    {config.icon}
                </div>

                {/* Formatted Message Box */}
                {message && (
                    <div className="w-full bg-muted/40 border border-border/70 rounded-xl p-3.5 text-[13px] text-text-secondary mb-5 leading-relaxed text-center font-normal">
                        {message}
                    </div>
                )}

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-center gap-2.5 w-full">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 h-10 px-4 rounded-xl text-[13px] font-bold text-text-secondary bg-surface hover:bg-muted/60 border border-border transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-2xs"
                        dusk={`${dusk}-cancel`}
                        data-testid={`${dusk}-cancel`}
                    >
                        {cancelLabel}
                    </button>
                    <Button
                        variant={config.buttonVariant}
                        onClick={onConfirm}
                        loading={loading}
                        className="flex-1 h-10 text-[13px] font-extrabold rounded-xl shadow-xs"
                        dusk={`${dusk}-submit`}
                        data-testid={`${dusk}-submit`}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
