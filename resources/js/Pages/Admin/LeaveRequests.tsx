import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    StatusBadge,
    Pagination,
    FilterBar,
    TabSwitcher,
    StickyContainer,
    PageHeader,
    Drawer,
} from "@/Components";
import { LeaveRequestCard } from "@/Components/ui/LeaveRequestCard";
import type { LeaveRequest } from "@/Components/ui/LeaveRequestCard";
import AppShell from "@/Layouts/AppShell";

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface PageProps {
    leaveRequests: PaginatedData<LeaveRequest>;
    filters: Record<string, string | undefined>;
}

    // No Table columns needed

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

export default function PengajuanIzin({ leaveRequests, filters }: PageProps) {
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

    return (
        <AppShell title="Pengajuan Izin">
            <PageHeader title="Pengajuan Izin" description="Kelola permohonan dispensasi dan ketidakhadiran siswa." />

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

            <section className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                    {leaveRequests.data.length > 0 ? (
                        leaveRequests.data.map((lr) => (
                            <LeaveRequestCard 
                                key={lr.id} 
                                leaveRequest={lr} 
                                onDetailClick={setSelectedRequest}
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
                    onPageChange={(page) =>
                        router.get(
                            "/leave-requests",
                            {
                                page,
                                status: statusTab || undefined,
                                category: categoryFilter || undefined,
                            },
                            { preserveState: true },
                        )
                    }
                />
            </section>

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
                                Informasi Siswa
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
                                </div>
                            </div>
                        </div>

                        {/* Leave Detail */}
                        <div className="border border-border/80 rounded-xl p-4 space-y-3">
                            <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">
                                Detail Ketidakhadiran
                            </h3>
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
                                <span className="text-text-muted block text-[11px] mb-1">Keterangan / Alasan</span>
                                <div className="bg-muted/30 p-3 rounded-lg text-text-secondary text-[13px] leading-relaxed">
                                    {selectedRequest.description || "Tidak ada keterangan tertulis."}
                                </div>
                            </div>
                        </div>

                        {/* Document Attachment */}
                        {selectedRequest.document_url && (
                            <div className="border border-border/80 rounded-xl p-4 space-y-2">
                                <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">
                                    Dokumen Lampiran
                                </h3>
                                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                    <span className="text-[13px] font-medium truncate max-w-[200px]">
                                        Surat_Keterangan.pdf / Dokumen Bukti
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
                    </div>
                )}
            </Drawer>
        </AppShell>
    );
}
