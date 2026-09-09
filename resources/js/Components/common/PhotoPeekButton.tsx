import { useState } from "react";
import { FiCamera } from "react-icons/fi";
import Button, { type ButtonProps } from "@/Components/ui/Button";
import PhotoPeekModal from "./PhotoPeekModal";

export interface PhotoPeekButtonProps {
    photoUrl?: string | null;
    title?: string;
    subtitle?: string;
    label?: string;
    variant?: ButtonProps["variant"];
    size?: ButtonProps["size"];
    className?: string;
}

export default function PhotoPeekButton({
    photoUrl,
    title = "Foto Bukti Presensi",
    subtitle,
    label = "Cek Foto",
    variant = "ghost",
    size = "sm",
    className = "text-[12px] font-semibold text-primary",
}: PhotoPeekButtonProps) {
    const [open, setOpen] = useState(false);

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
                icon={<FiCamera className="text-[13px] shrink-0" />}
            >
                {label}
            </Button>
            <PhotoPeekModal
                open={open}
                onClose={() => setOpen(false)}
                url={photoUrl}
                title={title}
                subtitle={subtitle}
            />
        </>
    );
}
