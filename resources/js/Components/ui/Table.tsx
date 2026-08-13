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
        <div className="w-full overflow-x-auto border border-border md:border md:rounded-lg">
            <table className="w-full border-collapse font-inter block md:table">
                <thead className="hidden md:table-header-group">
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
                <tbody className="block md:table-row-group bg-surface md:bg-transparent">
                    {loading ? (
                        <tr className="block md:table-row">
                            <td
                                colSpan={columns.length}
                                className="block md:table-cell px-4 py-12 text-center text-text-inactive"
                            >
                                Memuat data...
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr className="block md:table-row">
                            <td
                                colSpan={columns.length}
                                className="block md:table-cell px-4 py-12 text-center text-text-inactive"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr
                                key={keyExtractor(item)}
                                className="block md:table-row border-b border-border md:border-b-border md:last:border-b-0 hover:bg-muted transition-colors mb-4 md:mb-0 p-4 md:p-0 bg-surface md:bg-transparent shadow-sm md:shadow-none"
                            >
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={`flex md:table-cell items-center justify-between md:justify-start px-0 md:px-4 py-2 md:py-3 text-[14px] text-text-primary ${col.className ?? ""}`}
                                    >
                                        <span className="md:hidden font-medium text-text-muted text-[13px] uppercase">
                                            {col.header}
                                        </span>
                                        <div className="text-right md:text-left flex-1 flex justify-end md:justify-start overflow-hidden">
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
