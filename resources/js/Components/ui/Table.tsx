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
}: TableProps<T>) {
    return (
        <div className={`w-full overflow-x-auto ${bare ? "" : "border border-border rounded-lg shadow-sm"}`}>
            <table className="w-full border-collapse font-inter min-w-[600px] md:min-w-0">
                <thead>
                    <tr className="bg-muted border-b border-border">
                        {columns.map((col) => {
                            const justify = getJustifyClass(col.className);
                            return (
                                <th
                                    key={col.key}
                                    className={`px-4 py-3 text-[13px] font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap align-middle ${col.className ?? ""}`}
                                >
                                    <div className={`flex items-center w-full min-h-[24px] gap-2 ${justify}`}>
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
                                            className={`px-4 py-3 text-[14px] text-text-primary align-middle whitespace-nowrap ${col.className ?? ""}`}
                                        >
                                            <div className={`flex items-center w-full min-h-[24px] ${justify}`}>
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
