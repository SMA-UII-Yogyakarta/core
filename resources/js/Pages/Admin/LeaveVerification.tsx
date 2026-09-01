import { useState } from "react";
import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import {
    Button,
    Pagination,
    Drawer,
    Checkbox,
    EmptyState,
    ConfirmDialog,
    FilterBar,
    TabSwitcher,
    StickyContainer,
    PageHeader,
} from "@/Components";
import { LeaveRequestCard } from "@/Components/ui/LeaveRequestCard";
import type { LeaveRequest } from "@/types";

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface Filters {
    status?: string;
    category?: string;
}

interface VerifikasiIzinProps {
    leaveRequests: PaginatedData<LeaveRequest>;
    filters: Filters;
    classes?: { id: number; name: string }[];
    selectedClassId?: number | null;
}

const filterTabs = [
    { key: "", label: "Semua" },
    { key: "Pending", label: "Menunggu Verifikasi" },
    { key: "Approved", label: "Riwayat Disetujui" },
    { key: "Rejected", label: "Riwayat Ditolak" },
];

const categoryFilters = [
    { key: "", label: "Semua Kategori" },
    { key: "Sick", label: "Sakit" },
    { key: "Event", label: "Izin Acara" },
    { key: "Competition", label: "Lomba" },
    { key: "Other", label: "Lainnya" },
];

const formatDatePretty = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "-";
    try {
        const cleanStr = dateStr.split("T")[0];
        const d = new Date(cleanStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
};

const formatCategoryPretty = (cat: string | null | undefined): string => {
    if (!cat) return "-";
    const map: Record<string, string> = {
        Sick: "Sakit",
        Event: "Izin Acara",
        Competition: "Lomba",
        Other: "Lainnya",
    };
    return map[cat] ?? cat;
};

export default function VerifikasiIzin({
    leaveRequests,
    filters,
    classes = [],
    selectedClassId = null,
}: VerifikasiIzinProps) {
    const [statusFilter, setStatusFilter] = useState(filters.status ?? "");
    const [categoryFilter, setCategoryFilter] = useState(filters.category ?? "");
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [selectedLeaveIds, setSelectedLeaveIds] = useState<number[]>([]);

    const handleFilter = (status?: string, category?: string) => {
        const s = status ?? statusFilter;
        const c = category ?? categoryFilter;
        setSelectedLeaveIds([]);
        router.get(
            "/leave-requests/verification",
            { status: s || undefined, category: c || undefined },
            { preserveState: true },
        );
    };

    const [approveConfirm, setApproveConfirm] = useState<{ open: boolean; id: number | null; isBulk: boolean }>({ open: false, id: null, isBulk: false });
    const [rejectConfirm, setRejectConfirm] = useState<{ open: boolean; id: number | null; isBulk: boolean }>({ open: false, id: null, isBulk: false });

    const handleApprove = (id: number) => {
        setApproveConfirm({ open: true, id, isBulk: false });
    };

    const handleReject = (id: number) => {
        setRejectConfirm({ open: true, id, isBulk: false });
    };

    const handleBulkApprove = () => {
        if (selectedLeaveIds.length === 0) return;
        setApproveConfirm({ open: true, id: null, isBulk: true });
    };

    const handleBulkReject = () => {
        if (selectedLeaveIds.length === 0) return;
        setRejectConfirm({ open: true, id: null, isBulk: true });
    };

    const handleConfirmedApprove = () => {
        if (approveConfirm.isBulk) {
            router.post(
                "/leave-requests/bulk-verify",
                { ids: selectedLeaveIds, status: "Approved" },
                {
                    onSuccess: () => {
                        setSelectedLeaveIds([]);
                        setApproveConfirm({ open: false, id: null, isBulk: false });
                    },
                },
            );
        } else if (approveConfirm.id) {
            router.patch(`/leave-requests/${approveConfirm.id}/approve`, {}, {
                onSuccess: () => setApproveConfirm({ open: false, id: null, isBulk: false }),
            });
        }
    };

    const handleConfirmedReject = () => {
        if (rejectConfirm.isBulk) {
            router.post(
                "/leave-requests/bulk-verify",
                { ids: selectedLeaveIds, status: "Rejected" },
                {
                    onSuccess: () => {
                        setSelectedLeaveIds([]);
                        setRejectConfirm({ open: false, id: null, isBulk: false });
                    },
                },
            );
        } else if (rejectConfirm.id) {
            router.patch(`/leave-requests/${rejectConfirm.id}/reject`, {}, {
                onSuccess: () => setRejectConfirm({ open: false, id: null, isBulk: false }),
            });
        }
    };

    const toggleSelectAll = () => {
        if (selectedLeaveIds.length === leaveRequests.data.length) {
            setSelectedLeaveIds([]);
        } else {
            setSelectedLeaveIds(leaveRequests.data.map((lr) => lr.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedLeaveIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
        );
    };

    return (
        <AppShell title="Verifikasi Izin & Sakit">
            <PageHeader
                title="Verifikasi Izin & Sakit"
                description="Verifikasi berkas keterangan dispensasi dan ketidakhadiran siswa."
            />

            <StickyContainer>
                <TabSwitcher
                    tabs={filterTabs}
                    activeKey={statusFilter}
                    onChange={(key) => {
                        setStatusFilter(key);
                        handleFilter(key, categoryFilter);
                    }}
                />
            </StickyContainer>

            <FilterBar className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                    {categoryFilters.map((tab) => (
                        <Button
                            key={tab.key}
                            variant={categoryFilter === tab.key ? "primary" : "ghost"}
                            size="sm"
                            onClick={() => {
                                setCategoryFilter(tab.key);
                                handleFilter(statusFilter, tab.key);
                            }}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>
                <FilterBar.Select
                    label="Kelas"
                    options={[
                        { value: "", label: "Semua Kelas" },
                        ...classes.map((c) => ({ value: c.id.toString(), label: c.name.split(" (")[0] })),
                    ]}
                    value={selectedClassId?.toString() ?? ""}
                    onChange={(e) => {
                        const classId = e.target.value ? parseInt(e.target.value) : null;
                        router.get(
                            "/leave-requests/verification",
                            { class_id: classId || undefined, status: statusFilter, category: categoryFilter },
                            { preserveState: true },
                        );
                    }}
                />
            </FilterBar>

            <div className="space-y-6 font-inter">
                {/* Bulk Actions Bar */}
                {statusFilter === "" && leaveRequests.data.length > 0 && (
                    <div className="flex items-center justify-between bg-muted/60 border border-border p-3.5 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Checkbox
                                id="select-all"
                                checked={
                                    leaveRequests.data.length > 0 &&
                                    selectedLeaveIds.length === leaveRequests.data.length
                                }
                                onChange={toggleSelectAll}
                            />
                            <label htmlFor="select-all" className="text-[13px] font-bold text-text-primary cursor-pointer">
                                Pilih Semua ({selectedLeaveIds.length} dipilih)
                            </label>
                        </div>
                        {selectedLeaveIds.length > 0 && (
                            <div className="flex gap-2">
                                <Button
                                    variant="danger-outline"
                                    size="sm"
                                    onClick={handleBulkReject}
                                >
                                    Tolak Massal ({selectedLeaveIds.length})
                                </Button>
                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={handleBulkApprove}
                                >
                                    Setujui Massal ({selectedLeaveIds.length})
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Leave Requests Cards List */}
                {leaveRequests.data.length === 0 ? (
                    <EmptyState
                        variant="no-data"
                        title="Tidak Ada Pengajuan Izin"
                        description="Belum ada pengajuan izin yang sesuai dengan kriteria yang dipilih."
                    />
                ) : (
                    <div className="space-y-4">
                        {leaveRequests.data.map((lr) => (
                            <LeaveRequestCard
                                key={lr.id}
                                leaveRequest={lr}
                                onDetailClick={() => setSelectedRequest(lr)}
                                onApprove={() => handleApprove(lr.id)}
                                onReject={() => handleReject(lr.id)}
                                checkboxSlot={
                                    statusFilter === "" && lr.approval_status === "Pending" ? (
                                        <Checkbox
                                            id={`select-${lr.id}`}
                                            checked={selectedLeaveIds.includes(lr.id)}
                                            onChange={() => toggleSelect(lr.id)}
                                        />
                                    ) : undefined
                                }
                            />
                        ))}
                    </div>
                )}

                {/* Symmetrical Footer Info & Full-Width Pagination Bar */}
                <div className="mt-4 pt-3 border-t border-border flex flex-col gap-3 font-inter">
                    <div className="flex items-center gap-2 text-[12px] text-text-muted font-medium">
                        <i className="fas fa-info-circle text-primary text-[14px] shrink-0" />
                        <span>Menampilkan pengajuan izin siswa yang diverifikasi.</span>
                    </div>
                    {leaveRequests.last_page > 1 && (
                        <Pagination
                            currentPage={leaveRequests.current_page}
                            totalPages={leaveRequests.last_page}
                            totalItems={leaveRequests.total}
                            perPage={leaveRequests.per_page}
                            onPageChange={(page) =>
                                router.get(
                                    "/leave-requests/verification",
                                    { page, status: statusFilter, category: categoryFilter, class_id: selectedClassId },
                                    { preserveState: true },
                                )
                            }
                        />
                    )}
                </div>
            </div>

            {/* Intuitive Detail Drawer with Clean Indonesian Formatting */}
            <Drawer
                open={Boolean(selectedRequest)}
                onClose={() => setSelectedRequest(null)}
                title="Detail Verifikasi Izin"
            >
                {selectedRequest && (
                    <div className="space-y-6 font-inter">
                        <div className="flex justify-between items-start pb-4 border-b border-border">
                            <div>
                                <h3 className="text-[18px] font-bold text-text-primary">
                                    {selectedRequest.student?.name}
                                </h3>
                                <p className="text-[13px] text-text-muted mt-0.5">
                                    NIS: {selectedRequest.student?.nis} • Kelas: {selectedRequest.student?.class?.name?.split(" (")[0] ?? "-"}
                                </p>
                            </div>
                            <div className="shrink-0">
                                {selectedRequest.approval_status === "Pending" ? (
                                    <span className="bg-warning-bg text-warning font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wide inline-block">
                                        MENUNGGU
                                    </span>
                                ) : selectedRequest.approval_status === "Approved" ? (
                                    <span className="bg-success-bg text-success font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wide inline-block">
                                        DISETUJUI
                                    </span>
                                ) : (
                                    <span className="bg-danger-bg text-danger font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wide inline-block">
                                        DITOLAK
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3.5 bg-muted/70 p-4 rounded-xl border border-border text-[13px]">
                            <div className="flex justify-between items-center">
                                <span className="text-text-muted font-semibold">Kategori:</span>
                                <span className="font-bold text-text-primary">
                                    {formatCategoryPretty(selectedRequest.category)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-text-muted font-semibold">Tanggal:</span>
                                <span className="font-bold text-text-primary">
                                    {selectedRequest.start_date === selectedRequest.end_date
                                        ? formatDatePretty(selectedRequest.start_date)
                                        : `${formatDatePretty(selectedRequest.start_date)} s/d ${formatDatePretty(selectedRequest.end_date)}`}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-text-muted font-semibold">Wali Murid:</span>
                                <span className="font-semibold text-text-primary">
                                    {selectedRequest.guardian?.name ?? "-"}
                                </span>
                            </div>
                            <div className="pt-3 border-t border-border/60">
                                <span className="text-text-muted font-semibold block mb-1">Keterangan:</span>
                                <p className="text-text-primary leading-relaxed bg-surface p-3 rounded-lg border border-border/50">
                                    {selectedRequest.description || "Tidak ada keterangan."}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            {selectedRequest.approval_status === "Pending" && (
                                <>
                                    <Button
                                        variant="danger-outline"
                                        className="w-full"
                                        onClick={() => {
                                            const id = selectedRequest.id;
                                            setSelectedRequest(null);
                                            handleReject(id);
                                        }}
                                    >
                                        Tolak Izin
                                    </Button>
                                    <Button
                                        variant="success"
                                        className="w-full"
                                        onClick={() => {
                                            const id = selectedRequest.id;
                                            setSelectedRequest(null);
                                            handleApprove(id);
                                        }}
                                    >
                                        Setujui Izin
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setSelectedRequest(null)}
                            >
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Drawer>

            {/* Confirm Dialogs */}
            <ConfirmDialog
                open={approveConfirm.open}
                title="Konfirmasi Persetujuan"
                message={
                    approveConfirm.isBulk
                        ? `Apakah Anda yakin ingin menyetujui ${selectedLeaveIds.length} pengajuan izin ini?`
                        : "Apakah Anda yakin ingin menyetujui pengajuan izin ini?"
                }
                confirmLabel="Ya, Setujui"
                cancelLabel="Batal"
                variant="primary"
                onConfirm={handleConfirmedApprove}
                onClose={() => setApproveConfirm({ open: false, id: null, isBulk: false })}
            />

            <ConfirmDialog
                open={rejectConfirm.open}
                title="Konfirmasi Penolakan"
                message={
                    rejectConfirm.isBulk
                        ? `Apakah Anda yakin ingin menolak ${selectedLeaveIds.length} pengajuan izin ini?`
                        : "Apakah Anda yakin ingin menolak pengajuan izin ini?"
                }
                confirmLabel="Ya, Tolak"
                cancelLabel="Batal"
                variant="danger"
                onConfirm={handleConfirmedReject}
                onClose={() => setRejectConfirm({ open: false, id: null, isBulk: false })}
            />
        </AppShell>
    );
}