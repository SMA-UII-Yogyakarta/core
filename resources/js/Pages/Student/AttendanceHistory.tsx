import { router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { FiCamera, FiFilter } from "react-icons/fi";
import {
    AttendanceCalendar,
    BottomSheet,
    Button,
    EmptyState,
    FilterBar,
    MobileNativePagination,
    Modal,
    NativeSelect,
    PageHeader,
    StatusBadge,
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
    const [photoModal, setPhotoModal] = useState<{ url: string; date: string } | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

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

    return (
        <AppShell title="Riwayat Presensi Siswa" headerActions={mobileHeaderActions}>
            {/* Desktop PageHeader with auto-updating Month & Year filter dropdowns */}
            <PageHeader
                title="Riwayat Presensi Siswa"
                description={`Daftar lengkap rekapitulasi kehadiran ${student.name} per bulan.`}
                className="hidden lg:flex shrink-0 mb-4"
            >
                <div className="flex items-center gap-3">
                    <FilterBar.Select
                        options={MONTH_NAMES.map((name, i) => ({
                            value: (i + 1).toString(),
                            label: name,
                        }))}
                        value={monthVal}
                        onChange={(e) => applyFilter(e.target.value, yearVal)}
                        dusk="select-month"
                        data-testid="select-month"
                        className="w-36"
                    />
                    <FilterBar.Select
                        options={["2024", "2025", "2026", "2027"].map((t) => ({
                            value: t,
                            label: t,
                        }))}
                        value={yearVal}
                        onChange={(e) => applyFilter(monthVal, e.target.value)}
                        dusk="select-year"
                        data-testid="select-year"
                        className="w-24"
                    />
                    <div className="flex items-center gap-2 bg-surface px-4 py-2 border border-border rounded-xl shadow-xs">
                        <span className="text-[12px] font-bold text-text-muted uppercase">Tingkat Kehadiran:</span>
                        <span className="text-[16px] font-bold text-primary font-mono">{stats.rate}%</span>
                    </div>
                </div>
            </PageHeader>

            <div className="space-y-6 font-inter pb-12 sm:pb-6">
                {/* Filter Controls for Tablet (hidden on mobile and desktop) */}
                <div className="hidden sm:flex lg:hidden items-center justify-between gap-3 bg-surface p-3.5 rounded-2xl border border-border shadow-xs">
                    <div className="flex items-center gap-2.5">
                        <FilterBar.Select
                            options={MONTH_NAMES.map((name, i) => ({
                                value: (i + 1).toString(),
                                label: name,
                            }))}
                            value={monthVal}
                            onChange={(e) => applyFilter(e.target.value, yearVal)}
                            dusk="select-month-tablet"
                            data-testid="select-month-tablet"
                            className="w-36"
                        />
                        <FilterBar.Select
                            options={["2024", "2025", "2026", "2027"].map((t) => ({
                                value: t,
                                label: t,
                            }))}
                            value={yearVal}
                            onChange={(e) => applyFilter(monthVal, e.target.value)}
                            dusk="select-year-tablet"
                            data-testid="select-year-tablet"
                            className="w-24"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[12px] font-bold font-mono">
                        <span>Kehadiran: {stats.rate}%</span>
                    </div>
                </div>

                {/* ══ DESKTOP: 2 kolom kalender + tabel (12-kolom grid seimbang di lg+) ══ */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-start">
                    {/* Kiri — Kalender Visual (5 Kolom) */}
                    <div className="lg:col-span-5 min-w-0 space-y-4">
                        <AttendanceCalendar
                            month={month}
                            year={year}
                            attendances={attendances}
                            selectedDay={selectedDay}
                            onSelectDay={(day) => setSelectedDay(day)}
                            dusk="student-attendance-calendar"
                        />

                        {/* Day selection preview card */}
                        {selectedDay && (
                            <div className="p-4 rounded-2xl bg-surface border border-border shadow-card animate-slide-in">
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
                    </div>

                    {/* Kanan — Tabel Riwayat Kehadiran (7 Kolom) */}
                    <div className="lg:col-span-7 min-w-0 space-y-3">
                        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-card">
                            <h3 className="text-[15px] font-bold text-text-primary mb-3">
                                Rincian Log Kehadiran — {MONTH_NAMES[month - 1]} {year}
                            </h3>
                            <Table<AttendanceRecord>
                                columns={columns}
                                data={paginatedAttendances}
                                keyExtractor={(row) => row.id}
                                emptyMessage="Belum ada data kehadiran untuk bulan yang dipilih."
                            />
                            {attendances.length > attPageSize && (
                                <TableFooter
                                    info={`Menampilkan ${paginatedAttendances.length} dari ${attendances.length} log kehadiran`}
                                    currentPage={attSafePage}
                                    totalPages={attTotalPages}
                                    totalItems={attendances.length}
                                    perPage={attPageSize}
                                    onPageChange={setAttPage}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* ══ MOBILE & TABLET: Card stack log kehadiran (< lg) ════════════════ */}
                <div className="lg:hidden space-y-4">
                    {/* Visual Calendar for Tablet/Mobile */}
                    <div className="bg-surface rounded-2xl border border-border p-4 shadow-card">
                        <AttendanceCalendar
                            month={month}
                            year={year}
                            attendances={attendances}
                            selectedDay={selectedDay}
                            onSelectDay={(day) => setSelectedDay(day)}
                            dusk="mobile-attendance-calendar"
                        />
                    </div>

                    {/* Log List Header */}
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[14px] font-bold text-text-primary font-inter">
                            Daftar Kehadiran Bulan {MONTH_NAMES[month - 1]} {year}
                        </h3>
                        <span className="text-[12px] font-bold text-primary font-mono bg-primary/10 px-2.5 py-1 rounded-lg">
                            {attendances.length} Catatan
                        </span>
                    </div>

                    {/* Mobile Card List */}
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

                    {/* Pagination (< lg) */}
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
            </div>

            {/* Photo Modal */}
            {photoModal && (
                <Modal open={true} onClose={() => setPhotoModal(null)} title={`Bukti Presensi — ${photoModal.date}`}>
                    <div className="flex flex-col items-center justify-center p-4">
                        <img
                            src={photoModal.url}
                            alt="Bukti Kehadiran"
                            className="max-h-[360px] w-auto rounded-xl object-contain border border-border shadow-md"
                        />
                        <div className="mt-4 w-full flex justify-end">
                            <Button variant="secondary" onClick={() => setPhotoModal(null)}>
                                Tutup
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

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
