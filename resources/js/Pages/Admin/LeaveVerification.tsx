import { useState } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { StatusBadge, Button, Table, Pagination } from "@/Components";
import type { Column } from "@/Components/ui/Table";
import type { StatusVariant } from "@/types/component";

// ─── Types ───

interface LeaveRequest {
    id: number;
    category: string;
    start_date: string;
    end_date: string;
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

// ─── Helpers ───

const categoryLabels: Record<string, string> = {
    Sick: "Sakit",
    Event: "Kegiatan",
    Competition: "Lomba",
};

const statusToVariant: Record<string, StatusVariant> = {
    Pending: "pending",
    Approved: "approved",
    Rejected: "rejected",
};

const filterTabs = [
    { key: "", label: "Semua" },
    { key: "Pending", label: "Pending" },
    { key: "Approved", label: "Disetujui" },
    { key: "Rejected", label: "Ditolak" },
];

const categoryFilters = [
    { key: "", label: "Semua Kategori" },
    { key: "Sick", label: "Sakit" },
    { key: "Event", label: "Kegiatan" },
    { key: "Competition", label: "Lomba" },
];

// ─── Page ───

export default function VerifikasiIzin({
    leaveRequests,
    filters,
}: VerifikasiIzinProps) {
    const [statusFilter, setStatusFilter] = useState(filters.status ?? "");
    const [categoryFilter, setCategoryFilter] = useState(
        filters.category ?? "",
    );

    const handleFilter = (status?: string, category?: string) => {
        const s = status ?? statusFilter;
        const c = category ?? categoryFilter;
        router.get(
            "/admin/leave-verification",
            { status: s || undefined, category: c || undefined },
            { preserveState: true },
        );
    };

    const handleApprove = (id: number) => {
        if (confirm("Setujui izin ini?")) {
            router.patch(`/admin/verifikasi-izin/${id}/approve`, undefined, {
                preserveState: true,
            });
        }
    };

    const handleReject = (id: number) => {
        if (confirm("Tolak izin ini?")) {
            router.patch(`/admin/verifikasi-izin/${id}/reject`, undefined, {
                preserveState: true,
            });
        }
    };

    const columns: Column<LeaveRequest>[] = [
        {
            key: "student",
            header: "Nama Siswa",
            render: (lr) => (
                <div>
                    <div className="font-semibold text-text-primary">
                        {lr.student.name}
                    </div>
                    <div className="text-[12px] text-text-muted">
                        NISN: {lr.student.nisn}
                    </div>
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
                <span className="inline-block px-2 py-0.5 bg-primary-light text-primary rounded-md text-[12px] font-semibold">
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
                const variant =
                    statusToVariant[lr.approval_status] ?? "pending";
                return <StatusBadge variant={variant} />;
            },
        },
        {
            key: "actions",
            header: "Aksi",
            render: (lr) =>
                lr.approval_status === "Pending" ? (
                    <div className="flex gap-2">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(lr.id)}
                        >
                            <i className="fas fa-check mr-1" />
                            Setujui
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(lr.id)}
                        >
                            <i className="fas fa-times mr-1" />
                            Tolak
                        </Button>
                    </div>
                ) : (
                    <span className="text-[13px] text-text-muted">—</span>
                ),
        },
    ];

    return (
        <AdminLayout title="Verifikasi Izin" activeMenu="Verifikasi Izin">
            {/* Filter Tabs */}
            <section className="bg-surface border border-border rounded-lg p-4 lg:p-6 mb-6">
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center">
                    <div className="flex gap-1">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => {
                                    setStatusFilter(tab.key);
                                    handleFilter(tab.key, undefined);
                                }}
                                className={`px-4 py-1.5 text-[13px] rounded-full font-medium transition-colors ${
                                    (statusFilter || "") === tab.key
                                        ? "bg-accent text-primary font-bold"
                                        : "bg-background text-text-muted hover:bg-border"
                                }`}
                                type="button"
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            handleFilter(undefined, e.target.value);
                        }}
                        className="w-full sm:w-auto border border-border rounded-lg px-3 py-1.5 text-[13px] font-inter text-text-primary bg-surface focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    >
                        {categoryFilters.map((cf) => (
                            <option key={cf.key} value={cf.key}>
                                {cf.label}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            {/* Table */}
            <section className="bg-surface border border-border rounded-lg p-4 lg:p-6">
                <Table
                    columns={columns}
                    data={leaveRequests.data}
                    keyExtractor={(lr) => lr.id}
                    emptyMessage="Tidak ada pengajuan izin."
                />

                <Pagination
                    currentPage={leaveRequests.current_page}
                    totalPages={leaveRequests.last_page}
                    totalItems={leaveRequests.total}
                    perPage={leaveRequests.per_page}
                    onPageChange={(page) => {
                        router.get(
                            "/admin/leave-verification",
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
        </AdminLayout>
    );
}
