import { useState, useEffect } from "react";
import {
    FaUserGraduate,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaCalendarAlt,
    FaSchool,
    FaFileDownload,
    FaUsers,
    FaSearch,
} from "react-icons/fa";
import GuruLayout from "@/Layouts/GuruLayout";
import {
    Button,
    StatusBadge,
    Pagination,
    EmptyState,
    ErrorState,
} from "@/Components/ui/index";

/* ===== Types ===== */
interface Student {
    id: number;
    no: number;
    name: string;
    nis: string;
    checkIn: string;
    checkOut: string;
    status: "present" | "late" | "absent" | "sick" | "permit";
}

/* ===== Mock Data ===== */
const students: Student[] = [
    {
        id: 1,
        no: 1,
        name: "Ahmad Reza Pahlevi",
        nis: "1234567890",
        checkIn: "06:45",
        checkOut: "15:30",
        status: "present",
    },
    {
        id: 2,
        no: 2,
        name: "Siti Nurhaliza",
        nis: "1234567891",
        checkIn: "06:50",
        checkOut: "15:25",
        status: "present",
    },
    {
        id: 3,
        no: 3,
        name: "Budi Santoso",
        nis: "1234567892",
        checkIn: "07:00",
        checkOut: "15:35",
        status: "late",
    },
    {
        id: 4,
        no: 4,
        name: "Dewi Lestari",
        nis: "1234567893",
        checkIn: "-",
        checkOut: "-",
        status: "absent",
    },
    {
        id: 5,
        no: 5,
        name: "Rudi Hermawan",
        nis: "1234567894",
        checkIn: "-",
        checkOut: "-",
        status: "sick",
    },
    {
        id: 6,
        no: 6,
        name: "Ani Safitri",
        nis: "1234567895",
        checkIn: "06:48",
        checkOut: "15:28",
        status: "present",
    },
    {
        id: 7,
        no: 7,
        name: "Rizki Pratama",
        nis: "1234567896",
        checkIn: "-",
        checkOut: "-",
        status: "permit",
    },
    {
        id: 8,
        no: 8,
        name: "Fitri Handayani",
        nis: "1234567897",
        checkIn: "06:55",
        checkOut: "15:20",
        status: "present",
    },
];

const dailyStats = {
    hadir: students.filter((s) => s.status === "present").length,
    sakit: students.filter((s) => s.status === "sick").length,
    izin: students.filter((s) => s.status === "permit").length,
    alpha: students.filter((s) => s.status === "absent" || s.status === "late")
        .length,
    total: students.length,
};

const todayInfo = {
    date: "06 Jun",
    fullDate: "Sabtu, 06 Juni 2026",
    status: "present" as const,
    message: "Semua siswa telah hadir",
};

export default function DashboardWaliKelas() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState("2026-06-06");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const filteredStudents = students.filter(
        (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.nis.includes(searchQuery),
    );

    const paginationLinks = [
        { url: "#", label: "pagination.previous", active: false },
        { url: "#", label: "1", active: true },
        { url: "#", label: "2", active: false },
        { url: "#", label: "pagination.next", active: false },
    ];

    const statusDotColor: Record<string, string> = {
        present: "bg-success",
        late: "bg-amber-500",
        absent: "bg-danger",
        sick: "bg-primary",
        permit: "bg-accent",
    };

    /* ===== Loading ===== */
    if (loading) {
        return (
            <GuruLayout title="Dashboard Wali Kelas">
                <div className="h-24 bg-surface animate-pulse rounded-lg border border-border mb-4" />
                <div className="h-28 bg-surface animate-pulse rounded-lg border border-border mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[1, 2, 3, 4].map((i) => (
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
                            className="h-16 bg-surface animate-pulse rounded-lg border border-border"
                        />
                    ))}
                </div>
            </GuruLayout>
        );
    }

    /* ===== Error ===== */
    if (error) {
        return (
            <GuruLayout title="Dashboard Wali Kelas">
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
        <GuruLayout title="Dashboard Wali Kelas">
            {/* Class Info Header */}
            <div className="bg-surface rounded-lg border border-border p-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <FaSchool className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-text-primary">
                            X-A (Reguler)
                        </h2>
                        <p className="text-xs text-text-muted flex items-center gap-1">
                            <FaUsers className="w-3 h-3" />
                            {dailyStats.total} Siswa
                        </p>
                    </div>
                </div>
            </div>

            {/* Today's Status Card */}
            <div
                className={`bg-surface rounded-lg border-t-4 border-l border-r border-b border-border p-4 mb-4 ${
                    todayInfo.status === "present"
                        ? "border-t-success"
                        : "border-t-danger"
                }`}
            >
                <div className="flex items-center gap-4">
                    <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
                            todayInfo.status === "present"
                                ? "bg-success/10 text-success"
                                : "bg-danger/10 text-danger"
                        }`}
                    >
                        {todayInfo.status === "present" ? (
                            <FaCheckCircle className="w-7 h-7" />
                        ) : (
                            <FaTimesCircle className="w-7 h-7" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                            STATUS HARI INI ({todayInfo.date})
                        </p>
                        <h3 className="text-sm font-bold text-text-primary mt-0.5">
                            {todayInfo.message}
                        </h3>
                        <p className="text-xs text-text-muted">
                            {todayInfo.fullDate}
                        </p>
                    </div>
                </div>

                {/* Desktop: Date Filter */}
                <div className="hidden md:flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <FaCalendarAlt className="w-3.5 h-3.5 text-text-muted" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="h-8 px-2 bg-background border border-border rounded text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-surface rounded-lg border border-border p-3 text-center">
                    <p className="text-lg font-bold text-success">
                        {dailyStats.hadir}
                    </p>
                    <p className="text-[10px] text-text-muted">Hadir</p>
                </div>
                <div className="bg-surface rounded-lg border border-border p-3 text-center">
                    <p className="text-lg font-bold text-danger">
                        {dailyStats.sakit}
                    </p>
                    <p className="text-[10px] text-text-muted">Sakit</p>
                </div>
                <div className="bg-surface rounded-lg border border-border p-3 text-center">
                    <p className="text-lg font-bold text-primary">
                        {dailyStats.izin}
                    </p>
                    <p className="text-[10px] text-text-muted">Izin</p>
                </div>
                <div className="bg-surface rounded-lg border border-border p-3 text-center">
                    <p className="text-lg font-bold text-text-muted">
                        {dailyStats.alpha}
                    </p>
                    <p className="text-[10px] text-text-muted">Alpha</p>
                </div>
            </div>

            {/* Desktop: Search + Export */}
            <div className="hidden md:flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 flex-1 max-w-xs">
                    <div className="relative w-full">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Cari nama atau NIS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-9 pl-9 pr-3 bg-surface border border-border rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-text-muted"
                        />
                    </div>
                </div>
                <Button variant="import" size="sm" icon={FaFileDownload}>
                    Export
                </Button>
            </div>

            {/* ===== Mobile: Student List Cards ===== */}
            <div className="md:hidden space-y-2">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                    Daftar Siswa
                </h3>

                {filteredStudents.length === 0 ? (
                    <EmptyState
                        title="Tidak Ada Siswa"
                        description="Tidak ada siswa yang ditemukan."
                    />
                ) : (
                    filteredStudents.map((student) => (
                        <div
                            key={student.id}
                            className="bg-surface rounded-lg border border-border p-3 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                {/* Status Indicator Dot */}
                                <div
                                    className={`w-3 h-3 rounded-full shrink-0 ${
                                        statusDotColor[student.status] ??
                                        "bg-text-muted"
                                    }`}
                                />
                                <div>
                                    <p className="text-xs font-semibold text-text-primary">
                                        {student.name}
                                    </p>
                                    <p className="text-[10px] text-text-muted">
                                        NIS: {student.nis}
                                    </p>
                                    <p className="text-[10px] text-text-secondary">
                                        {student.checkIn !== "-"
                                            ? `Masuk: ${student.checkIn}`
                                            : "Belum masuk"}
                                        {student.checkOut !== "-"
                                            ? ` | Keluar: ${student.checkOut}`
                                            : ""}
                                    </p>
                                </div>
                            </div>
                            <StatusBadge status={student.status} />
                        </div>
                    ))
                )}
            </div>

            {/* ===== Desktop: Full Table ===== */}
            <div className="hidden md:block bg-surface rounded-lg border border-border overflow-hidden">
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
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-8 text-center text-text-muted text-sm"
                                    >
                                        Tidak ada siswa ditemukan
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="hover:bg-background/50 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-text-primary text-xs">
                                            {student.no}
                                        </td>
                                        <td className="px-4 py-3 text-text-primary text-xs font-medium">
                                            {student.name}
                                        </td>
                                        <td className="px-4 py-3 text-text-secondary text-xs">
                                            {student.nis}
                                        </td>
                                        <td className="px-4 py-3 text-text-primary text-xs">
                                            {student.checkIn}
                                        </td>
                                        <td className="px-4 py-3 text-text-primary text-xs">
                                            {student.checkOut}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge
                                                status={student.status}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-border flex items-center justify-between">
                    <Pagination links={paginationLinks} className="mb-0 mt-0" />
                    <Button variant="import" size="sm" icon={FaFileDownload}>
                        Export Excel
                    </Button>
                </div>
            </div>
        </GuruLayout>
    );
}
