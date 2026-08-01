import { router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { StatCard, StatusBadge, Button } from "@/Components";
import type { StatusVariant } from "@/types/component";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
    total_students: number;
    verified_present: number;
    late: number;
    sick_permit: number;
    absent: number;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface AttentionStudent {
    id: number;
    name: string;
    nis: string;
    nisn: string;
    status: string; // Present | Late | Absent | Pending | Permission
    check_in_time: string | null;
    keterangan: string | null;
    leave_request_id: number | null;
}

interface DashboardProps {
    stats: Stats;
    pendingLeaveCount: number;
    classes: SchoolClass[];
    selectedClassId: number | null;
    classDetail: {
        class: SchoolClass;
        date: string;
        students: AttentionStudent[];
    } | null;
    selectedDate: string;
    todayAttendance: unknown[];
    monthlyStats: unknown;
    overview: unknown;
    monthlyTrend: unknown;
    weeklyTrend: unknown;
    studentDetail: unknown;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusConfig: Record<
    string,
    { variant: StatusVariant; label: string; timeColor?: string }
> = {
    Present: { variant: "present", label: "HADIR" },
    Late: { variant: "late", label: "TERLAMBAT", timeColor: "text-warning" },
    Absent: { variant: "absent", label: "ALPA" },
    Pending: { variant: "pending", label: "PENDING IZIN" },
    Permission: { variant: "approved", label: "DIIZINKAN" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard({
    stats,
    pendingLeaveCount,
    classes,
    selectedClassId,
    classDetail,
    selectedDate,
}: DashboardProps) {
    // ── Handlers ──
    const handleClassFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(
            "/dashboard",
            { class_id: e.target.value || undefined, date: selectedDate },
            { preserveState: true, replace: true },
        );
    };

    const handleDateFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(
            "/dashboard",
            { class_id: selectedClassId || undefined, date: e.target.value },
            { preserveState: true, replace: true },
        );
    };

    // ── Table students: use classDetail when a class is selected ──
    const students: AttentionStudent[] = classDetail?.students ?? [];

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <AdminLayout title="Dashboard Admin" activeMenu="Dashboard">
            {/* ── Header: "Monitoring Live" + Filter ── */}
            <div className="bg-surface border border-border rounded-xl p-4 mb-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-[20px] font-bold text-text-primary font-inter">
                        Monitoring Live
                    </h1>

                    <div className="flex flex-wrap items-center gap-5">
                        {/* Filter Kelas */}
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] text-text-muted font-inter whitespace-nowrap">
                                Filter Kelas:
                            </span>
                            <select
                                value={selectedClassId ?? ""}
                                onChange={handleClassFilter}
                                className="border border-border rounded-lg px-3 py-1.5 text-[13px] font-inter text-text-primary bg-surface focus:ring-2 focus:ring-primary/30 focus:outline-none min-w-[140px]"
                            >
                                <option value="">Semua Kelas</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tanggal */}
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] text-text-muted font-inter whitespace-nowrap">
                                <i className="fas fa-calendar-alt mr-1 text-text-inactive" />
                                Tanggal:
                            </span>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={handleDateFilter}
                                className="border border-border rounded-lg px-3 py-1.5 text-[13px] font-inter text-text-primary bg-surface focus:ring-2 focus:ring-primary/30 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
                <StatCard
                    label="Total Siswa"
                    value={stats.total_students}
                    color="grey"
                />
                <StatCard
                    label="Hadir Terdata"
                    value={stats.verified_present}
                    color="green"
                />
                <StatCard label="Terlambat" value={stats.late} color="amber" />
                <StatCard
                    label="Sakit / Izin"
                    value={stats.sick_permit}
                    color="blue"
                />
                <StatCard
                    label="Alpa (Kosong)"
                    value={stats.absent}
                    color="red"
                />
            </section>

            {/* ── Perhatian Khusus Hari Ini ── */}
            <section className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
                {/* Section header */}
                <div className="px-6 py-4 border-b border-border flex items-center bg-muted justify-between">
                    <h2 className="text-[15px] font-bold text-text-primary font-inter">
                        Perhatian Khusus Hari Ini
                    </h2>
                    {pendingLeaveCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger-bg text-danger text-[12px] font-semibold font-inter">
                            <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                            {pendingLeaveCount} izin menunggu
                        </span>
                    )}
                </div>

                {!selectedClassId ? (
                    /* ── Prompt to select a class ── */
                    <div className="py-16 flex flex-col items-center gap-3 text-text-inactive">
                        <i className="fas fa-filter text-3xl" />
                        <p className="text-[14px] font-inter">
                            Pilih kelas di filter atas untuk menampilkan data
                            siswa.
                        </p>
                    </div>
                ) : students.length === 0 ? (
                    /* ── Empty state ── */
                    <div className="py-16 flex flex-col items-center gap-3 text-text-inactive">
                        <i className="fas fa-check-circle text-3xl text-success" />
                        <p className="text-[14px] font-inter">
                            Semua siswa sudah hadir tepat waktu hari ini.
                        </p>
                    </div>
                ) : (
                    /* ── Table ── */
                    <div className="overflow-x-auto">
                        <table className="w-full font-inter">
                            <thead>
                                <tr className="border-b border-border bg-muted">
                                    <th className="px-6 py-3 text-left text-[12px] font-semibold text-text-muted uppercase tracking-wide w-[140px]">
                                        NISN
                                    </th>
                                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                                        Nama Siswa
                                    </th>
                                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-text-muted uppercase tracking-wide w-[160px]">
                                        Status Hari Ini
                                    </th>
                                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                                        Waktu / Keterangan
                                    </th>
                                    <th className="px-4 py-3 text-right text-[12px] font-semibold text-text-muted uppercase tracking-wide w-[160px]">
                                        Tindakan
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s) => {
                                    const cfg =
                                        statusConfig[s.status] ??
                                        statusConfig["Absent"];
                                    const isAbsent = s.status === "Absent";
                                    const isPending = s.status === "Pending";
                                    const isLate = s.status === "Late";
                                    const isPresent = s.status === "Present";

                                    return (
                                        <tr
                                            key={s.id}
                                            className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                                        >
                                            {/* NISN */}
                                            <td className="px-6 py-3.5 text-[14px] text-text-primary font-semibold">
                                                {s.nisn || s.nis}
                                            </td>

                                            {/* Nama Siswa */}
                                            <td className="px-4 py-3.5 text-[14px] text-text-primary">
                                                {s.name}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-4 py-3.5">
                                                <StatusBadge
                                                    variant={cfg.variant}
                                                    label={cfg.label}
                                                />
                                            </td>

                                            {/* Waktu / Keterangan */}
                                            <td className="px-4 py-3.5 text-[14px]">
                                                {isAbsent ? (
                                                    <span className="text-text-placeholder">
                                                        Belum ada kabar
                                                    </span>
                                                ) : isLate ? (
                                                    <span
                                                        className={
                                                            cfg.timeColor ??
                                                            "text-text-primary"
                                                        }
                                                    >
                                                        {s.check_in_time
                                                            ? `${s.check_in_time} WIB`
                                                            : "—"}
                                                    </span>
                                                ) : isPresent ? (
                                                    <span className="text-text-primary">
                                                        {s.check_in_time
                                                            ? `${s.check_in_time} WIB`
                                                            : "—"}
                                                    </span>
                                                ) : (
                                                    <span className="text-text-secondary">
                                                        {s.keterangan ?? "—"}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Tindakan */}
                                            <td className="px-4 py-3.5 text-right">
                                                {isAbsent ? (
                                                    <span className="text-text-placeholder text-[14px]">
                                                        —
                                                    </span>
                                                ) : isPending ? (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.get(
                                                                "/leave-verification",
                                                            )
                                                        }
                                                    >
                                                        Verifikasi Izin
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.get(
                                                                "/master-data",
                                                                {
                                                                    highlight:
                                                                        s.id,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        Lihat Detail
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}
