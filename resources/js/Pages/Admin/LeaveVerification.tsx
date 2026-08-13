import { useState } from "react";
import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import {
    StatusBadge,
    Button,
    Table,
    Pagination,
    TabSwitcher,
    FilterBar,
    StickyContainer,
    PageHeader,
    Drawer,
    Card,
    ActionButton,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import type { StatusVariant } from "@/types/component";

interface LeaveRequest {
    id: number;
    category: string;
    start_date: string;
    end_date: string;
    description?: string | null;
    document_url: string | null;
    approval_status: string;
    student: {
        id: number;
        nisn: string;
        name: string;
        class: { id: number; name: string } | null;
    };
    guardian: {
        id: number;
        name: string;
        phone: string | null;
    } | null;
    created_at: string;
}

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

const statusToVariant: Record<string, StatusVariant> = {
    Pending: "pending",
    Approved: "approved",
    Rejected: "rejected",
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

    const handleFilter = (status?: string, category?: string) => {
        const s = status ?? statusFilter;
        const c = category ?? categoryFilter;
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
                onSuccess: () => setSelectedRequest(null),
            });
        }
    };

    const handleReject = (id: number) => {
        if (confirm("Tolak permohonan izin ini?")) {
            router.patch(`/leave-requests/${id}/reject`, undefined, {
                preserveState: true,
                onSuccess: () => setSelectedRequest(null),
            });
        }
    };

    const columns: Column<LeaveRequest>[] = [
        {
            key: "student",
            header: "Nama Siswa",
            render: (lr) => (
                <div>
                    <div className="font-semibold text-text-primary">{lr.student.name}</div>
                    <div className="text-[12px] text-text-muted">NISN: {lr.student.nisn}</div>
                </div>
            ),
        },
        {
            key: "class",
            header: "Kelas",
            render: (lr) => lr.student.class?.name ?? "-",
        },
        {
            key: "category",
            header: "Kategori",
            render: (lr) => (
                <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary rounded-md text-[12px] font-bold">
                    {categoryLabels[lr.category] ?? lr.category}
                </span>
            ),
        },
        {
            key: "dates",
            header: "Tanggal",
            render: (lr) => (
                <span className="text-[13px]">
                    {lr.start_date} — {lr.end_date}
                </span>
            ),
        },
        {
            key: "guardian",
            header: "Wali",
            render: (lr) => lr.guardian?.name ?? "-",
        },
        {
            key: "status",
            header: "Status",
            render: (lr) => {
                const variant = statusToVariant[lr.approval_status] ?? "pending";
                return <StatusBadge variant={variant} />;
            },
        },
        {
            key: "actions",
            header: "Aksi",
            render: (lr) => (
                <div className="flex items-center gap-2 justify-end">
                    <ActionButton
                        variant="detail"
                        icon="fa-eye"
                        label="Detail"
                        onClick={() => setSelectedRequest(lr)}
                    />
                    {lr.approval_status === "Pending" && (
                        <>
                            <ActionButton
                                variant="edit"
                                icon="fa-check"
                                label="Setuju"
                                onClick={() => handleApprove(lr.id)}
                            />
                            <ActionButton
                                variant="delete"
                                icon="fa-times"
                                label="Tolak"
                                onClick={() => handleReject(lr.id)}
                            />
                        </>
                    )}
                </div>
            ),
            className: "w-px whitespace-nowrap text-right",
        },
    ];

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

            <FilterBar className="mb-6">
                <FilterBar.Select
                    label="Kategori"
                    options={categoryFilters.map((cf) => ({
                        label: cf.label,
                        value: cf.key,
                    }))}
                    value={categoryFilter}
                    onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        handleFilter(undefined, e.target.value);
                    }}
                />
            </FilterBar>

            {/* Table */}
            <section className="flex flex-col gap-4">
                <Card>
                    <Table
                        columns={columns}
                        data={leaveRequests.data}
                        keyExtractor={(lr) => lr.id}
                        emptyMessage="Tidak ada pengajuan izin."
                    />
                </Card>

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
                            <StatusBadge variant={statusToVariant[selectedRequest.approval_status] ?? "pending"} />
                        </div>

                        {/* Student Info */}
                        <div className="border border-border/80 rounded-xl p-4 space-y-2">
                            <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">
                                Data Siswa & Pengaju
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-[13px]">
                                <div>
                                    <span className="text-text-muted block text-[11px]">Nama Siswa</span>
                                    <span className="font-semibold">{selectedRequest.student.name}</span>
                                </div>
                                <div>
                                    <span className="text-text-muted block text-[11px]">NISN</span>
                                    <span className="font-semibold">{selectedRequest.student.nisn}</span>
                                </div>
                                <div>
                                    <span className="text-text-muted block text-[11px]">Kelas</span>
                                    <span className="font-semibold">{selectedRequest.student.class?.name ?? "-"}</span>
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
