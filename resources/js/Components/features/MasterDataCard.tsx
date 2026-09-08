import type { ReactNode } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Avatar from "@/Components/ui/Avatar";
import Checkbox from "@/Components/ui/Checkbox";

export interface MasterDataCardProps {
    isSelected: boolean;
    onSelect: (checked: boolean) => void;
    onOpenDetail: () => void;
    onEdit: () => void;
    onDelete?: () => void;
    selectLabel?: string;
    editAriaLabel?: string;
    deleteAriaLabel?: string;
    deleteTitle?: string;
    avatarName?: string;
    title: ReactNode;
    titleClassName?: string;
    subtitle?: ReactNode;
    rightBadge?: ReactNode;
    children?: ReactNode;
    footerHint?: string;
    className?: string;
}

export default function MasterDataCard({
    isSelected,
    onSelect,
    onOpenDetail,
    onEdit,
    onDelete,
    selectLabel = "Pilih Item",
    editAriaLabel = "Edit Data",
    deleteAriaLabel = "Hapus Data",
    deleteTitle,
    avatarName,
    title,
    titleClassName = "text-[13px] font-bold text-text-primary truncate leading-snug",
    subtitle,
    rightBadge,
    children,
    footerHint = "Ketuk kartu untuk detail & edit",
    className = "",
}: MasterDataCardProps) {
    return (
        <div
            onClick={onOpenDetail}
            className={`p-3 bg-surface border rounded-2xl shadow-xs space-y-2 transition-all cursor-pointer active:scale-[0.99] select-none ${
                isSelected
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:border-text-muted/30"
            } ${className}`}
        >
            {/* Top Row: Checkbox, Avatar, Title/Subtitle, and Right Badges */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                    {/* Checkbox Wrapper with stopPropagation */}
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(!isSelected);
                        }}
                        className="pt-0.5 cursor-pointer p-1 -m-1 rounded hover:bg-muted/50 transition-colors flex items-center justify-center shrink-0"
                        title={selectLabel}
                    >
                        <Checkbox checked={isSelected} readOnly className="pointer-events-none" />
                    </div>

                    {/* Optional Avatar */}
                    {avatarName && <Avatar name={avatarName} size="sm" className="shrink-0 mt-0.5" />}

                    {/* Title & Subtitle */}
                    <div className="min-w-0 flex-1">
                        <div className={titleClassName}>{title}</div>
                        {subtitle && <div className="mt-0.5">{subtitle}</div>}
                    </div>
                </div>

                {/* Right Badges / Actions */}
                {rightBadge && <div className="shrink-0 pt-0.5 flex items-center gap-1.5">{rightBadge}</div>}
            </div>

            {/* Middle Content Row (Custom for each entity) */}
            {children}

            {/* Bottom Action Row */}
            <div className="flex items-center justify-between pt-1 border-t border-border/60">
                <span className="text-[10px] text-text-muted">{footerHint}</span>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={onEdit}
                        className="h-8 px-3 rounded-xl text-[12px] font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                        aria-label={editAriaLabel}
                    >
                        <FiEdit2 className="text-[12.5px]" />
                        <span>Edit</span>
                    </button>
                    {onDelete && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="h-8 w-8 rounded-xl text-danger bg-danger/10 hover:bg-danger/20 border border-danger/20 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
                            aria-label={deleteAriaLabel}
                            title={deleteTitle || deleteAriaLabel}
                        >
                            <FiTrash2 className="text-[13px]" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
