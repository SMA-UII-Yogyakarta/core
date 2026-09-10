import { router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { FiCalendar, FiCamera, FiFilter, FiList } from "react-icons/fi";
import {
    AttendanceCalendar,
    BottomSheet,
    Button,
    EmptyState,
    FilterPopover,
    MobileNativePagination,
    NativeSelect,
    PageHeader,
    PhotoPeekModal,
    StatusBadge,
    TabSwitcher,
    Table,
    TableFooter,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import { useClientPagination } from "@/hooks/useClientPagination";
import AppShell from "@/Layouts/AppShell";
import { INDONESIAN_MONTHS } from "@/utils/helpers";

interface Student {
    id: number;
    nis: string;
    name: string;
    class: { id: number; name: string } | null;
}

interface AttendanceRecord {
    id: number;
    status: string;
    check_in_time: string | null;
    attendance_date: string;
    photo_url?: string | null;
}

interface PageProps {
    student: Student;
    attendances: AttendanceRecord[];
    month: number;
    year: number;
}

const MONTH_NAMES = INDONESIAN_MONTHS;

export default function AttendanceHistory({ student, attendances, month, year }: PageProps) {
    const [monthVal, setMonthVal] = useState(month.toString());
    const [yearVal, setYearVal] = useState(year.toString());
    const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);
    const [photoModal, setPhotoModal] = useState<{ url: string; date: string } | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");
    const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);

    const handleSelectDay = (day: number) => {
        setSelectedDay(day);
        setIsDayDetailOpen(true);
    };

    const {
        currentPage: attPage,
        setCurrentPage: setAttPage,
        totalPages: attTotalPages,
        safePage: attSafePage,
        paginatedData: paginatedAttendances,
        pageSize: attPageSize,
    } = useClientPagination(attendances, 1, 10);

    // Calculate monthly rate percentage
    const stats = useMemo(() => {
        const total = attendances.length;
        const present = attendances.filter((a) => {
            const s = a.status.toLowerCase();
            return s === "present" || s === "hadir";
        }).length;
        const late = attendances.filter((a) => {
            const s = a.status.toLowerCase();
            return s === "late";
        }).length;
        const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;
        return { total, present, late, rate };
    }, [attendances]);

    const applyFilter = (newMonth: string, newYear: string) => {
        setMonthVal(newMonth);
        setYearVal(newYear);
        router.get(
            "/student/history",
            { month: newMonth, year: newYear },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["attendances", "month", "year"],
            },
        );
    };

    const formatCheckInTime = (time: string | null) => {
        if (!time) return null;
        if (time.includes("T")) {
            try {
                const date = new Date(time);
                return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
            } catch {
                return time;
            }
        }
        if (time.length >= 5) {
            return time.substring(0, 5);
        }
        return time;
    };

    const formatDateIndo = (dateStr: string) => {
        try {
            const d = new Date(dateStr + "T00:00:00");
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

    // Selected day record finder
    const selectedRecord = useMemo(() => {
        if (!selectedDay) return null;
        const dayFormatted = selectedDay.toString().padStart(2, "0");
        const monthFormatted = month.toString().padStart(2, "0");
        const datePattern = `${year}-${monthFormatted}-${dayFormatted}`;
        return attendances.find((a) => a.attendance_date.startsWith(datePattern)) || null;
    }, [selectedDay, attendances, month, year]);

    const columns: Column<AttendanceRecord>[] = [
        {
            key: "attendance_date",
            header: "Hari & Tanggal",
            className: "w-48",
            render: (row: AttendanceRecord) => (
                <span className="font-semibold text-text-primary text-[13px] block">
                    {formatDateIndo(row.attendance_date)}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            className: "w-32",
            render: (row: AttendanceRecord) => <StatusBadge variant={row.status} />,
        },
        {
            key: "check_in_time",
            header: "Waktu Masuk",
            className: "w-32",
            render: (row: AttendanceRecord) => {
                const formatted = formatCheckInTime(row.check_in_time);
                return (
                    <span className="font-mono text-[13px] text-text-secondary font-medium">
                        {formatted ? `${formatted} WIB` : "—"}
                    </span>
                );
            },
        },
        {
            key: "photo_url",
            header: "Bukti Kamera",
            className: "w-28 text-center",
            render: (row: AttendanceRecord) =>
                row.photo_url ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            setPhotoModal({
                                url: row.photo_url!,
                                date: formatDateIndo(row.attendance_date),
                            })
                        }
                        className="text-[12px] font-semibold text-primary"
                        icon={<FiCamera className="text-[12px]" />}
                    >
                        Cek Foto
                    </Button>
                ) : (
                    <span className="text-[12px] text-text-muted">—</span>
                ),
        },
    ];

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const hasActiveFilters = monthVal !== month.toString() || yearVal !== year.toString();

    const mobileHeaderActions = (
        <div className="flex items-center gap-2 sm:hidden font-inter">
            <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                    hasActiveFilters ? "bg-primary text-white" : "bg-muted/60 text-text-primary hover:bg-muted"
                }`}
                title="Filter Riwayat"
                aria-label="Filter Riwayat"
            >
                <FiFilter className="text-[14px]" />
            </button>
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
                    dusk="select-month"
                    data-testid="select-month"
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
                    dusk="select-year"
                    data-testid="select-year"
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
            title="Riwayat Presensi Siswa"
            headerActions={mobileHeaderActions}
            showNotificationBell={false}
            showNotificationBellOnMobile={false}
        >
            {/* Desktop PageHeader (hidden on mobile & tablet, only visible on lg+) */}
            <PageHeader
                title="Riwayat Presensi Siswa"
                description={`Daftar lengkap rekapitulasi kehadiran ${student.name} per bulan.`}
                className="hidden lg:flex shrink-0 mb-3"
            />

            {/* ── TOOLBAR: Desktop (Kehadiran Left, Filter Right) | Mobile (< lg) (TabSwitcher Left, Kehadiran & Filter Right) ── */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4 shrink-0 font-inter w-full min-w-0 flex-nowrap">
                {/* Sisi Kiri Mobile/Tablet (< lg): TabSwitcher */}
                <div className="lg:hidden min-w-0 shrink">
                    <TabSwitcher
                        tabs={[
                            {
                                key: "calendar",
                                label: (
                                    <>
                                        <span className="hidden sm:inline">Kalender Presensi</span>
                                        <span className="hidden xs:inline sm:hidden truncate">Kalender</span>
                                    </>
                                ),
                                icon: <FiCalendar className="text-[14px] shrink-0" />,
                            },
                            {
                                key: "list",
                                label: (
                                    <>
                                        <span className="hidden sm:inline">Daftar Kehadiran</span>
                                        <span className="hidden xs:inline sm:hidden truncate">Daftar</span>
                                    </>
                                ),
                                icon: <FiList className="text-[14px] shrink-0" />,
                                count: attendances.length,
                            },
                        ]}
                        activeKey={activeTab}
                        onChange={(key) => setActiveTab(key as "calendar" | "list")}
                        variant="segmented"
                        shrinkable
                        iconOnly="lg"
                    />
                </div>

                {/* Sisi Kiri Desktop (lg+): Tingkat Kehadiran Badge di Pojok Kiri */}
                <div className="hidden lg:flex items-center gap-2 bg-surface px-3.5 h-10 border border-border rounded-xl shadow-2xs shrink-0 whitespace-nowrap">
                    <span className="text-[12px] font-bold text-text-muted uppercase">Tingkat Kehadiran:</span>
                    <span className="text-[14px] font-bold text-primary font-mono">{stats.rate}%</span>
                </div>

                {/* Sisi Kanan: (Mobile < lg: Kehadiran Badge) + (Tablet & Desktop >= sm: Filter Popover di Pojok Kanan) */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto font-inter">
                    {/* Tingkat Kehadiran Badge khusus Mobile/Tablet (< lg) */}
                    <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 bg-surface px-2.5 sm:px-3.5 h-10 border border-border rounded-xl shadow-2xs shrink-0 whitespace-nowrap">
                        <span className="text-[11px] sm:text-[12px] font-bold text-text-muted uppercase">
                            <span className="hidden sm:inline">Tingkat Kehadiran:</span>
                            <span className="hidden xs:inline sm:hidden">Kehadiran:</span>
                            <span className="xs:hidden">%:</span>
                        </span>
                        <span className="text-[14px] font-bold text-primary font-mono">{stats.rate}%</span>
                    </div>

                    {/* Filter Popover di Pojok Kanan (Hanya di Tablet & Desktop >= sm untuk menghindari redundansi filter header pada mobile < sm) */}
                    <div className="hidden sm:block shrink-0">
                        <FilterPopover
                            open={isDesktopFilterOpen}
                            onClose={() => setIsDesktopFilterOpen(false)}
                            align="right"
                            trigger={
                                <Button
                                    variant="accent"
                                    size="sm"
                                    onClick={() => setIsDesktopFilterOpen((prev) => !prev)}
                                    icon={<FiFilter className="text-[13px]" />}
                                    className="h-10 px-3 sm:px-4 text-[13px] font-bold rounded-xl shrink-0 whitespace-nowrap"
                                >
                                    Filter{hasActiveFilters ? " (Aktif)" : ""}
                                </Button>
                            }
                        >
                            {filterPopoverContent}
                        </FilterPopover>
                    </div>
                </div>
            </div>

                {/* ══ DESKTOP (lg+): 12-kolom grid seimbang (5-kolom kalender + 7-kolom tabel) ══ */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-5 lg:gap-6 items-start">
                    {/* Kiri — Kalender Visual (5 Kolom) */}
                    <div className="lg:col-span-5 min-w-0 flex flex-col justify-start space-y-3">
                        {/* Day selection preview card (Di atas kalender) */}
                        {selectedDay && (
                            <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-card animate-slide-in shrink-0">
                                <p className="text-[13px] font-bold text-text-primary mb-1">
                                    Rincian Tanggal {selectedDay} {MONTH_NAMES[month - 1]} {year}
                                </p>
                                {selectedRecord ? (
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60">
                                        <div className="flex items-center gap-2">
                                            <StatusBadge variant={selectedRecord.status} />
                                            <span className="text-[12px] text-text-muted font-mono font-semibold">
                                                {formatCheckInTime(selectedRecord.check_in_time)
                                                    ? `${formatCheckInTime(selectedRecord.check_in_time)} WIB`
                                                    : "—"}
                                            </span>
                                        </div>
                                        {selectedRecord.photo_url && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setPhotoModal({
                                                        url: selectedRecord.photo_url!,
                                                        date: formatDateIndo(selectedRecord.attendance_date),
                                                    })
                                                }
                                                className="text-[11px] font-bold"
                                            >
                                                Foto Selfie
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-[12px] text-text-muted mt-1">
                                        Tidak ada catatan kehadiran pada tanggal ini.
                                    </p>
                                )}
                            </div>
                        )}

                        <AttendanceCalendar
                            month={month}
                            year={year}
                            attendances={attendances}
                            selectedDay={selectedDay}
                            onSelectDay={(day) => setSelectedDay(day)}
                            dusk="student-attendance-calendar"
                            compact
                        />
                    </div>

                    {/* Kanan — Tabel Riwayat Kehadiran (7 Kolom) Standalone Table Pattern */}
                    <div className="lg:col-span-7 min-w-0 flex flex-col space-y-2.5">
                        <div className="flex items-center justify-between px-1 shrink-0">
                            <h3 className="text-[14px] font-bold text-text-primary">
                                Rincian Log Kehadiran — {MONTH_NAMES[month - 1]} {year}
                            </h3>
                            <span className="text-[11px] font-bold text-primary font-mono bg-primary/10 px-2.5 py-0.5 rounded-lg">
                                {attendances.length} Log
                            </span>
                        </div>

                        <Table<AttendanceRecord>
                            columns={columns}
                            data={paginatedAttendances}
                            keyExtractor={(row) => row.id}
                            emptyMessage="Belum ada data kehadiran untuk bulan yang dipilih."
                            containerClassName="bg-surface border border-border rounded-xl shadow-xs overflow-x-auto"
                            dense
                        />

                        {attendances.length > attPageSize && (
                            <div className="shrink-0 mt-auto pt-1">
                                <TableFooter
                                    info={`Menampilkan ${paginatedAttendances.length} dari ${attendances.length} log kehadiran`}
                                    currentPage={attSafePage}
                                    totalPages={attTotalPages}
                                    totalItems={attendances.length}
                                    perPage={attPageSize}
                                    onPageChange={setAttPage}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ══ TABLET & MOBILE LAYOUT (< lg): Content based on Active Tab ══ */}
                <div className="lg:hidden flex flex-col space-y-4 font-inter pb-28 max-sm:pb-32">
                    {/* Tab 1: Kalender Presensi (Tanpa pembungkus card ganda) */}
                    {activeTab === "calendar" && (
                        <div className="space-y-3">
                            {/* Day selection preview card (Di atas kalender) */}
                            {selectedDay && (
                                <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-card animate-slide-in shrink-0">
                                    <p className="text-[13px] font-bold text-text-primary mb-1">
                                        Rincian Tanggal {selectedDay} {MONTH_NAMES[month - 1]} {year}
                                    </p>
                                    {selectedRecord ? (
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60">
                                            <div className="flex items-center gap-2">
                                                <StatusBadge variant={selectedRecord.status} />
                                                <span className="text-[12px] text-text-muted font-mono font-semibold">
                                                    {formatCheckInTime(selectedRecord.check_in_time)
                                                        ? `${formatCheckInTime(selectedRecord.check_in_time)} WIB`
                                                        : "—"}
                                                </span>
                                            </div>
                                            {selectedRecord.photo_url && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        setPhotoModal({
                                                            url: selectedRecord.photo_url!,
                                                            date: formatDateIndo(selectedRecord.attendance_date),
                                                        })
                                                    }
                                                    className="text-[11px] font-bold"
                                                >
                                                    Foto Selfie
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-[12px] text-text-muted mt-1">
                                            Tidak ada catatan kehadiran pada tanggal ini.
                                        </p>
                                    )}
                                </div>
                            )}

                            <AttendanceCalendar
                                month={month}
                                year={year}
                                attendances={attendances}
                                selectedDay={selectedDay}
                                onSelectDay={(day) => setSelectedDay(day)}
                                dusk="mobile-attendance-calendar"
                            />
                        </div>
                    )}

                    {/* Tab 2: Daftar Kehadiran */}
                    {activeTab === "list" && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-[14px] font-bold text-text-primary">
                                    Daftar Kehadiran Bulan {MONTH_NAMES[month - 1]} {year}
                                </h3>
                                <span className="text-[12px] font-bold text-primary font-mono bg-primary/10 px-2.5 py-1 rounded-lg">
                                    {attendances.length} Catatan
                                </span>
                            </div>

                            {paginatedAttendances.length === 0 ? (
                                <EmptyState
                                    variant="no-data"
                                    title="Tidak Ada Data Presensi"
                                    description={`Belum ada catatan presensi untuk bulan ${MONTH_NAMES[month - 1]} ${year}.`}
                                />
                            ) : (
                                <div className="space-y-2.5">
                                    {paginatedAttendances.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-3.5 rounded-2xl bg-surface border border-border shadow-xs space-y-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-[13px] font-bold text-text-primary">
                                                    {formatDateIndo(item.attendance_date)}
                                                </span>
                                                <StatusBadge variant={item.status} />
                                            </div>
                                            <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[12px] text-text-secondary">
                                                <span className="font-mono">
                                                    Masuk:{" "}
                                                    <strong className="text-text-primary">
                                                        {formatCheckInTime(item.check_in_time)
                                                            ? `${formatCheckInTime(item.check_in_time)} WIB`
                                                            : "—"}
                                                    </strong>
                                                </span>
                                                {item.photo_url && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setPhotoModal({
                                                                url: item.photo_url!,
                                                                date: formatDateIndo(item.attendance_date),
                                                            })
                                                        }
                                                        className="text-primary font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <FiCamera className="text-[12px]" />
                                                        <span>Foto</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {attendances.length > attPageSize && (
                                <div className="pt-2">
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
                    )}
                </div>

            {/* 📅 BOTTOM SHEET DETAIL TANGGAL KALENDER */}
            <BottomSheet
                open={isDayDetailOpen}
                onClose={() => setIsDayDetailOpen(false)}
                title={
                    selectedDay
                        ? `Rincian Tanggal ${selectedDay} ${MONTH_NAMES[month - 1]} ${year}`
                        : "Rincian Tanggal"
                }
                subtitle="Detail catatan presensi siswa pada tanggal ini"
            >
                {selectedRecord ? (
                    <div className="flex flex-col gap-3.5 font-inter pb-2 pt-1">
                        <div className="flex items-center justify-between p-3.5 bg-surface rounded-xl border border-border">
                            <span className="text-[13px] font-semibold text-text-secondary">Status Kehadiran</span>
                            <StatusBadge variant={selectedRecord.status} />
                        </div>

                        <div className="flex items-center justify-between p-3.5 bg-surface rounded-xl border border-border">
                            <span className="text-[13px] font-semibold text-text-secondary">Waktu Masuk</span>
                            <span className="text-[14px] font-bold font-mono text-text-primary">
                                {formatCheckInTime(selectedRecord.check_in_time)
                                    ? `${formatCheckInTime(selectedRecord.check_in_time)} WIB`
                                    : "—"}
                            </span>
                        </div>

                        {selectedRecord.photo_url ? (
                            <Button
                                variant="primary"
                                onClick={() => {
                                    const rec = selectedRecord;
                                    setIsDayDetailOpen(false);
                                    setTimeout(() => {
                                        if (rec?.photo_url) {
                                            setPhotoModal({
                                                url: rec.photo_url,
                                                date: formatDateIndo(rec.attendance_date),
                                            });
                                        }
                                    }, 100);
                                }}
                                icon={<FiCamera className="text-[14px]" />}
                                className="w-full h-11 text-[13px] font-bold rounded-xl mt-1"
                            >
                                Lihat Bukti Foto Selfie
                            </Button>
                        ) : (
                            <p className="text-[12px] text-text-muted text-center py-1">
                                Tidak ada bukti foto selfie untuk presensi ini.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="py-6 text-center">
                        <p className="text-[13px] font-medium text-text-muted">
                            Tidak ada catatan presensi pada tanggal ini.
                        </p>
                    </div>
                )}
            </BottomSheet>

            {/* Photo Peek Overlay (Instagram Peek Style) */}
            <PhotoPeekModal
                open={Boolean(photoModal)}
                onClose={() => setPhotoModal(null)}
                url={photoModal?.url ?? null}
                title={`Bukti Presensi — ${photoModal?.date ?? ""}`}
            />

            {/* 📱 MOBILE FILTER BOTTOM SHEET */}
            <BottomSheet
                open={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                title="Filter Riwayat Presensi"
                subtitle="Atur bulan dan tahun rekapitulasi presensi"
            >
                <div className="flex flex-col gap-4 font-inter pb-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-text-secondary">Pilih Bulan</label>
                        <NativeSelect
                            value={monthVal}
                            onChange={(e) => {
                                const newM = e.target.value;
                                applyFilter(newM, yearVal);
                                setIsMobileFilterOpen(false);
                            }}
                            className="h-10 text-[13px] rounded-xl"
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
                                const newY = e.target.value;
                                applyFilter(monthVal, newY);
                                setIsMobileFilterOpen(false);
                            }}
                            className="h-10 text-[13px] rounded-xl"
                        >
                            {["2024", "2025", "2026", "2027"].map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>

                    {hasActiveFilters && (
                        <div className="pt-2">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    const currentM = new Date().getMonth() + 1;
                                    const currentY = new Date().getFullYear();
                                    applyFilter(currentM.toString(), currentY.toString());
                                    setIsMobileFilterOpen(false);
                                }}
                                className="w-full h-10 text-[13px] font-bold rounded-xl"
                            >
                                Reset Filter
                            </Button>
                        </div>
                    )}
                </div>
            </BottomSheet>
        </AppShell>
    );
}
