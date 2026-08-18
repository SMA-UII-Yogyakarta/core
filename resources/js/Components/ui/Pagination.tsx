export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage?: number;
    onPageChange: (page: number) => void;
}

type PaginationItem = number | "...";

function getPaginationRange(currentPage: number, totalPages: number): PaginationItem[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const range: PaginationItem[] = [];
    const showLeftEllipsis = currentPage > 4;
    const showRightEllipsis = currentPage < totalPages - 3;

    if (!showLeftEllipsis && showRightEllipsis) {
        for (let i = 1; i <= 5; i++) {
            range.push(i);
        }
        range.push("...");
        range.push(totalPages);
    } else if (showLeftEllipsis && !showRightEllipsis) {
        range.push(1);
        range.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
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
}: PaginationProps) {
    if (totalPages <= 0) return null;

    const paginationRange = getPaginationRange(currentPage, totalPages);
    const startItem = totalItems > 0 ? (currentPage - 1) * perPage + 1 : 0;
    const endItem = Math.min(currentPage * perPage, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pb-20 sm:pb-0 gap-3 text-[13px] text-text-muted font-inter select-none">
            <span className="text-[12px] sm:text-[13px]">
                Menampilkan <strong className="text-text-primary font-bold">{startItem}</strong>–
                <strong className="text-text-primary font-bold">{endItem}</strong> dari total{" "}
                <strong className="text-text-primary font-bold">{totalItems}</strong> data
            </span>

            <nav className="flex items-center gap-1.5" aria-label="Pagination">
                {/* Previous Button */}
                <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="h-8 px-2.5 rounded-lg border border-border text-[12px] font-semibold text-text-primary bg-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                    aria-label="Halaman sebelumnya"
                >
                    <i className="fas fa-chevron-left text-[10px]" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1">
                    {paginationRange.map((item, idx) => {
                        if (item === "...") {
                            return (
                                <span
                                    key={`ellipsis-${idx}`}
                                    className="w-8 h-8 flex items-center justify-center text-text-inactive font-bold text-[13px] select-none"
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
                                className={`w-8 h-8 rounded-lg text-[13px] font-bold font-inter transition-all flex items-center justify-center cursor-pointer ${
                                    isActive
                                        ? "bg-primary text-white shadow-sm"
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
                    className="h-8 px-2.5 rounded-lg border border-border text-[12px] font-semibold text-text-primary bg-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                    aria-label="Halaman selanjutnya"
                >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <i className="fas fa-chevron-right text-[10px]" />
                </button>
            </nav>
        </div>
    );
}
