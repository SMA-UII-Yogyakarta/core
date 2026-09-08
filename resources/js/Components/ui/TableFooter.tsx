import type { ReactNode } from "react";
import { FiInfo } from "react-icons/fi";
import { getPaginationRange } from "@/utils/helpers";
import Pagination from "./Pagination";

export interface TableFooterProps {
    info?: ReactNode;
    emptyInfo?: ReactNode;
    pagination?: ReactNode;
    className?: string;

    // Declarative pagination props matching MobileNativePagination
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    perPage?: number;
    onPageChange?: (page: number) => void;
    itemLabel?: string;
}

export default function TableFooter({
    info,
    emptyInfo,
    pagination,
    className = "",
    currentPage,
    totalPages,
    totalItems,
    perPage = 10,
    onPageChange,
    itemLabel = "data",
}: TableFooterProps) {
    // 1. Resolve Info text: explicit prop wins, otherwise declarative range
    let resolvedInfo = info;
    if (!resolvedInfo && totalItems !== undefined) {
        if (totalItems > 0 && currentPage) {
            const { from, to } = getPaginationRange(currentPage, perPage, totalItems);
            resolvedInfo = (
                <span>
                    Menampilkan{" "}
                    <strong className="text-text-primary font-bold">
                        {from}–{to}
                    </strong>{" "}
                    dari total <strong className="text-text-primary font-bold">{totalItems}</strong> {itemLabel}.
                </span>
            );
        } else if (totalItems > 0) {
            resolvedInfo = (
                <span>
                    Menampilkan total <strong className="text-text-primary font-bold">{totalItems}</strong> {itemLabel}.
                </span>
            );
        } else if (emptyInfo) {
            resolvedInfo = emptyInfo;
        }
    }

    // 2. Resolve Pagination: explicit prop wins, otherwise declarative Pagination
    let resolvedPagination = pagination;
    if (!resolvedPagination && totalPages !== undefined && totalPages > 1 && onPageChange && currentPage) {
        resolvedPagination = (
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems ?? 0}
                perPage={perPage}
                onPageChange={onPageChange}
                showInfo={false}
                className="!w-auto !gap-3"
            />
        );
    }

    if (!resolvedInfo && !resolvedPagination) return null;

    return (
        <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 mt-auto font-inter min-h-[36px] select-none ${className}`}
        >
            {resolvedInfo ? (
                <div className="flex items-center gap-2 text-[12px] text-text-muted font-medium min-w-0 flex-1">
                    <FiInfo className="text-primary text-[14px] shrink-0" />
                    <span
                        className="truncate block"
                        title={typeof resolvedInfo === "string" ? resolvedInfo : undefined}
                    >
                        {resolvedInfo}
                    </span>
                </div>
            ) : (
                <div className="flex-1" />
            )}

            {resolvedPagination && <div className="shrink-0 flex items-center">{resolvedPagination}</div>}
        </div>
    );
}
