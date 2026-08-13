import { useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { StatCard, StatusBadge, Button, AttendanceChart, Table, Card, PageHeader } from "@/Components";
import type { ChartDataPoint } from "@/Components/features/AttendanceChart";
import type { StatusVariant } from "@/types/component";
import type { Column } from "@/Components/ui/Table";
import { useInertiaPolling } from "@/hooks/useInertiaPolling";

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
    status: string;
    check_in_time: string | null;
    keterangan: string | null;
    leave_request_id: number | null;
}

interface MonthlyTrend {
    year: number;
    months: ChartDataPoint[];
}

interface WeeklyTrendPoint {
    label: string;
    total: number;
    present: number;
    late: number;
}

type Period = "Harian" | "Bulanan" | "Semester";

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
    monthlyTrend: MonthlyTrend | null;
    weeklyTrend: WeeklyTrendPoint[] | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { variant: StatusVariant; label: string; timeColor?: string }> = {
    Present: { variant: "present", label: "HADIR" },
    Late: { variant: "late", label: "TERLAMBAT", timeColor: "text-warning" },
    Absent: { variant: "absent", label: "ALPA" },
    Pending: { variant: "pending", label: "PENDING IZIN" },
    Permission: { variant: "approved", label: "DIIZINKAN" },
};

const PERIODS: Period[] = ["Harian", "Bulanan", "Semester"];

function semesterMonths(months: ChartDataPoint[], date: string): ChartDataPoint[] {
    const month = new Date(date).getMonth() + 1; // 1–12
    // Ganjil: Jan–Jun (1–6), Genap: Jul–Dec (7–12)
    const isOdd = month <= 6;
    return months.filter((_, idx) => {
        const m = idx + 1;
        return isOdd ? m <= 6 : m >= 7;
    });
}

function chartRangeLabel(period: Period, year: number, date: string): string {
    const month = new Date(date).getMonth() + 1;
    if (period === "Harian") {
        return "4 minggu terakhir";
    }
    if (period === "Bulanan") {
        return `Januari ${year} – Desember ${year}`;
    }
    const isOdd = month <= 6;
    return isOdd ? `Januari ${year} – Juni ${year}` : `Juli ${year} – Desember ${year}`;
}

function chartTitle(period: Period, date: string): string {
    if (period === "Harian") return "Tren Kehadiran Mingguan";
    if (period === "Bulanan") return "Tren Kehadiran Bulanan";
    const month = new Date(date).getMonth() + 1;
    const isOdd = month <= 6;
    return `Tren Kehadiran Bulanan (Semester ${isOdd ? "Ganjil" : "Genap"})`;
}

function toRatePoints(
    points: Array<{ label: string; present: number; late: number; total?: number; absent?: number }>,
): ChartDataPoint[] {
    return points.map((p) => {
        const total = typeof p.total === "number" ? p.total : p.present + p.late + (p.absent ?? 0);
        const rate = total > 0 ? Math.round(((p.present + p.late) / total) * 1000) / 10 : 0;
        return {
            label: p.label,
            present: p.present,
            late: p.late,
            absent: p.absent,
            rate,
        };
    });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard({
    stats,
    pendingLeaveCount,
    classes,
    selectedClassId,
    classDetail,
    selectedDate,
    monthlyTrend,
    weeklyTrend,
}: DashboardProps) {
    const [period, setPeriod] = useState<Period>("Bulanan");

    // ── Live Polling for Admin Stats (30s) ──────────────────────────────────
    useInertiaPolling({
        only: ["stats", "classDetail", "weeklyTrend", "monthlyTrend"],
        intervalMs: 30000,
    });

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

    const students: AttentionStudent[] = classDetail?.students ?? [];

    // Backend: verified_present = present + late already.
    const avgAttendanceFixed =
        stats.total_students > 0 ? ((stats.verified_present / stats.total_students) * 100).toFixed(1) + "%" : "0%";

    const year = monthlyTrend?.year ?? new Date(selectedDate).getFullYear();

    const chartData = useMemo<ChartDataPoint[]>(() => {
        if (period === "Harian") {
            const weeks = weeklyTrend ?? [];
            return toRatePoints(
                weeks.map((w) => ({
                    label: w.label,
                    present: w.present,
                    late: w.late,
                    total: w.total,
                })),
            );
        }

        const allMonths = monthlyTrend?.months ?? [];

        if (period === "Semester") {
            return toRatePoints(semesterMonths(allMonths, selectedDate));
        }

        return toRatePoints(allMonths);
    }, [period, weeklyTrend, monthlyTrend, selectedDate]);

    const presentPct = stats.total_students > 0 ? Math.round((stats.verified_present / stats.total_students) * 100) : 0;
    const izinPct = stats.total_students > 0 ? Math.round((stats.sick_permit / stats.total_students) * 100) : 0;
    const sakitAlpaSplit = stats.absent; // absent without note

    const attentionColumns: Column<AttentionStudent>[] = [
        {
            key: "nisn",
            header: "NISN",
            className: "w-[140px]",
            render: (s) => <span className="text-[14px] font-semibold text-text-primary">{s.nisn || s.nis}</span>,
        },
        {
            key: "name",
            header: "Nama Siswa",
            render: (s) => <span className="text-[14px] text-text-primary">{s.name}</span>,
        },
        {
            key: "status",
            header: "Status Hari Ini",
            className: "w-[160px]",
            render: (s) => {
                const cfg = statusConfig[s.status] ?? statusConfig["Absent"];
                return <StatusBadge variant={cfg.variant} label={cfg.label} />;
            },
        },
        {
            key: "waktu",
            header: "Waktu / Keterangan",
            render: (s) => {
                const cfg = statusConfig[s.status] ?? statusConfig["Absent"];
                const isAbsent = s.status === "Absent";
                const isLate = s.status === "Late";
                const isPresent = s.status === "Present";

                if (isAbsent) return <span className="text-text-placeholder text-[14px]">Belum ada kabar</span>;
                if (isLate || isPresent) {
                    const color = isLate ? (cfg.timeColor ?? "text-text-primary") : "text-text-primary";
                    return (
                        <span className={`${color} text-[14px]`}>
                            {s.check_in_time ? `${s.check_in_time} WIB` : "—"}
                        </span>
                    );
                }
                return <span className="text-text-secondary text-[14px]">{s.keterangan ?? "—"}</span>;
            },
        },
        {
            key: "actions",
            header: "Tindakan",
            className: "w-[160px]",
            render: (s) => {
                const isAbsent = s.status === "Absent";
                const isPending = s.status === "Pending";
                if (isAbsent)
                    return <span className="text-text-placeholder text-[14px] w-full block md:text-right">—</span>;
                if (isPending) {
                    return (
                        <div className="w-full flex md:justify-end">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => router.get("/leave-requests/verification")}
                            >
                                Verifikasi Izin
                            </Button>
                        </div>
                    );
                }
                return (
                    <div className="w-full flex md:justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.get("/master-data", { highlight: s.id })}
                        >
                            Lihat Detail
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppShell title="Dashboard Admin">
            {/* Page Header */}
            <PageHeader
                title="Statistik Kehadiran Sekolah"
                description="Ringkasan kehadiran institusi berdasarkan periode yang dipilih."
            >
                <div
                    className="flex bg-slate-200/60 p-1 rounded-xl select-none self-start sm:self-auto shadow-sm border border-slate-300/30"
                    role="tablist"
                    aria-label="Periode statistik"
                >
                    {PERIODS.map((p) => {
                        const isPeriodActive = period === p;
                        return (
                            <button
                                key={p}
                                role="tab"
                                aria-selected={isPeriodActive}
                                onClick={() => setPeriod(p)}
                                className={`px-4 sm:px-5 py-1.5 text-[12px] sm:text-[13px] font-bold font-inter rounded-lg transition-all cursor-pointer ${
                                    isPeriodActive
                                        ? "bg-accent text-primary shadow-sm"
                                        : "text-text-secondary hover:text-text-primary bg-transparent"
                                }`}
                                type="button"
                            >
                                {p}
                            </button>
                        );
                    })}
                </div>
            </PageHeader>

            {/* ── Mobile KPI (Figma: 2×2 Hadir/Alpa/Ijin/Sakit) ── */}
            <section className="grid grid-cols-2 gap-3 mb-5 lg:hidden">
                <article className="bg-surface border border-border rounded-xl p-3 shadow-sm">
                    <p className="text-[11px] text-text-muted font-inter">Hadir</p>
                    <p className="text-[20px] font-bold text-primary font-inter mt-1">
                        {stats.verified_present}
                        <span className="text-text-inactive font-normal mx-1">||</span>
                        <span className="text-primary">{presentPct}%</span>
                    </p>
                </article>
                <article className="bg-surface border border-border rounded-xl p-3 shadow-sm">
                    <p className="text-[11px] text-text-muted font-inter">Alpa</p>
                    <p className="text-[20px] font-bold text-danger font-inter mt-1">{sakitAlpaSplit}</p>
                </article>
                <article className="bg-surface border border-border rounded-xl p-3 shadow-sm">
                    <p className="text-[11px] text-text-muted font-inter">Ijin</p>
                    <p className="text-[20px] font-bold text-success font-inter mt-1">
                        {stats.sick_permit}
                        <span className="text-text-inactive font-normal mx-1">||</span>
                        <span>{izinPct}%</span>
                    </p>
                </article>
                <article className="bg-surface border border-border rounded-xl p-3 shadow-sm">
                    <p className="text-[11px] text-text-muted font-inter">Terlambat</p>
                    <p className="text-[20px] font-bold text-warning font-inter mt-1">{stats.late}</p>
                </article>
            </section>

            {/* ── Desktop Stat Cards (Figma 4 cards) ── */}
            <section className="hidden lg:grid grid-cols-4 gap-6 mb-6">
                <StatCard label="Rata-rata Kehadiran" value={avgAttendanceFixed} color="grey" />
                <StatCard label="Siswa Terlambat" value={stats.late} color="grey" />
                <StatCard label="Pengajuan Izin" value={stats.sick_permit} color="grey" />
                <StatCard label="Absensi Tanpa Ket." value={stats.absent} color="red" />
            </section>

            {/* ── Chart ── */}
            <Card className="mb-6">
                <Card.Body className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
                        <h2 className="text-[15px] font-bold text-text-primary font-inter">
                            {chartTitle(period, selectedDate)}
                        </h2>
                        <span className="text-[12px] text-text-muted font-medium font-inter">
                            {chartRangeLabel(period, year, selectedDate)}
                        </span>
                    </div>
                    <div className="h-[200px] sm:h-[220px]">
                        {chartData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-text-inactive text-[13px] font-inter">
                                Belum ada data tren untuk periode ini.
                            </div>
                        ) : (
                            <AttendanceChart data={chartData} type="rate" height={220} />
                        )}
                    </div>
                </Card.Body>
            </Card>

            {/* ── Perhatian Khusus Hari Ini (ops layer beyond pure Figma) ── */}
            <Card className="mb-6">
                <Card.Body className="px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
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

                    <div className="flex flex-wrap items-center gap-4 sm:gap-5">
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
                </Card.Body>
            </Card>

            {!selectedClassId ? (
                <Card className="py-16 flex flex-col items-center gap-3 text-text-inactive">
                    <i className="fas fa-filter text-3xl" />
                    <p className="text-[14px] font-inter text-center px-4">
                        Pilih kelas di filter atas untuk menampilkan data siswa.
                    </p>
                </Card>
            ) : students.length === 0 ? (
                <Card className="py-16 flex flex-col items-center gap-3 text-text-inactive">
                    <i className="fas fa-check-circle text-3xl text-success" />
                    <p className="text-[14px] font-inter">Semua siswa sudah hadir tepat waktu hari ini.</p>
                </Card>
            ) : (
                <Table columns={attentionColumns} data={students} keyExtractor={(s) => s.id} />
            )}
        </AppShell>
    );
}
