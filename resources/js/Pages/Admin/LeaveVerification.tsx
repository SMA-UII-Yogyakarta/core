import { useState } from "react";
import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import {
    StatusBadge,
    Button,
    Pagination,
    TabSwitcher,
    FilterBar,
    StickyContainer,
    PageHeader,
    Drawer,
    Checkbox,
} from "@/Components";
import { LeaveRequestCard } from "@/Components";
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
}

const categoryLabels: Record<string, string> = {
    Sick: "Sakit",
    Event: "Kegiatan",
    Competition: "Lomba",
    Other: "Lainnya",
};

const filterTabs = [
    { key: "", label: "Semua" },
    { key: "Pending", label: "Menunggu" },
    { key: "Approved", label: "Disetujui" },
    { key: "Rejected", label: "Ditolak" },
];

const categoryFilters = [
    { key: "", label: "Semua Kategori" },
    { key: "Sick", label: "Sakit" },
    { key: "Event", label: "Kegiatan" },
    { key: "Competition", label: "Lomba" },
    { key: "Other", label: "Lainnya" },
];

export default function VerifikasiIzin({ leaveRequests, filters }: VerifikasiIzinProps) {
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

    const handleApprove = (id: number) => {
        if (confirm("Setujui permohonan izin ini?")) {
            router.patch(`/leave-requests/${id}/approve`, undefined, {
                preserveState: true,
                onSuccess: () => {
                    setSelectedRequest(null);
                    setSelectedLeaveIds((prev) => prev.filter((i) => i !== id));
                },
            });
        }
    };

    const handleReject = (id: number) => {
        if (confirm("Tolak permohonan izin ini?")) {
            router.patch(`/leave-requests/${id}/reject`, undefined, {
                preserveState: true,
                onSuccess: () => {
                    setSelectedRequest(null);
                    setSelectedLeaveIds((prev) => prev.filter((i) => i !== id));
                },
            });
        }
    };

    const handleBulkApprove = () => {
        if (selectedLeaveIds.length === 0) return;
        if (!confirm(`Setujui ${selectedLeaveIds.length} permohonan izin terpilih sekaligus?`)) {
            return;
        }
        router.post(
            "/leave-requests/bulk-verify",
            {
                ids: selectedLeaveIds,
                status: "Approved",
            },
            {
                preserveState: true,
                onSuccess: () => setSelectedLeaveIds([]),
            },
        );
    };

    const handleBulkReject = () => {
        if (selectedLeaveIds.length === 0) return;
        if (!confirm(`Tolak ${selectedLeaveIds.length} permohonan izin terpilih sekaligus?`)) {
            return;
        }
        router.post(
            "/leave-requests/bulk-verify",
            {
                ids: selectedLeaveIds,
                status: "Rejected",
            },
            {
                preserveState: true,
                onSuccess: () => setSelectedLeaveIds([]),
            },
        );
    };

    // Selection math
    const pendingList = leaveRequests.data.filter((lr) => lr.approval_status === "Pending");
    const allPendingSelected =
        pendingList.length > 0 && pendingList.every((lr) => selectedLeaveIds.includes(lr.id));
    const somePendingSelected =
        pendingList.some((lr) => selectedLeaveIds.includes(lr.id)) && !allPendingSelected;

    return (
        <AppShell title="Verifikasi Izin">
            <PageHeader
                title="Verifikasi Izin"
                description="Verifikasi berkas keterangan dispensasi dan ketidakhadiran siswa."
            />

            {/* Filter Tabs */}
            <StickyContainer>
                <TabSwitcher
                    tabs={filterTabs}
                    activeKey={statusFilter}
                    onChange={(key) => {
                        setStatusFilter(key);
                        handleFilter(key, undefined);
                    }}
                />
            </StickyContainer>

            <FilterBar className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                    {categoryFilters.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setCategoryFilter(tab.key);
                                handleFilter(undefined, tab.key);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                                categoryFilter === tab.key
                                    ? "bg-primary text-white"
                                    : "bg-surface border border-border text-text-muted hover:text-text-primary"
                            }`}
                            type="button"
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Bulk Action Controls */}
                {selectedLeaveIds.length > 0 && (
                    <div className="flex items-center gap-2 shrink-0 bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-lg">
                        <span className="text-[13px] font-bold text-primary mr-1">
                            {selectedLeaveIds.length} dipilih:
                        </span>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleBulkApprove}
                            icon={<i className="fas fa-check-double text-[11px]" />}
                        >
                            Setujui Semua
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleBulkReject}
                            icon={<i className="fas fa-times-circle text-[11px]" />}
                        >
                            Tolak Semua
                        </Button>
                    </div>
                )}
            </FilterBar>

            {/* Bulk Select All Checkbox for top bar */}
            {pendingList.length > 0 && statusFilter === "Pending" && (
                <div className="flex items-center gap-2 mb-2 px-1">
                    <Checkbox
                        checked={allPendingSelected}
                        indeterminate={somePendingSelected}
                        onChange={(e) => {
                            const ids = pendingList.map((lr) => lr.id);
                            if (e.target.checked) {
                                setSelectedLeaveIds((prev) => Array.from(new Set([...prev, ...ids])));
                            } else {
                                const set = new Set(ids);
                                setSelectedLeaveIds((prev) => prev.filter((id) => !set.has(id)));
                            }
                        }}
                    />
                    <span className="text-[13px] text-text-muted font-medium cursor-pointer" onClick={() => {
                        const ids = pendingList.map((lr) => lr.id);
                        if (!allPendingSelected) {
                            setSelectedLeaveIds((prev) => Array.from(new Set([...prev, ...ids])));
                        } else {
                            const set = new Set(ids);
                            setSelectedLeaveIds((prev) => prev.filter((id) => !set.has(id)));
                        }
                    }}>Pilih Semua ({pendingList.length})</span>
                </div>
            )}

            {/* List */}
            <section className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                    {leaveRequests.data.length > 0 ? (
                        leaveRequests.data.map((lr) => (
                            <LeaveRequestCard 
                                key={lr.id} 
                                leaveRequest={lr} 
                                onDetailClick={setSelectedRequest}
                                checkboxSlot={
                                    lr.approval_status === "Pending" ? (
                                        <Checkbox
                                            checked={selectedLeaveIds.includes(lr.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedLeaveIds((prev) => [...prev, lr.id]);
                                                } else {
                                                    setSelectedLeaveIds((prev) => prev.filter((id) => id !== lr.id));
                                                }
                                            }}
                                        />
                                    ) : undefined
                                }
                                actionSlot={
                                    lr.approval_status === "Pending" ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleApprove(lr.id)}
                                                className="px-3 py-1.5 flex-1 sm:flex-none bg-success/10 text-success border border-success/20 rounded-lg text-[12px] font-bold hover:bg-success/20 transition-colors flex items-center justify-center gap-1.5"
                                            >
                                                <i className="fas fa-check"></i> Setuju
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleReject(lr.id)}
                                                className="px-3 py-1.5 flex-1 sm:flex-none bg-danger/10 text-danger border border-danger/20 rounded-lg text-[12px] font-bold hover:bg-danger/20 transition-colors flex items-center justify-center gap-1.5"
                                            >
                                                <i className="fas fa-times"></i> Tolak
                                            </button>
                                        </>
                                    ) : undefined
                                }
                            />
                        ))
                    ) : (
                        <div className="bg-surface border border-border rounded-xl p-8 text-center">
                            <div className="text-text-muted mb-2"><i className="fas fa-inbox text-3xl"></i></div>
                            <p className="text-text-secondary text-[14px]">Tidak ada pengajuan izin.</p>
                        </div>
                    )}
                </div>

                <Pagination
                    currentPage={leaveRequests.current_page}
                    totalPages={leaveRequests.last_page}
                    totalItems={leaveRequests.total}
                    perPage={leaveRequests.per_page}
                    onPageChange={(page) => {
                        router.get(
                            "/leave-requests/verification",
                            {
                                page,
                                status: statusFilter || undefined,
                                category: categoryFilter || undefined,
                            },
                            { preserveState: true },
                        );
                    }}
                />
            </section>

            {/* Verification Detail Drawer */}
            <Drawer
                open={selectedRequest !== null}
                onClose={() => setSelectedRequest(null)}
                title="Verifikasi Pengajuan Izin"
                width="lg"
            >
                {selectedRequest && (
                    <div className="space-y-5 font-inter text-text-primary text-[14px]">
                        {/* Status Header */}
                        <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                            <div>
                                <span className="text-[11px] font-bold text-text-inactive uppercase tracking-wider block">
                                    Status Pengajuan
                                </span>
                                <span className="font-bold text-[15px]">{selectedRequest.approval_status}</span>
                            </div>
                            <StatusBadge variant={
                                selectedRequest.approval_status === "Pending" ? "pending" : 
                                selectedRequest.approval_status === "Approved" ? "approved" : "rejected"
                            } />
                        </div>

                        {/* Student Info */}
                        <div className="border border-border/80 rounded-xl p-4 space-y-2">
                            <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">
                                Data Siswa & Pengaju
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-[13px]">
                                <div>
                                    <span className="text-text-muted block text-[11px]">Nama Siswa</span>
                                    <span className="font-semibold">{selectedRequest.student?.name}</span>
                                </div>
                                <div>
                                    <span className="text-text-muted block text-[11px]">NISN</span>
                                    <span className="font-semibold">{selectedRequest.student?.nisn}</span>
                                </div>
                                <div>
                                    <span className="text-text-muted block text-[11px]">Kelas</span>
                                    <span className="font-semibold">{selectedRequest.student?.class?.name ?? "-"}</span>
                                </div>
                                <div>
                                    <span className="text-text-muted block text-[11px]">Wali Murid</span>
                                    <span className="font-semibold">{selectedRequest.guardian?.name ?? "—"}</span>
                                    {selectedRequest.guardian?.phone && (
                                        <span className="text-text-muted block text-[11px] mt-0.5">
                                            {selectedRequest.guardian.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Reason / Detail */}
                        <div className="border border-border/80 rounded-xl p-4 space-y-3">
                            <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">Detail Izin</h3>
                            <div className="grid grid-cols-2 gap-3 text-[13px]">
                                <div>
                                    <span className="text-text-muted block text-[11px]">Kategori</span>
                                    <span className="font-bold text-primary">
                                        {categoryLabels[selectedRequest.category] ?? selectedRequest.category}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-text-muted block text-[11px]">Rentang Tanggal</span>
                                    <span className="font-semibold">
                                        {selectedRequest.start_date} s/d {selectedRequest.end_date}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="text-text-muted block text-[11px] mb-1">Alasan / Penjelasan</span>
                                <div className="bg-muted/30 p-3 rounded-lg text-text-secondary text-[13px] leading-relaxed">
                                    {selectedRequest.description || "Tidak ada keterangan tertulis."}
                                </div>
                            </div>
                        </div>

                        {/* Attached Document */}
                        {selectedRequest.document_url && (
                            <div className="border border-border/80 rounded-xl p-4 space-y-2">
                                <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">
                                    Lampiran Dokumen
                                </h3>
                                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                    <span className="text-[13px] font-medium truncate max-w-[200px]">
                                        Dokumen_Lampiran.pdf / Bukti
                                    </span>
                                    <a
                                        href={selectedRequest.document_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-primary hover:underline text-[12px] font-bold"
                                    >
                                        <i className="fas fa-external-link-alt" />
                                        <span>Buka Dokumen</span>
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons in Drawer */}
                        {selectedRequest.approval_status === "Pending" && (
                            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                                <Button variant="danger" onClick={() => handleReject(selectedRequest.id)}>
                                    <i className="fas fa-times mr-2" />
                                    Tolak Permohonan
                                </Button>
                                <Button variant="primary" onClick={() => handleApprove(selectedRequest.id)}>
                                    <i className="fas fa-check mr-2" />
                                    Setujui Permohonan
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Drawer>
        </AppShell>
    );
}
