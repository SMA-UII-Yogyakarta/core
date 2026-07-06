import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    StatusBadge,
    Button,
    Table,
    Pagination,
    FilterBar,
    TabSwitcher,
} from "@/Components";
import AdminLayout from "@/Layouts/AdminLayout";
import type { Column } from "@/Components/ui/Table";
import type { StatusVariant } from "@/types/component";

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
    guardian: { id: number; name: string } | null;
    created_at: string;
}

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

const statusToVariant: Record<string, StatusVariant> = {
    Pending: "pending",
    Approved: "approved",
    Rejected: "rejected",
};

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
    const [categoryFilter, setCategoryFilter] = useState(
        filters.category ?? "",
    );
    const [search, setSearch] = useState(filters.search ?? "");

    const handleFilter = (extra?: Record<string, string | undefined>) => {
        router.get(
            "/admin/leave-requests",
            {
                status: statusTab || undefined,
                category: categoryFilter || undefined,
                search: search || undefined,
                ...extra,
            },
            { preserveState: true },
        );
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
            render: (lr) => `${lr.start_date} — ${lr.end_date}`,
        },
        {
            key: "guardian",
            header: "Pengaju",
            render: (lr) => lr.guardian?.name ?? "Siswa",
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
            render: () => (
                <Button variant="outline" size="sm">
                    Detail
                </Button>
            ),
        },
    ];

    return (
        <AdminLayout title="Pengajuan Izin" activeMenu="Pengajuan Izin">
            <h1 className="text-[18px] font-bold text-text-primary font-inter mb-6">
                Pengajuan Izin
            </h1>

            <TabSwitcher
                tabs={statusTabs}
                activeKey={statusTab}
                onChange={(key) => {
                    setStatusTab(key);
                    handleFilter({ status: key || undefined });
                }}
                className="mb-6"
            />

            <FilterBar className="mb-6">
                <FilterBar.Select
                    label="Kategori"
                    options={[
                        { value: "", label: "Semua Kategori" },
                        { value: "Sick", label: "Sakit" },
                        { value: "Event", label: "Kegiatan" },
                        { value: "Competition", label: "Lomba" },
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
                    placeholder="Cari siswa..."
                />
            </FilterBar>

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
                    onPageChange={(page) =>
                        router.get(
                            "/admin/leave-requests",
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
        </AdminLayout>
    );
}
