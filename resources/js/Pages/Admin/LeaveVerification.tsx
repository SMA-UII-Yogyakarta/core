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
    EmptyState,
    ConfirmDialog,
} from "@/Components";
import { LeaveRequestCard, statusToVariant } from "@/Components/ui/LeaveRequestCard";
import { FiCheck, FiX, FiCheckSquare, FiXCircle, FiExternalLink } from "react-icons/fi";
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
                { preserveState: true, onSuccess: () => { setSelectedLeaveIds([]); setApproveConfirm({ open: false, id: null, isBulk: false }); } }
            );
        } else if (approveConfirm.id !== null) {
            router.patch(`/leave-requests/${approveConfirm.id}/approve`, undefined, {
                preserveState: true,
                onSuccess: () => { setSelectedRequest(null); setSelectedLeaveIds(prev => prev.filter(i => i !== approveConfirm.id)); setApproveConfirm({ open: false, id: null, isBulk: false }); }
            });
        }
    };

    const handleConfirmedReject = () => {
        if (rejectConfirm.isBulk) {
            router.post(
                "/leave-requests/bulk-verify",
                { ids: selectedLeaveIds, status: "Rejected" },
                { preserveState: true, onSuccess: () => { setSelectedLeaveIds([]); setRejectConfirm({ open: false, id: null, isBulk: false }); } }
            );
        } else if (rejectConfirm.id !== null) {
            router.patch(`/leave-requests/${rejectConfirm.id}/reject`, undefined, {
                preserveState: true,
                onSuccess: () => { setSelectedRequest(null); setSelectedLeaveIds(prev => prev.filter(i => i !== rejectConfirm.id)); setRejectConfirm({ open: false, id: null, isBulk: false }); }
            });
        }
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
                        <Button
                            key={tab.key}
                            variant={categoryFilter === tab.key ? "primary" : "ghost"}
                            size="sm"
                            onClick={() => {
                                setCategoryFilter(tab.key);
                                handleFilter(undefined, tab.key);
                            }}
                        >
                            {tab.label}
                        </Button>
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
                            icon={<FiCheckSquare className="text-[11px]" />}
                        >
                            Setujui Semua
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleBulkReject}
                            icon={<FiXCircle className="text-[11px]" />}
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
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleApprove(lr.id)}
                                                className="flex-1 sm:flex-none"
                                            >
                                                <FiCheck className="mr-1.5" /> Setuju
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleReject(lr.id)}
                                                className="flex-1 sm:flex-none"
                                            >
                                                <FiX className="mr-1.5" /> Tolak
                                            </Button>
                                        </>
                                    ) : undefined
                                }
                            />
                        ))
                    ) : (
                        <EmptyState variant="no-leaves" />
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
                            <StatusBadge variant={statusToVariant[selectedRequest.approval_status] || "pending"} />
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
                                        <FiExternalLink />
                                        <span>Buka Dokumen</span>
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons in Drawer */}
                        {selectedRequest.approval_status === "Pending" && (
                            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                                <Button variant="danger" onClick={() => handleReject(selectedRequest.id)}>
                                    <FiX className="mr-2" />
                                    Tolak Permohonan
                                </Button>
                                <Button variant="primary" onClick={() => handleApprove(selectedRequest.id)}>
                                    <FiCheck className="mr-2" />
                                    Setujui Permohonan
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Drawer>

            <ConfirmDialog
                open={approveConfirm.open}
                onClose={() => setApproveConfirm({ open: false, id: null, isBulk: false })}
                onConfirm={handleConfirmedApprove}
                title="Setujui Izin"
                message="Yakin menyetujui pengajuan izin ini?"
                confirmLabel="Ya, Setujui"
                variant="primary"
            />
            <ConfirmDialog
                open={rejectConfirm.open}
                onClose={() => setRejectConfirm({ open: false, id: null, isBulk: false })}
                onConfirm={handleConfirmedReject}
                title="Tolak Izin"
                message="Yakin menolak pengajuan izin ini?"
                confirmLabel="Ya, Tolak"
                variant="danger"
            />
        </AppShell>
    );
}
