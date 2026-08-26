import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import {
    AttendanceCalendar,
    Button,
    StatusBadge,
    Modal,
    PageHeader,
    Table,
    EmptyState,
    FilterBar,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import { FiCamera, FiFilter } from "react-icons/fi";

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

const MONTH_NAMES = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
];

export default function AttendanceHistory({ student, attendances, month, year }: PageProps) {
    const [monthVal, setMonthVal] = useState(month.toString());
    const [yearVal, setYearVal] = useState(year.toString());
    const [photoModal, setPhotoModal] = useState<{ url: string; date: string } | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    // Calculate monthly rate percentage
    const stats = useMemo(() => {
        const total = attendances.length;
        const present = attendances.filter((a) => {
            const s = a.status.toLowerCase();
            return s === "present" || s === "hadir";
        }).length;
        const late = attendances.filter((a) => {
            const s = a.status.toLowerCase();
            return s === "late" || s === "terlambat";
        }).length;
        const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;
        return { total, present, late, rate };
    }, [attendances]);

    const handleFilter = () => {
        router.get(
            "/student/history",
            { month: monthVal, year: yearVal },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["attendances", "month", "year"],
            },
        );
    };

    // Find record for selected day
    const selectedRecord = useMemo(() => {
        if (!selectedDay) return null;
        return attendances.find((a) => {
            const d = new Date(a.attendance_date);
            return d.getDate() === selectedDay;
        });
    }, [attendances, selectedDay]);

    const columns: Column<AttendanceRecord>[] = [
        {
            key: "attendance_date",
            header: "Tanggal",
            render: (att) => <span className="font-semibold text-text-primary">{att.attendance_date}</span>,
        },
        {
            key: "check_in_time",
            header: "Waktu Masuk",
            render: (att) => (
                <span className="font-mono text-text-secondary">
                    {att.check_in_time ? `${att.check_in_time} WIB` : "—"}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (att) => <StatusBadge variant={att.status} />,
        },
        {
            key: "photo",
            header: "Foto Bukti",
            render: (att) =>
                att.photo_url ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            setPhotoModal({
                                url: att.photo_url!,
                                date: att.attendance_date,
                            })
                        }
                        className="text-[12px]"
                        icon={<FiCamera className="text-[12px]" />}
                    >
                        Cek Foto
                    </Button>
                ) : (
                    <span className="text-[12px] text-text-muted">—</span>
                ),
        },
    ];

    return (
        <AppShell title="Riwayat Presensi Siswa">
            <PageHeader
                title="Riwayat Presensi Siswa"
                description={`Daftar lengkap rekapitulasi kehadiran ${student.name} per bulan.`}
            >
                <div className="flex items-center gap-2 bg-surface px-4 py-2 border border-border rounded-xl shadow-xs">
                    <span className="text-[12px] font-bold text-text-muted uppercase">Tingkat Kehadiran:</span>
                    <span className="text-[16px] font-bold text-primary font-mono">{stats.rate}%</span>
                </div>
            </PageHeader>

            <div className="space-y-6 font-inter">
                {/* Filter Controls */}
                <FilterBar>
                    <FilterBar.Select
                        label="Bulan"
                        options={MONTH_NAMES.map((name, i) => ({
                            value: (i + 1).toString(),
                            label: name,
                        }))}
                        value={monthVal}
                        onChange={(e) => setMonthVal(e.target.value)}
                        dusk="select-month"
                        data-testid="select-month"
                    />
                    <FilterBar.Select
                        label="Tahun"
                        options={["2024", "2025", "2026", "2027"].map((t) => ({
                            value: t,
                            label: t,
                        }))}
                        value={yearVal}
                        onChange={(e) => setYearVal(e.target.value)}
                        dusk="select-year"
                        data-testid="select-year"
                    />
                    <Button
                        variant="primary"
                        onClick={handleFilter}
                        icon={<FiFilter className="w-4 h-4" />}
                        dusk="btn-filter-history"
                        data-testid="btn-filter-history"
                    >
                        Tampilkan
                    </Button>
                </FilterBar>

                {/* ══ DESKTOP: 2 kolom kalender + tabel ══════════════════════════ */}
                <div className="hidden lg:grid lg:grid-cols-[1.1fr_1.4fr] gap-6">
                    {/* Kiri — Kalender Visual Composable */}
                    <div className="space-y-4">
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
                                            <span className="text-[12px] text-text-muted font-mono">
                                                {selectedRecord.check_in_time ? `${selectedRecord.check_in_time} WIB` : "-"}
                                            </span>
                                        </div>
                                        {selectedRecord.photo_url && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setPhotoModal({
                                                        url: selectedRecord.photo_url!,
                                                        date: selectedRecord.attendance_date,
                                                    })
                                                }
                                                className="text-[12px] text-primary"
                                            >
                                                Lihat Foto Selfie
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-[12px] text-text-muted mt-1">
                                        Tidak ada catatan presensi pada tanggal ini (Libur / Alpa).
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Kanan — Standalone Table */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[14px] font-bold text-text-primary">
                                Rekapitulasi {MONTH_NAMES[month - 1]} {year}
                            </span>
                            <span className="text-[12px] text-text-muted">
                                Total {attendances.length} Hari Terdata
                            </span>
                        </div>

                        <Table
                            columns={columns}
                            data={attendances}
                            keyExtractor={(att) => att.id}
                            emptyMessage="Belum ada data kehadiran untuk periode bulan dan tahun ini."
                        />
                    </div>
                </div>

                {/* ══ MOBILE: Kalender + List View ═══════════════════════════════ */}
                <div className="lg:hidden flex flex-col gap-4 font-inter">
                    <AttendanceCalendar
                        month={month}
                        year={year}
                        attendances={attendances}
                        selectedDay={selectedDay}
                        onSelectDay={(day) => setSelectedDay(day)}
                        dusk="mobile-attendance-calendar"
                    />

                    {attendances.length === 0 ? (
                        <EmptyState
                            variant="no-history"
                            title="Belum Ada Data Kehadiran"
                            description={`Belum ada riwayat kehadiran untuk periode ${MONTH_NAMES[month - 1]} ${year}.`}
                            className="bg-surface rounded-2xl border border-border"
                        />
                    ) : (
                        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card">
                            <div className="px-4 py-3 bg-muted border-b border-border flex items-center justify-between">
                                <span className="text-[12px] font-bold text-text-primary">
                                    Bulan {MONTH_NAMES[month - 1]} {year}
                                </span>
                                <span className="text-[11px] font-bold text-primary font-mono">{stats.rate}% Hadir</span>
                            </div>

                            {attendances.map((att, idx) => {
                                const isLast = idx === attendances.length - 1;
                                return (
                                    <div
                                        key={att.id}
                                        className={`flex items-center px-4 py-3.5 gap-3 ${
                                            !isLast ? "border-b border-border" : ""
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-bold text-text-primary">
                                                {att.attendance_date}
                                            </p>
                                            <p className="text-[11px] text-text-muted font-mono mt-0.5">
                                                {att.check_in_time ? `${att.check_in_time} WIB` : "Tidak ada jam"}
                                            </p>
                                        </div>

                                        <StatusBadge variant={att.status} />

                                        {att.photo_url && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setPhotoModal({
                                                        url: att.photo_url!,
                                                        date: att.attendance_date,
                                                    })
                                                }
                                                className="text-primary px-2"
                                                aria-label="Lihat foto selfie"
                                            >
                                                <FiCamera className="text-[14px]" />
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Pratinjau Foto Bukti Selfie */}
            {photoModal && (
                <Modal
                    open={Boolean(photoModal)}
                    onClose={() => setPhotoModal(null)}
                    title={`Bukti Foto Presensi — ${photoModal.date}`}
                    width="sm"
                >
                    <div className="flex flex-col items-center font-inter">
                        <img
                            src={photoModal.url}
                            alt="Foto Selfie Siswa"
                            className="w-full rounded-xl object-cover max-h-[340px] shadow-sm border border-border"
                        />
                        <div className="mt-3 text-center">
                            <p className="text-[12px] font-semibold text-text-primary">{student.name}</p>
                            <p className="text-[11px] text-text-muted">NIS: {student.nis}</p>
                        </div>
                    </div>
                </Modal>
            )}
        </AppShell>
    );
}
