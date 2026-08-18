import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { Avatar } from "@/Components";

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
            {/* ══════════════════════════════════════════════════
                MOBILE LAYOUT (lg            {/* ══════════════════════════════════════════════════
                MOBILE LAYOUT (lg:hidden) — Native App Experience
            ══════════════════════════════════════════════════ */}
            <div className="lg:hidden flex flex-col gap-4 font-inter">
                {/* 1. Hero Greeting Card (Figma: Mobile Siswa Dashboard) */}
                <div
                    className="bg-primary text-white rounded-2xl p-5 shadow-card overflow-hidden"
                    dusk="student-greeting-card"
                    data-testid="student-greeting-card"
                >
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-white/80 text-[13px] font-medium">
                                Selamat Pagi,
                            </p>
                            <h2 className="text-white text-[20px] font-bold leading-tight mt-0.5 truncate">
                                {student.name}
                            </h2>
                            <p className="text-accent text-[13px] font-semibold mt-1">
                                Kelas {className}
                            </p>
                        </div>

                        {/* Digital Clock Badge */}
                        <div className="text-right shrink-0 bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl px-3 py-1.5">
                            <p className="text-[18px] font-extrabold font-mono text-white leading-none">
                                {currentTime ? currentTime.replace(" WIB", "") : "--:--"}
                            </p>
                            <p className="text-[9px] font-bold text-accent uppercase tracking-widest mt-0.5">
                                WIB
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Primary Action Button (Figma: PRESENSI MASUK SEKARANG) */}
                {todayAttendance ? (
                    <div
                        className="rounded-xl px-4 py-3.5 flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-xs"
                        dusk="today-attendance-done"
                        data-testid="today-attendance-done"
                    >
                        <i className="fas fa-check-circle text-[16px] text-emerald-600" />
                        <span className="font-bold text-[13px]">
                            Sudah Presensi Masuk ({todayAttendance.check_in_time} WIB)
                        </span>
                    </div>
                ) : (
                    <Link
                        href="/student/attendance"
                        className="w-full rounded-xl flex items-center justify-center gap-2 py-3.5 font-extrabold text-[14px] bg-accent text-primary hover:bg-accent-light active:scale-[0.98] transition-all shadow-md shadow-accent/30 cursor-pointer"
                        dusk="btn-presensi-mobile"
                        data-testid="btn-presensi-mobile"
                    >
                        <i className="fas fa-camera text-[15px]" />
                        <span>PRESENSI MASUK SEKARANG</span>
                    </Link>
                )}

                {/* 3. REKAP BULAN INI (Figma: 3 white cards with green/amber/dark numbers) */}
                <div>
                    <h3 className="text-[13px] font-bold text-text-primary uppercase tracking-wider mb-2.5">
                        REKAP BULAN INI
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-surface border border-border rounded-xl p-3.5 text-center shadow-xs">
                            <span className="text-[24px] font-bold text-success block leading-none" dusk="stat-hadir">
                                {stats.present}
                            </span>
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1.5 block">
                                HADIR
                            </span>
                        </div>
                        <div className="bg-surface border border-border rounded-xl p-3.5 text-center shadow-xs">
                            <span className="text-[24px] font-bold text-warning block leading-none" dusk="stat-terlambat">
                                {stats.late}
                            </span>
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1.5 block">
                                TELAT
                            </span>
                        </div>
                        <div className="bg-surface border border-border rounded-xl p-3.5 text-center shadow-xs">
                            <span className="text-[24px] font-bold text-text-primary block leading-none" dusk="stat-alpa">
                                {alpa}
                            </span>
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1.5 block">
                                ALPA
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. Menu Utama Navigasi Grid (Mobile: 2x2 || Tablet: 4x1) */}
                <div>
                    <h3 className="text-[13px] font-bold text-text-primary uppercase tracking-wider mb-2.5">
                        Menu Utama
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                        <Link
                            href="/student/attendance"
                            className="bg-surface border border-border/80 rounded-2xl p-4 shadow-card hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between"
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center text-[18px] mb-3">
                                <i className="fas fa-camera" />
                            </div>
                            <div>
                                <span className="text-[14px] font-bold text-text-primary block leading-tight">
                                    Live Presensi
                                </span>
                                <span className="text-[11px] text-text-muted mt-0.5 block">
                                    Kamera selfie & GPS
                                </span>
                            </div>
                        </Link>

                        <Link
                            href="/student/history"
                            className="bg-surface border border-border/80 rounded-2xl p-4 shadow-card hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between"
                        >
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-[18px] mb-3">
                                <i className="fas fa-calendar-alt" />
                            </div>
                            <div>
                                <span className="text-[14px] font-bold text-text-primary block leading-tight">
                                    Riwayat Absensi
                                </span>
                                <span className="text-[11px] text-text-muted mt-0.5 block">
                                    Rekap log bulanan
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Footer Branding */}
                <p className="text-center text-[11px] text-text-muted/60 py-4 font-inter">
                    SMART Absen · SMA UII Yogyakarta
                </p>
            </div>

            {/* ══════════════════════════════════════════════════
                DESKTOP LAYOUT (hidden lg:block)
            ══════════════════════════════════════════════════ */}
            <div className="hidden lg:block font-inter">
                {/* Header with live clock */}
                <div className="flex items-center justify-between mb-7">
                    <div className="flex items-center gap-4">
                        <Avatar name={student.name} size="xl" variant="primary" />
                        <div>
                            <h1 className="text-[24px] font-bold text-text-primary leading-snug">
                                Selamat Datang, {student.name}
                            </h1>
                            <p className="text-[13px] text-text-muted mt-0.5">
                                Siswa Kelas <strong className="text-text-primary">{className}</strong> • NIS:{" "}
                                {student.nis} (NISN: {student.nisn || "-"})
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-[13px] font-bold text-text-primary">{currentDate}</p>
                        <p className="text-[18px] font-bold text-primary font-mono mt-0.5">{currentTime}</p>
                    </div>
                </div>

                {/* Stat cards */}
                <section className="grid grid-cols-3 gap-5 mb-7">
                    <div
                        className="bg-surface border border-border rounded-2xl p-6 shadow-card flex flex-col items-center justify-center transition-all hover:border-primary/30"
                        dusk="desktop-stat-hadir"
                        data-testid="desktop-stat-hadir"
                    >
                        <div className="w-10 h-10 rounded-full bg-success-light text-success flex items-center justify-center text-[16px] mb-2">
                            <i className="fas fa-check" />
                        </div>
                        <span className="text-[34px] font-bold leading-none mb-1 font-inter text-primary">
                            {stats.present} Hari
                        </span>
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                            Hadir Tepat Waktu
                        </span>
                    </div>

                    <div
                        className="bg-surface border border-border rounded-2xl p-6 shadow-card flex flex-col items-center justify-center transition-all hover:border-warning/30"
                        dusk="desktop-stat-telat"
                        data-testid="desktop-stat-telat"
                    >
                        <div className="w-10 h-10 rounded-full bg-warning-bg text-warning flex items-center justify-center text-[16px] mb-2">
                            <i className="fas fa-clock" />
                        </div>
                        <span className="text-[34px] font-bold leading-none mb-1 font-inter text-warning">
                            {stats.late} Kali
                        </span>
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                            Terlambat
                        </span>
                    </div>

                    <div
                        className="bg-surface border border-border rounded-2xl p-6 shadow-card flex flex-col items-center justify-center transition-all hover:border-danger/30"
                        dusk="desktop-stat-alpa"
                        data-testid="desktop-stat-alpa"
                    >
                        <div className="w-10 h-10 rounded-full bg-danger-bg text-danger flex items-center justify-center text-[16px] mb-2">
                            <i className="fas fa-times" />
                        </div>
                        <span className="text-[34px] font-bold leading-none mb-1 font-inter text-danger">
                            {alpa} Hari
                        </span>
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                            Alpa / Tanpa Keterangan
                        </span>
                    </div>
                </section>

                {/* CTA Presensi Section */}
                <section
                    className="rounded-2xl flex flex-col items-center justify-center py-14 px-6 bg-surface border border-border shadow-card relative overflow-hidden"
                    dusk="student-attendance-cta"
                    data-testid="student-attendance-cta"
                >
                    {todayAttendance ? (
                        <>
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-[28px] mb-4 shadow-md bg-success">
                                <i className="fas fa-check-circle" />
                            </div>
                            <h2 className="text-[20px] font-bold text-primary mb-1">Sudah Presensi Masuk</h2>
                            <p className="text-[13px] text-text-muted text-center max-w-[400px]">
                                Anda telah melakukan presensi hari ini pada pukul{" "}
                                <strong className="text-text-primary">{todayAttendance.check_in_time}</strong> WIB
                                dengan status <strong>{todayAttendance.status}</strong>.
                            </p>
                            <Link
                                href="/student/history"
                                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                            >
                                <i className="fas fa-history" />
                                <span>Lihat Riwayat Lengkap</span>
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-[26px] mb-4 shadow-md bg-primary">
                                <i className="fas fa-camera" />
                            </div>
                            <h2 className="text-[20px] font-bold text-primary mb-1">Belum Presensi Hari Ini</h2>
                            <p className="text-[13px] text-text-muted text-center mb-6 max-w-[420px]">
                                Silakan ambil foto selfie dan pastikan Anda berada di dalam radius sekolah untuk
                                mencatat kehadiran.
                            </p>
                            <Link
                                href="/student/attendance"
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-[14px] tracking-wide text-white bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md cursor-pointer"
                                dusk="btn-presensi-desktop"
                                data-testid="btn-presensi-desktop"
                            >
                                <i className="fas fa-fingerprint text-[16px]" />
                                <span>PRESENSI SEKARANG</span>
                            </Link>
                        </>
                    )}
                </section>
            </div>
        </AppShell>
    );
}
