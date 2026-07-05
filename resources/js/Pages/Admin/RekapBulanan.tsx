import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Button,
    Input,
    StatCard,
    Table,
    EmptyState,
    ErrorState,
    LoadingSkeleton,
} from "@/Components/ui/index";
import {
    FaDownload,
    FaUsers,
    FaCheck,
    FaTimes,
    FaFileAlt,
    FaCalendarAlt,
    FaClock,
} from "react-icons/fa";

interface Attendee {
    id: number;
    tanggal: string;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
    total: number;
}

interface StatData {
    totalSiswa: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
}

type Tab = "grafik" | "tabel";

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

const yearOptions = ["2025", "2026", "2027"];

const mockStats: StatData = {
    totalSiswa: 240,
    hadir: 215,
    sakit: 12,
    izin: 8,
    alpha: 5,
};

const mockDailyData: Attendee[] = [
    {
        id: 1,
        tanggal: "1 Juni 2025",
        hadir: 230,
        sakit: 5,
        izin: 3,
        alpha: 2,
        total: 240,
    },
    {
        id: 2,
        tanggal: "2 Juni 2025",
        hadir: 225,
        sakit: 8,
        izin: 4,
        alpha: 3,
        total: 240,
    },
    {
        id: 3,
        tanggal: "3 Juni 2025",
        hadir: 228,
        sakit: 6,
        izin: 5,
        alpha: 1,
        total: 240,
    },
    {
        id: 4,
        tanggal: "4 Juni 2025",
        hadir: 232,
        sakit: 3,
        izin: 2,
        alpha: 3,
        total: 240,
    },
    {
        id: 5,
        tanggal: "5 Juni 2025",
        hadir: 218,
        sakit: 10,
        izin: 6,
        alpha: 6,
        total: 240,
    },
    {
        id: 6,
        tanggal: "6 Juni 2025",
        hadir: 220,
        sakit: 7,
        izin: 8,
        alpha: 5,
        total: 240,
    },
    {
        id: 7,
        tanggal: "7 Juni 2025",
        hadir: 235,
        sakit: 2,
        izin: 1,
        alpha: 2,
        total: 240,
    },
];

const columns = [
    { key: "tanggal", label: "Tanggal" },
    { key: "total", label: "Total Siswa" },
    {
        key: "hadir",
        label: "Hadir",
        render: (value: number) => (
            <span className="text-success font-semibold">{value}</span>
        ),
    },
    {
        key: "sakit",
        label: "Sakit",
        render: (value: number) => (
            <span className="text-amber-500 font-semibold">{value}</span>
        ),
    },
    {
        key: "izin",
        label: "Izin",
        render: (value: number) => (
            <span className="text-primary font-semibold">{value}</span>
        ),
    },
    {
        key: "alpha",
        label: "Alpha",
        render: (value: number) => (
            <span className="text-danger font-semibold">{value}</span>
        ),
    },
];

export default function RekapBulanan() {
    const [bulan, setBulan] = useState("06");
    const [tahun, setTahun] = useState("2025");
    const [activeTab, setActiveTab] = useState<Tab>("tabel");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<StatData | null>(null);
    const [dailyData, setDailyData] = useState<Attendee[]>([]);

    useEffect(() => {
        simulateFetch();
    }, []);

    function simulateFetch() {
        setLoading(true);
        setError(null);

        setTimeout(() => {
            setStats(mockStats);
            setDailyData(mockDailyData);
            setLoading(false);
        }, 800);
    }

    function handleTerapkan() {
        simulateFetch();
    }

    function handleEkspor() {
        alert("Mengunduh rekap bulanan...");
    }

    const tabClass = (tab: Tab) =>
        `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === tab
                ? "bg-primary text-white"
                : "text-text-secondary bg-surface border border-border hover:bg-background"
        }`;

    return (
        <AdminLayout title="Rekap Bulanan">
            <Head title="Rekap Bulanan" />

            {/* Filter Section */}
            <div className="flex flex-col md:flex-row md:items-end gap-3 mb-6">
                <div className="flex-1 w-full md:w-auto">
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                        Bulan
                    </label>
                    <select
                        value={bulan}
                        onChange={(e) => setBulan(e.target.value)}
                        className="w-full h-10 px-3 bg-surface border border-border-input rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                        {months.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 w-full md:w-auto">
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                        Tahun
                    </label>
                    <select
                        value={tahun}
                        onChange={(e) => setTahun(e.target.value)}
                        className="w-full h-10 px-3 bg-surface border border-border-input rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                        {yearOptions.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>

                <Button variant="primary" size="md" onClick={handleTerapkan}>
                    Terapkan
                </Button>
            </div>

            {/* Stat Cards */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="h-24 bg-background animate-pulse rounded-lg"
                        />
                    ))}
                </div>
            ) : error ? null : stats ? (
                <div className="flex gap-3 overflow-x-auto pb-2 mb-6 md:grid md:grid-cols-5">
                    <div className="min-w-[160px] md:min-w-0">
                        <StatCard
                            title="Total Siswa"
                            value={stats.totalSiswa}
                            icon={FaUsers}
                            color="primary"
                        />
                    </div>
                    <div className="min-w-[160px] md:min-w-0">
                        <StatCard
                            title="Hadir"
                            value={stats.hadir}
                            icon={FaCheck}
                            color="success"
                        />
                    </div>
                    <div className="min-w-[160px] md:min-w-0">
                        <StatCard
                            title="Sakit"
                            value={stats.sakit}
                            icon={FaClock}
                            color="warning"
                        />
                    </div>
                    <div className="min-w-[160px] md:min-w-0">
                        <StatCard
                            title="Izin"
                            value={stats.izin}
                            icon={FaFileAlt}
                            color="accent"
                        />
                    </div>
                    <div className="min-w-[160px] md:min-w-0">
                        <StatCard
                            title="Alpha"
                            value={stats.alpha}
                            icon={FaTimes}
                            color="danger"
                        />
                    </div>
                </div>
            ) : null}

            {/* Tabs & Ekspor */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab("grafik")}
                        className={tabClass("grafik")}
                    >
                        Grafik
                    </button>
                    <button
                        onClick={() => setActiveTab("tabel")}
                        className={tabClass("tabel")}
                    >
                        Tabel
                    </button>
                </div>

                <Button
                    variant="import"
                    size="sm"
                    icon={FaDownload}
                    onClick={handleEkspor}
                >
                    Ekspor
                </Button>
            </div>

            {/* Content */}
            {loading ? (
                <LoadingSkeleton />
            ) : error ? (
                <ErrorState message={error} onRetry={simulateFetch} />
            ) : activeTab === "grafik" ? (
                <div className="bg-surface border border-border rounded-lg p-6">
                    <p className="text-text-muted text-sm text-center py-12">
                        Grafik kehadiran akan ditampilkan di sini
                    </p>
                    {/* Bar chart visualization placeholder */}
                    <div className="flex items-end justify-center gap-2 h-40">
                        {dailyData.slice(0, 7).map((d) => {
                            const pct = Math.round((d.hadir / d.total) * 100);
                            return (
                                <div
                                    key={d.id}
                                    className="flex flex-col items-center gap-1"
                                >
                                    <span className="text-[10px] text-text-muted">
                                        {pct}%
                                    </span>
                                    <div
                                        className="w-8 bg-primary/70 rounded-t-md transition-all"
                                        style={{ height: `${pct * 1.2}px` }}
                                    />
                                    <span className="text-[10px] text-text-muted text-center leading-tight">
                                        {d.tanggal.split(" ")[0]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : dailyData.length === 0 ? (
                <EmptyState title="Belum ada data rekap bulanan" />
            ) : (
                <div className="overflow-x-auto md:overflow-x-visible">
                    <Table columns={columns} data={dailyData} />
                </div>
            )}
        </AdminLayout>
    );
}
