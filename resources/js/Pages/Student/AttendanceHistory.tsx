import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { AttendanceCalendar, Button, StatusBadge, Modal } from "@/Components";

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

    return (
        <AppShell title="Riwayat Presensi Siswa">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-[22px] font-bold text-text-primary font-inter">Riwayat Presensi Siswa</h1>
                    <p className="text-[13px] text-text-muted font-inter mt-0.5">
                        Daftar lengkap kehadiran <strong className="text-text-primary">{student.name}</strong> per
                        bulan.
                    </p>
                </div>

                {/* KPI Chip Rate */}
                <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="px-4 py-2 bg-surface border border-border rounded-xl shadow-sm flex items-center gap-2.5">
                        <span className="text-[11px] font-bold text-text-muted uppercase">Tingkat Kehadiran:</span>
                        <span className="text-[15px] font-bold text-primary font-mono">{stats.rate}%</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
                <select
                    value={monthVal}
                    onChange={(e) => setMonthVal(e.target.value)}
                    className="h-10 border border-border rounded-xl px-4 text-[13px] sm:text-[14px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
                    dusk="select-month"
                    data-testid="select-month"
                >
                    {MONTH_NAMES.map((name, i) => (
                        <option key={name} value={(i + 1).toString()}>
                            {name}
                        </option>
                    ))}
                </select>

                <select
                    value={yearVal}
                    onChange={(e) => setYearVal(e.target.value)}
                    className="h-10 border border-border rounded-xl px-4 text-[13px] sm:text-[14px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
                    dusk="select-year"
                    data-testid="select-year"
                >
                    {["2024", "2025", "2026", "2027"].map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </select>

                <Button
                    variant="primary"
                    size="md"
                    onClick={handleFilter}
                    dusk="btn-filter-history"
                    data-testid="btn-filter-history"
                >
                    <i className="fas fa-filter mr-1.5" />
                    Tampilkan
                </Button>
            </div>

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
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPhotoModal({
                                                    url: selectedRecord.photo_url!,
                                                    date: selectedRecord.attendance_date,
                                                })
                                            }
                                            className="text-[12px] font-bold text-primary hover:underline cursor-pointer"
                                        >
                                            Lihat Foto Selfie
                                        </button>
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

                {/* Kanan — Tabel */}
                <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card self-start">
                    <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
                        <span className="text-[13px] font-bold text-text-primary">
                            Rekapitulasi {MONTH_NAMES[month - 1]} {year}
                        </span>
                        <span className="text-[11px] font-semibold text-text-muted">
                            Total {attendances.length} Hari Terdata
                        </span>
                    </div>

                    {attendances.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                            <i className="fas fa-calendar-times text-[36px] mb-3 opacity-40" />
                            <p className="text-[14px] font-semibold">Belum ada data kehadiran</p>
                            <p className="text-[12px] mt-0.5">Pilih periode bulan dan tahun di atas.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left font-inter">
                            <thead>
                                <tr className="border-b border-border bg-muted text-[11px] font-bold text-text-muted uppercase tracking-wider">
                                    <th className="px-4 py-3">Tanggal</th>
                                    <th className="px-4 py-3">Waktu Masuk</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Foto Bukti</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendances.map((att) => (
                                    <tr
                                        key={att.id}
                                        className="border-b border-border last:border-b-0 hover:bg-background transition-colors"
                                    >
                                        <td className="px-4 py-3.5 text-[13px] font-semibold text-text-primary">
                                            {att.attendance_date}
                                        </td>
                                        <td className="px-4 py-3.5 text-[13px] text-text-secondary font-mono">
                                            {att.check_in_time ? (
                                                `${att.check_in_time} WIB`
                                            ) : (
                                                <span className="text-text-muted">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <StatusBadge variant={att.status} />
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {att.photo_url ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPhotoModal({
                                                            url: att.photo_url!,
                                                            date: att.attendance_date,
                                                        })
                                                    }
                                                    className="text-[12px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1.5"
                                                >
                                                    <i className="fas fa-camera text-[11px]" />
                                                    <span>Cek Foto</span>
                                                </button>
                                            ) : (
                                                <span className="text-[12px] text-text-muted">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
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
                    <div className="flex flex-col items-center justify-center py-12 text-text-muted bg-surface rounded-2xl border border-border">
                        <i className="fas fa-calendar-times text-[32px] mb-2 opacity-40" />
                        <p className="text-[13px] font-semibold">Belum ada data kehadiran.</p>
                    </div>
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
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPhotoModal({
                                                    url: att.photo_url!,
                                                    date: att.attendance_date,
                                                })
                                            }
                                            className="text-primary text-[14px] p-2 hover:bg-muted rounded-xl"
                                            aria-label="Lihat foto selfie"
                                        >
                                            <i className="fas fa-camera" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Pratinjau Foto Bukti Selfie */}
            {photoModal && (
                <Modal
                    open={Boolean(photoModal)}
                    onClose={() => setPhotoModal(null)}
                    title={`Bukti Foto Presensi — ${photoModal.date}`}
                    width="sm"
                >
                    <div className="flex flex-col items-center">
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
