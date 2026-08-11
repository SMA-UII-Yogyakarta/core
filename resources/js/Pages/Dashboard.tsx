import { useState } from "react";
import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { StatCard, StatusBadge, Button, AttendanceChart } from "@/Components";
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
    monthlyTrend,
}: DashboardProps) {
    const [period, setPeriod] = useState("Bulanan"); // "Harian" | "Bulanan" | "Semester"

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

    const avgAttendance = stats.total_students > 0 
        ? ((stats.verified_present / stats.total_students) * 100).toFixed(1) + "%" 
        : "0%";

    const monthlyTrendData = (monthlyTrend as any)?.months ?? [];

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <AppShell title="Dashboard Admin">
            {/* ── Page Header: Title + Period Toggle ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-[24px] font-bold text-text-primary font-inter tracking-tight">
                    Statistik Kehadiran Sekolah (Desktop)
                </h1>

                {/* Period Selector (Segmented Control) */}
                <div className="flex bg-slate-200/60 p-1 rounded-xl select-none self-start sm:self-auto shadow-sm border border-slate-300/30">
                    {["Harian", "Bulanan", "Semester"].map((p) => {
                        const isPeriodActive = period === p;
                        return (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-5 py-1.5 text-[13px] font-bold font-inter rounded-lg transition-all cursor-pointer ${
                                    isPeriodActive
                                        ? "bg-surface text-primary shadow-sm"
                                        : "text-text-secondary hover:text-text-primary bg-transparent"
                                }`}
                                type="button"
                            >
                                {p}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Stat Cards (4 Cards) ── */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                    label="Rata-rata Kehadiran"
                    value={avgAttendance}
                    color="grey"
                />
                <StatCard
                    label="Siswa Terlambat"
                    value={stats.late}
                    color="grey"
                />
                <StatCard
                    label="Pengajuan Izin"
                    value={stats.sick_permit}
                    color="grey"
                />
                <StatCard
                    label="Absensi Tanpa Ket."
                    value={stats.absent}
                    color="red"
                />
            </section>

            {/* ── Chart: Tren Kehadiran Bulanan ── */}
            <section className="bg-surface border border-border rounded-xl p-6 shadow-card mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[15px] font-bold text-text-primary font-inter">
                        Tren Kehadiran Bulanan (Semester Ganjil)
                    </h2>
                    <span className="text-[12px] text-text-muted font-medium font-inter">
                        Januari 2026 - Juni 2026
                    </span>
                </div>
                <div className="h-[220px]">
                    <AttendanceChart data={monthlyTrendData} type="line" height={220} />
                </div>
            </section>

            {/* ── Perhatian Khusus Hari Ini ── */}
            <section className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
                {/* Section header containing title & filters */}
                <div className="px-6 py-4 border-b border-border flex flex-wrap items-center bg-muted justify-between gap-4">
                    <div className="flex items-center gap-3">
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
                                                                "/leave-requests/verification",
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
        </AppShell>
    );
}
