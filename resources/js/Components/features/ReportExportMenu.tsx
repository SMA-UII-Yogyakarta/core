import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiDownload, FiFileText, FiGrid } from "react-icons/fi";
import Button from "@/Components/ui/Button";

export interface ReportExportMenuProps {
    pdfHref?: string;
    excelHref?: string;
    onExportPdf?: () => void;
    onExportExcel?: () => void;
    className?: string;
}

const toneStyles = {
    danger: {
        icon: "bg-danger-bg text-danger border-danger/10",
        title: "group-hover:text-danger",
    },
    success: {
        icon: "bg-success-bg text-success border-success/10",
        title: "group-hover:text-success",
    },
} as const;

function ExportOption({
    tone,
    title,
    description,
    href,
    onClick,
    icon,
}: {
    tone: "danger" | "success";
    title: string;
    description: string;
    href?: string;
    onClick?: () => void;
    icon: ReactNode;
}) {
    const styles = toneStyles[tone];
    const className =
        "flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/70 transition-colors group cursor-pointer text-left";
    const content = (
        <>
            <span
                className={`w-9 h-9 rounded-lg ${styles.icon} flex items-center justify-center text-[15px] shrink-0 group-hover:scale-105 transition-transform`}
            >
                {icon}
            </span>
            <span className="min-w-0 flex-1">
                <span className={`block text-[13px] font-bold text-text-primary ${styles.title} transition-colors`}>
                    {title}
                </span>
                <span className="block text-[11px] text-text-muted truncate">{description}</span>
            </span>
        </>
    );

    if (href) {
        return (
            <a href={href} onClick={onClick} className={className}>
                {content}
            </a>
        );
    }

    return (
        <button type="button" onClick={onClick} className={className}>
            {content}
        </button>
    );
}

export default function ReportExportMenu({
    pdfHref,
    excelHref,
    onExportPdf,
    onExportExcel,
    className = "",
}: ReportExportMenuProps) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <div ref={menuRef} className={`relative shrink-0 ${className}`}>
            <Button
                type="button"
                variant="primary"
                onClick={() => setOpen((previous) => !previous)}
                icon={<FiDownload className="text-[14px]" />}
                className="shrink-0 whitespace-nowrap"
                aria-expanded={open}
                aria-haspopup="menu"
            >
                <span>Ekspor Laporan</span>
                <FiChevronDown
                    className={`text-[14px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </Button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-64 bg-surface rounded-xl border border-border shadow-dropdown p-1.5 z-50 flex flex-col gap-1 font-inter"
                        role="menu"
                    >
                        <ExportOption
                            tone="danger"
                            title="Dokumen PDF"
                            description="Format cetak resmi (.pdf)"
                            href={pdfHref}
                            onClick={() => {
                                onExportPdf?.();
                                setOpen(false);
                            }}
                            icon={<FiFileText className="text-[16px]" />}
                        />
                        <ExportOption
                            tone="success"
                            title="Spreadsheet Excel"
                            description="Format olah data (.xlsx)"
                            href={excelHref}
                            onClick={() => {
                                onExportExcel?.();
                                setOpen(false);
                            }}
                            icon={<FiGrid className="text-[16px]" />}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
