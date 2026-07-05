import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Button,
    StatCard,
    Table,
    Pagination,
    LoadingSkeleton,
    ErrorState,
} from "@/Components/ui/index";
import {
    FaUsers,
    FaCheck,
    FaClock,
    FaFileSignature,
    FaUserGraduate,
    FaCalendarAlt,
    FaEye,
    FaCheckCircle,
    FaPlus,
    FaInbox,
} from "react-icons/fa";

interface RecentActivity {
    id: number;
    student: string;
    class: string;
    status: string;
    time: string;
}

interface AttendanceRecord {
    id: number;
    nis: string;
    student: string;
    class: string;
    subject: string;
    status: string;
    time_in: string;
}

export default function Dashboard() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>(
        [],
    );

    // Simulate initial data load
    useEffect(() => {
        setLoading(true);
        setError(null);

        // Simulate fetch
        setTimeout(() => {
            setRecentActivity(mockRecentActivity);
            setAttendanceData(mockAttendanceData);
            setLoading(false);
        }, 500);
    }, []);

    const stats = [
        {
            title: "Total Siswa",
            value: 348,
            icon: FaUsers,
            color: "primary" as const,
        },
        {
            title: "Hadir",
            value: 287,
            icon: FaCheck,
            color: "success" as const,
        },
        { title: "Sakit", value: 12, icon: FaClock, color: "danger" as const },
        {
            title: "Izin",
            value: 8,
            icon: FaFileSignature,
            color: "warning" as const,
        },
    ];

    const quickActions = [
        {
            label: "Rekap Harian",
            icon: FaCalendarAlt,
            color: "primary" as const,
            onClick: () => {},
        },
        {
            label: "Live Presensi",
            icon: FaEye,
            color: "accent" as const,
            onClick: () => {},
        },
        {
            label: "Verifikasi Izin",
            icon: FaCheckCircle,
            color: "success" as const,
            onClick: () => {},
        },
        {
            label: "Tambah Data",
            icon: FaPlus,
            color: "warning" as const,
            onClick: () => {},
        },
    ];

    const attendanceColumns = [
        { key: "nis", label: "NIS" },
        { key: "student", label: "Nama" },
        { key: "class", label: "Kelas" },
        { key: "subject", label: "Mapel" },
        {
            key: "status",
            label: "Status",
            render: (_: string, row: AttendanceRecord) => {
                const statusMap: Record<
                    string,
                    { label: string; class: string }
                > = {
                    present: {
                        label: "Hadir",
                        class: "text-success bg-success/10",
                    },
                    late: {
                        label: "Terlambat",
                        class: "text-warning bg-warning-light",
                    },
                    absent: {
                        label: "Alpha",
                        class: "text-danger bg-danger-light",
                    },
                    sick: {
                        label: "Sakit",
                        class: "text-amber-600 bg-amber-100",
                    },
                };
                const s = statusMap[row.status] ?? {
                    label: row.status,
                    class: "text-text-muted bg-background",
                };
                return (
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${s.class}`}
                    >
                        {s.label}
                    </span>
                );
            },
        },
        { key: "time_in", label: "Jam Masuk" },
    ];

    /* ---------- Mobile: Recent Activity List ---------- */
    const MobileActivityList = () => {
        if (loading) return <LoadingSkeleton />;
        if (error)
            return (
                <ErrorState
                    message={error}
                    onRetry={() => window.location.reload()}
                />
            );
        if (recentActivity.length === 0)
            return (
                <div className="flex flex-col items-center py-12 text-text-muted">
                    <FaInbox className="w-12 h-12 mb-4" />
                    <p className="text-sm">Belum ada aktivitas hari ini</p>
                </div>
            );

        return (
            <div className="flex flex-col gap-2">
                {recentActivity.map((item) => (
                    <div
                        key={item.id}
                        className="bg-surface rounded-lg border border-border p-3 flex items-center justify-between"
                    >
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-text-primary">
                                {item.student}
                            </span>
                            <span className="text-xs text-text-muted">
                                {item.class} · {item.time}
                            </span>
                        </div>
                        <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                            {item.status}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <Head title="Dashboard" />

            {/* ===== Mobile Layout ===== */}
            <div className="lg:hidden flex flex-col gap-4">
                {/* StatCards — horizontal scroll */}
                <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4">
                    {stats.map((stat) => (
                        <StatCard
                            key={stat.title}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                            className="min-w-[160px] shrink-0"
                        />
                    ))}
                </div>

                {/* Recent Activity */}
                <div>
                    <h2 className="text-sm font-bold text-text-primary mb-3">
                        Aktivitas Terbaru
                    </h2>
                    <MobileActivityList />
                </div>

                {/* Quick Actions — 2x2 grid */}
                <div>
                    <h2 className="text-sm font-bold text-text-primary mb-3">
                        Aksi Cepat
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action) => (
                            <button
                                key={action.label}
                                onClick={action.onClick}
                                className="bg-surface rounded-lg border border-border p-4 flex flex-col items-center gap-2 hover:bg-background transition-colors"
                            >
                                <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        action.color === "primary"
                                            ? "bg-primary/10 text-primary"
                                            : action.color === "accent"
                                              ? "bg-accent/20 text-primary"
                                              : action.color === "success"
                                                ? "bg-success/10 text-success"
                                                : "bg-amber-100 text-amber-600"
                                    }`}
                                >
                                    <action.icon className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-semibold text-text-secondary text-center leading-tight">
                                    {action.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== Desktop Layout ===== */}
            <div className="hidden lg:flex flex-col gap-6">
                {/* StatCards — grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <StatCard
                            key={stat.title}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                        />
                    ))}
                </div>

                {/* Table + Quick Actions row */}
                <div className="flex gap-6">
                    {/* Attendance Table */}
                    <div className="flex-1">
                        <h2 className="text-sm font-bold text-text-primary mb-3">
                            Presensi Hari Ini
                        </h2>
                        <Table
                            columns={attendanceColumns}
                            data={attendanceData}
                            loading={loading}
                            error={error}
                            emptyMessage="Belum ada data presensi hari ini"
                            onRetry={() => {
                                setLoading(true);
                                setError(null);
                                setTimeout(() => {
                                    setAttendanceData(mockAttendanceData);
                                    setLoading(false);
                                }, 500);
                            }}
                        />
                    </div>

                    {/* Quick Actions sidebar */}
                    <div className="w-56 shrink-0">
                        <h2 className="text-sm font-bold text-text-primary mb-3">
                            Aksi Cepat
                        </h2>
                        <div className="flex flex-col gap-2">
                            {quickActions.map((action) => (
                                <button
                                    key={action.label}
                                    onClick={action.onClick}
                                    className="flex items-center gap-3 bg-surface rounded-lg border border-border p-3 hover:bg-background transition-colors"
                                >
                                    <div
                                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                            action.color === "primary"
                                                ? "bg-primary/10 text-primary"
                                                : action.color === "accent"
                                                  ? "bg-accent/20 text-primary"
                                                  : action.color === "success"
                                                    ? "bg-success/10 text-success"
                                                    : "bg-amber-100 text-amber-600"
                                        }`}
                                    >
                                        <action.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-semibold text-text-secondary">
                                        {action.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Override layout
Dashboard.layout = (page: React.ReactNode) => (
    <AdminLayout
        title="Dashboard"
        user={{ name: "Admin SMAUII", email: "admin@smauii.sch.id" }}
    >
        {page}
    </AdminLayout>
);

/* ===== Mock Data ===== */
const mockRecentActivity: RecentActivity[] = [
    {
        id: 1,
        student: "Ahmad Fauzi",
        class: "X-A",
        status: "Hadir",
        time: "07:15",
    },
    {
        id: 2,
        student: "Siti Nurhaliza",
        class: "X-B",
        status: "Hadir",
        time: "07:20",
    },
    {
        id: 3,
        student: "Budi Santoso",
        class: "XI-A",
        status: "Hadir",
        time: "07:18",
    },
    {
        id: 4,
        student: "Dewi Lestari",
        class: "X-A",
        status: "Hadir",
        time: "07:22",
    },
    {
        id: 5,
        student: "Rizky Pratama",
        class: "XII-A",
        status: "Hadir",
        time: "07:10",
    },
];

const mockAttendanceData: AttendanceRecord[] = [
    {
        id: 1,
        nis: "2426001",
        student: "Ahmad Fauzi",
        class: "X-A",
        subject: "Matematika",
        status: "present",
        time_in: "07:15",
    },
    {
        id: 2,
        nis: "2426002",
        student: "Siti Nurhaliza",
        class: "X-B",
        subject: "Bahasa Inggris",
        status: "present",
        time_in: "07:20",
    },
    {
        id: 3,
        nis: "2426003",
        student: "Budi Santoso",
        class: "XI-A",
        subject: "Fisika",
        status: "late",
        time_in: "07:45",
    },
    {
        id: 4,
        nis: "2426004",
        student: "Dewi Lestari",
        class: "X-A",
        subject: "Matematika",
        status: "present",
        time_in: "07:22",
    },
    {
        id: 5,
        nis: "2426005",
        student: "Rizky Pratama",
        class: "XII-A",
        subject: "Kimia",
        status: "absent",
        time_in: "-",
    },
    {
        id: 6,
        nis: "2426006",
        student: "Ani Rahmawati",
        class: "XI-B",
        subject: "Biologi",
        status: "sick",
        time_in: "-",
    },
    {
        id: 7,
        nis: "2426007",
        student: "Fajar Hidayat",
        class: "X-B",
        subject: "Bahasa Inggris",
        status: "present",
        time_in: "07:16",
    },
    {
        id: 8,
        nis: "2426008",
        student: "Citra Ayu",
        class: "XII-B",
        subject: "Sejarah",
        status: "present",
        time_in: "07:19",
    },
];
