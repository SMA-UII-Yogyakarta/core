import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { MetricPill, Avatar } from "@/Components";

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
        <AppShell title="Dashboard Siswa">
            {/* ══════════════════════════════════════════════════
                MOBILE LAYOUT (lg:hidden)
            ══════════════════════════════════════════════════ */}
            <div className="lg:hidden flex flex-col gap-4 font-inter">
                {/* Card sapaan personal */}
                <div
                    className="rounded-2xl p-5 bg-primary text-white shadow-card flex items-center justify-between gap-3"
                    dusk="student-greeting-card"
                    data-testid="student-greeting-card"
                >
                    <div className="flex items-center gap-3.5 min-w-0">
                        <Avatar name={student.name} size="lg" variant="accent" />
                        <div className="min-w-0">
                            <p className="text-white/75 text-[11px] font-medium">Selamat Datang,</p>
                            <h2 className="text-white text-[16px] font-bold truncate leading-snug">
                                {student.name}
                            </h2>
                            <p className="text-[11px] font-semibold text-accent mt-0.5">
                                Kelas {className} • NIS: {student.nis}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Date & Time pill */}
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface border border-border text-[12px] font-medium text-text-secondary shadow-sm">
                    <span className="flex items-center gap-1.5 font-semibold text-text-primary">
                        <i className="far fa-calendar-alt text-primary" />
                        {currentDate || "Hari Ini"}
                    </span>
                    <span className="font-mono font-bold text-primary">{currentTime}</span>
                </div>

                {/* Tombol CTA Presensi */}
                {todayAttendance ? (
                    <div
                        className="rounded-2xl px-4 py-4 flex items-center justify-center gap-2.5 bg-success-bg border border-success-light shadow-sm"
                        dusk="today-attendance-done"
                        data-testid="today-attendance-done"
                    >
                        <i className="fas fa-check-circle text-success text-[18px]" />
                        <div>
                            <p className="text-success font-bold text-[13px] leading-tight">
                                SUDAH PRESENSI MASUK
                            </p>
                            <p className="text-success/80 text-[11px] font-mono mt-0.5">
                                Pukul {todayAttendance.check_in_time} WIB ({todayAttendance.status})
                            </p>
                        </div>
                    </div>
                ) : (
                    <Link
                        href="/student/attendance"
                        className="rounded-2xl flex items-center justify-center gap-2 py-4 font-extrabold text-[14px] tracking-wide bg-accent text-primary active:scale-[0.98] transition-transform shadow-md cursor-pointer"
                        dusk="btn-presensi-mobile"
                        data-testid="btn-presensi-mobile"
                    >
                        <i className="fas fa-camera text-[16px]" />
                        <span>PRESENSI MASUK SEKARANG</span>
                    </Link>
                )}

                {/* Rekap bulan ini */}
                <div className="bg-surface border border-border rounded-2xl p-4 shadow-card">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[12px] font-bold text-text-primary uppercase tracking-wider">
                            Rekap Bulan Ini
                        </p>
                        <Link
                            href="/student/history"
                            className="text-[12px] font-bold text-primary hover:underline flex items-center gap-1"
                        >
                            <span>Lihat Riwayat</span>
                            <i className="fas fa-chevron-right text-[10px]" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                        <MetricPill label="HADIR" value={stats.present} variant="success" dusk="stat-hadir" />
                        <MetricPill label="TELAT" value={stats.late} variant="warning" dusk="stat-telat" />
                        <MetricPill label="ALPA" value={alpa} variant="danger" dusk="stat-alpa" />
                    </div>
                </div>
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
