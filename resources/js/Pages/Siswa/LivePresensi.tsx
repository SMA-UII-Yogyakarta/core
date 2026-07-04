import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import Button from "@/Components/ui/Button";
import SiswaLayout from "@/Layouts/SiswaLayout";

interface Student {
    id: number;
    nis: string;
    name: string;
    class: { id: number; name: string } | null;
}

interface TodayAttendance {
    id: number;
    status: string;
    check_in_time: string;
    attendance_date: string;
}

interface PageProps {
    student: Student;
    todayAttendance: TodayAttendance | null;
}

export default function LivePresensi({ student, todayAttendance }: PageProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const { errors } = usePage().props as { errors?: Record<string, string> };

    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });
    const dateStr = now.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const handleCheckIn = () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Get location
        if (!navigator.geolocation) {
            setError("Geolocation tidak didukung di browser ini.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                router.post(
                    "/siswa/live-presensi/checkin",
                    {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        photo_url: "",
                    },
                    {
                        preserveState: true,
                        onSuccess: () => {
                            setSuccess("Presensi berhasil!");
                            setLoading(false);
                        },
                        onError: (err) => {
                            setError(Object.values(err).join(", "));
                            setLoading(false);
                        },
                    },
                );
            },
            () => {
                // Fallback: submit without location
                router.post(
                    "/siswa/live-presensi/checkin",
                    {
                        latitude: 0,
                        longitude: 0,
                        photo_url: "",
                    },
                    {
                        preserveState: true,
                        onSuccess: () => {
                            setSuccess("Presensi berhasil!");
                            setLoading(false);
                        },
                        onError: (err) => {
                            setError(Object.values(err).join(", "));
                            setLoading(false);
                        },
                    },
                );
            },
            { timeout: 10000 },
        );
    };

    return (
        <SiswaLayout
            title="Live Presensi"
            userInitial={student.name.charAt(0)}
            showBack
            backHref="/siswa/dashboard"
        >
            <main className="flex-1 flex flex-col items-center justify-center p-6">
                {/* Time Display */}
                <div className="text-center mb-8">
                    <div className="text-[48px] font-bold text-text-primary font-inter">
                        {timeStr}
                    </div>
                    <div className="text-[14px] text-text-muted mt-2">
                        {dateStr}
                    </div>
                </div>

                {/* Camera Placeholder */}
                <div className="w-full max-w-xs aspect-square bg-surface border-2 border-dashed border-border rounded-2xl flex items-center justify-center mb-8">
                    <div className="text-center text-text-muted">
                        <div className="text-[40px] mb-2">📷</div>
                        <div className="text-[13px]">Kamera</div>
                    </div>
                </div>

                {/* Status */}
                {todayAttendance ? (
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-5 py-3 bg-success-bg border border-success-light rounded-xl text-success font-semibold text-[14px]">
                            <span className="w-3 h-3 bg-success rounded-full" />
                            Sudah Check In — {todayAttendance.check_in_time}
                        </div>
                    </div>
                ) : (
                    <Button
                        onClick={handleCheckIn}
                        loading={loading}
                        size="lg"
                        className="w-full max-w-xs py-4 text-[16px]"
                    >
                        {loading ? "Memproses..." : "Check In"}
                    </Button>
                )}

                {/* Messages */}
                {error && (
                    <div className="mt-4 px-4 py-3 bg-danger-bg border border-danger-light rounded-lg text-[13px] text-danger">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mt-4 px-4 py-3 bg-success-bg border border-success-light rounded-lg text-[13px] text-success font-semibold">
                        {success}
                    </div>
                )}
                {errors?.message && (
                    <div className="mt-4 px-4 py-3 bg-danger-bg border border-danger-light rounded-lg text-[13px] text-danger">
                        {errors.message}
                    </div>
                )}

                {/* Back */}
                <a
                    href="/siswa/dashboard"
                    className="mt-8 text-[13px] text-primary hover:underline"
                >
                    &larr; Kembali ke Dashboard
                </a>
            </main>
        </SiswaLayout>
    );
}
