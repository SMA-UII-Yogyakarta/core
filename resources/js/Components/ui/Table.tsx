import type { ReactNode } from "react";

export interface Column<T> {
    key: string;
    header: ReactNode;
    render?: (item: T) => ReactNode;
    className?: string;
}

export interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string | number;
    emptyMessage?: string;
    loading?: boolean;
    bare?: boolean;
    stickyHeader?: boolean;
    containerClassName?: string;
    dense?: boolean;
}

const getJustifyClass = (className?: string) => {
    if (!className) return "justify-start";
    if (className.includes("text-center")) return "justify-center text-center";
    if (className.includes("text-right")) return "justify-end text-right";
    return "justify-start";
};

export default function Table<T>({
    columns,
    data,
    keyExtractor,
    emptyMessage = "Tidak ada data.",
    loading = false,
    bare = false,
    stickyHeader = true,
    containerClassName = "",
    dense = false,
}: TableProps<T>) {
    return (
        <div
            className={`w-full overflow-auto table-scroll-container ${bare ? "" : "border border-border rounded-xl shadow-xs"} ${containerClassName}`}
        >
            <table className="w-full border-collapse font-inter min-w-[600px] md:min-w-0">
                <thead className={stickyHeader ? "sticky top-0 z-10 bg-muted" : ""}>
                    <tr className="bg-muted border-b border-border">
                        {columns.map((col) => {
                            const justify = getJustifyClass(col.className);
                            return (
                                <th
                                    key={col.key}
                                    className={`${dense ? "px-3.5 py-2.5" : "px-4 py-2.5"} text-[12px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap align-middle bg-muted ${
                                        stickyHeader ? "sticky top-0 z-10 border-b border-border" : ""
                                    } ${col.className ?? ""}`}
                                >
                                    <div className={`flex items-center w-full min-h-[22px] gap-2 ${justify}`}>
                                        {col.header}
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody className="bg-surface">
                    {loading ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-12 text-center text-text-inactive align-middle"
                            >
                                Memuat data...
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-12 text-center text-text-inactive align-middle"
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
                                {columns.map((col) => {
                                    const justify = getJustifyClass(col.className);
                                    return (
                                        <td
                                            key={col.key}
                                            className={`${dense ? "px-3.5 py-2" : "px-4 py-2.5"} text-[13px] text-text-primary align-middle whitespace-nowrap ${col.className ?? ""}`}
                                        >
                                            <div className={`flex items-center w-full min-h-[22px] ${justify}`}>
                                                {col.render
                                                    ? col.render(item)
                                                    : (((item as Record<string, unknown>)[col.key] as ReactNode) ?? "-")}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
