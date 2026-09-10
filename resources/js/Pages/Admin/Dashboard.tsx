import { Link, router, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";
import {
    FiActivity,
    FiAlertCircle,
    FiCheckCircle,
    FiCheckSquare,
    FiChevronRight,
    FiClock,
    FiDatabase,
    FiFileText,
    FiFilter,
    FiLayers,
    FiPieChart,
    FiUsers,
} from "react-icons/fi";
import {
    AttendanceChart,
    Avatar,
    Button,
    Card,
    Drawer,
    FilterPopover,
    PageHeader,
    SearchBar,
    StatCard,
    StatusBadge,
    Table,
} from "@/Components";
import EmptyState from "@/Components/common/EmptyState";
import TabSwitcher, { type TabItem } from "@/Components/common/TabSwitcher";
import type { ChartDataPoint } from "@/Components/features/AttendanceChart";
import Input from "@/Components/ui/Input";
import NativeSelect from "@/Components/ui/NativeSelect";
import type { Column } from "@/Components/ui/Table";
import { useInertiaPolling } from "@/hooks/useInertiaPolling";
import AppShell from "@/Layouts/AppShell";
import { formatIndonesianDate } from "@/utils/helpers";
import AttentionStudentsTab from "./Dashboard/components/AttentionStudentsTab";
import type { AttentionStudent, MonthlyTrend, Period, SchoolClass, Stats, WeeklyTrendPoint } from "./Dashboard/types";
import { STATUS_CONFIG as statusConfig } from "./Dashboard/types";

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

const PERIODS: Period[] = ["Harian", "Bulanan", "Semester"];

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
    points: Array<{
        label: string;
        present: number;
        late: number;
        total?: number;
        absent?: number;
        rate?: number | null;
    }>,
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
    const { schoolName = "SMA UII Yogyakarta" } = usePage().props as { schoolName?: string };
    const today = new Date().toISOString().split("T")[0];

    const [activeTab, setActiveTab] = useState<"overview" | "attention">(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const tabParam = urlParams.get("tab");
            if (tabParam === "attention" || tabParam === "overview") {
                return tabParam;
            }
        }
        return selectedClassId ? "attention" : "overview";
    });
    const [attentionSearch, setAttentionSearch] = useState("");
    const [period, setPeriod] = useState<Period>("Bulanan");
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

    // Mobile Drawer filter state
    const [drawerClassId, setDrawerClassId] = useState<string>(selectedClassId ? String(selectedClassId) : "");
    const [drawerDate, setDrawerDate] = useState<string>(selectedDate);

    const [prevSelectedClassId, setPrevSelectedClassId] = useState(selectedClassId);
    const [prevSelectedDate, setPrevSelectedDate] = useState(selectedDate);
    const [prevMobileFilterOpen, setPrevMobileFilterOpen] = useState(mobileFilterOpen);

    if (
        selectedClassId !== prevSelectedClassId ||
        selectedDate !== prevSelectedDate ||
        mobileFilterOpen !== prevMobileFilterOpen
    ) {
        setPrevSelectedClassId(selectedClassId);
        setPrevSelectedDate(selectedDate);
        setPrevMobileFilterOpen(mobileFilterOpen);
        setDrawerClassId(selectedClassId ? String(selectedClassId) : "");
        setDrawerDate(selectedDate);
    }
    const handleClassFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(
            "/dashboard",
            { tab: activeTab, class_id: e.target.value || undefined, date: selectedDate },
            { preserveState: true, replace: true },
        );
    };

    const handleDateFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(
            "/dashboard",
            { tab: activeTab, class_id: selectedClassId || undefined, date: e.target.value },
            { preserveState: true, replace: true },
        );
    };

    const handleApplyMobileFilter = () => {
        setMobileFilterOpen(false);
        router.get(
            "/dashboard",
            { tab: activeTab, class_id: drawerClassId || undefined, date: drawerDate },
            { preserveState: true, replace: true },
        );
    };

    const handleResetMobileFilter = () => {
        setDrawerClassId("");
        setDrawerDate(today);
        setMobileFilterOpen(false);
        router.get(
            "/dashboard",
            { tab: activeTab, class_id: undefined, date: today },
            { preserveState: true, replace: true },
        );
    };

    // ── Desktop Filter Popover Content ───────────────────────────────────────
    const desktopFilterContent = (
        <FilterPopover
            open={isFilterPopoverOpen}
            onClose={() => setIsFilterPopoverOpen(false)}
            align="right"
            trigger={
                <Button
                    variant="accent"
                    onClick={() => setIsFilterPopoverOpen((prev) => !prev)}
                    className="h-10 px-3.5 text-[13px] font-bold shadow-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border-transparent"
                    title="Filter Kelas & Tanggal"
                    aria-label="Filter Kelas & Tanggal"
                >
                    <FiFilter className="text-[14px] text-primary" />
                    <span>Filter</span>
                    {(selectedClassId || selectedDate !== today) && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                </Button>
            }
        >
            <div className="flex flex-col gap-4 font-inter p-1">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                    <h4 className="text-[14px] font-bold text-text-primary">Filter Presensi</h4>
                    {(selectedClassId || selectedDate !== today) && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsFilterPopoverOpen(false);
                                handleResetMobileFilter();
                            }}
                            className="text-[12px] font-semibold text-danger hover:underline cursor-pointer"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-text-secondary">Pilih Rombongan Belajar (Kelas)</label>
                    <NativeSelect
                        value={selectedClassId ? String(selectedClassId) : ""}
                        onChange={(e) => {
                            handleClassFilter(e);
                            setIsFilterPopoverOpen(false);
                        }}
                        className="h-10 text-[13px] rounded-xl"
                    >
                        <option value="">-- Semua Kelas --</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                                Kelas {c.name}
                            </option>
                        ))}
                    </NativeSelect>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-text-secondary">Pilih Tanggal Presensi</label>
                    <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            handleDateFilter(e);
                            setIsFilterPopoverOpen(false);
                        }}
                        className="h-10 text-[13px] rounded-xl"
                    />
                </div>
            </div>
        </FilterPopover>
    );

    // ── Live Polling for Admin Stats (30s) ──────────────────────────────────
    useInertiaPolling({
        only: ["stats", "classDetail", "weeklyTrend", "monthlyTrend"],
        intervalMs: 30000,
    });

    const handleTabChange = (k: "overview" | "attention") => {
        setActiveTab(k);
        router.get(
            "/dashboard",
            {
                tab: k,
                class_id: selectedClassId || undefined,
                date: selectedDate,
            },
            { preserveState: true, replace: true },
        );
    };

    const filteredAttentionStudents = useMemo(() => {
        if (!classDetail?.students) return [];
        if (!attentionSearch.trim()) return classDetail.students;
        const q = attentionSearch.toLowerCase().trim();
        return classDetail.students.filter(
            (s) =>
                (s.name && s.name.toLowerCase().includes(q)) ||
                (s.nis && s.nis.toLowerCase().includes(q)) ||
                (s.nisn && s.nisn.toLowerCase().includes(q)),
        );
    }, [classDetail, attentionSearch]);

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

    const isFilterActive = Boolean(
        selectedClassId || (selectedDate && selectedDate !== new Date().toISOString().split("T")[0]),
    );

    const verificationButtonNode = useMemo(() => {
        if (pendingLeaveCount <= 0) return null;
        return (
            <Button
                variant="primary"
                size="sm"
                onClick={() => router.get("/leave-requests/verification")}
                className="h-10 px-4 text-[13px] font-bold shadow-xs rounded-xl shrink-0"
            >
                Verifikasi ({pendingLeaveCount})
            </Button>
        );
    }, [pendingLeaveCount]);

    // Mobile header action: optional filter button (only < sm on attention tab)
    const mobileHeaderAction =
        activeTab === "attention" ? (
            <div className="sm:hidden flex items-center gap-2 select-none font-inter">
                <button
                    type="button"
                    onClick={() => setMobileFilterOpen(true)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all relative cursor-pointer"
                    title="Filter Data Presensi"
                    aria-label="Filter Data Presensi"
                >
                    <FiFilter className="text-[15px]" />
                    {isFilterActive && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent ring-2 ring-primary" />
                    )}
                </button>
            </div>
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

    const dashboardTabs = useMemo<TabItem[]>(
        () => [
            {
                key: "overview",
                label: "Statistik & Tren",
                icon: <FiPieChart className="w-3.5 h-3.5 shrink-0" />,
            },
            {
                key: "attention",
                label: "Perhatian Khusus",
                icon: <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />,
            },
        ],
        [],
    );

    return (
        <AppShell title="Dashboard Admin" hasTopTabs={true} headerActions={mobileHeaderAction}>
            {/* Desktop PageHeader (hidden on mobile & tablet) */}
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

            {/* 📱 MOBILE ONLY (< sm): Standard Tab Row */}
            <div className="sm:hidden flex flex-col gap-2.5 mb-3 font-inter">
                <TabSwitcher
                    tabs={dashboardTabs}
                    activeKey={activeTab}
                    onChange={(k) => handleTabChange(k as "overview" | "attention")}
                    variant="segmented"
                    fullWidth
                />
            </div>

            {/* 🖥️ TABLET & DESKTOP (>= sm): Clean Light Toolbar Row */}
            <div className="hidden sm:flex items-center justify-between gap-2.5 mb-4 shrink-0 font-inter max-w-full min-w-0 w-full">
                {/* Tab Switcher (Shrinkable & Truncated on tablet/desktop view) */}
                <div className="shrink min-w-0">
                    <TabSwitcher
                        tabs={dashboardTabs}
                        activeKey={activeTab}
                        onChange={(k) => handleTabChange(k as "overview" | "attention")}
                        variant="segmented"
                        theme="light"
                        shrinkable
                    />
                </div>

                {/* Verification Action for Overview Tab (Tablet & Desktop sm+) */}
                {activeTab === "overview" && verificationButtonNode && (
                    <div className="flex items-center gap-2 shrink-0 ml-auto font-inter">{verificationButtonNode}</div>
                )}

                {/* Search Bar & Filter Button in Attention Tab for Tablet & Desktop */}
                {activeTab === "attention" && (
                    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto font-inter">
                        <div className="w-44 sm:w-56 md:w-64">
                            <SearchBar
                                value={attentionSearch}
                                onChange={setAttentionSearch}
                                onSearch={() => {}}
                                placeholder="Cari NIS, NISN, atau nama..."
                            />
                        </div>
                        {desktopFilterContent}
                    </div>
                )}
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
                                            Presensi {schoolName}
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
                                        <span className="text-[11px] font-bold text-success">({presentPct}%)</span>
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
                                        <span className="text-[11px] font-bold text-warning">({latePct}%)</span>
                                    </div>
                                    <span className="text-[10px] text-text-muted block mt-0.5">lewat batas jam</span>
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
                                        <span className="text-[11px] font-bold text-primary">({sickPct}%)</span>
                                    </div>
                                    <span className="text-[10px] text-text-muted block mt-0.5">surat keterangan</span>
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
                                        <span className="text-[11px] font-bold text-danger">({absentPct}%)</span>
                                    </div>
                                    <span className="text-[10px] text-text-muted block mt-0.5">tanpa keterangan</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Interactive Attendance Trend Card */}
                        <div className="bg-surface border border-border rounded-2xl p-4 shadow-card flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-2 min-w-0">
                                <div className="min-w-0">
                                    <h3 className="text-[13px] font-bold text-text-primary leading-tight truncate">
                                        {chartTitle(period, selectedDate)}
                                    </h3>
                                    <p className="text-[10px] text-text-muted mt-0.5 truncate">
                                        {chartRangeLabel(period, year, selectedDate)}
                                    </p>
                                </div>
                                <TabSwitcher
                                    tabs={PERIODS.map((p) => ({ key: p, label: p }))}
                                    activeKey={period}
                                    onChange={(k) => setPeriod(k as Period)}
                                    variant="segmented"
                                    size="sm"
                                    className="shrink-0"
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
                                href="/export"
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
                <AttentionStudentsTab
                    isFilterActive={isFilterActive}
                    selectedClassId={selectedClassId}
                    classes={classes}
                    selectedDate={selectedDate}
                    onResetMobileFilter={handleResetMobileFilter}
                    filteredAttentionStudents={filteredAttentionStudents}
                    attentionSearch={attentionSearch}
                    onSearchChange={setAttentionSearch}
                    attentionColumns={attentionColumns}
                />
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
                        <label className="block text-[13px] font-bold text-text-primary mb-1.5">Tanggal Presensi</label>
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

            {/* 🎈 FLOATING BALLOON: Verifikasi Izin untuk Mobile (< sm) khusus Tab Statistik & Tren */}
            {activeTab === "overview" && pendingLeaveCount > 0 && (
                <button
                    type="button"
                    onClick={() => router.get("/leave-requests/verification")}
                    className="sm:hidden fixed bottom-20 right-4 z-40 bg-primary text-white font-bold text-[13px] px-4 py-2.5 rounded-full shadow-xl hover:bg-primary-hover active:scale-95 transition-all flex items-center gap-2 border border-white/20 backdrop-blur-sm cursor-pointer"
                    aria-label={`Verifikasi ${pendingLeaveCount} izin menunggu`}
                >
                    <FiCheckSquare className="text-[16px]" />
                    <span>Verifikasi ({pendingLeaveCount})</span>
                </button>
            )}
        </AppShell>
    );
}
