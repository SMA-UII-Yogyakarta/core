import type { ReactNode } from "react";

// --- Column Definition ---

export interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => ReactNode;
    className?: string;
}

// --- Table ---

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string | number;
    loading?: boolean;
    emptyMessage?: string;
}

export default function Table<T>({
    columns,
    data,
    keyExtractor,
    loading,
    emptyMessage = "Tidak ada data.",
}: TableProps<T>) {
    return (
        <div className="w-full overflow-x-auto border border-border rounded-lg">
            <table className="w-full border-collapse font-inter">
                <thead>
                    <tr className="bg-muted border-b border-border">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`px-4 py-3 text-left text-[13px] font-semibold text-text-muted uppercase tracking-wide ${col.className ?? ""}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-12 text-center text-text-inactive"
                            >
                                Memuat data...
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-12 text-center text-text-inactive"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr
                                key={keyExtractor(item)}
                                className="border-b border-border last:border-b-0 hover:bg-muted transition-colors"
                            >
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={`px-4 py-3 text-[14px] text-text-primary ${col.className ?? ""}`}
                                    >
                                        {col.render
                                            ? col.render(item)
                                            : (((
                                                  item as Record<
                                                      string,
                                                      unknown
                                                  >
                                              )[col.key] as ReactNode) ?? "-")}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

// --- Pagination ---

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage?: number;
    onPageChange: (page: number) => void;
}

export function Pagination({
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
        <div className="flex items-center justify-between mt-4 text-[13px] text-text-muted font-inter">
            <span>
                Menampilkan data {perPage} dari total {totalItems}
            </span>
            <nav className="flex gap-1" aria-label="Pagination">
                <button
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-background transition-colors"
                    aria-label="Halaman sebelumnya"
                >
                    &laquo;
                </button>
                {pages.map((p) => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`px-3 py-1 rounded border transition-colors ${
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
                    className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-background transition-colors"
                    aria-label="Halaman selanjutnya"
                >
                    &raquo;
                </button>
            </nav>
        </div>
    );
}
