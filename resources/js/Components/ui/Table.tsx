import type { ReactNode } from "react";

// --- Column Definition ---

export interface Column<T> {
    key: string;
    header: ReactNode;
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
        <div className="w-full overflow-x-auto border border-border rounded-lg shadow-sm">
            <table className="w-full border-collapse font-inter min-w-[600px] md:min-w-0">
                <thead>
                    <tr className="bg-muted border-b border-border">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`px-4 py-3 text-left text-[13px] font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap ${col.className ?? ""}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-surface">
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
                                        <div>
                                            {col.render
                                                ? col.render(item)
                                                : (((item as Record<string, unknown>)[col.key] as ReactNode) ?? "-")}
                                        </div>
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
