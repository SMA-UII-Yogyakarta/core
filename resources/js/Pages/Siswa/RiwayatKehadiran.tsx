import { useState, useEffect } from "react";
import { FaCalendarAlt, FaSearch, FaClock, FaFilter } from "react-icons/fa";
import SiswaLayout from "@/Layouts/SiswaLayout";
import {
    Button,
    Badge,
    Pagination,
    EmptyState,
    ErrorState,
} from "@/Components/ui/index";

interface Attendance {
    id: number;
    date: string;
    day: string;
    checkIn: string;
    checkOut: string;
    status: "hadir" | "sakit" | "izin" | "alpha";
}

const mockAttendance: Attendance[] = [
    {
        id: 1,
        date: "01 Jun 2026",
        day: "Senin",
        checkIn: "06:45",
        checkOut: "15:30",
        status: "hadir",
    },
    {
        id: 2,
        date: "02 Jun 2026",
        day: "Selasa",
        checkIn: "06:50",
        checkOut: "15:25",
        status: "hadir",
    },
    {
        id: 3,
        date: "03 Jun 2026",
        day: "Rabu",
        checkIn: "07:00",
        checkOut: "15:35",
        status: "hadir",
    },
    {
        id: 4,
        date: "04 Jun 2026",
        day: "Kamis",
        checkIn: "-",
        checkOut: "-",
        status: "alpha",
    },
    {
        id: 5,
        date: "05 Jun 2026",
        day: "Jumat",
        checkIn: "07:10",
        checkOut: "15:40",
        status: "hadir",
    },
    {
        id: 6,
        date: "06 Jun 2026",
        day: "Sabtu",
        checkIn: "06:55",
        checkOut: "15:20",
        status: "hadir",
    },
    {
        id: 7,
        date: "08 Jun 2026",
        day: "Senin",
        checkIn: "06:48",
        checkOut: "15:28",
        status: "hadir",
    },
    {
        id: 8,
        date: "09 Jun 2026",
        day: "Selasa",
        checkIn: "-",
        checkOut: "-",
        status: "sakit",
    },
    {
        id: 9,
        date: "10 Jun 2026",
        day: "Rabu",
        checkIn: "-",
        checkOut: "-",
        status: "izin",
    },
    {
        id: 10,
        date: "11 Jun 2026",
        day: "Kamis",
        checkIn: "06:42",
        checkOut: "15:32",
        status: "hadir",
    },
];

const statCards = [
    { label: "Hadir", value: 16, color: "text-success" },
    { label: "Sakit", value: 2, color: "text-danger" },
    { label: "Izin", value: 1, color: "text-primary" },
    { label: "Alpha", value: 1, color: "text-text-muted" },
];

const statusBadgeStyles: Record<string, { label: string; className: string }> =
    {
        hadir: {
            label: "Hadir",
            className: "bg-success/10 text-success border border-success/20",
        },
        sakit: {
            label: "Sakit",
            className: "bg-danger/10 text-danger border border-danger/20",
        },
        izin: {
            label: "Izin",
            className: "bg-accent/20 text-primary border border-accent/30",
        },
        alpha: {
            label: "Alpha",
            className: "bg-background text-text-muted border border-border",
        },
    };

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

const years = ["2024", "2025", "2026", "2027"];

export default function RiwayatKehadiran() {
    const [selectedMonth, setSelectedMonth] = useState("06");
    const [selectedYear, setSelectedYear] = useState("2026");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Attendance[]>([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setData(mockAttendance);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleFilter = () => {
        setLoading(true);
        setError(null);
        setTimeout(() => {
            setData(mockAttendance);
            setLoading(false);
        }, 500);
    };

    const paginationLinks = [
        { url: "#", label: "pagination.previous", active: false },
        { url: "#", label: "1", active: true },
        { url: "#", label: "2", active: false },
        { url: "#", label: "3", active: false },
        { url: "#", label: "pagination.next", active: false },
    ];

    /* ===== Loading ===== */
    if (loading) {
        return (
            <SiswaLayout title="Riwayat Kehadiran">
                <div className="bg-surface rounded-lg border border-border p-4 mb-4 animate-pulse">
                    <div className="flex gap-3">
                        <div className="h-9 bg-background rounded flex-1" />
                        <div className="h-9 bg-background rounded w-20" />
                        <div className="h-9 bg-background rounded w-20" />
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-24 bg-surface animate-pulse rounded-lg border border-border"
                        />
                    ))}
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="h-14 bg-surface animate-pulse rounded-lg border border-border"
                        />
                    ))}
                </div>
            </SiswaLayout>
        );
    }

    /* ===== Error ===== */
    if (error) {
        return (
            <SiswaLayout title="Riwayat Kehadiran">
                <ErrorState
                    message={error}
                    onRetry={() => {
                        setError(null);
                        setLoading(true);
                        setTimeout(() => {
                            setData(mockAttendance);
                            setLoading(false);
                        }, 800);
                    }}
                />
            </SiswaLayout>
        );
    }

    return (
        <SiswaLayout title="Riwayat Kehadiran">
            {/* Filter Bar */}
            <div className="bg-surface rounded-lg border border-border p-4 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                        <FaCalendarAlt className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="flex-1 h-9 px-3 bg-background border border-border rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            {months.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="h-9 px-3 bg-background border border-border rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        {years.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>

                    <Button
                        variant="filter"
                        size="sm"
                        icon={FaFilter}
                        onClick={handleFilter}
                    >
                        Filter
                    </Button>

                    {/* Desktop search */}
                    <div className="hidden md:flex items-center gap-2 flex-1 max-w-xs ml-auto">
                        <div className="relative w-full">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Cari tanggal..."
                                className="w-full h-9 pl-9 pr-3 bg-background border border-border rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-text-muted"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Row — 4 stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-surface rounded-lg border border-border p-4 text-center"
                    >
                        <p
                            className={`text-lg md:text-2xl font-bold ${stat.color}`}
                        >
                            {stat.value}
                        </p>
                        <p className="text-[10px] md:text-xs text-text-muted mt-1">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {!loading && !error && data.length === 0 && (
                <EmptyState
                    title="Belum Ada Data Kehadiran"
                    description="Tidak ada data kehadiran untuk periode ini."
                />
            )}

            {/* ===== Mobile: Card List ===== */}
            {!loading && !error && data.length > 0 && (
                <div className="md:hidden space-y-3">
                    <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Daftar Kehadiran —{" "}
                        {months.find((m) => m.value === selectedMonth)?.label}{" "}
                        {selectedYear}
                    </h3>

                    {data.map((item) => {
                        const badge =
                            statusBadgeStyles[item.status] ??
                            statusBadgeStyles.alpha;
                        return (
                            <div
                                key={item.id}
                                className="bg-surface rounded-lg border border-border p-3"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="text-xs font-semibold text-text-primary">
                                            {item.day}
                                        </p>
                                        <p className="text-[11px] text-text-muted">
                                            {item.date}
                                        </p>
                                    </div>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.className}`}
                                    >
                                        {badge.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-[11px] text-text-secondary">
                                    <span className="flex items-center gap-1">
                                        <FaClock className="w-3 h-3" /> Masuk:{" "}
                                        {item.checkIn}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FaClock className="w-3 h-3" /> Keluar:{" "}
                                        {item.checkOut}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ===== Desktop: Table ===== */}
            {!loading && !error && data.length > 0 && (
                <div className="hidden md:block bg-surface rounded-lg border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <h3 className="text-sm font-bold text-text-primary">
                            Daftar Kehadiran —{" "}
                            {
                                months.find((m) => m.value === selectedMonth)
                                    ?.label
                            }{" "}
                            {selectedYear}
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-background border-b border-border">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
                                        Tanggal
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
                                        Hari
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
                                        Jam Masuk
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
                                        Jam Keluar
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-surface divide-y divide-border">
                                {data.map((item) => {
                                    const badge =
                                        statusBadgeStyles[item.status] ??
                                        statusBadgeStyles.alpha;
                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-background/50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-text-primary text-xs">
                                                {item.date}
                                            </td>
                                            <td className="px-4 py-3 text-text-secondary text-xs">
                                                {item.day}
                                            </td>
                                            <td className="px-4 py-3 text-text-primary text-xs">
                                                {item.checkIn}
                                            </td>
                                            <td className="px-4 py-3 text-text-primary text-xs">
                                                {item.checkOut}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.className}`}
                                                >
                                                    {badge.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-border">
                        <Pagination links={paginationLinks} />
                    </div>
                </div>
            )}

            {/* Mobile Pagination */}
            {!loading && !error && data.length > 0 && (
                <div className="md:hidden mt-4">
                    <Pagination links={paginationLinks} />
                </div>
            )}
        </SiswaLayout>
    );
}
