import Modal from "@/Components/common/Modal";
import { Button, Input, SelectInput } from "@/Components";

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

export default function LeaveVerificationFilterModal({
    open,
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
}: LeaveVerificationFilterModalProps) {
    const datePresets: { key: DateMode; label: string }[] = [
        { key: "all", label: "Semua Waktu" },
        { key: "today", label: "Hari Ini" },
        { key: "week", label: "Minggu Ini" },
        { key: "month", label: "Bulan Ini" },
        { key: "custom", label: "Rentang Tanggal" },
    ];

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Filter & Urutkan Permohonan"
        >
            <div className="space-y-4">
                {/* Category */}
                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1.5">
                        Kategori Izin
                    </label>
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
                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1.5">
                        Urutkan Berdasarkan
                    </label>
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
                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1.5">
                        Periode Waktu
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                        {datePresets.map((p) => (
                            <button
                                key={p.key}
                                type="button"
                                onClick={() => onDateModeChange(p.key)}
                                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-muted rounded-xl border border-border">
                        <div>
                            <label className="block text-[12px] font-medium text-text-primary mb-1">
                                Dari Tanggal
                            </label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => onStartDateChange(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[12px] font-medium text-text-primary mb-1">
                                Sampai Tanggal
                            </label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => onEndDateChange(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                    <Button variant="ghost" onClick={onReset}>
                        Reset Filter
                    </Button>
                    <Button variant="primary" onClick={onClose}>
                        Terapkan
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
