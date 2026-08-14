import type { ReactNode } from "react";
import Modal from "./Modal";
import Button from "../ui/Button";

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
    { icon: string; iconBg: string; iconColor: string; buttonVariant: "danger" | "primary" | "secondary" }
> = {
    danger: {
        icon: "fa-trash-alt",
        iconBg: "bg-danger-bg border border-danger-light",
        iconColor: "text-danger",
        buttonVariant: "danger",
    },
    warning: {
        icon: "fa-exclamation-triangle",
        iconBg: "bg-warning-bg border border-warning-light",
        iconColor: "text-warning",
        buttonVariant: "secondary",
    },
    primary: {
        icon: "fa-question-circle",
        iconBg: "bg-primary-light/40 border border-primary/20",
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
            <div className="flex flex-col items-center text-center p-2" dusk={dusk}>
                <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-xl mb-4 ${config.iconBg} ${config.iconColor}`}
                >
                    <i className={`fas ${config.icon}`} />
                </div>

                {message && (
                    <div className="text-[14px] text-text-secondary font-inter mb-6 leading-relaxed">
                        {message}
                    </div>
                )}

                <div className="flex items-center justify-center gap-3 w-full">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1"
                        dusk={`${dusk}-cancel`}
                        data-testid={`${dusk}-cancel`}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={config.buttonVariant}
                        onClick={onConfirm}
                        loading={loading}
                        className="flex-1"
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
