import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { getPageNumbers, type PaginationItem } from "@/utils/helpers";

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    perPage?: number;
    onPageChange: (page: number) => void;
    compact?: boolean;
    showInfo?: boolean;
    align?: "auto" | "between" | "center" | "start" | "left";
    className?: string;
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems = 0,
    perPage = 10,
    onPageChange,
    compact = false,
    showInfo = true,
    align = "auto",
    className = "",
}: PaginationProps) {
    if (totalPages <= 0) return null;

    const isCentered = align === "center";
    const isStart = align === "start" || align === "left";
    const paginationRange = getPageNumbers(currentPage, totalPages, compact);
    const startItem = totalItems > 0 ? (currentPage - 1) * perPage + 1 : 0;
    const endItem = Math.min(currentPage * perPage, totalItems);

    return (
        <div
            className={`flex items-center ${
                isCentered ? "justify-center" : isStart ? "justify-start gap-3" : "justify-between gap-2"
            } text-[13px] text-text-muted font-inter select-none w-full max-w-full ${className}`}
        >
            {/* Info Text — Tepi Kiri */}
            {showInfo && (
                <span className="text-[12px] whitespace-nowrap text-text-secondary text-left">
                    {compact ? (
                        <>
                            <strong className="text-text-primary font-bold">{startItem}</strong>–
                            <strong className="text-text-primary font-bold">{endItem}</strong> dari{" "}
                            <strong className="text-text-primary font-bold">{totalItems}</strong>
                        </>
                    ) : (
                        <>
                            Menampilkan <strong className="text-text-primary font-bold">{startItem}</strong>–
                            <strong className="text-text-primary font-bold">{endItem}</strong> dari total{" "}
                            <strong className="text-text-primary font-bold">{totalItems}</strong> data
                        </>
                    )}
                </span>
            )}

            {/* Navigation Controls — Tepi Kanan */}
            <nav className="flex items-center justify-end gap-1 shrink-0" aria-label="Pagination">
                {/* Previous Button */}
                <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-border text-[11px] sm:text-[12px] font-semibold text-text-primary bg-surface disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted active:scale-95 transition-all flex items-center justify-center cursor-pointer shrink-0"
                    aria-label="Halaman sebelumnya"
                    title="Halaman sebelumnya"
                >
                    <FiChevronLeft className="text-[12px] sm:text-[13px]" />
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                    {paginationRange.map((item, idx) => {
                        if (item === "...") {
                            return (
                                <span
                                    key={`ellipsis-${idx}`}
                                    className="w-5 h-7 sm:w-6 sm:h-8 flex items-center justify-center text-text-inactive font-bold text-[11px] sm:text-[12px] select-none shrink-0"
                                >
                                    …
                                </span>
                            );
                        }

                        const pageNum = item as number;
                        const isActive = pageNum === currentPage;

                        return (
                            <button
                                key={pageNum}
                                type="button"
                                onClick={() => onPageChange(pageNum)}
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[11px] sm:text-[12px] font-bold font-inter transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                                    isActive
                                        ? "bg-primary text-white shadow-xs"
                                        : "bg-surface border border-border text-text-primary hover:bg-muted hover:border-border/80"
                                }`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                {/* Next Button */}
                <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-border text-[11px] sm:text-[12px] font-semibold text-text-primary bg-surface disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted active:scale-95 transition-all flex items-center justify-center cursor-pointer shrink-0"
                    aria-label="Halaman selanjutnya"
                    title="Halaman selanjutnya"
                >
                    <FiChevronRight className="text-[12px] sm:text-[13px]" />
                </button>
            </nav>
        </div>
    );
}
