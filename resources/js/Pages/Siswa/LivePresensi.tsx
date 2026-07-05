import { useState, useEffect } from "react";
import {
    FaCamera,
    FaCheckCircle,
    FaTimes,
    FaMapMarkerAlt,
} from "react-icons/fa";
import SiswaLayout from "@/Layouts/SiswaLayout";
import { Button } from "@/Components/ui/index";

export default function LivePresensi() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [simulatedLoading, setSimulatedLoading] = useState(true);

    // Simulate initial data loading
    useEffect(() => {
        const timer = setTimeout(() => setSimulatedLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    // Real-time clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) =>
        date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "Asia/Jakarta",
        });

    const formatDate = (date: Date) =>
        date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Jakarta",
        });

    const handlePresensi = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setIsCheckedIn((prev) => !prev);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1500);
    };

    const studentName = "Ahmad Reza Pahlevi";
    const studentClass = "X-A (Reguler)";

    /* ===== Loading State ===== */
    if (simulatedLoading) {
        return (
            <SiswaLayout title="AMBIL PRESENSI">
                <div className="h-64 bg-surface animate-pulse rounded-xl border-2 border-dashed border-border mb-4" />
                <div className="bg-surface rounded-lg border border-border p-4 md:p-6 animate-pulse">
                    <div className="space-y-3">
                        <div className="h-4 bg-background rounded w-48" />
                        <div className="h-8 bg-background rounded w-32" />
                        <div className="h-12 bg-background rounded" />
                    </div>
                </div>
            </SiswaLayout>
        );
    }

    return (
        <SiswaLayout title="AMBIL PRESENSI">
            {/* Success Banner */}
            {showSuccess && (
                <div
                    className={`mb-4 p-3 rounded-lg flex items-center gap-3 text-sm font-semibold border ${
                        isCheckedIn
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-accent/20 text-primary border-accent/30"
                    }`}
                >
                    <FaCheckCircle className="w-4 h-4 shrink-0" />
                    <span>
                        {isCheckedIn
                            ? "Berhasil Check In! Selamat datang di sekolah."
                            : "Berhasil Check Out! Sampai jumpa."}
                    </span>
                </div>
            )}

            {/* Camera Placeholder */}
            <div className="h-64 bg-muted rounded-xl border-2 border-dashed border-border flex items-center justify-center mb-4">
                <div className="flex flex-col items-center gap-2 text-text-muted">
                    <FaCamera className="w-16 h-16 text-text-muted/40" />
                    <p className="text-xs">Area Kamera</p>
                    <p className="text-[10px] text-text-muted/60">
                        Pastikan wajah terlihat jelas
                    </p>
                </div>
            </div>

            {/* Info Panel */}
            <div className="bg-surface rounded-lg border border-border p-4 md:p-6 mb-4">
                {/* Real-time Clock */}
                <div className="text-center mb-4">
                    <p className="text-sm text-text-muted">
                        {formatDate(currentTime)}
                    </p>
                    <p className="text-3xl md:text-4xl font-bold text-primary font-mono tracking-wider">
                        {formatTime(currentTime)}
                    </p>
                    <p className="text-xs text-text-muted mt-1">WIB</p>
                </div>

                {/* Student Info */}
                <div className="bg-background rounded-lg p-3 border border-border mb-4">
                    <p className="text-xs text-text-muted">Siswa</p>
                    <p className="text-sm font-bold text-text-primary">
                        {studentName}
                    </p>
                    <p className="text-xs text-text-secondary">
                        {studentClass}
                    </p>
                </div>

                {/* Location Status */}
                <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg mb-4">
                    <FaMapMarkerAlt className="w-4 h-4 text-success shrink-0" />
                    <p className="text-xs text-success font-semibold">
                        Lokasi: Anda berada di lingkungan sekolah ✓
                    </p>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 p-3 bg-background rounded-lg border border-border">
                    <div
                        className={`w-3 h-3 rounded-full shrink-0 ${
                            isCheckedIn ? "bg-accent" : "bg-text-muted"
                        }`}
                    />
                    <span
                        className={`text-xs font-semibold ${
                            isCheckedIn ? "text-primary" : "text-text-muted"
                        }`}
                    >
                        {isCheckedIn ? "Sudah Check In" : "Belum Check In"}
                    </span>
                </div>
            </div>

            {/* Action Button */}
            <Button
                variant={isCheckedIn ? "import" : "primary"}
                size="lg"
                className="w-full rounded-xl py-4 font-bold"
                icon={isCheckedIn ? undefined : FaCamera}
                loading={loading}
                onClick={handlePresensi}
            >
                {isCheckedIn ? "CHECK OUT" : "CHECK IN"}
            </Button>
        </SiswaLayout>
    );
}
