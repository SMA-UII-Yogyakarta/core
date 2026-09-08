import { router } from "@inertiajs/react";
import { FiAlertCircle, FiCheckCircle, FiClock, FiFilter } from "react-icons/fi";
import { Avatar, Button, Card, SearchBar, StatusBadge, Table } from "@/Components";
import EmptyState from "@/Components/common/EmptyState";
import type { Column } from "@/Components/ui/Table";
import type { AttentionStudent, SchoolClass } from "../types";
import { STATUS_CONFIG } from "../types";

export interface AttentionStudentsTabProps {
    isFilterActive: boolean;
    selectedClassId: number | null;
    classes: SchoolClass[];
    selectedDate: string;
    onResetMobileFilter: () => void;
    filteredAttentionStudents: AttentionStudent[];
    attentionSearch: string;
    onSearchChange: (val: string) => void;
    attentionColumns: Column<AttentionStudent>[];
}

export default function AttentionStudentsTab({
    isFilterActive,
    selectedClassId,
    classes,
    selectedDate,
    onResetMobileFilter,
    filteredAttentionStudents,
    attentionSearch,
    onSearchChange,
    attentionColumns,
}: AttentionStudentsTabProps) {
    return (
        <div className="flex flex-col gap-4 font-inter">
            {/* Active filter summary pill for mobile */}
            {isFilterActive && (
                <div className="flex items-center justify-between p-2.5 px-3.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[12px] font-medium sm:hidden">
                    <div className="flex items-center gap-2 truncate">
                        <FiFilter className="text-[13px] shrink-0" />
                        <span className="truncate">
                            {selectedClassId
                                ? (classes.find((c) => c.id === selectedClassId)?.name ?? "Filter Kelas")
                                : "Semua Kelas"}{" "}
                            • {selectedDate}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onResetMobileFilter}
                        className="text-[11px] font-bold underline ml-2 shrink-0 cursor-pointer"
                    >
                        Reset
                    </button>
                </div>
            )}

            {!selectedClassId ? (
                <Card className="p-8 rounded-2xl shadow-card">
                    <EmptyState
                        variant="no-data"
                        icon={<FiFilter className="text-4xl text-text-inactive" />}
                        title="Pilih Kelas"
                        description="Pilih kelas di filter atas untuk menampilkan data siswa yang memerlukan perhatian khusus."
                        className="py-4"
                    />
                </Card>
            ) : filteredAttentionStudents.length === 0 ? (
                <Card className="p-8 rounded-2xl shadow-card">
                    <EmptyState
                        variant="no-data"
                        icon={
                            attentionSearch.trim() ? (
                                <FiAlertCircle className="text-4xl text-text-inactive" />
                            ) : (
                                <FiCheckCircle className="text-4xl text-success" />
                            )
                        }
                        title={attentionSearch.trim() ? "Tidak Ada Hasil" : "Semua Hadir Tepat Waktu"}
                        description={
                            attentionSearch.trim()
                                ? `Tidak ditemukan siswa yang cocok dengan pencarian "${attentionSearch}".`
                                : "Semua siswa di kelas ini sudah hadir dan terdata aktif hari ini."
                        }
                        className="py-4"
                    />
                </Card>
            ) : (
                <>
                    {/* Mobile Search Bar (< sm) */}
                    <div className="sm:hidden mb-1">
                        <SearchBar
                            value={attentionSearch}
                            onChange={onSearchChange}
                            onSearch={onSearchChange}
                            placeholder="Cari NIS, NISN, atau nama..."
                        />
                    </div>

                    {/* Mobile Student List Feed (< sm) */}
                    <div className="flex flex-col gap-3 sm:hidden">
                        {filteredAttentionStudents.map((s) => {
                            const cfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG["Absent"];
                            const isAbsent = s.status === "Absent";
                            const isLate = s.status === "Late";
                            const isPending = s.status === "Pending";

                            return (
                                <div
                                    key={s.id}
                                    className="bg-surface border border-border rounded-2xl p-4 shadow-card flex flex-col gap-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar
                                                name={s.name}
                                                size="md"
                                                className="shrink-0 ring-2 ring-surface shadow-xs"
                                            />
                                            <div className="min-w-0">
                                                <h4 className="text-[14px] font-bold text-text-primary truncate">
                                                    {s.name}
                                                </h4>
                                                <p className="text-[11px] text-text-muted">NISN: {s.nisn || s.nis}</p>
                                            </div>
                                        </div>
                                        <StatusBadge variant={cfg.variant} label={cfg.label} />
                                    </div>

                                    <div className="pt-2 border-t border-border flex items-center justify-between text-[12px]">
                                        <span className="text-text-muted flex items-center gap-1.5 truncate pr-2">
                                            <FiClock className="text-text-inactive shrink-0" />
                                            <span className="truncate">
                                                {isAbsent
                                                    ? "Belum ada kabar"
                                                    : isLate || s.status === "Present"
                                                      ? s.check_in_time
                                                          ? `${s.check_in_time} WIB`
                                                          : "—"
                                                      : (s.keterangan ?? "—")}
                                            </span>
                                        </span>

                                        {isPending ? (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="h-8 text-[11px] px-3 font-bold rounded-lg shadow-xs shrink-0"
                                                onClick={() => router.get("/leave-requests/verification")}
                                            >
                                                Verifikasi
                                            </Button>
                                        ) : !isAbsent ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-[11px] px-2.5 rounded-lg shrink-0"
                                                onClick={() => router.get("/master-data", { highlight: s.id })}
                                            >
                                                Detail
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Tablet & Desktop Table (>= sm) */}
                    <div className="hidden sm:block">
                        <Table columns={attentionColumns} data={filteredAttentionStudents} keyExtractor={(s) => s.id} />
                    </div>
                </>
            )}
        </div>
    );
}
