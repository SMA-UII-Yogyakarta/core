import { useState } from "react";
import { FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import BottomSheet from "@/Components/common/BottomSheet";

export interface PaginationLabels {
    showingAll?: string;
    showingRange?: string;
    prev?: string;
    next?: string;
    pageInfo?: string;
    selectPage?: string;
    sheetTitle?: string;
    sheetSubtitle?: string;
    firstPage?: string;
    lastPage?: string;
    prevAria?: string;
    nextAria?: string;
}

const defaultLabels: Required<PaginationLabels> = {
    showingAll: "Menampilkan seluruh {total} {label}",
    showingRange: "Menampilkan {start}–{end} dari total {total} {label}",
    prev: "Prev",
    next: "Next",
    pageInfo: "Hal {current} / {total}",
    selectPage: "Ketuk untuk memilih halaman langsung",
    sheetTitle: "Pilih Halaman",
    sheetSubtitle: "Total {total} halaman ({count} {label})",
    firstPage: "« Halaman Pertama",
    lastPage: "Halaman Terakhir »",
    prevAria: "Halaman sebelumnya",
    nextAria: "Halaman selanjutnya",
};

function interpolate(template: string, params: Record<string, string | number>): string {
    let result = template;
    for (const [key, value] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
    }
    return result;
}

export interface MobileNativePaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    perPage?: number;
    onPageChange: (page: number) => void;
    itemLabel?: string;
    className?: string;
    sticky?: boolean;
    labels?: PaginationLabels;
}

export default function MobileNativePagination({
    currentPage,
    totalPages,
    totalItems,
    perPage = 10,
    onPageChange,
    itemLabel = "data",
    className = "",
    sticky = false,
    labels,
}: MobileNativePaginationProps) {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const L = { ...defaultLabels, ...labels };

    if (totalPages <= 1) {
        if (totalItems !== undefined && totalItems > 0) {
            return (
                <div
                    className={`w-full py-2 text-center text-[11.5px] text-text-muted font-inter select-none ${className}`}
                >
                    {interpolate(L.showingAll, { total: totalItems, label: itemLabel })}
                </div>
            );
        }
        return null;
    }

    const startItem = totalItems && perPage ? Math.min((currentPage - 1) * perPage + 1, totalItems) : null;
    const endItem = totalItems && perPage ? Math.min(currentPage * perPage, totalItems) : null;

    return (
        <div
            className={`w-full font-inter select-none ${
                sticky
                    ? "sticky bottom-0 z-20 bg-surface/95 backdrop-blur-md border-t border-border/80 px-3 py-2.5 shadow-lg"
                    : "pt-2"
            } ${className}`}
        >
            {totalItems !== undefined && startItem !== null && endItem !== null && (
                <div className="text-center text-[11.5px] text-text-muted pb-1.5 font-medium">
                    {interpolate(L.showingRange, { start: startItem, end: endItem, total: totalItems, label: itemLabel })}
                </div>
            )}

            <div className="flex items-center justify-between gap-2 w-full">
                <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="h-11 px-3.5 rounded-xl border border-border bg-surface text-text-primary hover:bg-muted active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1 cursor-pointer font-semibold text-[13px] shrink-0 shadow-2xs"
                    aria-label={L.prevAria}
                >
                    <FiChevronLeft className="text-[16px] shrink-0" />
                    <span>{L.prev}</span>
                </button>

                <button
                    type="button"
                    onClick={() => setIsPickerOpen(true)}
                    className="h-11 px-3 rounded-xl bg-primary/10 border border-primary/25 text-primary hover:bg-primary/15 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all flex-1 min-w-0 max-w-[200px]"
                    aria-label={interpolate(L.pageInfo, { current: currentPage, total: totalPages })}
                    title={L.selectPage}
                >
                    <span className="text-[13px] font-bold truncate">
                        {interpolate(L.pageInfo, { current: currentPage, total: totalPages })}
                    </span>
                    <FiChevronDown className="text-[13px] text-primary shrink-0 opacity-80" />
                </button>

                <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="h-11 px-3.5 rounded-xl border border-border bg-surface text-text-primary hover:bg-muted active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1 cursor-pointer font-semibold text-[13px] shrink-0 shadow-2xs"
                    aria-label={L.nextAria}
                >
                    <span>{L.next}</span>
                    <FiChevronRight className="text-[16px] shrink-0" />
                </button>
            </div>

            <BottomSheet
                open={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                title={L.sheetTitle}
                subtitle={interpolate(L.sheetSubtitle, { total: totalPages, count: totalItems ?? 0, label: itemLabel })}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-2 max-h-[280px] overflow-y-auto p-1 font-inter">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                            const isActive = p === currentPage;
                            return (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => {
                                        onPageChange(p);
                                        setIsPickerOpen(false);
                                    }}
                                    className={`h-11 rounded-xl text-[14px] font-bold transition-all flex items-center justify-center cursor-pointer ${
                                        isActive
                                            ? "bg-primary text-white shadow-xs ring-2 ring-primary/30"
                                            : "bg-surface border border-border text-text-primary hover:bg-muted active:scale-95"
                                    }`}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    {p}
                                </button>
                            );
                        })}
                    </div>

                    {totalPages > 5 && (
                        <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => {
                                    onPageChange(1);
                                    setIsPickerOpen(false);
                                }}
                                className="flex-1 py-2.5 px-3 rounded-xl border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-muted disabled:opacity-30 text-[12px] font-semibold transition-all"
                            >
                                {L.firstPage}
                            </button>
                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => {
                                    onPageChange(totalPages);
                                    setIsPickerOpen(false);
                                }}
                                className="flex-1 py-2.5 px-3 rounded-xl border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-muted disabled:opacity-30 text-[12px] font-semibold transition-all"
                            >
                                {L.lastPage}
                            </button>
                        </div>
                    )}
                </div>
            </BottomSheet>
        </div>
    );
}
