import { Link, router, usePage } from "@inertiajs/react";
import {
    FiActivity,
    FiCalendar,
    FiCheckCircle,
    FiChevronRight,
    FiClock,
    FiFileText,
    FiUserCheck,
    FiUsers,
} from "react-icons/fi";
import { Button, Card, DashboardHero, NativeSelect, PageHeader, StatCard, StatusBadge } from "@/Components";
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
    const { schoolName = "SMA UII Yogyakarta" } = usePage().props as { schoolName?: string };
    const handleSelectStudent = (val: string) => {
        router.get("/guardian", { student_id: val }, { preserveState: true });
    };

    return (
        <AppShell title="Overview Wali Murid">
            <div className="flex flex-col gap-6 font-inter">
                {/* 1. Page Header & Hero Greeting Card */}
                <PageHeader
                    title={`Selamat Datang, ${guardian?.name ?? "Wali Murid"}`}
                    description={`Portal Informasi Kehadiran & Pengajuan Izin Siswa · ${schoolName}`}
                    className="hidden lg:flex shrink-0 mb-4"
                />

                <DashboardHero
                    title="Pantauan Presensi Real-Time"
                    description={schoolName}
                    badges={[
                        {
                            icon: <FiUsers className="w-3.5 h-3.5 text-accent" />,
                            label: `${students.length} Siswa Terdaftar`,
                        },
                        {
                            icon: <FiCalendar className="w-3.5 h-3.5 text-white/70" />,
                            label: "Tahun Ajaran 2026/2027",
                        },
                    ]}
                />

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
                        todayAttendance ? "border-success/30 bg-success-bg" : "border-warning/30 bg-warning-bg"
                    }`}
                >
                    <div className="flex items-center justify-between w-full max-w-md mb-4">
                        <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                            Status Presensi Hari Ini
                        </p>
                        <StatusBadge variant={todayAttendance ? "hadir" : "alpa"} />
                    </div>

                    <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white mb-3.5 shadow-md ${
                            todayAttendance ? "bg-success" : "bg-warning"
                        }`}
                    >
                        {todayAttendance ? <FiCheckCircle className="w-8 h-8" /> : <FiClock className="w-8 h-8" />}
                    </div>

                    <h3 className="text-[18px] sm:text-[20px] font-bold text-text-primary mb-1">
                        {todayAttendance ? "Anak Anda Telah Hadir" : "Belum Melakukan Presensi"}
                    </h3>

                    <p className="text-[13px] text-text-muted max-w-md">
                        {todayAttendance?.check_in_time ? (
                            <>
                                Presensi tercatat pada pukul{" "}
                                <strong className="text-text-primary font-mono font-bold">
                                    {todayAttendance.check_in_time} WIB
                                </strong>
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
                            <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <FiActivity className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-[15px] font-bold text-text-primary">Riwayat Kehadiran</h4>
                                <p className="text-[12px] text-text-muted mt-1 leading-relaxed">
                                    Lihat laporan lengkap kehadiran bulanan, rekapan keterlambatan, dan riwayat presensi
                                    harian anak Anda.
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
                            <div className="w-12 h-12 rounded-xl bg-accent/20 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <FiFileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-[15px] font-bold text-text-primary">Pengajuan Izin / Sakit</h4>
                                <p className="text-[12px] text-text-muted mt-1 leading-relaxed">
                                    Kirim surat izin ketidakhadiran secara online langsung ke Wali Kelas lengkap dengan
                                    bukti foto/dokumen.
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
                <div className="space-y-3">
                    <h3 className="text-[13px] font-bold text-text-primary uppercase tracking-wider font-inter flex items-center gap-2">
                        <FiUserCheck className="w-4 h-4 text-primary" />
                        <span>Ringkasan Semester Ini</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatCard label="Hadir Tepat Waktu" value={semesterStats?.present ?? 0} />
                        <StatCard label="Sakit / Izin" value={semesterStats?.sick_permit ?? 0} />
                        <StatCard label="Alpa / Tanpa Keterangan" value={semesterStats?.absent ?? 0} />
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
