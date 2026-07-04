import { StatCard, StatusBadge } from "@/Components";
import SiswaLayout from "@/Layouts/SiswaLayout";

interface Student {
    id: number;
    nis: string;
    nisn: string;
    name: string;
    class: { id: number; name: string } | null;
}

interface TodayAttendance {
    id: number;
    status: string;
    check_in_time: string;
    attendance_date: string;
}

interface Stats {
    total_attendance: number;
    present: number;
    late: number;
    pending_leaves: number;
}

interface AttendanceRecord {
    id: number;
    status: string;
    check_in_time: string;
    attendance_date: string;
}

interface PageProps {
    student: Student;
    todayAttendance: TodayAttendance | null;
    recentHistory: AttendanceRecord[];
    stats: Stats;
}

export default function SiswaDashboard({
    student,
    todayAttendance,
    recentHistory,
    stats,
}: PageProps) {
    return (
        <SiswaLayout
            title="Dashboard Siswa"
            userInitial={student.name.charAt(0)}
        >
            {/* Profile Section */}
            <section className="bg-surface border border-border rounded-xl p-5 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white font-bold text-[18px]">
                        {student.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-[18px] font-bold text-text-primary">
                            {student.name}
                        </h1>
                        <p className="text-[13px] text-text-muted">
                            {student.class?.name ?? "Belum ada kelas"} — NISN:{" "}
                            {student.nisn}
                        </p>
                    </div>
                </div>
                {todayAttendance ? (
                    <div className="mt-4 p-3 bg-success-bg border border-success-light rounded-lg flex items-center gap-3">
                        <span className="w-3 h-3 bg-success rounded-full" />
                        <span className="text-[13px] text-success font-semibold">
                            Sudah presensi hari ini —{" "}
                            {todayAttendance.check_in_time} WIB
                        </span>
                    </div>
                ) : (
                    <div className="mt-4 p-3 bg-warning-bg border border-warning-light rounded-lg flex items-center gap-3">
                        <span className="w-3 h-3 bg-warning rounded-full" />
                        <span className="text-[13px] text-warning font-semibold">
                            Belum presensi hari ini
                        </span>
                    </div>
                )}
            </section>

            {/* Stats */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <StatCard
                    label="Total Presensi"
                    value={stats.total_attendance}
                    color="grey"
                />
                <StatCard label="Hadir" value={stats.present} color="green" />
                <StatCard label="Terlambat" value={stats.late} color="amber" />
                <StatCard
                    label="Izin Pending"
                    value={stats.pending_leaves}
                    color="blue"
                />
            </section>

            {/* Quick Actions */}
            <section className="flex gap-3 mb-6">
                <a
                    href="/siswa/live-presensi"
                    className="flex-1 px-5 py-4 bg-primary text-white rounded-xl text-center font-semibold text-[14px] hover:bg-primary/90 transition-colors"
                >
                    Presensi Sekarang
                </a>
                <a
                    href="/siswa/riwayat"
                    className="flex-1 px-5 py-4 bg-surface border border-border text-text-primary rounded-xl text-center font-semibold text-[14px] hover:bg-background transition-colors"
                >
                    Riwayat Kehadiran
                </a>
            </section>

            {/* Recent History */}
            <section className="bg-surface border border-border rounded-xl p-5">
                <h2 className="text-[16px] font-bold text-text-primary font-inter mb-4">
                    Riwayat Terbaru
                </h2>
                {recentHistory.length === 0 ? (
                    <p className="text-text-muted text-[13px] text-center py-6">
                        Belum ada riwayat presensi.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {recentHistory.slice(0, 10).map((record) => (
                            <div
                                key={record.id}
                                className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                            >
                                <span className="text-[13px] text-text-primary">
                                    {record.attendance_date}
                                </span>
                                <span className="text-[13px] text-text-muted">
                                    {record.check_in_time} WIB
                                </span>
                                <StatusBadge
                                    variant={
                                        record.status === "Present"
                                            ? "present"
                                            : "late"
                                    }
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </SiswaLayout>
    );
}
