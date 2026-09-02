import type { ReactNode } from "react";
import { FiInfo } from "react-icons/fi";

export interface TableFooterProps {
    info?: ReactNode;
    pagination?: ReactNode;
    className?: string;
}

export default function TableFooter({
    info,
    pagination,
    className = "",
}: TableFooterProps) {
    if (!info && !pagination) return null;

    return (
        <div
            className={`pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 mt-auto font-inter min-h-[36px] select-none ${className}`}
        >
            {info ? (
                <div className="flex items-center gap-2 text-[12px] text-text-muted font-medium min-w-0 flex-1">
                    <FiInfo className="text-primary text-[14px] shrink-0" />
                    <span className="truncate block" title={typeof info === "string" ? info : undefined}>
                        {info}
                    </span>
                </div>
            ) : (
                <div className="flex-1" />
            )}

            {pagination && <div className="shrink-0 flex items-center">{pagination}</div>}
        </div>
    );
}
