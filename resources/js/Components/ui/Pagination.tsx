export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage?: number;
    onPageChange: (page: number) => void;
    compact?: boolean;
    align?: "auto" | "between" | "center";
    className?: string;
}

type PaginationItem = number | "...";

function getPaginationRange(currentPage: number, totalPages: number, compact: boolean): PaginationItem[] {
    if (compact || totalPages <= 5) {
        if (totalPages <= 4) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        if (currentPage <= 2) {
            return [1, 2, "...", totalPages];
        }
        if (currentPage >= totalPages - 1) {
            return [1, "...", totalPages - 1, totalPages];
        }
        return [1, "...", currentPage, "...", totalPages];
    }

    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const range: PaginationItem[] = [];
    const showLeftEllipsis = currentPage > 3;
    const showRightEllipsis = currentPage < totalPages - 2;

    if (!showLeftEllipsis && showRightEllipsis) {
        for (let i = 1; i <= 4; i++) {
            range.push(i);
        }
        range.push("...");
        range.push(totalPages);
    } else if (showLeftEllipsis && !showRightEllipsis) {
        range.push(1);
        range.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
            range.push(i);
        }
    } else {
        range.push(1);
        range.push("...");
        range.push(currentPage - 1);
        range.push(currentPage);
        range.push(currentPage + 1);
        range.push("...");
        range.push(totalPages);
    }

    return range;
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    perPage = 10,
    onPageChange,
    compact = false,
    align = "auto",
    className = "",
}: PaginationProps) {
    if (totalPages <= 0) return null;

    const isCentered = align === "center";
    const paginationRange = getPaginationRange(currentPage, totalPages, compact);
    const startItem = totalItems > 0 ? (currentPage - 1) * perPage + 1 : 0;
    const endItem = Math.min(currentPage * perPage, totalItems);

    return (
        <div
            className={`flex items-center ${
                isCentered ? "justify-center" : "justify-between"
            } gap-2 text-[13px] text-text-muted font-inter select-none w-full max-w-full ${className}`}
        >
            {/* Info Text — Tepi Kiri */}
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

            {/* Navigation Controls — Tepi Kanan */}
            <nav
                className="flex items-center justify-end gap-1 shrink-0"
                aria-label="Pagination"
            >
                {/* Previous Button */}
                <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-border text-[11px] sm:text-[12px] font-semibold text-text-primary bg-surface disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted active:scale-95 transition-all flex items-center justify-center cursor-pointer shrink-0"
                    aria-label="Halaman sebelumnya"
                    title="Halaman sebelumnya"
                >
                    <i className="fas fa-chevron-left text-[9px] sm:text-[10px]" />
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
                    <i className="fas fa-chevron-right text-[9px] sm:text-[10px]" />
                </button>
            </nav>
        </div>
    );
}
