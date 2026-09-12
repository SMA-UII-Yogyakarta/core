import { Link, router } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
    FiCalendar,
    FiChevronDown,
    FiChevronUp,
    FiClock,
    FiFileText,
    FiFilter,
    FiPieChart,
    FiPlus,
    FiUser,
} from "react-icons/fi";
import {
    Avatar,
    BottomSheet,
    Button,
    Card,
    EmptyState,
    FilterPopover,
    FilterTriggerButton,
    HeaderIconButton,
    MobileNativePagination,
    NativeSelect,
    PageHeader,
    PhotoPeekButton,
    StatCard,
    StatusBadge,
    TabSwitcher,
    Table,
    TableFooter,
    TableSection,
} from "@/Components";
import AttendanceChart from "@/Components/features/AttendanceChart";
import type { Column } from "@/Components/ui/Table";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import AppShell from "@/Layouts/AppShell";
import LeaveDrawerForm from "./LeaveDrawerForm";
import { INDONESIAN_MONTHS } from "@/utils/helpers";

interface Student {
    id: number;
    name: string;
    nis: string;
    class: { id: number; name: string } | null;
}

interface AttendanceRecord {
    id: number;
    status: string;
    check_in_time: string;
    attendance_date: string;
    photo_url?: string | null;
}

interface LeaveRequest {
    id: number;
    category: string;
    start_date: string;
    end_date: string;
    approval_status: string;
}

interface MonthlyTrend {
    label: string;
    present: number;
    late: number;
}

interface Stats {
    total_days: number;
    present: number;
    late: number;
    absent: number;
    sick_permission?: number;
}

interface PageProps {
    students: Student[];
    selectedStudentId: number;
    selectedStudent: Student | null;
    attendances: AttendanceRecord[];
    leaveRequests: LeaveRequest[];
    month: number;
    year: number;
    stats: Stats | null;
    monthlyTrend: MonthlyTrend[] | null;
}

const MONTH_NAMES = INDONESIAN_MONTHS;

const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
        const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
        const d = new Date(cleanDate + "T00:00:00");
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
};

const formatTimeWib = (timeStr: string) => {
    if (!timeStr) return "-";
    if (timeStr.includes("T")) {
        try {
            const d = new Date(timeStr);
            return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
        } catch {
            return timeStr;
        }
    }
    const cleanTime = timeStr.length >= 5 ? timeStr.substring(0, 5) : timeStr;
    return `${cleanTime} WIB`;
};

export default function History({
    students,
    selectedStudentId,
    selectedStudent,
    attendances,
    leaveRequests,
    month,
    year,
    stats,
    monthlyTrend,
}: PageProps) {
    const [activeTab, setActiveTab] = useState<"attendances" | "stats">(() => {
        if (typeof window !== "undefined") {
            const tabParam = new URLSearchParams(window.location.search).get("tab");
            if (tabParam === "stats") return "stats";
        }
        return "attendances";
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            const tabParam = new URLSearchParams(window.location.search).get("tab");
            if (tabParam === "leaves") {
                router.visit("/guardian/leave-application", { replace: true });
            }
        }
    }, []);

    const [monthVal, setMonthVal] = useState(month.toString());
    const [yearVal, setYearVal] = useState(year.toString());
    const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Collapsible Child Selector State (localStorage memory matching Admin/ClassEnrolment.tsx)
    const [isCardExpanded, setIsCardExpanded] = useState<boolean>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("guardian_history_child_selector_expanded");
            if (saved !== null) {
                return saved === "true";
            }
        }
        return true;
    });

    const toggleCardExpanded = () => {
        setIsCardExpanded((prev) => {
            const next = !prev;
            if (typeof window !== "undefined") {
                localStorage.setItem("guardian_history_child_selector_expanded", String(next));
            }
            return next;
        });
    };

    const {
        currentPage: attPage,
        setCurrentPage: setAttPage,
        totalPages: attTotalPages,
        safePage: attSafePage,
        paginatedData: paginatedAttendances,
        pageSize: attPageSize,
    } = useClientPagination(attendances, 1, 10);

    const {
        currentPage: leavePage,
        setCurrentPage: setLeavePage,
        totalPages: leaveTotalPages,
        safePage: leaveSafePage,
        paginatedData: paginatedLeaves,
        pageSize: leavePageSize,
    } = useClientPagination(leaveRequests, 1, 10);

    const handleSelectStudent = (id: number) => {
        router.get(
            "/guardian/history",
            { student_id: id, month: monthVal, year: yearVal },
            { preserveState: true, preserveScroll: true },
        );
    };

    const applyFilter = (newMonth: string, newYear: string) => {
        setMonthVal(newMonth);
        setYearVal(newYear);
        router.get(
            "/guardian/history",
            { student_id: selectedStudentId, month: newMonth, year: newYear },
            { preserveState: true, preserveScroll: true },
        );
    };

    // Calculate attendance percentage rate
    const attendanceRate = useMemo(() => {
        if (!attendances || attendances.length === 0) {
            if (stats && stats.total_days > 0) {
                return Math.round((((stats.present || 0) + (stats.late || 0)) / stats.total_days) * 100);
            }
            return 100;
        }
        const total = attendances.length;
        const presentOrLate = attendances.filter((a) => {
            const s = a.status.toLowerCase();
            return s === "present" || s === "hadir" || s === "late" || s === "terlambat";
        }).length;
        return Math.round((presentOrLate / total) * 100);
    }, [attendances, stats]);

    // Columns for Attendance Table
    const attendanceColumns: Column<AttendanceRecord>[] = [
        {
            key: "attendance_date",
            header: "Tanggal Presensi",
            render: (row: AttendanceRecord) => (
                <div className="flex items-center gap-2 font-medium text-text-primary">
                    <FiCalendar className="w-4 h-4 text-text-muted shrink-0" />
                    <span>{formatDateIndo(row.attendance_date)}</span>
                </div>
            ),
        },
        {
            key: "check_in_time",
            header: "Jam Masuk",
            render: (row: AttendanceRecord) => (
                <div className="flex items-center gap-2 font-mono font-medium text-text-primary">
                    <FiClock className="w-4 h-4 text-text-muted shrink-0" />
                    <span>{formatTimeWib(row.check_in_time)}</span>
                </div>
            ),
        },
        {
            key: "status",
            header: "Status Kehadiran",
            render: (row: AttendanceRecord) => <StatusBadge variant={row.status} />,
        },
        {
            key: "photo_url",
            header: "Bukti Kamera",
            className: "w-28 text-center",
            render: (row: AttendanceRecord) => (
                <PhotoPeekButton
                    photoUrl={row.photo_url}
                    title={`Bukti Presensi — ${selectedStudent?.name ?? "Siswa"}`}
                    subtitle={formatDateIndo(row.attendance_date)}
                />
            ),
        },
    ];

    // Columns for Leave Request Table
    const leaveColumns: Column<LeaveRequest>[] = [
        {
            key: "category",
            header: "Kategori Izin",
            render: (row: LeaveRequest) => (
                <div className="flex items-center gap-2 font-medium text-text-primary">
                    <FiFileText className="w-4 h-4 text-primary shrink-0" />
                    <span>{row.category}</span>
                </div>
            ),
        },
        {
            key: "period",
            header: "Periode Tanggal",
            render: (row: LeaveRequest) => (
                <span className="text-text-muted font-medium text-[13px]">
                    {formatDateIndo(row.start_date)}{" "}
                    {row.end_date && row.end_date !== row.start_date ? `s/d ${formatDateIndo(row.end_date)}` : ""}
                </span>
            ),
        },
        {
            key: "approval_status",
            header: "Status Persetujuan",
            render: (row: LeaveRequest) => <StatusBadge variant={row.approval_status} />,
        },
    ];

    const hasActiveFilters = monthVal !== month.toString() || yearVal !== year.toString();

    const mobileHeaderActions = (
        <div className="flex items-center gap-2 sm:hidden font-inter">
            <HeaderIconButton
                icon={<FiFilter className="text-[14px]" />}
                active={hasActiveFilters}
                label="Filter Riwayat Anak"
                onClick={() => setIsMobileFilterOpen(true)}
            />
        </div>
    );

    const filterPopoverContent = (
        <div className="flex flex-col gap-3 font-inter min-w-[220px]">
            <div className="flex items-center justify-between border-b border-border pb-2">
                <h4 className="text-[13.5px] font-bold text-text-primary">Filter Riwayat</h4>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={() => {
                            const currentM = new Date().getMonth() + 1;
                            const currentY = new Date().getFullYear();
                            applyFilter(currentM.toString(), currentY.toString());
                            setIsDesktopFilterOpen(false);
                        }}
                        className="text-[11.5px] font-semibold text-danger hover:underline cursor-pointer"
                    >
                        Reset Filter
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-text-secondary">Pilih Bulan</label>
                <NativeSelect
                    value={monthVal}
                    onChange={(e) => {
                        applyFilter(e.target.value, yearVal);
                        setIsDesktopFilterOpen(false);
                    }}
                    className="h-9 text-[13px] rounded-xl"
                >
                    {MONTH_NAMES.map((name, i) => (
                        <option key={i + 1} value={(i + 1).toString()}>
                            {name}
                        </option>
                    ))}
                </NativeSelect>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-text-secondary">Pilih Tahun</label>
                <NativeSelect
                    value={yearVal}
                    onChange={(e) => {
                        applyFilter(monthVal, e.target.value);
                        setIsDesktopFilterOpen(false);
                    }}
                    className="h-9 text-[13px] rounded-xl"
                >
                    {["2024", "2025", "2026", "2027"].map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </NativeSelect>
            </div>
        </div>
    );

    return (
        <AppShell
            title="Riwayat Presensi Anak"
            hasTopCard={true}
            headerActions={mobileHeaderActions}
            showNotificationBell={false}
            showNotificationBellOnMobile={false}
        >
            <div className="font-inter pb-28 max-sm:pb-32">
                {/* Desktop Page Header (Matching Admin/ClassEnrolment.tsx mb-4 spacing) */}
                <PageHeader
                    title="Riwayat Presensi Anak"
                    description="Pantau laporan kehadiran harian, keterlambatan, dan riwayat pengajuan izin anak Anda."
                    className="hidden lg:flex shrink-0 mb-4"
                />

                {/* 🔽 TOP CONTROL PANEL: Child Selection & Header Filter (Matching Admin/ClassEnrolment.tsx 100%) */}
                {students.length > 0 && (
                    <div className="bg-surface border border-border rounded-2xl p-3.5 sm:p-4 shadow-card mb-4 font-inter shrink-0 transition-all duration-200">
                        {/* Card Header Row */}
                        <div className="flex items-center justify-between gap-3 min-w-0">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-xl bg-accent/20 text-primary flex items-center justify-center shrink-0 font-bold">
                                    <FiUser className="text-[15px]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <h3 className="text-[13px] sm:text-[14px] font-bold text-text-primary uppercase tracking-wider truncate shrink-0">
                                            Pilih Anak
                                        </h3>
                                        {isCardExpanded ? (
                                            <span className="text-[12px] font-medium text-text-muted shrink-0 whitespace-nowrap">
                                                • {students.length} Anak Terhubung
                                            </span>
                                        ) : (
                                            selectedStudent && (
                                                <div className="hidden sm:flex items-center gap-2 text-[12.5px] text-text-muted min-w-0 shrink overflow-hidden">
                                                    <span className="shrink-0">•</span>
                                                    <span className="font-bold text-text-primary truncate">
                                                        {selectedStudent.name}
                                                    </span>
                                                    {selectedStudent.class?.name && (
                                                        <>
                                                            <span className="shrink-0">•</span>
                                                            <span className="text-text-muted truncate">
                                                                Kelas {selectedStudent.class.name}
                                                            </span>
                                                        </>
                                                    )}
                                                    <span className="shrink-0">•</span>
                                                    <span className="font-mono text-text-muted shrink-0 whitespace-nowrap">
                                                        NIS: {selectedStudent.nis}
                                                    </span>
                                                    <span className="shrink-0">•</span>
                                                    <span className="font-bold text-primary shrink-0 whitespace-nowrap">
                                                        {students.length} Anak
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                    {selectedStudent && !isCardExpanded && (
                                        <p className="text-[11.5px] text-text-muted truncate sm:hidden mt-0.5">
                                            <strong className="text-text-primary font-bold">{selectedStudent.name}</strong>
                                            {selectedStudent.class?.name && ` (${selectedStudent.class.name})`} • {students.length} Anak
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Card Header Right: Filter Popover + Minimize/Maximize Toggle Button */}
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0 justify-end">
                                {/* Filter Popover di dalam Card Header (Tablet & Desktop >= sm) */}
                                <div className="hidden sm:block shrink-0">
                                    <FilterPopover
                                        open={isDesktopFilterOpen}
                                        onClose={() => setIsDesktopFilterOpen(false)}
                                        align="right"
                                        trigger={
                                            <FilterTriggerButton
                                                active={hasActiveFilters}
                                                onClick={() => setIsDesktopFilterOpen((prev) => !prev)}
                                            />
                                        }
                                    >
                                        {filterPopoverContent}
                                    </FilterPopover>
                                </div>

                                <button
                                    type="button"
                                    onClick={toggleCardExpanded}
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 active:scale-95 text-text-muted hover:text-text-primary flex items-center justify-center transition-all cursor-pointer shrink-0"
                                    title={isCardExpanded ? "Minimize Card (Sembunyikan Panel)" : "Maximize Card (Tampilkan Panel)"}
                                    aria-label={isCardExpanded ? "Minimize panel anak" : "Maximize panel anak"}
                                >
                                    {isCardExpanded ? (
                                        <FiChevronUp className="text-[15px] sm:text-[18px]" />
                                    ) : (
                                        <FiChevronDown className="text-[15px] sm:text-[18px]" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Collapsible Body (Child Pill Buttons directly without nested inner cards) */}
                        {isCardExpanded && (
                            <div className="pt-3.5 border-t border-border/60 mt-3 font-inter">
                                <div className="flex flex-wrap gap-2.5">
                                    {students.map((s) => {
                                        const isSelected = s.id === selectedStudentId;
                                        return (
                                            <Button
                                                key={s.id}
                                                type="button"
                                                onClick={() => handleSelectStudent(s.id)}
                                                variant={isSelected ? "primary" : "outline"}
                                                className="flex items-center gap-2 rounded-xl shadow-none font-bold text-[13px] h-10 px-3.5"
                                            >
                                                <Avatar name={s.name} size="xs" />
                                                <span className="truncate max-w-[140px] sm:max-w-[200px]">{s.name}</span>
                                                {s.class?.name && (
                                                    <span
                                                        className={`text-[11px] px-1.5 py-0.5 rounded-md font-normal shrink-0 ${
                                                            isSelected ? "bg-white/20 text-white" : "bg-muted text-text-muted"
                                                        }`}
                                                    >
                                                        {s.class.name}
                                                    </span>
                                                )}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {selectedStudent ? (
                    <>
                        {/* ── TOOLBAR: TabSwitcher (Left) | Kehadiran Badge (Right) ── */}
                        <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4 shrink-0 font-inter w-full min-w-0 flex-nowrap">
                            {/* Sisi Kiri: TabSwitcher Halaman (Presensi / Ringkasan & Statistik / Riwayat Izin) */}
                            <div className="min-w-0 shrink">
                                <TabSwitcher
                                    tabs={[
                                        {
                                            key: "attendances",
                                            label: (
                                                <>
                                                    <span className="hidden sm:inline">Presensi Harian</span>
                                                    <span className="sm:hidden truncate">Presensi</span>
                                                </>
                                            ),
                                            icon: <FiCalendar className="text-[14px] shrink-0" />,
                                            count: attendances.length,
                                        },
                                        {
                                            key: "stats",
                                            label: (
                                                <>
                                                    <span className="hidden sm:inline">Ringkasan & Statistik</span>
                                                    <span className="sm:hidden truncate">Statistik</span>
                                                </>
                                            ),
                                            icon: <FiPieChart className="text-[14px] shrink-0" />,
                                        },
                                    ]}
                                    activeKey={activeTab}
                                    onChange={(key) => setActiveTab(key as "attendances" | "stats")}
                                    variant="segmented"
                                    shrinkable
                                    iconOnly="lg"
                                />
                            </div>

                            {/* Sisi Kanan: Total Count & Tingkat Kehadiran Badge di Pojok Kanan */}
                            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto font-inter">
                                {activeTab === "attendances" && (
                                    <span className="text-[11px] sm:text-[12px] font-medium text-text-muted font-mono bg-surface border border-border px-2.5 h-10 flex items-center rounded-xl shrink-0 shadow-2xs">
                                        <span className="hidden xs:inline">Total:&nbsp;</span>
                                        <span>{attendances.length} Data</span>
                                    </span>
                                )}
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-surface px-2.5 sm:px-3.5 h-10 border border-border rounded-xl shadow-2xs shrink-0 whitespace-nowrap">
                                    <span className="text-[11px] sm:text-[12px] font-bold text-text-muted uppercase">
                                        <span className="hidden sm:inline">Tingkat Kehadiran:</span>
                                        <span className="hidden xs:inline sm:hidden">Kehadiran:</span>
                                        <span className="xs:hidden">%:</span>
                                    </span>
                                    <span className="text-[13px] sm:text-[14px] font-bold text-primary font-mono">
                                        {attendanceRate}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Filter BottomSheet */}
                        <BottomSheet
                            open={isMobileFilterOpen}
                            onClose={() => setIsMobileFilterOpen(false)}
                            title="Filter Riwayat"
                        >
                            <div className="p-4 space-y-4 font-inter">
                                <div>
                                    <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                        Pilih Bulan
                                    </label>
                                    <NativeSelect
                                        value={monthVal}
                                        onChange={(e) => {
                                            const newM = e.target.value;
                                            applyFilter(newM, yearVal);
                                            setIsMobileFilterOpen(false);
                                        }}
                                    >
                                        {MONTH_NAMES.map((name, i) => (
                                            <option key={i + 1} value={(i + 1).toString()}>
                                                {name}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                        Pilih Tahun
                                    </label>
                                    <NativeSelect
                                        value={yearVal}
                                        onChange={(e) => {
                                            const newY = e.target.value;
                                            applyFilter(monthVal, newY);
                                            setIsMobileFilterOpen(false);
                                        }}
                                    >
                                        {["2024", "2025", "2026", "2027"].map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </div>
                            </div>
                        </BottomSheet>

                        {/* ── TAB 1: Log Presensi ── */}
                        {activeTab === "attendances" && (
                            <section className="flex flex-col gap-3 font-inter">
                                {attendances.length === 0 ? (
                                    <EmptyState
                                        title="Belum Ada Data Presensi"
                                        description={`Tidak ada rekaman data presensi untuk periode ${MONTH_NAMES[month - 1]} ${year}.`}
                                    />
                                ) : (
                                    <>
                                        {/* Mobile Card Stack (< sm) */}
                                        <div className="sm:hidden space-y-3">
                                            {paginatedAttendances.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="bg-surface border border-border rounded-xl p-4 shadow-card space-y-2"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 font-medium text-text-primary text-[14px]">
                                                            <FiCalendar className="w-4 h-4 text-text-muted shrink-0" />
                                                            <span>{formatDateIndo(item.attendance_date)}</span>
                                                        </div>
                                                        <StatusBadge variant={item.status} />
                                                    </div>
                                                    <div className="flex items-center justify-between text-[12px] text-text-secondary pt-2 border-t border-border">
                                                        <span>Jam Masuk</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono font-medium text-text-primary">
                                                                {formatTimeWib(item.check_in_time)}
                                                            </span>
                                                            {item.photo_url && (
                                                                <PhotoPeekButton
                                                                    photoUrl={item.photo_url}
                                                                    title={`Bukti Presensi — ${selectedStudent?.name ?? "Siswa"}`}
                                                                    subtitle={formatDateIndo(item.attendance_date)}
                                                                    size="sm"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {attendances.length > attPageSize && (
                                                <div className="pt-2 font-inter">
                                                    <MobileNativePagination
                                                        currentPage={attSafePage}
                                                        totalPages={attTotalPages}
                                                        totalItems={attendances.length}
                                                        perPage={attPageSize}
                                                        onPageChange={setAttPage}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Tablet & Desktop View (>= sm) */}
                                        <TableSection desktopOnly>
                                            <Table
                                                columns={attendanceColumns}
                                                data={paginatedAttendances}
                                                keyExtractor={(item: AttendanceRecord) => item.id}
                                                fill
                                            />
                                            {attendances.length > attPageSize && (
                                                <TableFooter
                                                    currentPage={attSafePage}
                                                    totalPages={attTotalPages}
                                                    totalItems={attendances.length}
                                                    perPage={attPageSize}
                                                    onPageChange={setAttPage}
                                                    itemLabel="hari presensi"
                                                />
                                            )}
                                        </TableSection>
                                    </>
                                )}
                            </section>
                        )}

                        {/* ── TAB 2: Ringkasan & Statistik ── */}
                        {activeTab === "stats" && (
                            <section className="flex flex-col gap-4 font-inter">
                                {/* Summary Stat Cards Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    <StatCard label="TOTAL HADIR" value={stats?.present ?? 0} variant="success" />
                                    <StatCard label="TERLAMBAT" value={stats?.late ?? 0} variant="warning" />
                                    <StatCard label="ALPA / ABSEN" value={stats?.absent ?? 0} variant="danger" />
                                    <StatCard label="SAKIT & IZIN" value={stats?.sick_permission ?? 0} variant="info" />
                                </div>

                                {/* Monthly Attendance Trend Chart */}
                                {monthlyTrend && monthlyTrend.length > 0 ? (
                                    <Card className="p-4 sm:p-5 border-border bg-surface shadow-xs">
                                        <h4 className="text-[14px] font-bold text-text-primary mb-3">
                                            Grafik Tren Kehadiran Bulanan
                                        </h4>
                                        <AttendanceChart data={monthlyTrend} />
                                    </Card>
                                ) : (
                                    <Card className="p-6 border-border bg-surface text-center">
                                        <p className="text-[13px] text-text-muted">
                                            Belum ada data grafik tren bulanan yang tersedia.
                                        </p>
                                    </Card>
                                )}
                            </section>
                        )}

                    </>
                ) : (
                    <EmptyState
                        title="Tidak Ada Siswa Terpilih"
                        description="Silakan pilih salah satu profil anak di atas untuk menampilkan riwayat presensi."
                    />
                )}
            </div>
        </AppShell>
    );
}
