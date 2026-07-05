import { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Button,
    FilterBar,
    TabSwitcher,
    StatCard,
    StatusBadge,
    Table,
    EmptyState,
    ErrorState,
    LoadingSkeleton,
} from "@/Components/ui/index";
import {
    FaEye,
    FaFileSignature,
    FaCheck,
    FaClock,
    FaTimes,
    FaFilter,
    FaInbox,
} from "react-icons/fa";

/* ============================================================
   Types
   ============================================================ */
interface IzinRecord {
    id: number;
    nama: string;
    kelas: string;
    tanggal: string;
    jenis: "Izin" | "Sakit";
    keterangan: string;
    status: "pending" | "approved" | "rejected";
}

type TabKey = "semua" | "pending" | "approved" | "rejected";

/* ============================================================
   Mock Data (10+ entries)
   ============================================================ */
const mockData: IzinRecord[] = [
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
    {
        id: 9,
        nama: "Indra Wijaya",
        kelas: "X-B",
        tanggal: "2025-06-14",
        jenis: "Sakit",
        keterangan: "Sakit kepala",
        status: "pending",
    },
    {
        id: 10,
        nama: "Joko Susilo",
        kelas: "XI-A",
        tanggal: "2025-06-14",
        jenis: "Izin",
        keterangan: "Ibadah haji",
        status: "approved",
    },
    {
        id: 11,
        nama: "Kartika Sari",
        kelas: "XII-A",
        tanggal: "2025-06-15",
        jenis: "Izin",
        keterangan: "Kunjungan keluarga",
        status: "rejected",
    },
    {
        id: 12,
        nama: "Luki Hermawan",
        kelas: "XI-B",
        tanggal: "2025-06-15",
        jenis: "Sakit",
        keterangan: "Keracunan makanan",
        status: "pending",
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

const months = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
];

const days = Array.from({ length: 31 }, (_, i) => {
    const v = String(i + 1).padStart(2, "0");
    return { value: v, label: v };
});

const years = ["2024", "2025", "2026", "2027"];

/* ============================================================
   Helpers
   ============================================================ */
function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function countByStatus(data: IzinRecord[], status: TabKey) {
    if (status === "semua") return data.length;
    return data.filter((d) => d.status === status).length;
}

/* ============================================================
   Component
   ============================================================ */
export default function PantauanIzin() {
    /* ---- State ---- */
    const [data, setData] = useState<IzinRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [tab, setTab] = useState<TabKey>("semua");
    const [kelasFilter, setKelasFilter] = useState("");
    const [search, setSearch] = useState("");
    const [filterMonth, setFilterMonth] = useState("06");
    const [filterDay, setFilterDay] = useState("");
    const [filterYear, setFilterYear] = useState("2025");

    /* ---- Fetch simulation ---- */
    useEffect(() => {
        fetchData();
    }, []);

    function fetchData() {
        setLoading(true);
        setError(null);

        setTimeout(() => {
            setData(mockData);
            setLoading(false);
        }, 700);
    }

    /* ---- Filtered data ---- */
    const filtered = data.filter((item) => {
        if (tab !== "semua" && item.status !== tab) return false;
        if (kelasFilter && item.kelas !== kelasFilter) return false;
        if (search && !item.nama.toLowerCase().includes(search.toLowerCase()))
            return false;

        // Date filter
        const d = new Date(item.tanggal + "T00:00:00");
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const y = String(d.getFullYear());
        if (filterMonth && m !== filterMonth) return false;
        if (filterDay && String(d.getDate()).padStart(2, "0") !== filterDay)
            return false;
        if (filterYear && y !== filterYear) return false;

        return true;
    });

    const tableData = filtered.map((item, idx) => ({ ...item, no: idx + 1 }));

    /* ---- Stats ---- */
    const stats = [
        {
            title: "Total Pengajuan",
            value: data.length,
            icon: FaFileSignature,
            color: "primary" as const,
        },
        {
            title: "Menunggu",
            value: data.filter((d) => d.status === "pending").length,
            icon: FaClock,
            color: "warning" as const,
        },
        {
            title: "Disetujui",
            value: data.filter((d) => d.status === "approved").length,
            icon: FaCheck,
            color: "success" as const,
        },
        {
            title: "Ditolak",
            value: data.filter((d) => d.status === "rejected").length,
            icon: FaTimes,
            color: "danger" as const,
        },
    ];

    /* ---- Tabs ---- */
    const tabs: { key: TabKey; label: string; count?: number }[] = [
        { key: "semua", label: "Semua", count: countByStatus(data, "semua") },
        {
            key: "pending",
            label: "Menunggu",
            count: countByStatus(data, "pending"),
        },
        {
            key: "approved",
            label: "Disetujui",
            count: countByStatus(data, "approved"),
        },
        {
            key: "rejected",
            label: "Ditolak",
            count: countByStatus(data, "rejected"),
        },
    ];

    /* ---- Table columns ---- */
    const columns = [
        { key: "no", label: "No" },
        { key: "nama", label: "Nama" },
        { key: "kelas", label: "Kelas" },
        {
            key: "tanggal",
            label: "Tanggal",
            render: (value: string) => formatDate(value),
        },
        {
            key: "jenis",
            label: "Jenis",
            render: (value: string) => {
                const isSakit = value === "Sakit";
                return (
                    <span
                        className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md ${
                            isSakit
                                ? "bg-danger/10 text-danger"
                                : "bg-amber-100 text-amber-600"
                        }`}
                    >
                        {value}
                    </span>
                );
            },
        },
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
            render: (_: unknown, row: IzinRecord) => (
                <Button
                    variant="detail"
                    size="sm"
                    icon={FaEye}
                    onClick={() => handleDetail(row)}
                >
                    Detail
                </Button>
            ),
        },
    ];

    /* ---- Actions ---- */
    function handleDetail(row: IzinRecord) {
        alert(`Detail pengajuan: ${row.nama} (${row.jenis})`);
    }

    function handleReset() {
        setKelasFilter("");
        setSearch("");
        setFilterMonth("06");
        setFilterDay("");
        setFilterYear("2025");
        setTab("semua");
    }

    /* ---- Select class (shared) ---- */
    const selectClass =
        "w-full h-10 px-3 bg-surface border border-border-input rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer";

    /* ============================================================
       Render
       ============================================================ */
    return (
        <AdminLayout title="Pantauan Izin">
            <Head title="Pantauan Izin" />

            {/* ---- Heading ---- */}
            <h1 className="font-brand font-bold text-2xl text-text-primary mb-6">
                Pantauan Izin
            </h1>

            {/* ---- Global Filter Section ---- */}
            <section className="bg-surface border border-border rounded-lg p-4 md:p-5 mb-6">
                {/* Heading "Monitoring Live" */}
                <div className="flex items-center gap-2 mb-4">
                    <FaFilter className="w-4 h-4 text-primary" />
                    <h2 className="font-brand font-bold text-xl text-primary">
                        Monitoring Live
                    </h2>
                </div>

                {/* Filter controls */}
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Kelas dropdown */}
                    <div className="w-full md:w-44">
                        <select
                            value={kelasFilter}
                            onChange={(e) => setKelasFilter(e.target.value)}
                            className={selectClass}
                            aria-label="Filter kelas"
                        >
                            {kelasOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date spinbuttons */}
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="w-full md:w-20">
                            <select
                                value={filterDay}
                                onChange={(e) => setFilterDay(e.target.value)}
                                className={selectClass}
                                aria-label="Filter hari"
                            >
                                <option value="">Hari</option>
                                {days.map((d) => (
                                    <option key={d.value} value={d.value}>
                                        {d.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full md:w-36">
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className={selectClass}
                                aria-label="Filter bulan"
                            >
                                {months.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full md:w-24">
                            <select
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className={selectClass}
                                aria-label="Filter tahun"
                            >
                                {years.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex-1 min-w-0">
                        <FilterBar
                            onSearch={(q) => setSearch(q)}
                            onReset={handleReset}
                            searchPlaceholder="Cari nama siswa..."
                        />
                    </div>
                </div>
            </section>

            {/* ---- Stat Cards ---- */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-24 bg-background animate-pulse rounded-lg"
                        />
                    ))}
                </div>
            ) : error ? null : (
                <div className="flex gap-3 overflow-x-auto pb-2 mb-6 md:grid md:grid-cols-4 scrollbar-hide">
                    {stats.map((s) => (
                        <div
                            key={s.title}
                            className="min-w-[160px] md:min-w-0 shrink-0"
                        >
                            <StatCard
                                title={s.title}
                                value={s.value}
                                icon={s.icon}
                                color={s.color}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* ---- Tab Switcher ---- */}
            <div className="mb-4">
                <TabSwitcher
                    tabs={tabs}
                    activeTab={tab}
                    onChange={(key) => setTab(key as TabKey)}
                />
            </div>

            {/* ---- Content Area ---- */}
            {loading ? (
                <LoadingSkeleton />
            ) : error ? (
                <ErrorState message={error} onRetry={fetchData} />
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={FaInbox}
                    title="Belum ada data pengajuan"
                    description="Tidak ada pengajuan izin yang sesuai dengan filter yang dipilih."
                />
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                        <Table columns={columns} data={tableData} />
                    </div>

                    {/* Mobile Card List */}
                    <div className="md:hidden space-y-3">
                        {filtered.map((item) => {
                            const dateStr = formatDate(item.tanggal);
                            const isSakit = item.jenis === "Sakit";

                            return (
                                <div
                                    key={item.id}
                                    className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-3"
                                >
                                    {/* Top row: name + status badge */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold text-sm text-text-primary">
                                                {item.nama}
                                            </span>
                                            <span className="text-xs text-text-muted">
                                                {item.kelas}
                                            </span>
                                        </div>
                                        <StatusBadge status={item.status} />
                                    </div>

                                    {/* Middle row: date + jenis */}
                                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                                        <span className="flex items-center gap-1">
                                            <FaClock className="w-3 h-3 text-text-muted" />
                                            {dateStr}
                                        </span>
                                        <span
                                            className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md ${
                                                isSakit
                                                    ? "bg-danger/10 text-danger"
                                                    : "bg-amber-100 text-amber-600"
                                            }`}
                                        >
                                            {item.jenis}
                                        </span>
                                    </div>

                                    {/* Keterangan */}
                                    {item.keterangan && (
                                        <p className="text-xs text-text-muted bg-background p-2 rounded-md leading-relaxed">
                                            {item.keterangan}
                                        </p>
                                    )}

                                    {/* Aksi */}
                                    <div className="pt-1 border-t border-border">
                                        <Button
                                            variant="detail"
                                            size="sm"
                                            icon={FaEye}
                                            onClick={() => handleDetail(item)}
                                        >
                                            Detail
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </AdminLayout>
    );
}

/* ---- Layout assignment ---- */
PantauanIzin.layout = (page: React.ReactNode) => (
    <AdminLayout title="Pantauan Izin">{page}</AdminLayout>
);
