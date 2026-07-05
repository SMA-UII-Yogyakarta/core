import { useState, useEffect } from "react";
import {
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaCalendarAlt,
    FaChevronDown,
    FaPlus,
    FaUserGraduate,
} from "react-icons/fa";
import { Badge } from "@/Components/ui/index";
import WaliMuridLayout from "@/Layouts/WaliMuridLayout";

/* ===== Mock Data ===== */
const mockChildren = [
    {
        id: 1,
        name: "Ahmad Reza Pahlevi",
        class: "X-A (Reguler)",
        nis: "1234567890",
    },
    {
        id: 2,
        name: "Siti Nurhaliza",
        class: "XI-B (Reguler)",
        nis: "1234567891",
    },
];

const todayAttendance = {
    status: "present" as const,
    time: "06:45 WIB",
    date: "Selasa, 02 Juni 2026",
    message: "Anak Anda Telah Hadir",
};

const monthlyStats = { hadir: 18, sakit: 1, izin: 1, alpha: 0 };

const monthlyAttendance = [
    {
        id: 1,
        date: "01 Jun 2026",
        day: "Senin",
        time: "06:45",
        status: "hadir" as const,
    },
    {
        id: 2,
        date: "02 Jun 2026",
        day: "Selasa",
        time: "06:50",
        status: "hadir" as const,
    },
    {
        id: 3,
        date: "03 Jun 2026",
        day: "Rabu",
        time: "07:00",
        status: "hadir" as const,
    },
    {
        id: 4,
        date: "04 Jun 2026",
        day: "Kamis",
        time: "-",
        status: "alpha" as const,
    },
    {
        id: 5,
        date: "05 Jun 2026",
        day: "Jumat",
        time: "06:55",
        status: "hadir" as const,
    },
];

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
        present: {
            label: "Hadir",
            className: "bg-success/10 text-success border border-success/20",
        },
    };

export default function Dashboard() {
    const [selectedChild, setSelectedChild] = useState(mockChildren[0].id);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const activeChild = mockChildren.find((c) => c.id === selectedChild);

    if (loading) {
        return (
            <WaliMuridLayout title="Dashboard Wali Murid">
                <div className="h-12 bg-surface animate-pulse rounded-lg border border-border mb-4" />
                <div className="h-32 bg-surface animate-pulse rounded-lg border border-border mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-24 bg-surface animate-pulse rounded-lg border border-border"
                        />
                    ))}
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-16 bg-surface animate-pulse rounded-lg border border-border"
                        />
                    ))}
                </div>
            </WaliMuridLayout>
        );
    }

    if (error) {
        return (
            <WaliMuridLayout title="Dashboard Wali Murid">
                <div className="bg-danger-light border border-danger-border rounded-lg p-4 flex items-start gap-3">
                    <FaTimesCircle className="text-danger mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-danger">
                            Gagal memuat data
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                            {error}
                        </p>
                        <button
                            onClick={() => {
                                setError(null);
                                setLoading(true);
                                setTimeout(() => setLoading(false), 800);
                            }}
                            className="mt-2 text-xs font-semibold text-primary hover:underline"
                        >
                            Coba lagi
                        </button>
                    </div>
                </div>
            </WaliMuridLayout>
        );
    }

    return (
        <WaliMuridLayout title="Dashboard Wali Murid">
            {/* Child Selector */}
            <div className="bg-surface rounded-lg border border-border p-4 mb-4">
                <label className="text-xs font-medium text-text-muted mb-2 block">
                    Pilih Anak
                </label>
                <div className="relative">
                    <select
                        value={selectedChild}
                        onChange={(e) =>
                            setSelectedChild(Number(e.target.value))
                        }
                        className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 pr-10"
                    >
                        {mockChildren.map((child) => (
                            <option key={child.id} value={child.id}>
                                {child.name} — {child.class}
                            </option>
                        ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
                </div>
            </div>

            {/* Today's Status Card */}
            <div className="bg-surface rounded-lg border border-border p-4 md:p-6 mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                        <FaCheckCircle className="w-8 h-8 text-success" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-text-primary">
                            {todayAttendance.message}
                        </h3>
                        <p className="text-xs text-text-muted">
                            {todayAttendance.date}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-text-secondary flex items-center gap-1">
                                <FaClock className="w-3 h-3" />{" "}
                                {todayAttendance.time}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/10 text-success border border-success/20">
                                Hadir
                            </span>
                        </div>
                    </div>
                </div>
                {activeChild && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                        <FaUserGraduate className="w-3.5 h-3.5 text-text-muted" />
                        <span className="text-xs text-text-secondary">
                            {activeChild.name} — {activeChild.class}
                        </span>
                    </div>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-surface rounded-lg border border-border p-4 text-center">
                    <p className="text-lg md:text-2xl font-bold text-success">
                        {monthlyStats.hadir}
                    </p>
                    <p className="text-[10px] md:text-xs text-text-muted mt-1">
                        Hadir
                    </p>
                </div>
                <div className="bg-surface rounded-lg border border-border p-4 text-center">
                    <p className="text-lg md:text-2xl font-bold text-primary">
                        {monthlyStats.sakit}
                    </p>
                    <p className="text-[10px] md:text-xs text-text-muted mt-1">
                        Sakit
                    </p>
                </div>
                <div className="bg-surface rounded-lg border border-border p-4 text-center">
                    <p className="text-lg md:text-2xl font-bold text-primary">
                        {monthlyStats.izin}
                    </p>
                    <p className="text-[10px] md:text-xs text-text-muted mt-1">
                        Izin
                    </p>
                </div>
                <div className="bg-surface rounded-lg border border-border p-4 text-center">
                    <p className="text-lg md:text-2xl font-bold text-danger">
                        {monthlyStats.alpha}
                    </p>
                    <p className="text-[10px] md:text-xs text-text-muted mt-1">
                        Alpha
                    </p>
                </div>
            </div>

            {/* Monthly Attendance List */}
            <div className="bg-surface rounded-lg border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-text-primary">
                        Presensi Bulan Ini
                    </h3>
                    <span className="text-xs text-text-muted">
                        <FaCalendarAlt className="w-3 h-3 inline mr-1" /> Juni
                        2026
                    </span>
                </div>

                {monthlyAttendance.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-text-muted">
                        <FaCalendarAlt className="w-10 h-10 mb-3" />
                        <p className="text-sm">
                            Belum ada data presensi bulan ini
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {monthlyAttendance.map((item) => {
                            const badge =
                                statusBadgeStyles[item.status] ??
                                statusBadgeStyles.alpha;
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                item.status === "hadir"
                                                    ? "bg-success/10 text-success"
                                                    : item.status === "alpha"
                                                      ? "bg-danger/10 text-danger"
                                                      : "bg-accent/20 text-primary"
                                            }`}
                                        >
                                            {item.status === "hadir" ? (
                                                <FaCheckCircle className="w-4 h-4" />
                                            ) : item.status === "alpha" ? (
                                                <FaTimesCircle className="w-4 h-4" />
                                            ) : (
                                                <FaClock className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-text-primary">
                                                {item.day}, {item.date}
                                            </p>
                                            <p className="text-[11px] text-text-muted">
                                                Masuk: {item.time}
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
                )}
            </div>

            {/* Floating "Ajukan Izin" Button (mobile) */}
            <button className="fixed bottom-6 right-6 z-10 w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors md:hidden">
                <FaPlus className="w-5 h-5" />
            </button>

            {/* Desktop: Ajukan Izin */}
            <div className="hidden md:block mt-6">
                <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary rounded-md hover:bg-primary/90 transition-colors">
                    <FaPlus className="w-3.5 h-3.5" /> Ajukan Izin
                </button>
            </div>
        </WaliMuridLayout>
    );
}
