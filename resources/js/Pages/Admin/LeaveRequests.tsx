import { useState } from "react";
import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import {
    Pagination,
    Drawer,
    EmptyState,
    FilterBar,
    TabSwitcher,
    StickyContainer,
    PageHeader,
} from "@/Components";
import { LeaveRequestCard } from "@/Components/ui/LeaveRequestCard";
import { FiExternalLink } from "react-icons/fi";
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
    search?: string;
}

interface LeaveRequestsIndexProps {
    leaveRequests: PaginatedData<LeaveRequest>;
    filters: Filters;
}

const statusTabs = [
    { key: "", label: "Semua" },
    { key: "Pending", label: "Menunggu" },
    { key: "Approved", label: "Disetujui" },
    { key: "Rejected", label: "Ditolak" },
];

const categoryLabels: Record<string, string> = {
    Sick: "Sakit",
    Event: "Kegiatan",
    Competition: "Lomba",
    Other: "Lainnya",
};

export default function LeaveRequestsIndex({
    leaveRequests,
    filters,
}: LeaveRequestsIndexProps) {
    const [statusTab, setStatusTab] = useState(filters.status ?? "");
    const [categoryFilter, setCategoryFilter] = useState(filters.category ?? "");
    const [search, setSearch] = useState(filters.search ?? "");
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

    const handleFilter = (extra?: Record<string, string | undefined>) => {
        router.get(
            "/leave-requests",
            {
                status: statusTab || undefined,
                category: categoryFilter || undefined,
                search: search || undefined,
                ...extra,
            },
            { preserveState: true },
        );
    };

    const statusBadgeClass = (status: string) => {
        if (status === "Pending") return "bg-warning-bg text-warning";
        if (status === "Approved") return "bg-success-bg text-success";
        if (status === "Rejected") return "bg-danger-bg text-danger";
        return "bg-muted text-text-muted";
    };

    return (
        <AppShell title="Pengajuan Izin">
            <PageHeader
                title="Pengajuan Izin"
                description="Kelola permohonan dispensasi dan ketidakhadiran siswa."
            />

            <StickyContainer>
                <TabSwitcher
                    tabs={statusTabs}
                    activeKey={statusTab}
                    onChange={(key) => {
                        setStatusTab(key);
                        handleFilter({ status: key || undefined });
                    }}
                />
            </StickyContainer>

            <FilterBar className="mb-6">
                <FilterBar.Select
                    label="Kategori"
                    options={[
                        { value: "", label: "Semua Kategori" },
                        { value: "Sick", label: "Sakit" },
                        { value: "Event", label: "Kegiatan" },
                        { value: "Competition", label: "Lomba" },
                        { value: "Other", label: "Lainnya" },
                    ]}
                    value={categoryFilter}
                    onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        handleFilter({ category: e.target.value || undefined });
                    }}
                />
                <FilterBar.Search
                    value={search}
                    onChange={setSearch}
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleFilter();
                    }}
                    placeholder="Cari nama siswa..."
                />
            </FilterBar>

            <div className="space-y-6 font-inter">
                {/* Cards List */}
                <div className="space-y-4">
                    {leaveRequests.data.length > 0 ? (
                        leaveRequests.data.map((lr) => (
                            <LeaveRequestCard
                                key={lr.id}
                                leaveRequest={lr}
                                onDetailClick={setSelectedRequest}
                            />
                        ))
                    ) : (
                        <EmptyState variant="no-leaves" />
                    )}
                </div>

                {/* Symmetrical Footer & Pagination */}
                {leaveRequests.last_page > 1 && (
                    <div className="mt-4 pt-3 border-t border-border flex flex-col gap-3 font-inter">
                        <Pagination
                            currentPage={leaveRequests.current_page}
                            totalPages={leaveRequests.last_page}
                            totalItems={leaveRequests.total}
                            perPage={leaveRequests.per_page}
                            onPageChange={(page) =>
                                router.get(
                                    "/leave-requests",
                                    {
                                        page,
                                        status: statusTab || undefined,
                                        category: categoryFilter || undefined,
                                        search: search || undefined,
                                    },
                                    { preserveState: true },
                                )
                            }
                        />
                    </div>
                )}
            </div>

            {/* Detail Drawer */}
            <Drawer
                open={selectedRequest !== null}
                onClose={() => setSelectedRequest(null)}
                title="Detail Pengajuan Izin"
                width="lg"
            >
                {selectedRequest && (
                    <div className="space-y-5 font-inter text-text-primary text-[14px]">
                        {/* Status Badge header */}
                        <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                            <div>
                                <span className="text-[11px] font-bold text-text-inactive uppercase tracking-wider block">
                                    Status Pengajuan
                                </span>
                                <span className={`font-bold text-[15px] ${statusBadgeClass(selectedRequest.approval_status)}`}>
                                    {selectedRequest.approval_status === "Pending" ? "MENUNGGU" : selectedRequest.approval_status === "Approved" ? "DISETUJUI" : "DITOLAK"}
                                </span>
                            </div>
                        </div>

                        {/* Student Info */}
                        <div className="border border-border/80 rounded-xl p-4 space-y-2">
                            <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">
                                Informasi Siswa
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
                                </div>
                            </div>
                        </div>

                        {/* Leave Details */}
                        <div className="border border-border/80 rounded-xl p-4 space-y-2">
                            <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">
                                Detail Pengajuan
                            </h3>
                            <div className="space-y-2 text-[13px]">
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Kategori</span>
                                    <span className="font-semibold text-text-primary">
                                        {categoryLabels[selectedRequest.category] ?? selectedRequest.category}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Periode</span>
                                    <span className="font-semibold text-text-primary">
                                        {selectedRequest.start_date} s/d {selectedRequest.end_date}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Durasi</span>
                                    <span className="font-semibold text-text-primary">
                                        {(() => {
                                            if (!selectedRequest.start_date || !selectedRequest.end_date) return "1 Hari";
                                            const start = new Date(selectedRequest.start_date);
                                            const end = new Date(selectedRequest.end_date);
                                            const diff = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);
                                            return `${diff} Hari`;
                                        })()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="border border-border/80 rounded-xl p-4">
                            <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide mb-2">
                                Keterangan
                            </h3>
                            <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
                                {selectedRequest.description || "Tidak ada keterangan."}
                            </p>
                        </div>

                        {/* Document */}
                        {selectedRequest.document_url && (
                            <div className="border border-border/80 rounded-xl p-4 space-y-2">
                                <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">
                                    Berkas Pendukung
                                </h3>
                                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                                    <span className="text-[13px] font-medium text-text-primary truncate max-w-[200px]">
                                        Dokumen Lampiran Izin
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
                    </div>
                )}
            </Drawer>
        </AppShell>
    );
}