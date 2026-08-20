import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { Avatar, PageHeader, StatCard, Button, StatusBadge } from "@/Components";

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
    const alpa = stats.absent ?? 0;
    const className = student.class?.name ?? "-";

    const [currentTime, setCurrentTime] = useState<string>("");
    const [currentDate, setCurrentDate] = useState<string>("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }) + " WIB",
            );
            setCurrentDate(
                now.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                }),
            );
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <AppShell title="Overview Siswa">
            <div className="flex flex-col gap-6 font-inter">
                <PageHeader
                    title={`Selamat Datang, ${student.name}`}
                    description={`Siswa Kelas ${className} • NIS: ${student.nis} (NISN: ${student.nisn || "-"})`}
                />

                {/* Hero Greeting Card */}
                <div
                    className="relative bg-primary text-white rounded-2xl p-5 sm:p-6 shadow-card overflow-hidden"
                    dusk="student-greeting-card"
                    data-testid="student-greeting-card"
                >
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-white/80 text-[13px] font-medium">
                                {currentDate}
                            </p>
                            <h2 className="text-white text-[22px] font-bold leading-tight mt-0.5 truncate">
                                {student.name}
                            </h2>
                            <p className="text-accent text-[13px] font-semibold mt-1">
                                Kelas {className}
                            </p>
                        </div>

                        {/* Digital Clock Badge */}
                        <div className="text-right shrink-0 bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl px-3.5 py-2">
                            <p className="text-[20px] font-extrabold font-mono text-white leading-none">
                                {currentTime ? currentTime.replace(" WIB", "") : "--:--"}
                            </p>
                            <p className="text-[9px] font-bold text-accent uppercase tracking-widest mt-0.5">
                                WIB
                            </p>
                        </div>
                    </div>
                </div>

                {/* Primary Action Button */}
                {todayAttendance ? (
                    <div
                        className="rounded-xl px-4 py-3.5 flex items-center justify-between bg-success-bg border border-success/30 text-success shadow-xs"
                        dusk="today-attendance-done"
                        data-testid="today-attendance-done"
                    >
                        <div className="flex items-center gap-2">
                            <i className="fas fa-check-circle text-[18px]" />
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
                        <Button variant="primary" size="lg" className="w-full justify-center text-[15px] font-extrabold py-3.5 shadow-md">
                            <i className="fas fa-camera text-[16px] mr-2" />
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
                        <StatCard label="ALPA" value={alpa} />
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
                                <i className="fas fa-camera" />
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
                                <i className="fas fa-calendar-alt" />
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
