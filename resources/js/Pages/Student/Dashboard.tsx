import { Link } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { PageHeader, StatCard, Button, StatusBadge, DashboardHero } from "@/Components";
import { FiCalendar, FiCamera, FiCheckCircle } from "react-icons/fi";

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
    absent?: number;
}

interface PageProps {
    student: Student;
    todayAttendance: TodayAttendance | null;
    stats: Stats;
}

export default function StudentDashboard({ student, todayAttendance, stats }: PageProps) {
    const absent = stats.absent ?? 0;
    const className = student.class?.name ?? "-";

    return (
        <AppShell title="Overview Siswa">
            <div className="flex flex-col gap-6 font-inter">
                <PageHeader
                    title={`Selamat Datang, ${student.name}`}
                    description={`Siswa Kelas ${className} • NIS: ${student.nis} (NISN: ${student.nisn || "-"})`}
                    className="hidden lg:flex shrink-0 mb-4"
                />

                {/* Hero Greeting Card */}
                <DashboardHero
                    title={student.name}
                    description={`Kelas ${className}`}
                    descriptionClassName="text-accent text-[13px] font-semibold"
                    dusk="student-greeting-card"
                    data-testid="student-greeting-card"
                />

                {/* Primary Action Button */}
                {todayAttendance ? (
                    <div
                        className="rounded-xl px-4 py-3.5 flex items-center justify-between bg-success-bg border border-success/30 text-success shadow-xs"
                        dusk="today-attendance-done"
                        data-testid="today-attendance-done"
                    >
                        <div className="flex items-center gap-2">
                            <FiCheckCircle className="text-[18px]" />
                            <span className="font-bold text-[14px]">
                                Sudah Presensi Masuk ({todayAttendance.check_in_time} WIB)
                            </span>
                        </div>
                        <StatusBadge variant={todayAttendance.status} />
                    </div>
                ) : (
                    <Link
                        href="/student/attendance"
                        className="w-full"
                        dusk="btn-presensi-mobile"
                        data-testid="btn-presensi-mobile"
                    >
                        <Button variant="primary" size="lg" className="w-full justify-center text-[15px] font-extrabold py-3.5 shadow-md" icon={<FiCamera className="w-4 h-4" />}>
                            <span>PRESENSI MASUK SEKARANG</span>
                        </Button>
                    </Link>
                )}

                {/* REKAP BULAN INI */}
                <div className="space-y-3">
                    <h3 className="text-[13px] font-bold text-text-primary uppercase tracking-wider">
                        Rekapitulasi Kehadiran Bulan Ini
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        <StatCard label="HADIR" value={stats.present} />
                        <StatCard label="TELAT" value={stats.late} />
                        <StatCard label="ALPA" value={absent} />
                    </div>
                </div>

                {/* Menu Utama Navigasi Grid */}
                <div className="space-y-3">
                    <h3 className="text-[13px] font-bold text-text-primary uppercase tracking-wider">
                        Menu Utama
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link
                            href="/student/attendance"
                            className="bg-surface border border-border rounded-2xl p-5 shadow-card hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between"
                        >
                            <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center text-[20px] mb-3">
                                <FiCamera />
                            </div>
                            <div>
                                <span className="text-[15px] font-bold text-text-primary block leading-tight">
                                    Live Presensi
                                </span>
                                <span className="text-[12px] text-text-muted mt-0.5 block">
                                    Presensi foto selfie & verifikasi lokasi GPS geofence
                                </span>
                            </div>
                        </Link>

                        <Link
                            href="/student/history"
                            className="bg-surface border border-border rounded-2xl p-5 shadow-card hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between"
                        >
                            <div className="w-11 h-11 rounded-xl bg-muted text-text-primary flex items-center justify-center text-[20px] mb-3">
                                <FiCalendar />
                            </div>
                            <div>
                                <span className="text-[15px] font-bold text-text-primary block leading-tight">
                                    Riwayat Absensi
                                </span>
                                <span className="text-[12px] text-text-muted mt-0.5 block">
                                    Rekap log kehadiran dan kalender presensi bulanan
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
