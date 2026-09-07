import { useState, useRef, useEffect } from "react";
import { FiCopy, FiTrash2, FiEdit2, FiLock, FiCheck, FiChevronDown } from "react-icons/fi";
import { toast } from "sonner";
import Tooltip from "@/Components/ui/Tooltip";
import { copyToClipboard } from "@/utils/helpers";

export interface CopyField {
    label: string;
    value: string | number | null | undefined;
}

interface DrawerHeaderActionsProps {
    mode?: "create" | "edit" | "detail" | null;
    isCreate?: boolean;
    isUnlocked?: boolean;
    onToggleUnlock?: () => void;
    onDelete?: () => void;
    copyFields?: CopyField[];
    entityTitle?: string;
    hideUnlock?: boolean;
    hideDelete?: boolean;
    hideCopy?: boolean;
    variant?: "default" | "header";
}

export default function DrawerHeaderActions({
    mode = "detail",
    isCreate = false,
    isUnlocked = false,
    onToggleUnlock,
    onDelete,
    copyFields = [],
    entityTitle = "Data",
    hideUnlock = false,
    hideDelete = false,
    hideCopy = false,
    variant = "default",
}: DrawerHeaderActionsProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [copiedType, setCopiedType] = useState<"csv" | "md" | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isInCreateMode = mode === "create" || isCreate;
    const isHeaderVariant = variant === "header";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    const handleCopyCsv = () => {
        if (!copyFields || copyFields.length === 0) return;
        const headers = copyFields.map((f) => `"${f.label.replace(/"/g, '""')}"`).join(",");
        const values = copyFields
            .map((f) => {
                const val = f.value ?? "";
                return `"${String(val).replace(/"/g, '""')}"`;
            })
            .join(",");
        const csvContent = `${headers}\n${values}`;

        copyToClipboard(csvContent).then(() => {
            setCopiedType("csv");
            toast.success(`${entityTitle} tersalin dalam format CSV!`);
            setTimeout(() => {
                setCopiedType(null);
                setMenuOpen(false);
            }, 1200);
        });
    };

    const handleCopyMarkdown = () => {
        if (!copyFields || copyFields.length === 0) return;
        const rows = copyFields.map((f) => `| ${f.label} | ${f.value ?? "-"} |`).join("\n");
        const mdContent = `### ${entityTitle}\n\n| Kolom / Field | Nilai |\n| :--- | :--- |\n${rows}`;

        copyToClipboard(mdContent).then(() => {
            setCopiedType("md");
            toast.success(`${entityTitle} tersalin dalam format Tabel Markdown!`);
            setTimeout(() => {
                setCopiedType(null);
                setMenuOpen(false);
            }, 1200);
        });
    };

    if (isInCreateMode) {
        if (isHeaderVariant) return null;
        return (
            <div className="flex items-center gap-1 sm:gap-1.5 font-inter">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                    Mode Tambah
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 font-inter">
            {/* Copy Dropdown */}
            {!hideCopy && copyFields.length > 0 && (
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className={
                            isHeaderVariant
                                ? `w-8 h-8 rounded-xl border text-[12px] font-semibold transition-all flex items-center justify-center cursor-pointer backdrop-blur-xs ${
                                      menuOpen
                                          ? "bg-white/25 border-white/40 text-white shadow-xs"
                                          : "bg-white/10 border-white/20 text-white/95 hover:bg-white/20 hover:text-white"
                                  }`
                                : `h-7.5 px-2 rounded-lg border text-[11.5px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                                      menuOpen
                                          ? "bg-muted border-primary text-primary"
                                          : "border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-muted"
                                  }`
                        }
                        aria-label="Salin data"
                        title="Salin data"
                    >
                        {copiedType ? (
                            <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                            <FiCopy className="w-3.5 h-3.5" />
                        )}
                        {!isHeaderVariant && (
                            <>
                                <span>Salin</span>
                                <FiChevronDown className="w-3 h-3 opacity-80" />
                            </>
                        )}
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-52 bg-surface rounded-xl shadow-xl border border-border py-1.5 z-50 text-[12px] animate-in fade-in slide-in-from-top-1">
                            <div className="px-3 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider border-b border-border/50 mb-1">
                                Opsi Format Salin
                            </div>
                            <button
                                type="button"
                                onClick={handleCopyCsv}
                                className="w-full text-left px-3 py-1.5 text-text-primary hover:bg-muted flex items-center justify-between transition-colors cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="font-semibold text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border">
                                        CSV
                                    </span>
                                    Format Spreadsheet
                                </span>
                                {copiedType === "csv" && <FiCheck className="w-3.5 h-3.5 text-success" />}
                            </button>
                            <button
                                type="button"
                                onClick={handleCopyMarkdown}
                                className="w-full text-left px-3 py-1.5 text-text-primary hover:bg-muted flex items-center justify-between transition-colors cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="font-semibold text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border">
                                        MD
                                    </span>
                                    Tabel Markdown
                                </span>
                                {copiedType === "md" && <FiCheck className="w-3.5 h-3.5 text-success" />}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Unlock / Edit Mode Toggle Button */}
            {!hideUnlock && onToggleUnlock && (
                <Tooltip
                    content={isUnlocked ? "Kunci Form (Batal Edit)" : "Buka Kunci untuk Mengubah Data"}
                    position="bottom"
                >
                    <button
                        type="button"
                        onClick={onToggleUnlock}
                        className={
                            isHeaderVariant
                                ? `w-8 h-8 rounded-xl border text-[12px] font-semibold transition-all flex items-center justify-center cursor-pointer backdrop-blur-xs ${
                                      isUnlocked
                                          ? "bg-amber-400/20 text-amber-200 border-amber-300/40 hover:bg-amber-400/30"
                                          : "bg-white/10 border-white/20 text-white/95 hover:bg-white/20 hover:text-white"
                                  }`
                                : `h-7.5 px-2.5 rounded-lg border text-[11.5px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                                      isUnlocked
                                          ? "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20"
                                          : "bg-surface border-border text-text-secondary hover:text-primary hover:bg-muted"
                                  }`
                        }
                        aria-label={isUnlocked ? "Kunci form" : "Buka kunci edit"}
                        title={isUnlocked ? "Kunci form" : "Buka kunci edit"}
                    >
                        {isUnlocked ? (
                            <>
                                <FiLock className="w-3.5 h-3.5" />
                                {!isHeaderVariant && <span>Kunci</span>}
                            </>
                        ) : (
                            <>
                                <FiEdit2 className="w-3.5 h-3.5" />
                                {!isHeaderVariant && <span>Edit</span>}
                            </>
                        )}
                    </button>
                </Tooltip>
            )}

            {/* Shortcut Delete Button */}
            {!hideDelete && onDelete && (
                <Tooltip content="Hapus Data Ini" position="bottom">
                    <button
                        type="button"
                        onClick={onDelete}
                        className={
                            isHeaderVariant
                                ? "w-8 h-8 rounded-xl border border-white/20 bg-white/10 text-white/90 hover:bg-danger hover:border-danger hover:text-white transition-all flex items-center justify-center cursor-pointer shrink-0 backdrop-blur-xs"
                                : "h-7.5 px-2.5 rounded-lg border border-danger/20 bg-danger-bg text-danger hover:bg-danger/20 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 text-[11.5px] font-semibold"
                        }
                        aria-label="Hapus data"
                    >
                        <FiTrash2 className="w-3.5 h-3.5" />
                        {!isHeaderVariant && <span>Hapus</span>}
                    </button>
                </Tooltip>
            )}
        </div>
    );
}
