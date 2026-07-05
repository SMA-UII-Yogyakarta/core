import { useState, useEffect } from "react";
import { FaVideo, FaCheckCircle, FaClock, FaCalendarAlt } from "react-icons/fa";
import SiswaLayout from "@/Layouts/SiswaLayout";
import {
    Button,
    StatCard,
    Badge,
    EmptyState,
    ErrorState,
} from "@/Components/ui/index";

const statusBadgeStyles: Record<string, { label: string; className: string }> =
    {
        hadir: {
            label: "Hadir",
            className: "bg-success/10 text-success border border-success/20",
        },
        sakit: {
            label: "Sakit",
            className: "bg-danger/10 text-danger border border-danger/20",
        },
        izin: {
            label: "Izin",
            className: "bg-accent/20 text-primary border border-accent/30",
        },
        alpha: {
            label: "Alpha",
            className: "bg-background text-text-muted border border-border",
        },
    };

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const studentName = "Ahmad Reza Pahlevi";
    const studentClass = "X-A (Reguler)";
    const nis = "1234567890";
    const lastPresence = "06:45 WIB";

    const timeline = [
        { id: 1, time: "06:45 WIB", status: "hadir" as const },
        { id: 2, time: "15:30 WIB", status: "hadir" as const },
    ];

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

    /* ===== Loading ===== */
    if (loading) {
        return (
            <SiswaLayout title="Dashboard Siswa">
                <div className="bg-surface rounded-lg border border-border p-4 mb-4 animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-background" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-background rounded w-48" />
                            <div className="h-3 bg-background rounded w-32" />
                            <div className="h-3 bg-background rounded w-24" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 mb-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="min-w-[140px] flex-1 h-24 bg-surface animate-pulse rounded-lg border border-border"
                        />
                    ))}
                </div>
                <div className="h-14 bg-surface animate-pulse rounded-xl mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-16 bg-surface animate-pulse rounded-lg border border-border"
                        />
                    ))}
                </div>
            </SiswaLayout>
        );
    }

    /* ===== Error ===== */
    if (error) {
        return (
            <SiswaLayout title="Dashboard Siswa">
                <ErrorState
                    message={error}
                    onRetry={() => {
                        setError(null);
                        setLoading(true);
                        setTimeout(() => setLoading(false), 800);
                    }}
                />
            </SiswaLayout>
        );
    }

    /* ===== Empty ===== */
    if (timeline.length === 0) {
        return (
            <SiswaLayout title="Dashboard Siswa">
                <div className="bg-surface rounded-lg border border-border p-4 md:p-6 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-sm">
                                {getInitials(studentName)}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-base md:text-lg font-bold text-text-primary truncate">
                                {studentName}
                            </h2>
                            <p className="text-xs md:text-sm text-text-secondary">
                                {studentClass}
                            </p>
                            <p className="text-xs text-text-muted">
                                NIS: {nis}
                            </p>
                        </div>
                    </div>
                </div>
                <EmptyState
                    title="Belum Ada Presensi Hari Ini"
                    description="Belum ada data kehadiran untuk hari ini."
                />
            </SiswaLayout>
        );
    }

    /* ===== Data View ===== */
    return (
        <SiswaLayout title="Dashboard Siswa">
            {/* Student Info Header */}
            <div className="bg-surface rounded-lg border border-border p-4 md:p-6 mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-sm">
                            {getInitials(studentName)}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base md:text-lg font-bold text-text-primary truncate">
                            {studentName}
                        </h2>
                        <p className="text-xs md:text-sm text-text-secondary">
                            {studentClass}
                        </p>
                        <p className="text-xs text-text-muted">NIS: {nis}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-1 text-xs text-text-muted">
                        <FaCalendarAlt className="w-3.5 h-3.5" />
                        <span>Selasa, 02 Juni 2026</span>
                    </div>
                </div>
            </div>

            {/* Stat Cards — horizontal scroll mobile, grid desktop */}
            <div className="flex gap-3 overflow-x-auto pb-2 mb-4 md:grid md:grid-cols-3 md:overflow-x-visible md:pb-0 scrollbar-none">
                <div className="min-w-[140px] md:min-w-0 flex-1">
                    <StatCard
                        title="Kehadiran Bulan Ini"
                        value="20 Hari"
                        icon={FaCheckCircle}
                        color="primary"
                    />
                </div>
                <div className="min-w-[140px] md:min-w-0 flex-1">
                    <StatCard
                        title="Izin Tersisa"
                        value="5 Hari"
                        icon={FaClock}
                        color="warning"
                    />
                </div>
                <div className="min-w-[140px] md:min-w-0 flex-1">
                    <StatCard
                        title="Sakit"
                        value="2 Hari"
                        icon={FaCalendarAlt}
                        color="danger"
                    />
                </div>
            </div>

            {/* Presensi Sekarang Button */}
            <button className="w-full bg-primary text-white rounded-xl py-4 mb-4 md:mb-6 text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 active:bg-primary/80 transition-colors">
                <FaVideo className="w-4 h-4" />
                Presensi Sekarang
            </button>

            {/* Today's Attendance Timeline */}
            <div className="bg-surface rounded-lg border border-border p-4 md:p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-text-primary">
                        Presensi Hari Ini
                    </h3>
                    <span className="text-xs text-text-muted">
                        Selasa, 02 Juni 2026
                    </span>
                </div>

                <div className="space-y-3">
                    {timeline.map((entry) => {
                        const badge =
                            statusBadgeStyles[entry.status] ??
                            statusBadgeStyles.alpha;
                        return (
                            <div
                                key={entry.id}
                                className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <FaClock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-text-primary">
                                            {entry.time}
                                        </p>
                                        <p className="text-[10px] text-text-muted">
                                            Presensi
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.className}`}
                                >
                                    {badge.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Info */}
            <div className="bg-surface rounded-lg border border-border p-4 flex items-center gap-3">
                <FaClock className="w-4 h-4 text-text-muted" />
                <p className="text-xs text-text-muted">
                    Terakhir Presensi:{" "}
                    <span className="font-semibold text-text-primary">
                        {lastPresence}
                    </span>
                </p>
            </div>
        </SiswaLayout>
    );
}
