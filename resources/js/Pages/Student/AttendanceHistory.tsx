import { useState } from "react";
import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";

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
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DAY_LABELS = ["M", "S", "S", "R", "K", "J", "S"];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month - 1, 1).getDay();
}

function statusDotColor(status: string): string {
    const s = status.toLowerCase();
    if (s === "present") return "#10B981";
    if (s === "late") return "#F59E0B";
    return "#EF4444";
}

function statusLabel(status: string): string {
    const s = status.toLowerCase();
    if (s === "present") return "HADIR";
    if (s === "late") return "TERLAMBAT";
    return "ALPA";
}

function statusColor(status: string): string {
    const s = status.toLowerCase();
    if (s === "present") return "#10B981";
    if (s === "late") return "#F59E0B";
    return "#EF4444";
}

function mobileStatusLabel(status: string): string {
    const s = status.toLowerCase();
    if (s === "present") return "Hadir Tepat Waktu";
    if (s === "late") return "Terlambat Hadir";
    return "Tanpa Keterangan";
}

function mobileStatusIcon(status: string): string {
    const s = status.toLowerCase();
    if (s === "present") return "fas fa-check";
    if (s === "late") return "fas fa-clock";
    return "fas fa-times";
}

function mobileStatusColors(status: string): { iconBg: string; iconColor: string; rowBg: string } {
    const s = status.toLowerCase();
    if (s === "present") return { iconBg: "#DCFCE7", iconColor: "#10B981", rowBg: "#FFFFFF" };
    if (s === "late")    return { iconBg: "#FEF3C7", iconColor: "#F59E0B", rowBg: "#FFFDEB" };
    return                       { iconBg: "#FEE2E2", iconColor: "#EF4444", rowBg: "#FFFAFA" };
}

function dayFromDate(dateStr: string): number {
    return parseInt(dateStr.split("-")[2], 10);
}

function formatLongDate(dateStr: string): string {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

export default function AttendanceHistory({
    student: _student,
    attendances,
    month,
    year,
}: PageProps) {
    const [monthVal, setMonthVal] = useState(month.toString());
    const [yearVal, setYearVal] = useState(year.toString());
    const [photoModal, setPhotoModal] = useState<{ url: string; date: string } | null>(null);

    // Build attendance map: day → record
    const attendanceMap = new Map<number, AttendanceRecord>();
    for (const att of attendances) {
        attendanceMap.set(dayFromDate(att.attendance_date), att);
    }

    // Build calendar grid (Sun-first)
    const totalDays = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    const today = new Date();

    const handleFilter = () => {
        router.get("/student/history", { month: monthVal, year: yearVal }, { preserveState: true });
    };

    return (
        <AppShell title="Riwayat Kehadiran">

            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-[22px] font-bold text-text-primary font-inter">
                    Riwayat Kehadiran
                </h1>
                <p className="text-[13px] text-text-muted font-inter mt-1">
                    Pantau rekapitulasi kehadiran Anda setiap bulannya.
                </p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
                <select
                    value={monthVal}
                    onChange={(e) => setMonthVal(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    {MONTH_NAMES.map((name, i) => (
                        <option key={i} value={(i + 1).toString()}>{name}</option>
                    ))}
                </select>
                <select
                    value={yearVal}
                    onChange={(e) => setYearVal(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    {["2024", "2025", "2026", "2027"].map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={handleFilter}
                    className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white hover:opacity-90 active:scale-[0.98] transition-all"
                    style={{ background: "#2E3391" }}
                >
                    Tampilkan
                </button>
            </div>

            {/* ══ DESKTOP: 2 kolom kalender + tabel ══════════════════════════ */}
            <div className="hidden lg:grid lg:grid-cols-[1fr_1.5fr] gap-5">

                {/* Kiri — Kalender visual */}
                <div className="bg-surface border border-border rounded-xl p-5">
                    <h2 className="text-[15px] font-bold text-text-primary font-inter mb-4">
                        Kalender {MONTH_NAMES[month - 1]} {year}
                    </h2>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-1">
                        {DAY_LABELS.map((d, i) => (
                            <div key={i} className="flex items-center justify-center text-[11px] font-bold text-text-muted py-1">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Date cells */}
                    <div className="grid grid-cols-7 gap-y-1">
                        {cells.map((day, idx) => {
                            if (!day) return <div key={idx} />;
                            const att = attendanceMap.get(day);
                            const isToday =
                                day === today.getDate() &&
                                month === today.getMonth() + 1 &&
                                year === today.getFullYear();

                            return (
                                <div key={idx} className="flex flex-col items-center gap-0.5 py-1">
                                    <span
                                        className={`text-[12px] font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                                            isToday ? "bg-primary text-white" : "text-text-primary"
                                        }`}
                                    >
                                        {day}
                                    </span>
                                    {att ? (
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ background: statusDotColor(att.status) }}
                                        />
                                    ) : (
                                        <span className="w-1.5 h-1.5" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border flex-wrap">
                        {[
                            { color: "#10B981", label: "Hadir" },
                            { color: "#F59E0B", label: "Terlambat" },
                            { color: "#EF4444", label: "Alpa" },
                        ].map(({ color, label }) => (
                            <div key={label} className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                                <span className="text-[11px] text-text-muted">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Kanan — Tabel */}
                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                    {attendances.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                            <i className="fas fa-calendar-times text-[32px] mb-3 opacity-40" />
                            <p className="text-[13px]">Belum ada data kehadiran.</p>
                        </div>
                    ) : (
                        <table className="w-full border-collapse font-inter">
                            <thead>
                                <tr className="border-b border-border bg-background">
                                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-text-muted uppercase tracking-wide">Tanggal</th>
                                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-text-muted uppercase tracking-wide">Waktu</th>
                                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-text-muted uppercase tracking-wide">Status</th>
                                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-text-muted uppercase tracking-wide">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendances.map((att) => (
                                    <tr key={att.id} className="border-b border-border last:border-b-0 hover:bg-background transition-colors">
                                        <td className="px-4 py-3 text-[13px] font-semibold text-text-primary">
                                            {att.attendance_date}
                                        </td>
                                        <td className="px-4 py-3 text-[13px] text-text-secondary">
                                            {att.check_in_time
                                                ? `${att.check_in_time} WIB`
                                                : <span className="text-text-muted">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-[12px] font-bold" style={{ color: statusColor(att.status) }}>
                                                {statusLabel(att.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {att.photo_url ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setPhotoModal({ url: att.photo_url!, date: att.attendance_date })}
                                                    className="text-[12px] font-medium hover:underline"
                                                    style={{ color: "#2E3391" }}
                                                >
                                                    Cek Foto
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

            {/* ══ MOBILE: list view ═══════════════════════════════════════════ */}
            <div className="lg:hidden">
                {attendances.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                        <i className="fas fa-calendar-times text-[32px] mb-3 opacity-40" />
                        <p className="text-[13px]">Belum ada data kehadiran.</p>
                    </div>
                ) : (
                    <div className="bg-surface border border-border rounded-xl overflow-hidden">
                        <div className="px-4 py-2.5 bg-background border-b border-border">
                            <span className="text-[11px] font-bold text-text-muted">
                                Bulan {MONTH_NAMES[month - 1]} {year}
                            </span>
                        </div>

                        {attendances.map((att, idx) => {
                            const { iconBg, iconColor, rowBg } = mobileStatusColors(att.status);
                            const isLast = idx === attendances.length - 1;
                            return (
                                <div
                                    key={att.id}
                                    className={`flex items-center px-4 py-3 gap-3 ${!isLast ? "border-b border-border" : ""}`}
                                    style={{ background: rowBg }}
                                >
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                                        style={{ background: iconBg }}
                                    >
                                        <i
                                            className={`${mobileStatusIcon(att.status)} text-[12px]`}
                                            style={{ color: iconColor }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="text-[13px] font-bold leading-tight"
                                            style={{ color: att.status.toLowerCase() === "present" ? "#000000" : iconColor }}
                                        >
                                            {mobileStatusLabel(att.status)}
                                        </p>
                                        <p className="text-[11px] text-text-muted mt-0.5 truncate">
                                            {formatLongDate(att.attendance_date)}
                                        </p>
                                    </div>
                                    <span className="text-[12px] font-bold text-text-primary shrink-0">
                                        {att.check_in_time ?? "--:--"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Photo modal */}
            {photoModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
                    onClick={() => setPhotoModal(null)}
                >
                    <div
                        className="bg-white rounded-2xl overflow-hidden max-w-sm w-full shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <span className="text-[14px] font-bold text-text-primary">Foto Presensi</span>
                            <button
                                type="button"
                                onClick={() => setPhotoModal(null)}
                                className="text-text-muted hover:text-text-primary text-[16px]"
                                aria-label="Tutup"
                            >
                                <i className="fas fa-times" />
                            </button>
                        </div>
                        <img
                            src={photoModal.url}
                            alt={`Foto presensi ${photoModal.date}`}
                            className="w-full object-cover"
                        />
                        <div className="px-4 py-3 text-center">
                            <p className="text-[12px] text-text-muted">{photoModal.date}</p>
                        </div>
                    </div>
                </div>
            )}
        </AppShell>
    );
}
