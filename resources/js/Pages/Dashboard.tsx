import AdminLayout from "@/Layouts/AdminLayout";
import { DashboardStats, StatCard, Table, StatusBadge } from "@/Components";
import type { Column } from "@/Components/ui/Table";
import type { StatusVariant } from "@/types/component";

interface Stats {
    total_students: number;
    hadir_terdata: number;
    terlambat: number;
    sakit_izin: number;
    alpa: number;
}

interface AttendanceRow {
    id: number;
    student: {
        id: number;
        nisn: string;
        name: string;
        class: { id: number; name: string } | null;
    };
    status: string;
    check_in_time: string | null;
    attendance_date: string;
    latitude: string;
    longitude: string;
    photo_url: string;
}

interface MonthlyStats {
    bulan: string;
    total_siswa: number;
    hari_efektif: number;
    total_hadir: number;
    total_terlambat: number;
    rata_hadir_per_hari: number;
}

interface SpecialAttention {
    id: number;
    student: {
        id: number;
        nisn: string;
        name: string;
        class: { id: number; name: string } | null;
    };
    status: string;
    reason: string;
    attendance_date: string;
}

interface DashboardProps {
    stats: Stats;
    todayAttendance: AttendanceRow[];
    pendingLeaveCount: number;
    monthlyStats: MonthlyStats;
    specialAttention?: SpecialAttention[];
}

const statusToVariant: Record<string, StatusVariant> = {
    Present: "present",
    Late: "late",
    Absent: "absent",
};

export default function Dashboard({
    stats,
    todayAttendance,
    pendingLeaveCount,
    monthlyStats,
    specialAttention = [],
}: DashboardProps) {
    const attendanceColumns: Column<AttendanceRow>[] = [
        {
            key: "student",
            header: "Nama Siswa",
            render: (r) => (
                <div>
                    <div className="font-semibold text-text-primary">
                        {r.student.name}
                    </div>
                    <div className="text-[12px] text-text-muted">
                        NISN: {r.student.nisn}
                    </div>
                </div>
            ),
        },
        {
            key: "kelas",
            header: "Kelas",
            render: (r) => r.student.class?.name ?? "-",
        },
        {
            key: "status",
            header: "Status Hari Ini",
            render: (r) => {
                const variant = statusToVariant[r.status] ?? "absent";
                return <StatusBadge variant={variant} />;
            },
        },
        {
            key: "time",
            header: "Waktu",
            render: (r) => (r.check_in_time ? `${r.check_in_time} WIB` : "-"),
        },
    ];

    const attentionColumns: Column<SpecialAttention>[] = [
        {
            key: "student",
            header: "Nama Siswa",
            render: (r) => (
                <div>
                    <div className="font-semibold text-text-primary">
                        {r.student.name}
                    </div>
                    <div className="text-[12px] text-text-muted">
                        NISN: {r.student.nisn}
                    </div>
                </div>
            ),
        },
        {
            key: "kelas",
            header: "Kelas",
            render: (r) => r.student.class?.name ?? "-",
        },
        {
            key: "status",
            header: "Status",
            render: (r) => {
                const variant = statusToVariant[r.status] ?? "absent";
                return <StatusBadge variant={variant} />;
            },
        },
        {
            key: "reason",
            header: "Keterangan",
            render: (r) => (
                <span className="text-[13px] text-text-secondary">
                    {r.reason}
                </span>
            ),
        },
    ];

    return (
        <AdminLayout title="Dashboard Admin" activeMenu="Dashboard">
            {/* Statistics Cards */}
            <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                <StatCard
                    label="Total Siswa"
                    value={stats.total_students}
                    color="grey"
                />
                <StatCard
                    label="Hadir Terdata"
                    value={stats.hadir_terdata}
                    color="green"
                />
                <StatCard
                    label="Terlambat"
                    value={stats.terlambat}
                    color="amber"
                />
                <StatCard
                    label="Sakit / Izin"
                    value={stats.sakit_izin}
                    color="blue"
                />
                <StatCard
                    label="Alpa (Kosong)"
                    value={stats.alpa}
                    color="red"
                />
            </section>

            {/* Perhatian Khusus Hari Ini */}
            {specialAttention.length > 0 && (
                <section className="bg-surface border border-border rounded-lg mb-6 overflow-hidden">
                    <div className="bg-muted px-5 py-[15px]">
                        <h2 className="text-[16px] font-bold text-text-primary font-inter">
                            Perhatian Khusus Hari Ini
                        </h2>
                    </div>
                    <div className="p-4 lg:p-5">
                        <Table
                            columns={attentionColumns}
                            data={specialAttention}
                            keyExtractor={(r) => r.id}
                            emptyMessage="Tidak ada data."
                        />
                    </div>
                </section>
            )}

            {/* Today's Attendance */}
            <section className="bg-surface border border-border rounded-lg p-4 lg:p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[16px] font-bold text-text-primary font-inter">
                        Kehadiran Hari Ini
                    </h2>
                    {pendingLeaveCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-danger-bg text-danger rounded-full text-[12px] font-semibold">
                            <span className="w-2 h-2 bg-danger rounded-full" />
                            {pendingLeaveCount} izin menunggu
                        </span>
                    )}
                </div>
                <Table
                    columns={attendanceColumns}
                    data={todayAttendance}
                    keyExtractor={(r) => r.id}
                    emptyMessage="Belum ada data kehadiran hari ini."
                />
            </section>

            {/* Monthly Stats */}
            <section className="bg-surface border border-border rounded-lg p-4 lg:p-6 mb-6">
                <h2 className="text-[16px] font-bold text-text-primary font-inter mb-4">
                    Statistik Bulanan — {monthlyStats.bulan}
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-background rounded-lg p-4 text-center">
                        <div className="text-[24px] font-bold text-primary">
                            {monthlyStats.hari_efektif}
                        </div>
                        <div className="text-[12px] text-text-muted mt-1">
                            Hari Efektif
                        </div>
                    </div>
                    <div className="bg-background rounded-lg p-4 text-center">
                        <div className="text-[24px] font-bold text-success">
                            {monthlyStats.total_hadir}
                        </div>
                        <div className="text-[12px] text-text-muted mt-1">
                            Total Hadir
                        </div>
                    </div>
                    <div className="bg-background rounded-lg p-4 text-center">
                        <div className="text-[24px] font-bold text-warning">
                            {monthlyStats.total_terlambat}
                        </div>
                        <div className="text-[12px] text-text-muted mt-1">
                            Total Terlambat
                        </div>
                    </div>
                    <div className="bg-background rounded-lg p-4 text-center">
                        <div className="text-[24px] font-bold text-primary">
                            {monthlyStats.rata_hadir_per_hari}
                        </div>
                        <div className="text-[12px] text-text-muted mt-1">
                            Rata-rata/Hari
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile Dashboard Stats */}
            <section className="lg:hidden mb-6">
                <DashboardStats />
            </section>
        </AdminLayout>
    );
}
