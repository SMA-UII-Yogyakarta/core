import { useState, useRef, useEffect } from "react";
import { FiCopy, FiTrash2, FiEdit3, FiLock, FiCheck, FiChevronDown } from "react-icons/fi";
import { toast } from "sonner";

export interface CopyField {
    label: string;
    value: string | number | null | undefined;
}

interface DrawerHeaderActionsProps {
    isUnlocked?: boolean;
    onToggleUnlock?: () => void;
    onDelete?: () => void;
    copyFields?: CopyField[];
    entityTitle?: string;
    hideUnlock?: boolean;
    hideDelete?: boolean;
    hideCopy?: boolean;
}

export default function DrawerHeaderActions({
    isUnlocked = false,
    onToggleUnlock,
    onDelete,
    copyFields = [],
    entityTitle = "Data",
    hideUnlock = false,
    hideDelete = false,
    hideCopy = false,
}: DrawerHeaderActionsProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [copiedType, setCopiedType] = useState<"csv" | "md" | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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

        navigator.clipboard.writeText(csvContent).then(() => {
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

        navigator.clipboard.writeText(mdContent).then(() => {
            setCopiedType("md");
            toast.success(`${entityTitle} tersalin dalam format Tabel Markdown!`);
            setTimeout(() => {
                setCopiedType(null);
                setMenuOpen(false);
            }, 1200);
        });
    };

    return (
        <div className="flex items-center gap-1.5 font-inter">
            {/* Copy Dropdown */}
            {!hideCopy && copyFields.length > 0 && (
                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className={`h-8 px-2 rounded-lg border text-[12px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                            menuOpen
                                ? "bg-muted border-primary text-primary"
                                : "border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-muted"
                        }`}
                        title="Salin semua data (CSV / Markdown)"
                        aria-label="Salin data"
                    >
                        {copiedType ? (
                            <FiCheck className="w-3.5 h-3.5 text-success" />
                        ) : (
                            <FiCopy className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">Salin</span>
                        <FiChevronDown className="w-3 h-3 text-text-muted" />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-52 bg-surface rounded-xl shadow-xl border border-border py-1.5 z-50 text-[13px] animate-in fade-in slide-in-from-top-1">
                            <div className="px-3 py-1 text-[11px] font-semibold text-text-muted uppercase tracking-wider border-b border-border/50 mb-1">
                                Opsi Format Salin
                            </div>
                            <button
                                type="button"
                                onClick={handleCopyCsv}
                                className="w-full text-left px-3 py-2 text-text-primary hover:bg-muted flex items-center justify-between transition-colors cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="font-semibold text-xs px-1.5 py-0.5 rounded bg-muted border border-border">
                                        CSV
                                    </span>
                                    Format Spreadsheet
                                </span>
                                {copiedType === "csv" && <FiCheck className="w-4 h-4 text-success" />}
                            </button>
                            <button
                                type="button"
                                onClick={handleCopyMarkdown}
                                className="w-full text-left px-3 py-2 text-text-primary hover:bg-muted flex items-center justify-between transition-colors cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="font-semibold text-xs px-1.5 py-0.5 rounded bg-muted border border-border">
                                        MD
                                    </span>
                                    Tabel Markdown
                                </span>
                                {copiedType === "md" && <FiCheck className="w-4 h-4 text-success" />}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Unlock / Edit Mode Toggle Button */}
            {!hideUnlock && onToggleUnlock && (
                <button
                    type="button"
                    onClick={onToggleUnlock}
                    className={`h-8 px-2.5 rounded-lg border text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isUnlocked
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20"
                            : "bg-surface border-border text-text-secondary hover:text-primary hover:bg-muted"
                    }`}
                    title={isUnlocked ? "Kunci Kembali Form (Batal Edit)" : "Buka Kunci untuk Edit Data"}
                    aria-label={isUnlocked ? "Kunci form" : "Buka kunci edit"}
                >
                    {isUnlocked ? (
                        <>
                            <FiLock className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Kunci</span>
                        </>
                    ) : (
                        <>
                            <FiEdit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                        </>
                    )}
                </button>
            )}

            {/* Shortcut Delete Button */}
            {!hideDelete && onDelete && (
                <button
                    type="button"
                    onClick={onDelete}
                    className="h-8 w-8 rounded-lg border border-danger/20 bg-danger-bg text-danger hover:bg-danger/20 transition-colors flex items-center justify-center cursor-pointer"
                    title="Hapus Data Ini"
                    aria-label="Hapus data"
                >
                    <FiTrash2 className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}
