import { Link } from "@inertiajs/react";
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

export default function StudentDashboard({
    student,
    todayAttendance,
    stats,
}: PageProps) {
    const alpa = stats.absent ?? 0;
    const className = student.class?.name ?? "-";

    return (
        <AppShell title="Dashboard Siswa">

            {/* ══════════════════════════════════════════════════
                MOBILE LAYOUT  (lg:hidden)
                Card sapaan navy + tombol kuning + rekap 3 kolom
            ══════════════════════════════════════════════════ */}
            <div className="lg:hidden flex flex-col gap-4">

                {/* Card sapaan — navy background */}
                <div
                    className="rounded-xl px-5 py-5"
                    style={{ background: "#2E3391" }}
                >
                    <p className="text-white/80 text-[11px] font-normal font-inter">
                        Selamat Pagi,
                    </p>
                    <p className="text-white text-[16px] font-bold font-inter mt-0.5">
                        {student.name}
                    </p>
                    <p
                        className="text-[11px] font-normal font-inter mt-1"
                        style={{ color: "#FAE62A" }}
                    >
                        Kelas {className} (Reguler)
                    </p>
                </div>

                {/* Tombol CTA kuning — PRESENSI MASUK SEKARANG */}
                {todayAttendance ? (
                    <div className="rounded-xl px-4 py-3.5 flex items-center justify-center gap-2 bg-success-bg border border-success-light">
                        <i className="fas fa-check-circle text-success text-[14px]" />
                        <span className="text-success font-bold text-[13px] tracking-wide">
                            SUDAH PRESENSI — {todayAttendance.check_in_time} WIB
                        </span>
                    </div>
                ) : (
                    <Link
                        href="/student/attendance"
                        className="rounded-xl flex items-center justify-center py-3.5 font-extrabold text-[13px] tracking-wide active:scale-[0.98] transition-transform shadow-sm"
                        style={{
                            background: "#FAE62A",
                            color: "#2E3391",
                            boxShadow: "0px 4px 10px rgba(250,230,42,0.3)",
                        }}
                    >
                        PRESENSI MASUK SEKARANG
                    </Link>
                )}

                {/* Rekap bulan ini — 3 kolom */}
                <div>
                    <p className="text-[12px] font-bold text-text-primary font-inter mb-2">
                        REKAP BULAN INI
                    </p>
                    <div className="grid grid-cols-3 gap-2.5">
                        {/* Hadir */}
                        <div className="bg-white border border-border rounded-xl p-2.5 flex flex-col items-center gap-1">
                            <span
                                className="text-[18px] font-bold leading-none"
                                style={{ color: "#10B981" }}
                            >
                                {stats.present}
                            </span>
                            <span className="text-[9px] font-bold text-text-inactive uppercase tracking-wide">
                                HADIR
                            </span>
                        </div>
                        {/* Telat */}
                        <div className="bg-white border border-border rounded-xl p-2.5 flex flex-col items-center gap-1">
                            <span
                                className="text-[18px] font-bold leading-none"
                                style={{ color: "#F59E0B" }}
                            >
                                {stats.late}
                            </span>
                            <span className="text-[9px] font-bold text-text-inactive uppercase tracking-wide">
                                TELAT
                            </span>
                        </div>
                        {/* Alpa */}
                        <div className="bg-white border border-border rounded-xl p-2.5 flex flex-col items-center gap-1">
                            <span className="text-[18px] font-bold leading-none text-text-primary">
                                {alpa}
                            </span>
                            <span className="text-[9px] font-bold text-text-inactive uppercase tracking-wide">
                                ALPA
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════
                DESKTOP LAYOUT  (hidden lg:block)
                Header text + 3 stat cards + CTA card besar
            ══════════════════════════════════════════════════ */}
            <div className="hidden lg:block">

                {/* Header */}
                <div className="mb-7">
                    <h1 className="text-[22px] font-bold text-text-primary font-inter mb-1.5">
                        Selamat Datang di Portal Siswa
                    </h1>
                    <p className="text-[13px] text-text-muted font-inter">
                        Kelola kehadiran dan pantau kedisiplinan belajar Anda secara real-time.
                    </p>
                </div>

                {/* Stat cards — 3 kolom */}
                <section className="grid grid-cols-3 gap-4 mb-7">
                    {/* Hadir */}
                    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
                        <span
                            className="text-[32px] font-bold leading-none mb-2 font-inter"
                            style={{ color: "#2E3391" }}
                        >
                            {stats.present} Hari
                        </span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-inter">
                            Hadir Bulan Ini
                        </span>
                    </div>
                    {/* Terlambat */}
                    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
                        <span
                            className="text-[32px] font-bold leading-none mb-2 font-inter"
                            style={{ color: "#F59E0B" }}
                        >
                            {stats.late} Kali
                        </span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-inter">
                            Terlambat
                        </span>
                    </div>
                    {/* Alpa */}
                    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
                        <span
                            className="text-[32px] font-bold leading-none mb-2 font-inter"
                            style={{ color: "#EF4444" }}
                        >
                            {alpa}
                        </span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-inter">
                            Alpa
                        </span>
                    </div>
                </section>

                {/* CTA card — dashed border */}
                <section
                    className="rounded-xl flex flex-col items-center justify-center py-14 px-6"
                    style={{
                        background: "#F0F4FF",
                        border: "2px dashed #B8C5F5",
                    }}
                >
                    {todayAttendance ? (
                        <>
                            <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-[22px] mb-5 shadow-sm"
                                style={{ background: "#10B981" }}
                            >
                                <i className="fas fa-check-circle" />
                            </div>
                            <h2
                                className="text-[18px] font-bold font-inter mb-2"
                                style={{ color: "#2E3391" }}
                            >
                                Sudah Presensi Masuk
                            </h2>
                            <p className="text-[13px] text-text-muted font-inter text-center">
                                Anda telah melakukan presensi hari ini pada pukul{" "}
                                <strong>{todayAttendance.check_in_time}</strong> WIB.
                            </p>
                        </>
                    ) : (
                        <>
                            <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-[24px] mb-5 shadow-sm"
                                style={{ background: "#2E3391" }}
                            >
                                <i className="fas fa-camera" />
                            </div>
                            <h2
                                className="text-[18px] font-bold font-inter mb-2"
                                style={{ color: "#2E3391" }}
                            >
                                Belum Presensi Masuk
                            </h2>
                            <p className="text-[13px] text-text-muted font-inter text-center mb-7">
                                Sistem mendeteksi Anda belum melakukan presensi hari ini.
                            </p>
                            <Link
                                href="/student/attendance"
                                className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-bold text-[13px] tracking-wide text-white hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
                                style={{ background: "#2E3391" }}
                            >
                                <i className="fas fa-fingerprint" />
                                PRESENSI SEKARANG
                            </Link>
                        </>
                    )}
                </section>
            </div>
        </AppShell>
    );
}
