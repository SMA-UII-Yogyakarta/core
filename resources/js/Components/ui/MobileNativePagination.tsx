import { useState } from "react";
import { FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import BottomSheet from "@/Components/common/BottomSheet";

export interface MobileNativePaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    perPage?: number;
    onPageChange: (page: number) => void;
    itemLabel?: string;
    className?: string;
    sticky?: boolean;
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
}: MobileNativePaginationProps) {
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    if (totalPages <= 1) {
        if (totalItems !== undefined && totalItems > 0) {
            return (
                <div
                    className={`w-full py-2 text-center text-[11.5px] text-text-muted font-inter select-none ${className}`}
                >
                    Menampilkan seluruh <strong className="text-text-primary font-bold">{totalItems}</strong>{" "}
                    {itemLabel}
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
            {/* Range info summary */}
            {totalItems !== undefined && startItem !== null && endItem !== null && (
                <div className="text-center text-[11.5px] text-text-muted pb-1.5 font-medium">
                    Menampilkan{" "}
                    <strong className="text-text-primary font-bold">
                        {startItem}–{endItem}
                    </strong>{" "}
                    dari total <strong className="text-text-primary font-bold">{totalItems}</strong> {itemLabel}
                </div>
            )}

            {/* Main Navigation Bar */}
            <div className="flex items-center justify-between gap-2 w-full">
                {/* Previous Button (Touch Target 44px) */}
                <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="h-11 px-3.5 rounded-xl border border-border bg-surface text-text-primary hover:bg-muted active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1 cursor-pointer font-semibold text-[13px] shrink-0 shadow-2xs"
                    aria-label="Halaman sebelumnya"
                >
                    <FiChevronLeft className="text-[16px] shrink-0" />
                    <span>Prev</span>
                </button>

                {/* Center Segmented Capsule (Tappable Quick-Jump Trigger) */}
                <button
                    type="button"
                    onClick={() => setIsPickerOpen(true)}
                    className="h-11 px-3 rounded-xl bg-primary/10 border border-primary/25 text-primary hover:bg-primary/15 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all flex-1 min-w-0 max-w-[200px]"
                    aria-label={`Halaman ${currentPage} dari ${totalPages}. Ketuk untuk memilih halaman.`}
                    title="Ketuk untuk memilih halaman langsung"
                >
                    <span className="text-[13px] font-bold truncate">
                        Hal {currentPage} <span className="text-primary/70 font-medium">/ {totalPages}</span>
                    </span>
                    <FiChevronDown className="text-[13px] text-primary shrink-0 opacity-80" />
                </button>

                {/* Next Button (Touch Target 44px) */}
                <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="h-11 px-3.5 rounded-xl border border-border bg-surface text-text-primary hover:bg-muted active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1 cursor-pointer font-semibold text-[13px] shrink-0 shadow-2xs"
                    aria-label="Halaman selanjutnya"
                >
                    <span>Next</span>
                    <FiChevronRight className="text-[16px] shrink-0" />
                </button>
            </div>

            {/* Quick-Jump Bottom Sheet Modal */}
            <BottomSheet
                open={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                title="Pilih Halaman"
                subtitle={`Total ${totalPages} halaman (${totalItems ?? 0} ${itemLabel})`}
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

                    {/* Quick First / Last Shortcuts */}
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
                                « Halaman Pertama
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
                                Halaman Terakhir »
                            </button>
                        </div>
                    )}
                </div>
            </BottomSheet>
        </div>
    );
}
