import { Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";

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
    absent?: number; // Not always provided, but we can default to 0
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
    return (
        <StudentLayout
            title="Dashboard Siswa"
            username={student.name}
            studentClass={student.class?.name}
        >
            {/* Header Text */}
            <div className="mb-8">
                <h1 className="text-[22px] font-bold text-primary font-inter mb-1.5">
                    Selamat Datang di Portal Siswa
                </h1>
                <p className="text-[13px] text-text-muted font-inter">
                    Kelola kehadiran dan pantau kedisiplinan belajar Anda secara real-time.
                </p>
            </div>

            {/* Stat Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <div className="bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
                    <span className="text-[32px] font-bold text-primary leading-none mb-2">
                        {stats.present} Hari
                    </span>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        Hadir Bulan Ini
                    </span>
                </div>
                <div className="bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
                    <span className="text-[32px] font-bold text-warning leading-none mb-2">
                        {stats.late} Kali
                    </span>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        Terlambat
                    </span>
                </div>
                <div className="bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
                    <span className="text-[32px] font-bold text-danger leading-none mb-2">
                        {stats.absent ?? 0}
                    </span>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        Alpa
                    </span>
                </div>
            </section>

            {/* Action Box */}
            <section className="bg-[#F8FAFC] border-2 border-dashed border-primary/40 rounded-xl flex flex-col items-center justify-center py-16 px-4">
                {todayAttendance ? (
                    <>
                        <div className="w-14 h-14 bg-success rounded-xl flex items-center justify-center text-white text-2xl mb-5 shadow-sm">
                            <i className="fas fa-check-circle" />
                        </div>
                        <h2 className="text-[18px] font-bold text-primary font-inter mb-2">
                            Sudah Presensi Masuk
                        </h2>
                        <p className="text-[13px] text-text-muted font-inter text-center mb-6">
                            Anda telah melakukan presensi hari ini pada pukul {todayAttendance.check_in_time} WIB.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-12 bg-primary rounded-xl flex items-center justify-center text-white text-[28px] mb-5 shadow-sm">
                            <i className="fas fa-camera" />
                        </div>
                        <h2 className="text-[18px] font-bold text-primary font-inter mb-2">
                            Belum Presensi Masuk
                        </h2>
                        <p className="text-[13px] text-text-muted font-inter text-center mb-6">
                            Sistem mendeteksi Anda belum melakukan presensi hari ini.
                        </p>
                        <Link
                            href="/student/live-attendance"
                            className="bg-primary text-white font-bold text-[13px] px-6 py-3 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            <i className="fas fa-fingerprint mr-2" />
                            PRESENSI SEKARANG
                        </Link>
                    </>
                )}
            </section>
        </StudentLayout>
    );
}
