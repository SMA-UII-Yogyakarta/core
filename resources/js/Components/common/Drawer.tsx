import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import Button from "@/Components/ui/Button";
import IconButton from "@/Components/ui/IconButton";
import Tooltip from "@/Components/ui/Tooltip";
import TruncatedText from "@/Components/ui/TruncatedText";
import { useLanguage } from "@/Contexts/LanguageContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { ButtonVariant } from "@/types/component";

export interface DrawerProps {
    open: boolean;
    onClose: () => void;
    title: ReactNode;
    description?: ReactNode;
    children: ReactNode;
    onSubmit?: (e?: React.FormEvent) => void;
    submitFormId?: string;
    onCancel?: () => void;
    submitLabel?: string;
    cancelLabel?: string;
    submitVariant?: ButtonVariant;
    cancelVariant?: ButtonVariant;
    loading?: boolean;
    disabled?: boolean;
    width?: "sm" | "md" | "lg" | "xl";
    headerActions?: ReactNode;
    showFooter?: boolean;
    footer?: ReactNode;
    leftFooter?: ReactNode;
    fullScreenMobile?: boolean;
    asForm?: boolean;
    bodyClassName?: string;
    showCloseButton?: boolean;
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
    submitFormId,
    asForm,
    onCancel,
    submitLabel = "Simpan",
    cancelLabel = "Batal",
    submitVariant = "primary",
    cancelVariant = "ghost",
    loading = false,
    disabled = false,
    width = "md",
    headerActions,
    showFooter = true,
    footer,
    leftFooter,
    fullScreenMobile = false,
    bodyClassName,
    showCloseButton = true,
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

    const handleCancelClick = () => {
        if (onCancel) {
            onCancel();
        } else {
            onClose();
        }
    };

    const renderFooterContent = () => {
        if (footer) return footer;

        return (
            <>
                <Button
                    type="button"
                    variant={cancelVariant}
                    onClick={handleCancelClick}
                    className="h-9 px-3.5 text-[12.5px]"
                    dusk="drawer-cancel-btn"
                    data-testid="drawer-cancel-btn"
                >
                    {cancelLabel}
                </Button>
                <Button
                    type="submit"
                    form={submitFormId}
                    variant={submitVariant}
                    loading={loading}
                    disabled={disabled}
                    onClick={submitFormId ? undefined : handleSubmitClick}
                    className="h-9 px-4 text-[12.5px]"
                    dusk="drawer-submit-btn"
                    data-testid="drawer-submit-btn"
                >
                    {submitLabel}
                </Button>
            </>
        );
    };

    const isFormWrapper = asForm ?? (Boolean(onSubmit) && !submitFormId);
    const ContentWrapper = isFormWrapper ? "form" : "div";

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

                    {/* Responsive Container: Full-Screen Native View on Mobile (<640px), Side Drawer on Tablet & Desktop (>=640px) */}
                    <motion.div
                        initial={isDesktop ? { x: "100%" } : { y: "100%" }}
                        animate={isDesktop ? { x: 0 } : { y: 0 }}
                        exit={isDesktop ? { x: "100%" } : { y: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        className={`relative w-full ${widthClasses[width]} bg-surface shadow-2xl z-10 flex flex-col
                            ${
                                fullScreenMobile
                                    ? "h-[100dvh] max-h-[100dvh] rounded-none border-none"
                                    : "max-h-[92dvh] rounded-t-3xl border-t"
                            }
                            sm:max-h-full sm:h-full sm:rounded-t-none sm:border-t-0 sm:border-l border-border
                            focus:outline-none`}
                    >
                        {/* Mobile Drag Handle Pill (Only when not full-screen mobile) */}
                        {!fullScreenMobile && (
                            <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0 cursor-grab active:cursor-grabbing select-none">
                                <div className="w-10 h-1 rounded-full bg-border" />
                            </div>
                        )}

                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3 border-b border-border select-none shrink-0 bg-surface gap-2.5 min-h-[52px]">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                {fullScreenMobile && (
                                    <IconButton
                                        size="sm"
                                        variant="ghost"
                                        icon={<FiX className="w-5 h-5" />}
                                        label="Kembali"
                                        onClick={handleCancelClick}
                                        className="rounded-lg"
                                    />
                                )}
                                <div className="min-w-0 flex-1">
                                    {typeof title === "string" ? (
                                        <TruncatedText
                                            as="h2"
                                            text={title}
                                            className="text-[15px] font-bold text-text-primary font-inter leading-tight"
                                            tooltipPosition="bottom"
                                        />
                                    ) : (
                                        title
                                    )}
                                    {description &&
                                        (typeof description === "string" ? (
                                            <TruncatedText
                                                as="p"
                                                text={description}
                                                className="text-[11px] text-text-muted mt-0.5 leading-tight block"
                                                tooltipPosition="bottom"
                                            />
                                        ) : (
                                            description
                                        ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                {headerActions}
                                {showCloseButton && (
                                    <Tooltip content={t("common.close") || "Tutup"} position="bottom">
                                        <button
                                            onClick={onClose}
                                            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary rounded-lg hover:bg-muted transition-colors cursor-pointer"
                                            type="button"
                                            aria-label={t("common.close") || "Tutup"}
                                            dusk="drawer-close-btn"
                                            data-testid="drawer-close-btn"
                                        >
                                            <FiX className="w-4 h-4" />
                                        </button>
                                    </Tooltip>
                                )}
                            </div>
                        </div>

                        {/* Drawer Content */}
                        <ContentWrapper
                            onSubmit={isFormWrapper ? handleSubmitClick : undefined}
                            className="flex-1 flex flex-col min-h-0 overflow-hidden font-inter"
                        >
                            <div
                                className={`flex-1 ${
                                    bodyClassName !== undefined
                                        ? bodyClassName
                                        : "overflow-y-auto overflow-x-hidden p-4 sm:p-5 space-y-4"
                                } overscroll-contain ${!showFooter ? "pb-safe" : ""}`}
                            >
                                {children}
                            </div>

                            {/* Sticky Footer (Only shown when showFooter is true) */}
                            {showFooter && (
                                <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3 border-t border-border select-none shrink-0 bg-surface pb-safe min-w-0">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">{leftFooter}</div>
                                    <div className="flex items-center gap-2.5 shrink-0 ml-auto">
                                        {renderFooterContent()}
                                    </div>
                                </div>
                            )}
                        </ContentWrapper>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
