import { router, Link } from "@inertiajs/react";
import {
    FiCheckCircle,
    FiClock,
    FiFileText,
    FiUsers,
    FiCalendar,
    FiUserCheck,
    FiChevronRight,
    FiActivity,
} from "react-icons/fi";
import { Card, StatCard, NativeSelect, Button } from "@/Components";
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
            <div className="flex flex-col gap-6 font-inter">
                {/* 1. Hero Greeting & Real-Time Clock Card */}
                <div className="relative bg-primary text-white rounded-2xl p-5 sm:p-6 shadow-card overflow-hidden">
                    {/* Background Glow Effects */}
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-accent/15 blur-2xl pointer-events-none" />
                    <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-white/70 text-[11px] font-bold tracking-wider uppercase mb-1">
                                    {currentDate}
                                </p>
                                <h1 className="text-white text-[20px] sm:text-[24px] font-bold leading-tight truncate">
                                    Selamat Datang, {guardian?.name ?? "Wali Murid"}
                                </h1>
                                <p className="text-white/80 text-[13px] font-medium mt-1">
                                    Portal Wali Murid · SMA UII Yogyakarta
                                </p>
                            </div>

                            {/* Digital Clock Display */}
                            <div className="self-start sm:self-auto shrink-0 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-4 py-2.5 text-right">
                                <p className="text-[22px] font-extrabold font-mono text-white leading-none">
                                    {currentTime}
                                </p>
                                <p className="text-[9px] font-bold text-accent uppercase tracking-widest mt-1">
                                    WIB
                                </p>
                            </div>
                        </div>

                        {/* Status Quick Pills */}
                        <div className="flex items-center gap-2.5 mt-5 flex-wrap">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-medium bg-white/15 text-white backdrop-blur-xs border border-white/10">
                                <FiUsers className="w-3.5 h-3.5 text-accent" />
                                <span>{students.length} Siswa Terdaftar</span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-medium bg-white/10 text-white/90 border border-white/5">
                                <FiCalendar className="w-3.5 h-3.5 text-white/70" />
                                <span>Tahun Ajaran 2026/2027</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Selector Profil Anak */}
                <Card className="p-5 border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <label className="text-[12px] font-bold text-text-primary uppercase tracking-wider block font-inter">
                                Pilih Profil Anak
                            </label>
                            <p className="text-[12px] text-text-muted mt-0.5">
                                Pilih siswa untuk melihat presensi dan riwayat izin ketidakhadiran
                            </p>
                        </div>
                        <div className="w-full sm:w-80 min-w-0 max-w-full">
                            <NativeSelect
                                value={selectedStudentId?.toString() ?? ""}
                                onChange={(e) => handleSelectStudent(e.target.value)}
                            >
                                {students.map((s) => (
                                    <option key={s.id} value={s.id.toString()}>
                                        {s.name} ({s.class?.name ?? "-"}) — NIS: {s.nis}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>
                    </div>
                </Card>

                {/* 3. Status Kehadiran Hari Ini Card */}
                <Card
                    className={`p-6 text-center border-2 flex flex-col items-center justify-center transition-all ${
                        todayAttendance
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-amber-500/30 bg-amber-500/5"
                    }`}
                >
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3">
                        STATUS PRESENSI HARI INI ({new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })})
                    </p>
                    <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white mb-3.5 shadow-lg transition-transform hover:scale-105 ${
                            todayAttendance
                                ? "bg-emerald-500 shadow-emerald-500/25"
                                : "bg-amber-500 shadow-amber-500/25"
                        }`}
                    >
                        {todayAttendance ? (
                            <FiCheckCircle className="w-8 h-8" />
                        ) : (
                            <FiClock className="w-8 h-8" />
                        )}
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-1">
                        <h3 className="text-[18px] sm:text-[20px] font-bold text-text-primary">
                            {todayAttendance ? "Anak Anda Telah Hadir" : "Belum Melakukan Presensi"}
                        </h3>
                    </div>

                    <p className="text-[13px] text-text-muted mt-1 max-w-md">
                        {todayAttendance?.check_in_time ? (
                            <>
                                Presensi tercatat pada pukul <strong className="text-text-primary font-mono font-bold">{todayAttendance.check_in_time} WIB</strong>
                            </>
                        ) : (
                            "Jam sekolah aktif 07:00 – 15:30 WIB. Pastikan siswa melakukan scan QR saat tiba di sekolah."
                        )}
                    </p>
                </Card>

                {/* 4. Action Cards Side-by-Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="p-5 hover:border-primary/40 transition-all flex flex-col justify-between group">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <FiActivity className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-[15px] font-bold text-text-primary">
                                    Riwayat Kehadiran
                                </h4>
                                <p className="text-[12px] text-text-muted mt-1 leading-relaxed">
                                    Lihat laporan lengkap kehadiran bulanan, rekapan keterlambatan, dan riwayat presensi harian anak Anda.
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-border flex justify-end">
                            <Link href="/guardian/history">
                                <Button variant="outline" size="sm" icon={<FiChevronRight className="w-4 h-4" />}>
                                    Lihat Riwayat
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    <Card className="p-5 hover:border-accent/40 transition-all flex flex-col justify-between group bg-accent/5 border-accent/20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-accent/20 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <FiFileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-[15px] font-bold text-text-primary">
                                    Pengajuan Izin / Sakit
                                </h4>
                                <p className="text-[12px] text-text-muted mt-1 leading-relaxed">
                                    Kirim surat izin ketidakhadiran secara online langsung ke Wali Kelas lengkap dengan bukti foto/dokumen.
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-accent/20 flex justify-end">
                            <Link href="/guardian/leave-application">
                                <Button variant="primary" size="sm" icon={<FiChevronRight className="w-4 h-4" />}>
                                    Ajukan Izin Baru
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* 5. Ringkasan Semester Ini */}
                <div>
                    <h3 className="text-[13px] font-bold text-text-primary uppercase tracking-wider mb-3 font-inter flex items-center gap-2">
                        <FiUserCheck className="w-4 h-4 text-primary" />
                        <span>Ringkasan Semester Ini</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatCard
                            label="Hadir"
                            value={semesterStats?.present ?? 0}
                            color="green"
                            subtitle="Total Hari Presensi Masuk"
                        />
                        <StatCard
                            label="Sakit / Izin"
                            value={semesterStats?.sick_permit ?? 0}
                            color="amber"
                            subtitle="Permohonan Disetujui"
                        />
                        <StatCard
                            label="Alpa / Tanpa Keterangan"
                            value={semesterStats?.absent ?? 0}
                            color="red"
                            subtitle="Ketidakhadiran Tanpa Izin"
                        />
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
