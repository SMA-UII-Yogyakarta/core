import { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Button,
    TabSwitcher,
    StatCard,
    EmptyState,
    ErrorState,
    LoadingSkeleton,
} from "@/Components/ui/index";
import {
    FaDownload,
    FaFileExport,
    FaCalendarAlt,
    FaChevronLeft,
    FaChevronRight,
    FaUsers,
    FaCheck,
    FaClock,
    FaFileAlt,
    FaTimes,
} from "react-icons/fa";

/* ===== Types ===== */

type PeriodeTab = "harian" | "bulanan" | "semester";

interface StatData {
    total: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
}

interface RekapRecord {
    id: number;
    label: string;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
    total: number;
}

/* ===== Constants ===== */

const TABS = [
    { key: "harian", label: "Harian" },
    { key: "bulanan", label: "Bulanan" },
    { key: "semester", label: "Semester" },
];

const MONTHS = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
];

const YEARS = [2025, 2026, 2027];

/* ===== Mock Data ===== */

const mockStats: StatData = {
    total: 348,
    hadir: 287,
    sakit: 12,
    izin: 8,
    alpha: 5,
};

const mockHarian: RekapRecord[] = [
    {
        id: 1,
        label: "1 Juli 2026",
        hadir: 42,
        sakit: 2,
        izin: 1,
        alpha: 0,
        total: 45,
    },
    {
        id: 2,
        label: "2 Juli 2026",
        hadir: 40,
        sakit: 3,
        izin: 1,
        alpha: 1,
        total: 45,
    },
    {
        id: 3,
        label: "3 Juli 2026",
        hadir: 41,
        sakit: 1,
        izin: 2,
        alpha: 1,
        total: 45,
    },
    {
        id: 4,
        label: "4 Juli 2026",
        hadir: 43,
        sakit: 1,
        izin: 0,
        alpha: 1,
        total: 45,
    },
    {
        id: 5,
        label: "5 Juli 2026",
        hadir: 39,
        sakit: 3,
        izin: 2,
        alpha: 1,
        total: 45,
    },
];

const mockBulanan: RekapRecord[] = [
    {
        id: 1,
        label: "Januari 2026",
        hadir: 890,
        sakit: 32,
        izin: 18,
        alpha: 12,
        total: 952,
    },
    {
        id: 2,
        label: "Februari 2026",
        hadir: 810,
        sakit: 28,
        izin: 22,
        alpha: 15,
        total: 875,
    },
    {
        id: 3,
        label: "Maret 2026",
        hadir: 920,
        sakit: 25,
        izin: 15,
        alpha: 10,
        total: 970,
    },
    {
        id: 4,
        label: "April 2026",
        hadir: 870,
        sakit: 35,
        izin: 20,
        alpha: 14,
        total: 939,
    },
    {
        id: 5,
        label: "Mei 2026",
        hadir: 940,
        sakit: 18,
        izin: 12,
        alpha: 8,
        total: 978,
    },
];

const mockSemester: RekapRecord[] = [
    {
        id: 1,
        label: "Ganjil 2025/2026",
        hadir: 4320,
        sakit: 145,
        izin: 98,
        alpha: 62,
        total: 4625,
    },
    {
        id: 2,
        label: "Genap 2025/2026",
        hadir: 4510,
        sakit: 132,
        izin: 87,
        alpha: 55,
        total: 4784,
    },
];

/* ===== Helpers ===== */

function getToday() {
    const d = new Date();
    return {
        day: d.getDate(),
        month: d.getMonth() + 1,
        year: d.getFullYear(),
    };
}

function daysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate();
}

/* ===== Inline Date Spinbutton ===== */

interface DateSpinbuttonProps {
    day: number;
    month: number;
    year: number;
    onDayChange: (d: number) => void;
    onMonthChange: (m: number) => void;
    onYearChange: (y: number) => void;
}

function DateSpinbutton({
    day,
    month,
    year,
    onDayChange,
    onMonthChange,
    onYearChange,
}: DateSpinbuttonProps) {
    const maxDay = daysInMonth(month, year);

    return (
        <div className="flex items-center gap-2">
            {/* Day */}
            <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden">
                <button
                    type="button"
                    onClick={() => onDayChange(Math.max(1, day - 1))}
                    className="w-8 h-9 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-background transition-colors"
                    aria-label="Kurangi hari"
                >
                    <FaChevronLeft className="w-2.5 h-2.5" />
                </button>
                <span className="min-w-7 text-center text-sm font-semibold text-text-primary select-none">
                    {String(day).padStart(2, "0")}
                </span>
                <button
                    type="button"
                    onClick={() => onDayChange(Math.min(maxDay, day + 1))}
                    className="w-8 h-9 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-background transition-colors"
                    aria-label="Tambah hari"
                >
                    <FaChevronRight className="w-2.5 h-2.5" />
                </button>
            </div>

            <span className="text-xs text-text-muted">/</span>

            {/* Month */}
            <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden">
                <button
                    type="button"
                    onClick={() => onMonthChange(month <= 1 ? 12 : month - 1)}
                    className="w-8 h-9 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-background transition-colors"
                    aria-label="Kurangi bulan"
                >
                    <FaChevronLeft className="w-2.5 h-2.5" />
                </button>
                <span className="min-w-7 text-center text-sm font-semibold text-text-primary select-none">
                    {String(month).padStart(2, "0")}
                </span>
                <button
                    type="button"
                    onClick={() => onMonthChange(month >= 12 ? 1 : month + 1)}
                    className="w-8 h-9 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-background transition-colors"
                    aria-label="Tambah bulan"
                >
                    <FaChevronRight className="w-2.5 h-2.5" />
                </button>
            </div>

            <span className="text-xs text-text-muted">/</span>

            {/* Year */}
            <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden">
                <button
                    type="button"
                    onClick={() => onYearChange(year - 1)}
                    className="w-8 h-9 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-background transition-colors"
                    aria-label="Kurangi tahun"
                >
                    <FaChevronLeft className="w-2.5 h-2.5" />
                </button>
                <span className="min-w-10 text-center text-sm font-semibold text-text-primary select-none">
                    {year}
                </span>
                <button
                    type="button"
                    onClick={() => onYearChange(year + 1)}
                    className="w-8 h-9 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-background transition-colors"
                    aria-label="Tambah tahun"
                >
                    <FaChevronRight className="w-2.5 h-2.5" />
                </button>
            </div>
        </div>
    );
}

/* ===== Inline Column Definitions per Tab ===== */

function getColumns(tab: PeriodeTab) {
    const base = [
        {
            key: "label",
            label:
                tab === "harian"
                    ? "Tanggal"
                    : tab === "bulanan"
                      ? "Bulan"
                      : "Semester",
        },
        { key: "total", label: "Total" },
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
    return base;
}

const columnClass =
    "text-left px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider";
const cellClass = "px-3 py-3 text-xs text-text-primary";

/* ===== Page Component ===== */

export default function LaporanEksporGlobal() {
    const today = getToday();

    const [activeTab, setActiveTab] = useState<PeriodeTab>("harian");
    const [day, setDay] = useState(today.day);
    const [month, setMonth] = useState(today.month);
    const [year, setYear] = useState(today.year);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<StatData | null>(null);
    const [records, setRecords] = useState<RekapRecord[]>([]);

    useEffect(() => {
        simulateFetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function simulateFetch() {
        setLoading(true);
        setError(null);

        setTimeout(() => {
            setStats(mockStats);

            if (activeTab === "harian") setRecords(mockHarian);
            else if (activeTab === "bulanan") setRecords(mockBulanan);
            else setRecords(mockSemester);

            setLoading(false);
        }, 600);
    }

    function handleTabChange(key: string) {
        setActiveTab(key as PeriodeTab);
        setLoading(true);
        setError(null);

        setTimeout(() => {
            setStats(mockStats);

            if (key === "harian") setRecords(mockHarian);
            else if (key === "bulanan") setRecords(mockBulanan);
            else setRecords(mockSemester);

            setLoading(false);
        }, 400);
    }

    function handleTerapkan() {
        simulateFetch();
    }

    function handleEkspor() {
        const labelMap: Record<PeriodeTab, string> = {
            harian: "Harian",
            bulanan: "Bulanan",
            semester: "Semester",
        };
        alert(`Mengunduh laporan ${labelMap[activeTab]}...`);
    }

    const columns = getColumns(activeTab);

    return (
        <>
            <Head title="Laporan & Ekspor Global" />

            {/* Header */}
            <div className="flex flex-col gap-1 mb-6">
                <h1 className="text-[28px] font-bold text-text-primary font-brand leading-tight">
                    Laporan & Ekspor Global
                </h1>
                <p className="text-sm text-text-muted leading-relaxed">
                    Rekapitulasi kehadiran siswa berdasarkan periode dan
                    kategori kelas.
                </p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                {/* Tab Switcher */}
                <TabSwitcher
                    tabs={TABS}
                    activeTab={activeTab}
                    onChange={handleTabChange}
                />

                {/* Date Spinbutton */}
                <div className="flex items-center gap-3">
                    <DateSpinbutton
                        day={day}
                        month={month}
                        year={year}
                        onDayChange={setDay}
                        onMonthChange={setMonth}
                        onYearChange={setYear}
                    />
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleTerapkan}
                    >
                        Terapkan
                    </Button>
                </div>
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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    <StatCard
                        title="Total"
                        value={stats.total}
                        icon={FaUsers}
                        color="primary"
                    />
                    <StatCard
                        title="Hadir"
                        value={stats.hadir}
                        icon={FaCheck}
                        color="success"
                    />
                    <StatCard
                        title="Sakit"
                        value={stats.sakit}
                        icon={FaClock}
                        color="warning"
                    />
                    <StatCard
                        title="Izin"
                        value={stats.izin}
                        icon={FaFileAlt}
                        color="accent"
                    />
                    <StatCard
                        title="Alpha"
                        value={stats.alpha}
                        icon={FaTimes}
                        color="danger"
                    />
                </div>
            ) : null}

            {/* Report Preview Card */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                {/* Card Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <FaCalendarAlt className="w-4 h-4 text-text-muted" />
                        <span className="text-sm font-semibold text-text-primary">
                            {activeTab === "harian"
                                ? "Rekap Harian"
                                : activeTab === "bulanan"
                                  ? "Rekap Bulanan"
                                  : "Rekap Semester"}
                        </span>
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

                {/* Card Body */}
                <div className="p-4">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : error ? (
                        <ErrorState message={error} onRetry={simulateFetch} />
                    ) : records.length === 0 ? (
                        <EmptyState title="Belum ada data laporan" />
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-background border-b border-border">
                                            {columns.map((col) => (
                                                <th
                                                    key={col.key}
                                                    className={columnClass}
                                                >
                                                    {col.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {records.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="hover:bg-background/50 transition-colors"
                                            >
                                                {columns.map((col) => {
                                                    const val = (
                                                        row as unknown as Record<
                                                            string,
                                                            unknown
                                                        >
                                                    )[col.key] as
                                                        string | number;
                                                    const typedVal =
                                                        val as number;
                                                    return (
                                                        <td
                                                            key={col.key}
                                                            className={
                                                                cellClass
                                                            }
                                                        >
                                                            {col.render
                                                                ? col.render(
                                                                      typedVal,
                                                                  )
                                                                : (val ?? "-")}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card List */}
                            <div className="md:hidden space-y-2">
                                {records.map((row) => (
                                    <div
                                        key={row.id}
                                        className="bg-background rounded-lg p-3 flex flex-col gap-2"
                                    >
                                        <div className="text-sm font-semibold text-text-primary">
                                            {row.label}
                                        </div>
                                        <div className="grid grid-cols-5 gap-2 text-center">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-text-muted">
                                                    Total
                                                </span>
                                                <span className="text-xs font-bold text-text-primary">
                                                    {row.total}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-text-muted">
                                                    Hadir
                                                </span>
                                                <span className="text-xs font-bold text-success">
                                                    {row.hadir}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-text-muted">
                                                    Sakit
                                                </span>
                                                <span className="text-xs font-bold text-amber-500">
                                                    {row.sakit}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-text-muted">
                                                    Izin
                                                </span>
                                                <span className="text-xs font-bold text-primary">
                                                    {row.izin}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-text-muted">
                                                    Alpha
                                                </span>
                                                <span className="text-xs font-bold text-danger">
                                                    {row.alpha}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

/* ===== Layout Assignment ===== */

LaporanEksporGlobal.layout = (page: React.ReactNode) => (
    <AdminLayout title="Laporan & Ekspor Global">{page}</AdminLayout>
);
