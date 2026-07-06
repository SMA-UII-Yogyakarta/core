import { useEffect, useRef, useState } from "react";
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
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraReady, setCameraReady] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
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

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((t) => t.stop());
            }
        };
    }, [stream]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: 320, height: 240 },
                audio: false,
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setCameraReady(true);
        } catch {
            setError("Kamera tidak tersedia. Silakan izinkan akses kamera.");
        }
    };

    const capturePhoto = (): string => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return "";

        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext("2d");
        if (!ctx) return "";

        ctx.drawImage(video, 0, 0, 320, 240);
        return canvas.toDataURL("image/jpeg", 0.9);
    };

    const handleCheckIn = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!navigator.geolocation) {
            setError("Geolocation tidak didukung di browser ini.");
            setLoading(false);
            return;
        }

        if (!cameraReady) {
            await startCamera();
        }

        // Small delay to ensure camera is ready
        setTimeout(() => {
            const photoBlob = capturePhoto();

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const formData = new FormData();
                    formData.append("latitude", position.coords.latitude.toString());
                    formData.append("longitude", position.coords.longitude.toString());
                    formData.append("photo_blob", photoBlob.split(",")[1] || "");

                    router.post("/siswa/live-presensi/checkin", formData, {
                        preserveState: true,
                        headers: { "Content-Type": "multipart/form-data" },
                        onSuccess: () => {
                            setSuccess("Presensi berhasil!");
                            setLoading(false);
                            if (stream) {
                                stream.getTracks().forEach((t) => t.stop());
                                setStream(null);
                            }
                        },
                        onError: (err) => {
                            const msg = typeof err === "string" ? err : Object.values(err).join(", ");
                            setError(msg || "Terjadi kesalahan.");
                            setLoading(false);
                        },
                    });
                },
                () => {
                    const formData = new FormData();
                    formData.append("latitude", "0");
                    formData.append("longitude", "0");
                    formData.append("photo_blob", photoBlob.split(",")[1] || "");

                    router.post("/siswa/live-presensi/checkin", formData, {
                        preserveState: true,
                        headers: { "Content-Type": "multipart/form-data" },
                        onSuccess: () => {
                            setSuccess("Presensi berhasil!");
                            setLoading(false);
                            if (stream) {
                                stream.getTracks().forEach((t) => t.stop());
                                setStream(null);
                            }
                        },
                        onError: (err) => {
                            const msg = typeof err === "string" ? err : Object.values(err).join(", ");
                            setError(msg || "Terjadi kesalahan.");
                            setLoading(false);
                        },
                    });
                },
                { timeout: 10000 },
            );
        }, 500);
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

                {/* Camera / Video */}
                <div className="w-full max-w-xs aspect-square bg-surface border-2 border-dashed border-border rounded-2xl flex items-center justify-center mb-8 overflow-hidden">
                    {cameraReady ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-center text-text-muted">
                            <div className="text-[40px] mb-2">📷</div>
                            <div className="text-[13px]">Kamera</div>
                        </div>
                    )}
                </div>

                <canvas ref={canvasRef} className="hidden" />

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
