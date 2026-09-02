import { useMemo, useState, useEffect } from "react";
import { router, Link } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import {
    Avatar,
    StatCard,
    StatusBadge,
    Button,
    AttendanceChart,
    Table,
    Card,
    PageHeader,
    Drawer,
} from "@/Components";
import TabSwitcher from "@/Components/common/TabSwitcher";
import EmptyState from "@/Components/common/EmptyState";
import Input from "@/Components/ui/Input";
import NativeSelect from "@/Components/ui/NativeSelect";
import {
    FiDatabase,
    FiClock,
    FiUsers,
    FiFileText,
    FiFilter,
    FiCheckCircle,
    FiPieChart,
    FiAlertCircle,
    FiChevronRight,
    FiActivity,
    FiLayers,
} from "react-icons/fi";
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

function formatIndonesianDate(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

function semesterMonths(months: ChartDataPoint[], date: string): ChartDataPoint[] {
    const month = new Date(date).getMonth() + 1; // 1–12
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
    points: Array<{ label: string; present: number; late: number; total?: number; absent?: number; rate?: number | null }>,
): ChartDataPoint[] {
    return points.map((p) => {
        let rate: number | undefined;
        if (typeof p.rate === "number") {
            rate = p.rate;
        } else if (p.rate === null) {
            rate = undefined;
        } else {
            const total = typeof p.total === "number" ? p.total : p.present + p.late + (p.absent ?? 0);
            rate = total > 0 ? Math.round(((p.present + p.late) / total) * 1000) / 10 : undefined;
        }
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
    const [activeTab, setActiveTab] = useState<"overview" | "attention">(() => (selectedClassId ? "attention" : "overview"));
    const [period, setPeriod] = useState<Period>("Bulanan");
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    // Mobile Drawer filter state
    const [drawerClassId, setDrawerClassId] = useState<string>(selectedClassId ? String(selectedClassId) : "");
    const [drawerDate, setDrawerDate] = useState<string>(selectedDate);

    useEffect(() => {
        setDrawerClassId(selectedClassId ? String(selectedClassId) : "");
        setDrawerDate(selectedDate);
    }, [selectedClassId, selectedDate, mobileFilterOpen]);

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

    const handleApplyMobileFilter = () => {
        setMobileFilterOpen(false);
        router.get(
            "/dashboard",
            { class_id: drawerClassId || undefined, date: drawerDate },
            { preserveState: true, replace: true },
        );
    };

    const handleResetMobileFilter = () => {
        setDrawerClassId("");
        const today = new Date().toISOString().split("T")[0];
        setDrawerDate(today);
        setMobileFilterOpen(false);
        router.get(
            "/dashboard",
            { class_id: undefined, date: today },
            { preserveState: true, replace: true },
        );
    };

    const students: AttentionStudent[] = classDetail?.students ?? [];

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
    const latePct = stats.total_students > 0 ? Math.round((stats.late / stats.total_students) * 100) : 0;
    const sickPct = stats.total_students > 0 ? Math.round((stats.sick_permit / stats.total_students) * 100) : 0;
    const absentPct = stats.total_students > 0 ? Math.round((stats.absent / stats.total_students) * 100) : 0;

    const isFilterActive = Boolean(selectedClassId || (selectedDate && selectedDate !== new Date().toISOString().split("T")[0]));

    // Mobile Header Filter Button (only visible on mobile < sm when on attention tab)
    const mobileHeaderAction = activeTab === "attention" ? (
        <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all relative cursor-pointer"
            title="Filter Data Presensi"
            aria-label="Filter Data Presensi"
        >
            <FiFilter className="text-[15px]" />
            {isFilterActive && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent ring-2 ring-primary" />
            )}
        </button>
    ) : undefined;

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
            render: (s) => <span className="text-[14px] text-text-primary font-medium">{s.name}</span>,
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
                        <span className={`${color} text-[14px] font-medium`}>
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
        <AppShell title="Dashboard Admin" headerActions={mobileHeaderAction}>
            {/* Desktop PageHeader (hidden on mobile) */}
            <div className="hidden lg:block">
                <PageHeader
                    title="Statistik Kehadiran Sekolah"
                    description={
                        activeTab === "overview"
                            ? "Ringkasan kehadiran institusi berdasarkan periode yang dipilih."
                            : "Daftar siswa yang memerlukan tindak lanjut kehadiran hari ini."
                    }
                    className="shrink-0 mb-4"
                />
            </div>

            {/* Top Toolbar / Tab Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0 font-inter">
                <TabSwitcher
                    tabs={[
                        {
                            key: "overview",
                            label: "Statistik & Tren",
                            icon: <FiPieChart className="w-3.5 h-3.5" />,
                        },
                        {
                            key: "attention",
                            label: "Perhatian Khusus",
                            icon: <FiAlertCircle className="w-3.5 h-3.5" />,
                            badge: pendingLeaveCount > 0 ? (
                                <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-danger-bg text-danger border border-danger/20">
                                    {pendingLeaveCount} Menunggu
                                </span>
                            ) : undefined,
                        },
                    ]}
                    activeKey={activeTab}
                    onChange={(k) => setActiveTab(k as "overview" | "attention")}
                    variant="segmented"
                    className="shrink-0 w-full sm:w-auto"
                />

                {/* Tablet & Desktop Controls (hidden on mobile < sm, visible on >= sm) */}
                <div className="hidden sm:flex items-center gap-2.5 shrink-0 font-inter">
                    {activeTab === "overview" && (
                        <TabSwitcher
                            tabs={PERIODS.map((p) => ({ key: p, label: p }))}
                            activeKey={period}
                            onChange={(k) => setPeriod(k as Period)}
                            variant="segmented"
                            className="shrink-0"
                        />
                    )}

                    {activeTab === "attention" && (
                        <div className="flex items-center gap-2.5 font-inter">
                            <NativeSelect
                                value={selectedClassId ?? ""}
                                onChange={handleClassFilter}
                                className="min-w-[190px]"
                                aria-label="Pilih Kelas"
                            >
                                <option value="">Semua Kelas / Rombel</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </NativeSelect>

                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={handleDateFilter}
                                inputClassName="h-10 text-[13px] rounded-xl"
                                aria-label="Pilih Tanggal"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Tab Content 1: Overview ── */}
            {activeTab === "overview" && (
                <div className="flex flex-col gap-4 sm:gap-6 font-inter">
                    {/* ═══════════════════════════════════════════════════════════════════════
                        A. MOBILE & TABLET NATIVE VIEW (< lg)
                    ═══════════════════════════════════════════════════════════════════════ */}
                    <div className="lg:hidden flex flex-col gap-4 font-inter">
                        {/* 1. School Status Ribbon & Urgent Leave Alert Banner */}
                        <div className="bg-surface border border-border rounded-2xl p-4 shadow-card flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-[16px] shrink-0">
                                        <FiActivity />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-[14px] font-bold text-text-primary leading-tight truncate">
                                            Presensi SMA UII Yogyakarta
                                        </h2>
                                        <p className="text-[11px] text-text-muted mt-0.5 truncate">
                                            {formatIndonesianDate(selectedDate)}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-success-bg text-success border border-success/20 shrink-0">
                                    {presentPct}% Hadir
                                </span>
                            </div>

                            {pendingLeaveCount > 0 && (
                                <Link
                                    href="/leave-requests/verification"
                                    className="flex items-center justify-between p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger hover:bg-danger/15 active:scale-[0.99] transition-all"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <FiAlertCircle className="text-[16px] shrink-0 animate-pulse" />
                                        <div className="min-w-0">
                                            <span className="text-[12px] font-bold block truncate">
                                                {pendingLeaveCount} Izin Menunggu Verifikasi
                                            </span>
                                            <span className="text-[10px] text-text-muted block truncate">
                                                Klik untuk menindaklanjuti pengajuan izin
                                            </span>
                                        </div>
                                    </div>
                                    <FiChevronRight className="text-[14px] shrink-0 ml-1 text-danger" />
                                </Link>
                            )}
                        </div>

                        {/* 2. Native 2x2 KPI Metric Cards */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Hadir */}
                            <div className="bg-surface border border-border rounded-2xl p-3.5 shadow-card flex flex-col justify-between">
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wide">
                                        Hadir Terdata
                                    </span>
                                    <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                                </div>
                                <div className="mt-2.5">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-[22px] font-extrabold text-text-primary leading-tight">
                                            {stats.verified_present}
                                        </span>
                                        <span className="text-[11px] font-bold text-success">
                                            ({presentPct}%)
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-text-muted block mt-0.5">
                                        dari {stats.total_students} siswa
                                    </span>
                                </div>
                            </div>

                            {/* Terlambat */}
                            <div className="bg-surface border border-border rounded-2xl p-3.5 shadow-card flex flex-col justify-between">
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wide">
                                        Terlambat
                                    </span>
                                    <span className="w-2 h-2 rounded-full bg-warning shrink-0" />
                                </div>
                                <div className="mt-2.5">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-[22px] font-extrabold text-warning leading-tight">
                                            {stats.late}
                                        </span>
                                        <span className="text-[11px] font-bold text-warning">
                                            ({latePct}%)
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-text-muted block mt-0.5">
                                        lewat batas jam
                                    </span>
                                </div>
                            </div>

                            {/* Izin / Sakit */}
                            <div className="bg-surface border border-border rounded-2xl p-3.5 shadow-card flex flex-col justify-between">
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wide">
                                        Sakit & Izin
                                    </span>
                                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                </div>
                                <div className="mt-2.5">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-[22px] font-extrabold text-primary leading-tight">
                                            {stats.sick_permit}
                                        </span>
                                        <span className="text-[11px] font-bold text-primary">
                                            ({sickPct}%)
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-text-muted block mt-0.5">
                                        surat keterangan
                                    </span>
                                </div>
                            </div>

                            {/* Alpa */}
                            <div className="bg-surface border border-border rounded-2xl p-3.5 shadow-card flex flex-col justify-between">
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wide">
                                        Alpa / Kosong
                                    </span>
                                    <span className="w-2 h-2 rounded-full bg-danger shrink-0" />
                                </div>
                                <div className="mt-2.5">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-[22px] font-extrabold text-danger leading-tight">
                                            {stats.absent}
                                        </span>
                                        <span className="text-[11px] font-bold text-danger">
                                            ({absentPct}%)
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-text-muted block mt-0.5">
                                        tanpa keterangan
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Interactive Attendance Trend Card */}
                        <div className="bg-surface border border-border rounded-2xl p-4 shadow-card flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <h3 className="text-[13px] font-bold text-text-primary">
                                        {chartTitle(period, selectedDate)}
                                    </h3>
                                    <p className="text-[10px] text-text-muted mt-0.5">
                                        {chartRangeLabel(period, year, selectedDate)}
                                    </p>
                                </div>
                                <TabSwitcher
                                    tabs={PERIODS.map((p) => ({ key: p, label: p }))}
                                    activeKey={period}
                                    onChange={(k) => setPeriod(k as Period)}
                                    variant="segmented"
                                    className="shrink-0 self-start sm:self-auto text-[11px]"
                                />
                            </div>

                            <div className="h-[190px] mt-1">
                                {chartData.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-text-inactive text-[12px]">
                                        Belum ada data tren untuk periode ini.
                                    </div>
                                ) : (
                                    <AttendanceChart data={chartData} type="rate" height={190} />
                                )}
                            </div>
                        </div>

                        {/* 4. Menu Akses Cepat */}
                        <div className="flex flex-col gap-2.5">
                            <span className="text-[12px] font-bold text-text-muted uppercase tracking-wider px-1">
                                Menu Akses Cepat
                            </span>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Data Master */}
                                <Link
                                    href="/master-data"
                                    className="bg-surface border border-border rounded-2xl p-3.5 shadow-card hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-[18px] mb-2.5 group-hover:scale-105 transition-transform">
                                        <FiDatabase />
                                    </div>
                                    <div>
                                        <span className="text-[13px] font-bold text-text-primary block leading-tight">
                                            Data Master
                                        </span>
                                        <span className="text-[11px] text-text-muted mt-0.5 block truncate">
                                            Siswa, guru, kelas
                                        </span>
                                    </div>
                                </Link>

                                {/* Atur Waktu */}
                                <Link
                                    href="/operational-settings"
                                    className="bg-surface border border-border rounded-2xl p-3.5 shadow-card hover:border-warning/40 active:scale-[0.98] transition-all flex flex-col justify-between group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center text-[18px] mb-2.5 group-hover:scale-105 transition-transform">
                                        <FiClock />
                                    </div>
                                    <div>
                                        <span className="text-[13px] font-bold text-text-primary block leading-tight">
                                            Atur Waktu
                                        </span>
                                        <span className="text-[11px] text-text-muted mt-0.5 block truncate">
                                            Jam masuk & libur
                                        </span>
                                    </div>
                                </Link>

                                {/* Enrolment */}
                                <Link
                                    href="/class-enrolment"
                                    className="bg-surface border border-border rounded-2xl p-3.5 shadow-card hover:border-success/40 active:scale-[0.98] transition-all flex flex-col justify-between group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center text-[18px] mb-2.5 group-hover:scale-105 transition-transform">
                                        <FiUsers />
                                    </div>
                                    <div>
                                        <span className="text-[13px] font-bold text-text-primary block leading-tight">
                                            Enrolment
                                        </span>
                                        <span className="text-[11px] text-text-muted mt-0.5 block truncate">
                                            Penempatan kelas
                                        </span>
                                    </div>
                                </Link>

                                {/* Relasi Wali */}
                                <Link
                                    href="/guardian-assignment"
                                    className="bg-surface border border-border rounded-2xl p-3.5 shadow-card hover:border-indigo-500/40 active:scale-[0.98] transition-all flex flex-col justify-between group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-[18px] mb-2.5 group-hover:scale-105 transition-transform">
                                        <FiLayers />
                                    </div>
                                    <div>
                                        <span className="text-[13px] font-bold text-text-primary block leading-tight">
                                            Relasi Wali
                                        </span>
                                        <span className="text-[11px] text-text-muted mt-0.5 block truncate">
                                            Kaitkan orang tua
                                        </span>
                                    </div>
                                </Link>
                            </div>

                            {/* Ekspor Rekap Presensi */}
                            <Link
                                href="/reports"
                                className="bg-surface border border-border rounded-2xl p-3.5 shadow-card hover:border-primary/40 active:scale-[0.98] transition-all flex items-center justify-between group mt-1"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-[18px] group-hover:scale-105 transition-transform shrink-0">
                                        <FiFileText />
                                    </div>
                                    <div>
                                        <span className="text-[13px] font-bold text-text-primary block leading-tight">
                                            Laporan Rekap Presensi
                                        </span>
                                        <span className="text-[11px] text-text-muted mt-0.5 block">
                                            Unduh rekap harian, bulanan & semester
                                        </span>
                                    </div>
                                </div>
                                <FiChevronRight className="text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all text-[16px] shrink-0" />
                            </Link>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════════════════════════════════
                        B. DESKTOP VIEW (hidden on mobile, block on lg+)
                    ═══════════════════════════════════════════════════════════════════════ */}
                    <div className="hidden lg:flex flex-col gap-6">
                        {/* Desktop Stat Cards (4 cards) */}
                        <section className="grid grid-cols-4 gap-6">
                            <StatCard label="Rata-rata Kehadiran" value={avgAttendanceFixed} color="grey" />
                            <StatCard label="Siswa Terlambat" value={stats.late} color="grey" />
                            <StatCard label="Pengajuan Izin" value={stats.sick_permit} color="grey" />
                            <StatCard label="Absensi Tanpa Ket." value={stats.absent} color="red" />
                        </section>

                        {/* Chart Card */}
                        <Card className="rounded-2xl shadow-card">
                            <Card.Body className="p-6">
                                <div className="flex items-center justify-between gap-2 mb-6">
                                    <div>
                                        <h2 className="text-[15px] font-bold text-text-primary font-inter">
                                            {chartTitle(period, selectedDate)}
                                        </h2>
                                        <p className="text-[12px] text-text-muted font-medium font-inter mt-0.5">
                                            {chartRangeLabel(period, year, selectedDate)}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-[240px]">
                                    {chartData.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-text-inactive text-[13px] font-inter">
                                            Belum ada data tren untuk periode ini.
                                        </div>
                                    ) : (
                                        <AttendanceChart data={chartData} type="rate" height={240} />
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            )}

            {/* ── Tab Content 2: Perhatian Khusus Hari Ini ── */}
            {activeTab === "attention" && (
                <div className="flex flex-col gap-4 font-inter">
                    {/* Active filter summary pill for mobile */}
                    {isFilterActive && (
                        <div className="flex items-center justify-between p-2.5 px-3.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[12px] font-medium sm:hidden">
                            <div className="flex items-center gap-2 truncate">
                                <FiFilter className="text-[13px] shrink-0" />
                                <span className="truncate">
                                    {selectedClassId
                                        ? classes.find((c) => c.id === selectedClassId)?.name ?? "Filter Kelas"
                                        : "Semua Kelas"}{" "}
                                    • {selectedDate}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleResetMobileFilter}
                                className="text-[11px] font-bold underline ml-2 shrink-0 cursor-pointer"
                            >
                                Reset
                            </button>
                        </div>
                    )}

                    {!selectedClassId ? (
                        <Card className="p-8 rounded-2xl shadow-card">
                            <EmptyState
                                variant="no-data"
                                icon={<FiFilter className="text-4xl text-text-inactive" />}
                                title="Pilih Kelas"
                                description="Pilih kelas di filter atas untuk menampilkan data siswa yang memerlukan perhatian khusus."
                                className="py-4"
                            />
                        </Card>
                    ) : students.length === 0 ? (
                        <Card className="p-8 rounded-2xl shadow-card">
                            <EmptyState
                                variant="no-data"
                                icon={<FiCheckCircle className="text-4xl text-success" />}
                                title="Semua Hadir Tepat Waktu"
                                description="Semua siswa di kelas ini sudah hadir dan terdata aktif hari ini."
                                className="py-4"
                            />
                        </Card>
                    ) : (
                        <>
                            {/* Mobile Student List Feed (< sm) */}
                            <div className="flex flex-col gap-3 sm:hidden">
                                {students.map((s) => {
                                    const cfg = statusConfig[s.status] ?? statusConfig["Absent"];
                                    const isAbsent = s.status === "Absent";
                                    const isLate = s.status === "Late";
                                    const isPending = s.status === "Pending";

                                    return (
                                        <div
                                            key={s.id}
                                            className="bg-surface border border-border rounded-2xl p-4 shadow-card flex flex-col gap-3"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <Avatar
                                                        name={s.name}
                                                        size="md"
                                                        className="shrink-0 ring-2 ring-surface shadow-xs"
                                                    />
                                                    <div className="min-w-0">
                                                        <h4 className="text-[14px] font-bold text-text-primary truncate">
                                                            {s.name}
                                                        </h4>
                                                        <p className="text-[11px] text-text-muted">
                                                            NISN: {s.nisn || s.nis}
                                                        </p>
                                                    </div>
                                                </div>
                                                <StatusBadge variant={cfg.variant} label={cfg.label} />
                                            </div>

                                            <div className="pt-2 border-t border-border flex items-center justify-between text-[12px]">
                                                <span className="text-text-muted flex items-center gap-1.5 truncate pr-2">
                                                    <FiClock className="text-text-inactive shrink-0" />
                                                    <span className="truncate">
                                                        {isAbsent
                                                            ? "Belum ada kabar"
                                                            : isLate || s.status === "Present"
                                                            ? (s.check_in_time ? `${s.check_in_time} WIB` : "—")
                                                            : (s.keterangan ?? "—")}
                                                    </span>
                                                </span>

                                                {isPending ? (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        className="h-8 text-[11px] px-3 font-bold rounded-lg shadow-xs shrink-0"
                                                        onClick={() => router.get("/leave-requests/verification")}
                                                    >
                                                        Verifikasi
                                                    </Button>
                                                ) : !isAbsent ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-[11px] px-2.5 rounded-lg shrink-0"
                                                        onClick={() => router.get("/master-data", { highlight: s.id })}
                                                    >
                                                        Detail
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Tablet & Desktop Table (>= sm) */}
                            <div className="hidden sm:block">
                                <Card className="p-4 sm:p-6 rounded-2xl shadow-card">
                                    <Table columns={attentionColumns} data={students} keyExtractor={(s) => s.id} />
                                </Card>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Mobile Filter Drawer (< sm) */}
            <Drawer
                open={mobileFilterOpen}
                onClose={() => setMobileFilterOpen(false)}
                title="Filter Perhatian Khusus"
                description="Pilih kelas dan tanggal presensi untuk menampilkan data siswa."
                width="sm"
                showFooter={false}
            >
                <div className="flex flex-col gap-4 font-inter">
                    <div>
                        <label className="block text-[13px] font-bold text-text-primary mb-1.5">
                            Rombongan Belajar / Kelas
                        </label>
                        <NativeSelect
                            value={drawerClassId}
                            onChange={(e) => setDrawerClassId(e.target.value)}
                            className="w-full h-11 text-[13px] rounded-xl"
                            aria-label="Pilih Kelas"
                        >
                            <option value="">Semua Kelas / Rombel</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>

                    <div>
                        <label className="block text-[13px] font-bold text-text-primary mb-1.5">
                            Tanggal Presensi
                        </label>
                        <Input
                            type="date"
                            value={drawerDate}
                            onChange={(e) => setDrawerDate(e.target.value)}
                            inputClassName="h-11 text-[13px] rounded-xl"
                            aria-label="Pilih Tanggal"
                        />
                    </div>

                    <div className="flex items-center gap-2.5 pt-3 border-t border-border mt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-10 font-bold text-[13px] rounded-xl"
                            onClick={handleResetMobileFilter}
                        >
                            Reset
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            className="flex-1 h-10 font-bold text-[13px] rounded-xl shadow-xs"
                            onClick={handleApplyMobileFilter}
                        >
                            Terapkan Filter
                        </Button>
                    </div>
                </div>
            </Drawer>
        </AppShell>
    );
}
