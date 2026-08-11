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

function todayLabel(): string {
    return new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
    });
}

type StatusInfo = {
    borderColor: string;
    iconClass: string;
    iconColor: string;
    title: string;
    subtitle: string;
};

function getStatusInfo(att: TodayAttendance | null): StatusInfo {
    if (!att) {
        return {
            borderColor: "#E2E8F0",
            iconClass: "fas fa-clock",
            iconColor: "#94A3B8",
            title: "Belum Presensi",
            subtitle: "Siswa belum melakukan presensi hari ini.",
        };
    }
    const s = att.status.toLowerCase();
    if (s === "present") {
        return {
            borderColor: "#10B981",
            iconClass: "fas fa-check-circle",
            iconColor: "#10B981",
            title: "Anak Anda Telah Hadir",
            subtitle: `Presensi tercatat pukul ${att.check_in_time} WIB`,
        };
    }
    if (s === "late") {
        return {
            borderColor: "#F59E0B",
            iconClass: "fas fa-clock",
            iconColor: "#F59E0B",
            title: "Hadir Terlambat",
            subtitle: `Presensi tercatat pukul ${att.check_in_time} WIB`,
        };
    }
    return {
        borderColor: "#EF4444",
        iconClass: "fas fa-times-circle",
        iconColor: "#EF4444",
        title: "Tidak Hadir",
        subtitle: "Siswa tidak tercatat hadir hari ini.",
    };
}

export default function GuardianDashboard({
    students,
    selectedStudentId,
    todayAttendance,
    semesterStats,
}: PageProps) {
    const handleSelectStudent = (val: string) => {
        router.get("/guardian", { student_id: val }, { preserveState: true });
    };

    const info = getStatusInfo(todayAttendance);

    return (
        <AppShell title="Dashboard">
            {/* Desktop title */}
            <div className="hidden lg:block mb-7">
                <h1 className="text-[22px] font-bold text-text-primary font-inter">
                    Portal Orang Tua
                </h1>
                <p className="text-[13px] text-text-muted font-inter mt-1">
                    Pantau kehadiran dan izin anak Anda secara real-time.
                </p>
            </div>

            {/* ── Dropdown Pilih Profil Anak ── */}
            <div className="mb-4">
                <p className="text-[12px] font-bold text-text-muted uppercase tracking-wide mb-2 font-inter">
                    PILIH PROFIL ANAK
                </p>
                <div className="relative">
                    <select
                        value={selectedStudentId?.toString() ?? ""}
                        onChange={(e) => handleSelectStudent(e.target.value)}
                        className="w-full appearance-none rounded-xl px-4 py-3 text-[15px] font-bold font-inter focus:outline-none focus:ring-2 focus:ring-primary/30 pr-10"
                        style={{
                            border: "1px solid #2E3391",
                            color: "#2E3391",
                            background: "#FFFFFF",
                            boxShadow: "0px 4px 10px rgba(46,51,145,0.05)",
                        }}
                    >
                        {students.length === 0 && (
                            <option value="">Tidak ada data anak</option>
                        )}
                        {students.map((s) => (
                            <option key={s.id} value={s.id.toString()}>
                                {s.name} ({s.class?.name ?? "-"})
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                        <i
                            className="fas fa-chevron-down text-[14px]"
                            style={{ color: "#94A3B8" }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Status Card Hari Ini — border atas warna ── */}
            <div
                className="rounded-xl bg-white mb-4 flex flex-col items-center py-8 px-4 gap-1"
                style={{
                    borderWidth: "5px 1px 1px 1px",
                    borderStyle: "solid",
                    borderColor: info.borderColor,
                }}
            >
                <p className="text-[12px] font-bold text-text-muted uppercase tracking-wide font-inter mb-1">
                    STATUS HARI INI ({todayLabel()})
                </p>
                <i
                    className={`${info.iconClass} text-[45px] my-2`}
                    style={{ color: info.iconColor }}
                />
                <h2 className="text-[20px] font-bold text-text-primary font-inter text-center leading-tight">
                    {info.title}
                </h2>
                <p className="text-[13px] text-text-muted font-inter text-center mt-1">
                    {info.subtitle}
                </p>
            </div>

            {/* ── 2 Tombol Aksi ── */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <Link
                    href="/guardian/history"
                    className="flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl bg-white border border-border hover:bg-background transition-colors"
                >
                    <i
                        className="fas fa-history text-[20px]"
                        style={{ color: "#2E3391" }}
                    />
                    <span
                        className="text-[12px] font-bold font-inter"
                        style={{ color: "#2E3391" }}
                    >
                        Riwayat Lengkap
                    </span>
                </Link>

                <Link
                    href="/guardian/leave-application"
                    className="flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl transition-all active:scale-[0.98]"
                    style={{
                        background: "#FAE62A",
                        boxShadow: "0px 4px 10px rgba(250,230,42,0.3)",
                    }}
                >
                    <i
                        className="fas fa-file-medical text-[20px]"
                        style={{ color: "#2E3391" }}
                    />
                    <span
                        className="text-[12px] font-bold font-inter"
                        style={{ color: "#2E3391" }}
                    >
                        Ajukan Izin
                    </span>
                </Link>
            </div>

            {/* ── Ringkasan Semester Ini ── */}
            <div>
                <p className="text-[13px] font-bold text-text-primary font-inter mb-3">
                    RINGKASAN SEMESTER INI
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-white border border-border rounded-xl p-3 flex flex-col items-center gap-1.5">
                        <span
                            className="text-[18px] font-bold leading-none"
                            style={{ color: "#10B981" }}
                        >
                            {semesterStats?.present ?? 0}
                        </span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">
                            HADIR
                        </span>
                    </div>
                    <div className="bg-white border border-border rounded-xl p-3 flex flex-col items-center gap-1.5">
                        <span
                            className="text-[18px] font-bold leading-none"
                            style={{ color: "#2E3391" }}
                        >
                            {semesterStats?.sick_permit ?? 0}
                        </span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">
                            SAKIT/IZIN
                        </span>
                    </div>
                    <div className="bg-white border border-border rounded-xl p-3 flex flex-col items-center gap-1.5">
                        <span
                            className="text-[18px] font-bold leading-none"
                            style={{ color: "#EF4444" }}
                        >
                            {semesterStats?.absent ?? 0}
                        </span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">
                            ALPA
                        </span>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
