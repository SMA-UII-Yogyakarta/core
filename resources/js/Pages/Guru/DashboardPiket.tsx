import { useState, useEffect } from "react";
import {
    FaUsers,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaCalendarAlt,
    FaFileDownload,
    FaEye,
    FaSchool,
    FaUserGraduate,
} from "react-icons/fa";
import GuruLayout from "@/Layouts/GuruLayout";
import {
    Button,
    StatCard,
    StatusBadge,
    Pagination,
    ErrorState,
} from "@/Components/ui/index";

/* ===== Types ===== */
interface ClassInfo {
    id: number;
    className: string;
    totalStudents: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
}

interface StudentAttendance {
    id: number;
    no: number;
    name: string;
    nis: string;
    class: string;
    checkIn: string;
    checkOut: string;
    status: "present" | "late" | "absent" | "sick" | "permit";
}

/* ===== Mock Data ===== */
const classData: ClassInfo[] = [
    {
        id: 1,
        className: "X-A",
        totalStudents: 32,
        hadir: 28,
        sakit: 2,
        izin: 1,
        alpha: 1,
    },
    {
        id: 2,
        className: "X-B",
        totalStudents: 30,
        hadir: 25,
        sakit: 3,
        izin: 1,
        alpha: 1,
    },
    {
        id: 3,
        className: "XI-A",
        totalStudents: 31,
        hadir: 29,
        sakit: 1,
        izin: 0,
        alpha: 1,
    },
    {
        id: 4,
        className: "XI-B",
        totalStudents: 29,
        hadir: 24,
        sakit: 2,
        izin: 2,
        alpha: 1,
    },
    {
        id: 5,
        className: "XII-A",
        totalStudents: 28,
        hadir: 27,
        sakit: 0,
        izin: 1,
        alpha: 0,
    },
];

const fullAttendanceData: StudentAttendance[] = [
    {
        id: 1,
        no: 1,
        name: "Ahmad Reza Pahlevi",
        nis: "1234567890",
        class: "X-A",
        checkIn: "06:45",
        checkOut: "15:30",
        status: "present",
    },
    {
        id: 2,
        no: 2,
        name: "Siti Nurhaliza",
        nis: "1234567891",
        class: "X-A",
        checkIn: "06:50",
        checkOut: "15:25",
        status: "present",
    },
    {
        id: 3,
        no: 3,
        name: "Budi Santoso",
        nis: "1234567892",
        class: "X-A",
        checkIn: "07:00",
        checkOut: "15:35",
        status: "late",
    },
    {
        id: 4,
        no: 4,
        name: "Dewi Lestari",
        nis: "1234567893",
        class: "X-A",
        checkIn: "-",
        checkOut: "-",
        status: "absent",
    },
    {
        id: 5,
        no: 5,
        name: "Rudi Hermawan",
        nis: "1234567894",
        class: "X-A",
        checkIn: "-",
        checkOut: "-",
        status: "sick",
    },
];

const todayDate = "Selasa, 02 Juni 2026";

const summaryStats = {
    total: classData.reduce((sum, c) => sum + c.totalStudents, 0),
    hadir: classData.reduce((sum, c) => sum + c.hadir, 0),
    belum: classData.reduce((sum, c) => sum + (c.totalStudents - c.hadir), 0),
};

export default function DashboardPiket() {
    const [selectedClass, setSelectedClass] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const filteredClasses =
        selectedClass === "all"
            ? classData
            : classData.filter((c) => c.className === selectedClass);

    const classOptions = ["all", ...classData.map((c) => c.className)];

    /* ===== Loading ===== */
    if (loading) {
        return (
            <GuruLayout title="Dashboard Piket">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-4 w-4 bg-background animate-pulse rounded" />
                    <div className="h-4 w-48 bg-background animate-pulse rounded" />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-24 bg-surface animate-pulse rounded-lg border border-border"
                        />
                    ))}
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-28 bg-surface animate-pulse rounded-lg border border-border"
                        />
                    ))}
                </div>
            </GuruLayout>
        );
    }

    /* ===== Error ===== */
    if (error) {
        return (
            <GuruLayout title="Dashboard Piket">
                <ErrorState
                    message={error}
                    onRetry={() => {
                        setError(null);
                        setLoading(true);
                        setTimeout(() => setLoading(false), 800);
                    }}
                />
            </GuruLayout>
        );
    }

    return (
        <GuruLayout title="Dashboard Piket">
            {/* Date Display */}
            <div className="flex items-center gap-2 mb-4 text-text-secondary">
                <FaCalendarAlt className="w-4 h-4" />
                <span className="text-sm font-medium">{todayDate}</span>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <StatCard
                    title="Total Siswa"
                    value={summaryStats.total}
                    icon={FaUsers}
                    color="primary"
                />
                <StatCard
                    title="Sudah Presensi"
                    value={summaryStats.hadir}
                    icon={FaCheckCircle}
                    color="success"
                />
                <StatCard
                    title="Belum Presensi"
                    value={summaryStats.belum}
                    icon={FaClock}
                    color="danger"
                />
            </div>

            {/* ===== Mobile: Class List Cards ===== */}
            <div className="md:hidden space-y-3">
                {filteredClasses.map((cls) => (
                    <div
                        key={cls.id}
                        className="bg-surface rounded-lg border border-border p-4"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <FaSchool className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-bold text-text-primary">
                                    {cls.className}
                                </h3>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-text-muted">
                                <FaUserGraduate className="w-3 h-3" />
                                <span>{cls.totalStudents} Siswa</span>
                            </div>
                        </div>

                        {/* Attendance Counts */}
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            <div className="text-center">
                                <p className="text-xs font-bold text-success">
                                    {cls.hadir}
                                </p>
                                <p className="text-[10px] text-text-muted">
                                    Hadir
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-danger">
                                    {cls.sakit}
                                </p>
                                <p className="text-[10px] text-text-muted">
                                    Sakit
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-primary">
                                    {cls.izin}
                                </p>
                                <p className="text-[10px] text-text-muted">
                                    Izin
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-text-muted">
                                    {cls.alpha}
                                </p>
                                <p className="text-[10px] text-text-muted">
                                    Alpha
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="detail"
                            size="sm"
                            className="w-full"
                            icon={FaEye}
                        >
                            Detail
                        </Button>
                    </div>
                ))}
            </div>

            {/* Mobile: Rekap Button */}
            <div className="md:hidden mt-4">
                <Button
                    variant="import"
                    size="md"
                    className="w-full"
                    icon={FaFileDownload}
                >
                    Rekap Harian
                </Button>
            </div>

            {/* ===== Desktop: Filter + Table ===== */}
            <div className="hidden md:block">
                {/* Filter + Export */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-text-muted">
                            Filter Kelas:
                        </label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="h-9 px-3 bg-surface border border-border rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="all">Semua Kelas</option>
                            {classData.map((c) => (
                                <option key={c.id} value={c.className}>
                                    {c.className}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button variant="import" size="sm" icon={FaFileDownload}>
                        Rekap Harian
                    </Button>
                </div>

                {/* Class Filter Pills */}
                <div className="flex items-center gap-2 mb-3 overflow-x-auto">
                    {classOptions.map((cls) => (
                        <button
                            key={cls}
                            onClick={() => setSelectedClass(cls)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                                selectedClass === cls
                                    ? "bg-primary text-white"
                                    : "bg-surface text-text-secondary border border-border hover:bg-background"
                            }`}
                        >
                            {cls === "all" ? "Semua" : cls}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-surface rounded-lg border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-background border-b border-border">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
                                        No
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
                                        Nama
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
                                        NIS
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
                                        Kelas
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
                                {fullAttendanceData.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-8 text-center text-text-muted text-sm"
                                        >
                                            Belum ada data presensi
                                        </td>
                                    </tr>
                                ) : (
                                    fullAttendanceData.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-background/50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-text-primary text-xs">
                                                {row.no}
                                            </td>
                                            <td className="px-4 py-3 text-text-primary text-xs font-medium">
                                                {row.name}
                                            </td>
                                            <td className="px-4 py-3 text-text-secondary text-xs">
                                                {row.nis}
                                            </td>
                                            <td className="px-4 py-3 text-text-secondary text-xs">
                                                {row.class}
                                            </td>
                                            <td className="px-4 py-3 text-text-primary text-xs">
                                                {row.checkIn}
                                            </td>
                                            <td className="px-4 py-3 text-text-primary text-xs">
                                                {row.checkOut}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge
                                                    status={row.status}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer */}
                    <div className="p-4 border-t border-border flex items-center justify-between">
                        <span className="text-xs text-text-muted">
                            Menampilkan {fullAttendanceData.length} dari{" "}
                            {summaryStats.total} siswa
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="detail"
                                size="sm"
                                icon={FaFileDownload}
                            >
                                Export Kelas
                            </Button>
                            <Button
                                variant="import"
                                size="sm"
                                icon={FaFileDownload}
                            >
                                Export Semua
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </GuruLayout>
    );
}
