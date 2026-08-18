import { router } from "@inertiajs/react";
import { Link } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";

interface Student {
    id: number;
    name: string;
    class: { id: number; name: string } | null;
    nis: string;
}

interface TodayAttendance {
    id: number;
    status: string;
    check_in_time: string | null;
    attendance_date: string;
}

interface SemesterStats {
    present: number;
    sick_permit: number;
    absent: number;
}

interface PageProps {
    guardian: { id: number; name: string };
    students: Student[];
    selectedStudentId: number | null;
    selectedStudent: Student | null;
    todayAttendance: TodayAttendance | null;
    semesterStats: SemesterStats | null;
    // legacy props — kept for backward compat
    stats?: unknown;
    recentLeaves?: unknown;
    studentStats?: unknown;
    monthlyTrend?: unknown;
    recentHistory?: unknown;
}

export default function GuardianDashboard({
    guardian,
    students,
    selectedStudentId,
    selectedStudent: _selectedStudent,
    todayAttendance,
    semesterStats,
}: PageProps) {
    const handleSelectStudent = (val: string) => {
        router.get("/guardian", { student_id: val }, { preserveState: true });
    };

    const now = new Date();
    const currentDate = now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    const currentTime = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <AppShell title="Overview Wali Murid">
            <div className="flex flex-col gap-4 font-inter">
                {/* 1. Hero Greeting & Real-Time Clock Card */}
                <div className="relative bg-primary text-white rounded-2xl p-5 shadow-card overflow-hidden">
                    {/* Background Glows */}
                    <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-accent/10 blur-xl pointer-events-none" />
                    <div className="absolute -left-6 -top-6 w-28 h-28 rounded-full bg-white/5 blur-lg pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-white/70 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase">
                                    {currentDate}
                                </p>
                                <h2 className="text-white text-[20px] sm:text-[22px] font-bold leading-tight mt-1 truncate">
                                    Selamat datang, <br />
                                    <span>{guardian?.name ?? "Wali Murid"}</span>
                                </h2>
                                <p className="text-white/80 text-[12px] font-medium mt-1">
                                    Wali Murid · SMA UII Yogyakarta
                                </p>
                            </div>

                            {/* Digital Clock Display */}
                            <div className="text-right shrink-0 bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl px-3 py-2">
                                <p className="text-[20px] font-extrabold font-mono text-white leading-none">
                                    {currentTime}
                                </p>
                                <p className="text-[9px] font-bold text-accent uppercase tracking-widest mt-0.5">
                                    WIB
                                </p>
                            </div>
                        </div>

                        {/* Status Quick Pills */}
                        <div className="flex items-center gap-2 mt-4 flex-wrap">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-white/15 text-white backdrop-blur-xs border border-white/10">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span>{students.length} Siswa Terdaftar</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-white/10 text-white/90 border border-white/5">
                                <span>Tahun Ajaran 2026/2027</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 1. Selector Profil Anak (Figma: PILIH PROFIL ANAK) */}
                <div>
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                        PILIH PROFIL ANAK
                    </label>
                    <div className="relative">
                        <select
                            value={selectedStudentId?.toString() ?? ""}
                            onChange={(e) => handleSelectStudent(e.target.value)}
                            className="w-full h-12 appearance-none rounded-xl px-4 text-[14px] font-bold text-primary bg-surface border-2 border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 pr-10 cursor-pointer shadow-xs"
                        >
                            {students.map((s) => (
                                <option key={s.id} value={s.id.toString()}>
                                    {s.name} ({s.class?.name ?? "-"})
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-primary text-[14px]">
                            <i className="fas fa-chevron-down" />
                        </div>
                    </div>
                </div>

                {/* 2. Status Kehadiran Card (Figma: Status Hari Ini with checkmark circle) */}
                <div className="bg-surface border-2 border-emerald-400 rounded-2xl p-6 text-center shadow-card flex flex-col items-center">
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3">
                        STATUS HARI INI ({new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short" })})
                    </p>
                    <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[24px] mb-3 shadow-md shadow-emerald-500/20">
                        <i className={todayAttendance ? "fas fa-check" : "fas fa-clock"} />
                    </div>
                    <h3 className="text-[18px] font-bold text-text-primary">
                        {todayAttendance ? "Anak Anda Telah Hadir" : "Belum Melakukan Presensi"}
                    </h3>
                    <p className="text-[13px] text-text-muted mt-1">
                        {todayAttendance?.check_in_time ? (
                            <>
                                Presensi tercatat pukul <strong className="text-text-primary font-mono">{todayAttendance.check_in_time} WIB</strong>
                            </>
                        ) : (
                            "Jam sekolah aktif 07:00 – 15:30 WIB"
                        )}
                    </p>
                </div>

                {/* 3. Dua Kartu Aksi Utama Side by Side (Figma: Riwayat Lengkap & Ajukan Izin) */}
                <div className="grid grid-cols-2 gap-3.5">
                    <Link
                        href="/guardian/history"
                        className="bg-surface border border-border/80 rounded-2xl p-5 text-center shadow-card hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-2"
                    >
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center text-[20px]">
                            <i className="fas fa-history" />
                        </div>
                        <span className="text-[14px] font-bold text-primary">
                            Riwayat Lengkap
                        </span>
                    </Link>

                    <Link
                        href="/guardian/leave-application"
                        className="bg-accent rounded-2xl p-5 text-center shadow-card hover:bg-accent-light active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-2"
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-[20px]">
                            <i className="fas fa-file-medical" />
                        </div>
                        <span className="text-[14px] font-extrabold text-primary">
                            Ajukan Izin
                        </span>
                    </Link>
                </div>

                {/* 4. RINGKASAN SEMESTER INI (Figma: 3 white cards with 86 HADIR, 2 SAKIT/IZIN, 0 ALPA) */}
                <div>
                    <h3 className="text-[13px] font-bold text-text-primary uppercase tracking-wider mb-2.5">
                        RINGKASAN SEMESTER INI
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-surface border border-border rounded-xl p-3.5 text-center shadow-xs">
                            <span className="text-[24px] font-bold text-success block leading-none">
                                {semesterStats?.present ?? 0}
                            </span>
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1.5 block">
                                HADIR
                            </span>
                        </div>
                        <div className="bg-surface border border-border rounded-xl p-3.5 text-center shadow-xs">
                            <span className="text-[24px] font-bold text-primary block leading-none">
                                {semesterStats?.sick_permit ?? 0}
                            </span>
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1.5 block">
                                SAKIT/IZIN
                            </span>
                        </div>
                        <div className="bg-surface border border-border rounded-xl p-3.5 text-center shadow-xs">
                            <span className="text-[24px] font-bold text-danger block leading-none">
                                {semesterStats?.absent ?? 0}
                            </span>
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1.5 block">
                                ALPA
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Branding */}
                <p className="text-center text-[11px] text-text-muted/60 py-4 font-inter">
                    SMART Absen · SMA UII Yogyakarta
                </p>
            </div>
        </AppShell>
    );
}
