export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage?: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    perPage = 10,
    onPageChange,
}: PaginationProps) {
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4 text-[13px] text-text-muted font-inter">
            <span>
                Menampilkan data {perPage} dari total {totalItems}
            </span>
            <nav className="flex gap-1 overflow-x-auto max-w-full pb-1 md:pb-0" aria-label="Pagination">
                <button
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-background transition-colors shrink-0"
                    aria-label="Halaman sebelumnya"
                >
                    &laquo;
                </button>
                {pages.map((p) => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`px-3 py-1 rounded border transition-colors shrink-0 ${
                            p === currentPage
                                ? "bg-primary text-white border-primary"
                                : "border-border hover:bg-background"
                        }`}
                        aria-current={p === currentPage ? "page" : undefined}
                    >
                        {p}
                    </button>
                ))}
                <button
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-background transition-colors shrink-0"
                    aria-label="Halaman selanjutnya"
                >
                    &raquo;
                </button>
            </nav>
        </div>
    );
}
