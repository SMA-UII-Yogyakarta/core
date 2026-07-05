import { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Button,
    Input,
    StatusBadge,
    Table,
    EmptyState,
    ErrorState,
    LoadingSkeleton,
} from "@/Components/ui/index";
import { FaSearch, FaEye, FaFilter } from "react-icons/fa";

interface Pengajuan {
    id: number;
    nama: string;
    kelas: string;
    tanggal: string;
    jenis: "Izin" | "Sakit";
    keterangan: string;
    status: string;
}

type TabFilter = "semua" | "pending" | "approved" | "rejected";

const mockData: Pengajuan[] = [
    {
        id: 1,
        nama: "Ahmad Fauzi",
        kelas: "X-A",
        tanggal: "2025-06-10",
        jenis: "Sakit",
        keterangan: "Demam tinggi",
        status: "pending",
    },
    {
        id: 2,
        nama: "Budi Santoso",
        kelas: "X-A",
        tanggal: "2025-06-10",
        jenis: "Izin",
        keterangan: "Ada acara keluarga",
        status: "approved",
    },
    {
        id: 3,
        nama: "Citra Dewi",
        kelas: "X-B",
        tanggal: "2025-06-11",
        jenis: "Sakit",
        keterangan: "Sakit gigi",
        status: "rejected",
    },
    {
        id: 4,
        nama: "Dian Permata",
        kelas: "XI-A",
        tanggal: "2025-06-11",
        jenis: "Izin",
        keterangan: "Mengikuti lomba",
        status: "pending",
    },
    {
        id: 5,
        nama: "Eko Prasetyo",
        kelas: "XI-B",
        tanggal: "2025-06-12",
        jenis: "Sakit",
        keterangan: "Flu",
        status: "approved",
    },
    {
        id: 6,
        nama: "Fitri Handayani",
        kelas: "X-A",
        tanggal: "2025-06-12",
        jenis: "Izin",
        keterangan: "Keperluan mendadak",
        status: "pending",
    },
    {
        id: 7,
        nama: "Gilang Ramadhan",
        kelas: "XII-A",
        tanggal: "2025-06-13",
        jenis: "Sakit",
        keterangan: "Dirawat di rumah sakit",
        status: "approved",
    },
    {
        id: 8,
        nama: "Hana Safira",
        kelas: "XII-B",
        tanggal: "2025-06-13",
        jenis: "Izin",
        keterangan: "Pendampingan orang tua",
        status: "rejected",
    },
];

const kelasOptions = [
    { value: "", label: "Semua Kelas" },
    { value: "X-A", label: "X-A" },
    { value: "X-B", label: "X-B" },
    { value: "XI-A", label: "XI-A" },
    { value: "XI-B", label: "XI-B" },
    { value: "XII-A", label: "XII-A" },
    { value: "XII-B", label: "XII-B" },
];

function handleVerifikasi(row: Pengajuan) {
    alert(`Verifikasi pengajuan: ${row.nama} (${row.jenis})`);
}

export default function PengajuanIzinSakit() {
    const [tab, setTab] = useState<TabFilter>("semua");
    const [kelasFilter, setKelasFilter] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Pengajuan[]>([]);

    useEffect(() => {
        simulateFetch();
    }, []);

    function simulateFetch() {
        setLoading(true);
        setError(null);

        setTimeout(() => {
            setData(mockData);
            setLoading(false);
        }, 700);
    }

    const filtered = data.filter((item) => {
        if (tab !== "semua" && item.status !== tab) return false;
        if (kelasFilter && item.kelas !== kelasFilter) return false;
        if (search && !item.nama.toLowerCase().includes(search.toLowerCase()))
            return false;
        return true;
    });

    const tableData = filtered.map((item, idx) => ({ ...item, no: idx + 1 }));

    const tabs: { key: TabFilter; label: string }[] = [
        { key: "semua", label: "Semua" },
        { key: "pending", label: "Menunggu" },
        { key: "approved", label: "Disetujui" },
        { key: "rejected", label: "Ditolak" },
    ];

    const tabClass = (key: TabFilter) =>
        `px-4 py-2 text-xs font-medium rounded-md transition-colors ${
            tab === key
                ? "bg-primary text-white"
                : "text-text-secondary bg-surface border border-border hover:bg-background"
        }`;

    const columns = [
        { key: "no", label: "No" },
        { key: "nama", label: "Nama" },
        { key: "kelas", label: "Kelas" },
        {
            key: "tanggal",
            label: "Tanggal",
            render: (value: string) => {
                const d = new Date(value + "T00:00:00");
                return d.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                });
            },
        },
        {
            key: "jenis",
            label: "Jenis",
            render: (value: string) => {
                const variant = value === "Sakit" ? "danger" : "warning";
                return (
                    <span
                        className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md ${
                            variant === "danger"
                                ? "bg-danger/10 text-danger"
                                : "bg-amber-100 text-amber-600"
                        }`}
                    >
                        {value}
                    </span>
                );
            },
        },
        { key: "keterangan", label: "Keterangan" },
        {
            key: "status",
            label: "Status",
            render: (value: string) => {
                const statusMap: Record<string, string> = {
                    pending: "pending",
                    approved: "approved",
                    rejected: "rejected",
                };
                return <StatusBadge status={statusMap[value] ?? "pending"} />;
            },
        },
        {
            key: "aksi",
            label: "Aksi",
            render: (_: unknown, row: Pengajuan) => (
                <div className="flex items-center gap-2">
                    {row.status === "pending" && (
                        <Button
                            variant="detail"
                            size="sm"
                            icon={FaEye}
                            onClick={() => handleVerifikasi(row)}
                        >
                            Verifikasi
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AdminLayout title="Pengajuan Izin & Sakit">
            <Head title="Pengajuan Izin & Sakit" />

            {/* Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={tabClass(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="w-full md:w-48">
                    <select
                        value={kelasFilter}
                        onChange={(e) => setKelasFilter(e.target.value)}
                        className="w-full h-10 px-3 bg-surface border border-border-input rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                        {kelasOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <Input
                        placeholder="Cari nama siswa..."
                        icon={FaSearch}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <LoadingSkeleton />
            ) : error ? (
                <ErrorState message={error} onRetry={simulateFetch} />
            ) : filtered.length === 0 ? (
                <EmptyState title="Tidak ada pengajuan yang sesuai" />
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                        <Table columns={columns} data={tableData} />
                    </div>

                    {/* Mobile Card List */}
                    <div className="md:hidden space-y-3">
                        {filtered.map((item) => {
                            const statusMap: Record<string, string> = {
                                pending: "pending",
                                approved: "approved",
                                rejected: "rejected",
                            };
                            const dateStr = new Date(
                                item.tanggal + "T00:00:00",
                            ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            });
                            const jenisVariant =
                                item.jenis === "Sakit" ? "danger" : "warning";
                            return (
                                <div
                                    key={item.id}
                                    className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold text-sm text-text-primary">
                                                {item.nama}
                                            </span>
                                            <span className="text-xs text-text-muted">
                                                {item.kelas}
                                            </span>
                                        </div>
                                        <StatusBadge
                                            status={statusMap[item.status]}
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                                        <span>{dateStr}</span>
                                        <span
                                            className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md ${
                                                jenisVariant === "danger"
                                                    ? "bg-danger/10 text-danger"
                                                    : "bg-amber-100 text-amber-600"
                                            }`}
                                        >
                                            {item.jenis}
                                        </span>
                                    </div>
                                    {item.keterangan && (
                                        <p className="text-xs text-text-muted bg-background p-2 rounded-md">
                                            {item.keterangan}
                                        </p>
                                    )}
                                    {item.status === "pending" && (
                                        <div className="pt-1 border-t border-border">
                                            <Button
                                                variant="detail"
                                                size="sm"
                                                icon={FaEye}
                                                onClick={() =>
                                                    handleVerifikasi(item)
                                                }
                                            >
                                                Verifikasi
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
