import { useEffect, useRef, useState, useCallback } from "react";
import { router, usePage } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";

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

type GpsStatus = "idle" | "acquiring" | "locked" | "error";

export default function LiveAttendance({ student, todayAttendance }: PageProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { errors } = usePage().props as { errors?: Record<string, string> };

    // Auto-start camera on mount
    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: 640, height: 480 },
                audio: false,
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setCameraReady(true);
        } catch {
            setError("Kamera tidak tersedia. Pastikan izin kamera sudah diberikan.");
        }
    }, []);

    // Auto-acquire GPS on mount
    const startGps = useCallback(() => {
        if (!navigator.geolocation) {
            setGpsStatus("error");
            return;
        }
        setGpsStatus("acquiring");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setGpsStatus("locked");
            },
            () => setGpsStatus("error"),
            { timeout: 15000, enableHighAccuracy: true },
        );
    }, []);

    useEffect(() => {
        startCamera();
        startGps();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        return () => {
            if (stream) stream.getTracks().forEach((t) => t.stop());
        };
    }, [stream]);

    const capturePhoto = (): string => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return "";
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext("2d");
        if (!ctx) return "";
        ctx.drawImage(video, 0, 0, 320, 240);
        return canvas.toDataURL("image/jpeg", 0.7);
    };

    const handleSubmit = () => {
        setLoading(true);
        setError(null);

        const photoBlob = capturePhoto();
        const formData = new FormData();
        formData.append("latitude", coords ? coords.lat.toString() : "0");
        formData.append("longitude", coords ? coords.lng.toString() : "0");
        formData.append("photo_blob", photoBlob.split(",")[1] || "");

        router.post("/student/attendance/check-in", formData, {
            preserveState: true,
            headers: { "Content-Type": "multipart/form-data" },
            onSuccess: () => {
                setLoading(false);
                if (stream) {
                    stream.getTracks().forEach((t) => t.stop());
                    setStream(null);
                }
            },
            onError: (err) => {
                const msg =
                    typeof err === "string"
                        ? err
                        : Object.values(err as Record<string, string>).join(", ");
                setError(msg || "Terjadi kesalahan. Silakan coba lagi.");
                setLoading(false);
            },
        });
    };

    // ── Reusable: tombol submit ───────────────────────────────────────────────
    const SubmitButton = ({ label }: { label: string }) => {
        if (todayAttendance) {
            return (
                <div className="flex items-center justify-center gap-2 px-5 py-3 bg-success-bg border border-success-light rounded-xl text-success font-semibold text-[13px]">
                    <i className="fas fa-check-circle text-[15px]" />
                    <span>Sudah presensi pukul {todayAttendance.check_in_time} WIB</span>
                </div>
            );
        }
        return (
            <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !cameraReady}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-bold text-[14px] tracking-wide text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#10B981" }}
            >
                {loading ? (
                    <>
                        <i className="fas fa-spinner fa-spin" />
                        <span>Mengirim...</span>
                    </>
                ) : (
                    <>
                        <i className="fas fa-paper-plane" />
                        <span>{label}</span>
                    </>
                )}
            </button>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <AppShell title="Live Presensi">

            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-[22px] font-bold text-text-primary font-inter">
                    Ambil Foto &amp; Lokasi Presensi
                </h1>
                <p className="text-[13px] text-text-muted font-inter mt-1">
                    Pastikan wajah Anda berada di dalam lingkaran dan GPS aktif.
                </p>
            </div>

            {/* Error */}
            {(error || errors?.message) && (
                <div className="mb-5 px-4 py-3 bg-danger-bg border border-danger-light rounded-lg text-[13px] text-danger flex items-center gap-2">
                    <i className="fas fa-exclamation-circle" />
                    <span>{error ?? errors?.message}</span>
                </div>
            )}

            {/* ══ DESKTOP: 2 kolom ══════════════════════════════════════════ */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-5">

                {/* Kiri — Webcam */}
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                    {/* LIVE badge */}
                    {cameraReady && !todayAttendance && (
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60">
                            <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                            <span className="text-white text-[11px] font-bold tracking-wider">
                                LIVE WEBCAM
                            </span>
                        </div>
                    )}

                    {/* Video */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover transition-opacity duration-300 ${cameraReady ? "opacity-100" : "opacity-0"}`}
                    />

                    {/* Guide circle kuning dashed */}
                    {!todayAttendance && (
                        <div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            aria-hidden="true"
                        >
                            <div
                                className="rounded-full"
                                style={{
                                    width: 200,
                                    height: 200,
                                    border: "2px dashed #FAE62A",
                                    opacity: 0.7,
                                }}
                            />
                        </div>
                    )}

                    {/* Placeholder saat kamera belum siap */}
                    {!cameraReady && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <i className="fas fa-user text-[80px]" style={{ color: "#333" }} />
                        </div>
                    )}

                    {/* Success overlay */}
                    {todayAttendance && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                            <i className="fas fa-check-circle text-[48px] mb-3" style={{ color: "#10B981" }} />
                            <p className="text-white font-bold text-[16px]">Presensi Berhasil</p>
                            <p className="text-white/70 text-[13px] mt-1">{todayAttendance.check_in_time} WIB</p>
                        </div>
                    )}
                </div>

                {/* Kanan — GPS + tombol */}
                <div className="flex flex-col gap-0">
                    {/* Peta placeholder */}
                    <div
                        className="flex-1 rounded-t-xl flex items-center justify-center min-h-[220px]"
                        style={{ background: "#E2E8F0" }}
                    >
                        {gpsStatus === "locked" ? (
                            <div className="text-center">
                                <i className="fas fa-map-marker-alt text-[36px] mb-2" style={{ color: "#EF4444" }} />
                                <p className="text-[12px]" style={{ color: "#64748B" }}>Lokasi terdeteksi</p>
                            </div>
                        ) : gpsStatus === "acquiring" ? (
                            <div className="text-center">
                                <i className="fas fa-spinner fa-spin text-[30px] mb-2" style={{ color: "#94A3B8" }} />
                                <p className="text-[12px]" style={{ color: "#64748B" }}>Mengambil lokasi...</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <i className="fas fa-map text-[36px] mb-2" style={{ color: "#EF4444" }} />
                                <p className="text-[12px]" style={{ color: "#64748B" }}>GPS tidak tersedia</p>
                            </div>
                        )}
                    </div>

                    {/* Info lokasi */}
                    <div className="bg-white border border-border rounded-b-xl px-4 py-3 mb-3">
                        <p className="text-[13px] font-bold text-text-primary">
                            Lokasi Terkunci: SMA UII Yogyakarta
                        </p>
                        {coords ? (
                            <p className="text-[11px] text-text-muted mt-0.5">
                                Lat: {coords.lat.toFixed(4)} | Long: {coords.lng.toFixed(4)}
                            </p>
                        ) : gpsStatus === "acquiring" ? (
                            <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1">
                                <i className="fas fa-spinner fa-spin text-[10px]" />
                                Mendapatkan lokasi...
                            </p>
                        ) : (
                            <p className="text-[11px] text-warning mt-0.5">Lokasi tidak tersedia</p>
                        )}
                    </div>

                    <SubmitButton label="KIRIM DATA PRESENSI" />
                </div>
            </div>

            {/* ══ MOBILE: full-screen style ══════════════════════════════════ */}
            <div className="lg:hidden flex flex-col">

                {/* Kamera area */}
                <div
                    className="relative w-full rounded-t-xl overflow-hidden bg-black"
                    style={{ minHeight: 340 }}
                >
                    {/* LIVE badge */}
                    {cameraReady && !todayAttendance && (
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60">
                            <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                            <span className="text-white text-[10px] font-bold tracking-wider">LIVE</span>
                        </div>
                    )}

                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full object-cover transition-opacity duration-300 ${cameraReady ? "opacity-100" : "opacity-0"}`}
                        style={{ minHeight: 340 }}
                    />

                    {/* Guide circle kuning solid */}
                    {!todayAttendance && (
                        <div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            aria-hidden="true"
                        >
                            <div
                                className="rounded-full"
                                style={{
                                    width: 180,
                                    height: 180,
                                    border: "2px solid #FAE62A",
                                    opacity: 0.65,
                                }}
                            />
                        </div>
                    )}

                    {/* Placeholder */}
                    {!cameraReady && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <i className="fas fa-user text-[70px]" style={{ color: "#333" }} />
                        </div>
                    )}

                    {/* GPS Locked badge */}
                    {gpsStatus === "locked" && !todayAttendance && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50">
                            <i className="fas fa-map-marker-alt text-[10px]" style={{ color: "#10B981" }} />
                            <span className="text-white text-[10px]">GPS Locked</span>
                        </div>
                    )}

                    {/* Success overlay */}
                    {todayAttendance && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                            <i className="fas fa-check-circle text-[48px] mb-3" style={{ color: "#10B981" }} />
                            <p className="text-white font-bold text-[16px]">Presensi Berhasil</p>
                            <p className="text-white/70 text-[13px] mt-1">{todayAttendance.check_in_time} WIB</p>
                        </div>
                    )}
                </div>

                {/* Card info lokasi + tombol */}
                <div className="bg-white border border-border rounded-b-xl px-4 py-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <i
                                className={`fas fa-map-marker-alt text-[14px] ${gpsStatus === "locked" ? "text-success" : "text-text-muted"}`}
                            />
                        </div>
                        <div>
                            <p className="text-[12px] font-bold text-text-primary">SMA UII Yogyakarta</p>
                            <p className="text-[11px] text-text-muted">
                                {gpsStatus === "locked"
                                    ? "Lokasi Sesuai Radius"
                                    : gpsStatus === "acquiring"
                                    ? "Mengambil lokasi..."
                                    : "Lokasi tidak tersedia"}
                            </p>
                        </div>
                    </div>

                    <SubmitButton label="KIRIM KEHADIRAN" />
                </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </AppShell>
    );
}
