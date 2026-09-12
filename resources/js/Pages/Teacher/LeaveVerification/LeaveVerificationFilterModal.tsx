import { Button, FilterPopoverPanel, Input, SelectInput } from "@/Components";
import BottomSheet from "@/Components/common/BottomSheet";
import Modal from "@/Components/common/Modal";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export type DateMode = "all" | "today" | "week" | "month" | "custom";
export type SortMode = "urgency" | "dateDesc" | "dateAsc";

interface LeaveVerificationFilterModalProps {
    open: boolean;
    category: string;
    dateMode: DateMode;
    sortMode: SortMode;
    startDate: string;
    endDate: string;
    onCategoryChange: (cat: string) => void;
    onDateModeChange: (mode: DateMode) => void;
    onSortModeChange: (sort: SortMode) => void;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    onReset: () => void;
    onClose: () => void;
}

export type LeaveVerificationFilterContentProps = Omit<LeaveVerificationFilterModalProps, "open"> & {
    showHeader?: boolean;
    showActions?: boolean;
};

export function LeaveVerificationFilterContent({
    category,
    dateMode,
    sortMode,
    startDate,
    endDate,
    onCategoryChange,
    onDateModeChange,
    onSortModeChange,
    onStartDateChange,
    onEndDateChange,
    onReset,
    onClose,
    showHeader = false,
    showActions = true,
}: LeaveVerificationFilterContentProps) {
    const datePresets: { key: DateMode; label: string }[] = [
        { key: "all", label: "Semua Waktu" },
        { key: "today", label: "Hari Ini" },
        { key: "week", label: "Minggu Ini" },
        { key: "month", label: "Bulan Ini" },
        { key: "custom", label: "Rentang Tanggal" },
    ];

    const hasActiveFilters =
        category !== "all" ||
        dateMode !== "all" ||
        sortMode !== "urgency" ||
        Boolean(startDate) ||
        Boolean(endDate);

    const filterFields = (
        <>
            {/* Category */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-text-secondary">Kategori Izin</label>
                <SelectInput
                    value={category}
                    onChange={(val) => onCategoryChange(val ? String(val) : "all")}
                    options={[
                        { value: "all", label: "Semua Kategori" },
                        { value: "Sick", label: "Sakit" },
                        { value: "Event", label: "Izin Acara Keluarga / Lainnya" },
                        { value: "Competition", label: "Dispensasi Lomba / Prestasi" },
                        { value: "Other", label: "Lainnya" },
                    ]}
                />
            </div>

            {/* Sort Mode */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-text-secondary">Urutkan Berdasarkan</label>
                <SelectInput
                    value={sortMode}
                    onChange={(val) => onSortModeChange((val as SortMode) || "urgency")}
                    options={[
                        { value: "urgency", label: "Urgensi (Paling Mendesak / Jatuh Tempo)" },
                        { value: "dateDesc", label: "Tanggal Pengajuan Terbaru → Terlama" },
                        { value: "dateAsc", label: "Tanggal Pengajuan Terlama → Terbaru" },
                    ]}
                />
            </div>

            {/* Date Presets */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-text-secondary">Periode Waktu</label>
                <div className="flex flex-wrap gap-2">
                    {datePresets.map((p) => (
                        <button
                            key={p.key}
                            type="button"
                            onClick={() => onDateModeChange(p.key)}
                            className={`px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                                dateMode === p.key
                                    ? "bg-primary text-white font-semibold"
                                    : "bg-surface text-text-secondary border border-border hover:bg-muted"
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Date Range Pickers */}
            {dateMode === "custom" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-muted rounded-xl border border-border">
                    <div>
                        <label className="block text-[12px] font-bold text-text-secondary mb-1.5">Dari Tanggal</label>
                        <Input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-[12px] font-bold text-text-secondary mb-1.5">
                            Sampai Tanggal
                        </label>
                        <Input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} />
                    </div>
                </div>
            )}

        </>
    );

    const filterActions = showActions ? (
        <>
            <Button variant="ghost" onClick={onReset} className="flex-1 h-10 rounded-xl">
                Reset Filter
            </Button>
            <Button variant="primary" onClick={onClose} className="flex-1 h-10 rounded-xl">
                Terapkan
            </Button>
        </>
    ) : null;

    if (showHeader) {
        return (
            <FilterPopoverPanel
                title="Filter & Urutkan Permohonan"
                hasActiveFilters={hasActiveFilters}
                onReset={onReset}
                footer={filterActions}
            >
                <div className="flex flex-col gap-4 pb-1">{filterFields}</div>
            </FilterPopoverPanel>
        );
    }

    return (
        <div className="flex flex-col gap-4 pb-1">
            {filterFields}
            {filterActions && <div className="flex items-center gap-3 border-t border-border pt-2.5">{filterActions}</div>}
        </div>
    );
}

export default function LeaveVerificationFilterModal({
    open,
    onClose,
    ...props
}: LeaveVerificationFilterModalProps) {
    const isDesktop = useMediaQuery("(min-width: 640px)");

    if (isDesktop) {
        return (
            <Modal open={open} onClose={onClose} title="Filter & Urutkan Permohonan">
                <LeaveVerificationFilterContent {...props} onClose={onClose} />
            </Modal>
        );
    }

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title="Filter & Urutkan Permohonan"
            subtitle="Atur kategori, periode, dan urutan pengajuan"
        >
            <LeaveVerificationFilterContent {...props} onClose={onClose} />
        </BottomSheet>
    );
}
