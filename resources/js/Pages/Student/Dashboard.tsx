import { Link } from "@inertiajs/react";
import { FiCalendar, FiCamera, FiCheckCircle } from "react-icons/fi";
import { Button, DashboardHero, PageHeader, StatCard, StatusBadge } from "@/Components";
import AppShell from "@/Layouts/AppShell";

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
    const totalDays = (stats as unknown as { total_days?: number }).total_days ?? stats.present + stats.late + absent;
    const presentPct = totalDays > 0 ? Math.round((stats.present / totalDays) * 100) : 0;
    const latePct = totalDays > 0 ? Math.round((stats.late / totalDays) * 100) : 0;
    const absentPct = totalDays > 0 ? Math.round((absent / totalDays) * 100) : 0;

    return (
        <AppShell title="Overview Siswa">
            <div className="flex flex-col gap-4 sm:gap-6 font-inter">
                <PageHeader
                    title={`Selamat Datang, ${student.name}`}
                    description={`Siswa Kelas ${className} • NIS: ${student.nis} (NISN: ${student.nisn || "-"})`}
                    className="hidden lg:flex shrink-0 mb-4"
                />

                {/* Hero Greeting Card */}
                <DashboardHero
                    title={student.name}
                    description={`Kelas ${className}`}
                    descriptionClassName="text-accent text-[12px] sm:text-[13px] font-semibold"
                    dusk="student-greeting-card"
                    data-testid="student-greeting-card"
                />

                {/* Primary Action Button */}
                {todayAttendance ? (
                    <div
                        className="rounded-2xl px-4 py-3 sm:py-3.5 flex items-center justify-between bg-success-bg border border-success/30 text-success shadow-card"
                        dusk="today-attendance-done"
                        data-testid="today-attendance-done"
                    >
                        <div className="flex items-center gap-2">
                            <FiCheckCircle className="text-[18px]" />
                            <span className="font-bold text-[13px] sm:text-[14px]">
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
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full justify-center text-[14px] sm:text-[15px] font-extrabold py-3 sm:py-3.5 shadow-md rounded-xl"
                            icon={<FiCamera className="w-4 h-4" />}
                        >
                            <span>PRESENSI MASUK SEKARANG</span>
                        </Button>
                    </Link>
                )}

                {/* REKAP BULAN INI */}
                <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex items-center justify-between px-0.5">
                        <h3 className="text-[12px] sm:text-[13px] font-bold text-text-muted sm:text-text-primary uppercase tracking-wider">
                            Rekapitulasi Kehadiran Bulan Ini
                        </h3>
                        {totalDays > 0 && (
                            <span className="text-[11px] text-text-muted font-medium">
                                Total {totalDays} hari aktif
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                        <StatCard
                            label="HADIR"
                            value={stats.present}
                            color="green"
                            indicatorDot="green"
                            percentage={presentPct}
                            percentageColor="text-success"
                            subtitle="tepat waktu"
                        />
                        <StatCard
                            label="TELAT"
                            value={stats.late}
                            color="amber"
                            indicatorDot="amber"
                            percentage={latePct}
                            percentageColor="text-warning"
                            subtitle="lewat jam"
                        />
                        <StatCard
                            label="ALPA"
                            value={absent}
                            color="red"
                            indicatorDot="red"
                            percentage={absentPct}
                            percentageColor="text-danger"
                            subtitle="tanpa kabar"
                        />
                    </div>
                </div>

                {/* Menu Utama Navigasi Grid */}
                <div className="space-y-2.5 sm:space-y-3">
                    <h3 className="text-[12px] sm:text-[13px] font-bold text-text-muted sm:text-text-primary uppercase tracking-wider px-0.5">
                        Menu Utama
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href="/student/attendance"
                            className="bg-surface border border-border rounded-2xl p-3.5 sm:p-4 shadow-card hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-[18px] mb-2.5 group-hover:scale-105 transition-transform">
                                <FiCamera />
                            </div>
                            <div>
                                <span className="text-[13px] sm:text-[14px] font-bold text-text-primary block leading-tight">
                                    Live Presensi
                                </span>
                                <span className="text-[11px] text-text-muted mt-0.5 block truncate sm:whitespace-normal">
                                    Selfie & verifikasi GPS
                                </span>
                            </div>
                        </Link>

                        <Link
                            href="/student/history"
                            className="bg-surface border border-border rounded-2xl p-3.5 sm:p-4 shadow-card hover:border-warning/40 active:scale-[0.98] transition-all flex flex-col justify-between group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center text-[18px] mb-2.5 group-hover:scale-105 transition-transform">
                                <FiCalendar />
                            </div>
                            <div>
                                <span className="text-[13px] sm:text-[14px] font-bold text-text-primary block leading-tight">
                                    Riwayat Presensi
                                </span>
                                <span className="text-[11px] text-text-muted mt-0.5 block truncate sm:whitespace-normal">
                                    Kalender presensi & rekap
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
