import type { ReactNode } from "react";
import { useState } from "react";
import { FiCamera } from "react-icons/fi";
import Button, { type ButtonProps } from "@/Components/ui/Button";
import { useLanguage } from "@/Contexts/LanguageContext";
import PhotoPeekModal from "./PhotoPeekModal";

export interface PhotoPeekButtonProps {
    photoUrl?: string | null;
    title?: string;
    subtitle?: string;
    label?: string;
    variant?: ButtonProps["variant"];
    size?: ButtonProps["size"];
    className?: string;
    icon?: ReactNode;
}

export default function PhotoPeekButton({
    photoUrl,
    title,
    subtitle,
    label,
    variant = "ghost",
    size = "sm",
    className = "text-[12px] font-semibold text-primary",
    icon = <FiCamera className="text-[13px] shrink-0" />,
}: PhotoPeekButtonProps) {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const actionLabel = label ?? t("common.viewPhoto");

    if (!photoUrl) {
        return <span className="text-[12px] text-text-muted">—</span>;
    }

    return (
        <>
            <Button
                variant={variant}
                size={size}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(true);
                }}
                className={className}
                icon={icon}
            >
                {actionLabel}
            </Button>
            <PhotoPeekModal
                open={open}
                onClose={() => setOpen(false)}
                url={photoUrl}
                title={title ?? t("common.viewPhoto")}
                subtitle={subtitle}
            />
        </>
    );
}
