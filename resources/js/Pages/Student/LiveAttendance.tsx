import { useEffect, useRef, useState, useMemo } from "react";
import { router, usePage } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import Button from "@/Components/ui/Button";
import { LiveBadge } from "@/Components";
import ErrorAlert from "@/Components/common/ErrorAlert";
import {
    FiCheck,
    FiCheckCircle,
    FiClock,
    FiInfo,
    FiLoader,
    FiMapPin,
    FiSend,
    FiUser,
} from "react-icons/fi";
import { attendanceCheckInSchema } from "@/schemas/attendanceCheckIn.schema";
import { validateForm } from "@/utils/zodHelper";
import {
    calculateDistance,
    formatDistance,
    isWithinSchoolGeofence,
    SMA_UII_LOCATION,
} from "@/utils/geoHelper";
import { compressImageFromVideo } from "@/utils/imageCompressor";

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

export default function LiveAttendance({ todayAttendance }: PageProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [currentTime, setCurrentTime] = useState<string>("");

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { errors } = usePage().props as { errors?: Record<string, string> };

    // Live clock
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }) + " WIB",
            );
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto-start camera & GPS on mount
    useEffect(() => {
        let isMounted = true;

        async function initMedia() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user", width: 640, height: 480 },
                    audio: false,
                });
                if (!isMounted) {
                    mediaStream.getTracks().forEach((t) => t.stop());
                    return;
                }
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
                setCameraReady(true);
            } catch {
                if (isMounted) {
                    setError("Kamera tidak tersedia. Pastikan izin kamera sudah diberikan di pengaturan browser.");
                }
            }
        }

        function initGps() {
            if (!navigator.geolocation) {
                if (isMounted) setGpsStatus("error");
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    if (isMounted) {
                        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                        setGpsStatus("locked");
                    }
                },
                () => {
                    if (isMounted) setGpsStatus("error");
                },
                { timeout: 15000, enableHighAccuracy: true },
            );
        }

        initMedia();
        initGps();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        return () => {
            if (stream) stream.getTracks().forEach((t) => t.stop());
        };
    }, [stream]);

    // Distance calculation
    const distanceMeters = useMemo(() => {
        if (!coords) return null;
        return calculateDistance(coords.lat, coords.lng);
    }, [coords]);

    const isInsideRadius = useMemo(() => {
        if (!coords) return false;
        return isWithinSchoolGeofence(coords.lat, coords.lng);
    }, [coords]);

    const handleSubmit = () => {
        setError(null);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) {
            setError("Kamera belum siap. Mohon tunggu sejenak.");
            return;
        }

        const compression = compressImageFromVideo(video, canvas, 20 * 1024, 320, 240);
        if (compression.sizeInBytes > 20 * 1024) {
            setError(`Ukuran foto (${compression.sizeInKb} KB) melebihi batas 20 KB. Silakan coba lagi.`);
            return;
        }

        const photoBase64 = compression.base64;

        // Client Zod validation
        const payload = {
            latitude: coords ? coords.lat : 0,
            longitude: coords ? coords.lng : 0,
            photo_blob: photoBase64,
        };

        const validation = validateForm(attendanceCheckInSchema, payload);
        if (!validation.success) {
            const firstError = Object.values(validation.errors)[0];
            setError(firstError || "Data presensi tidak lengkap.");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("latitude", payload.latitude.toString());
        formData.append("longitude", payload.longitude.toString());
        formData.append("photo_blob", photoBase64);

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
                const msg = typeof err === "string" ? err : Object.values(err as Record<string, string>).join(", ");
                setError(msg || "Terjadi kesalahan saat memproses presensi. Silakan coba lagi.");
                setLoading(false);
            },
        });
    };

    // Submit button
    const renderSubmitButton = (label: string, isMobile = false) => {
        if (todayAttendance) {
            return (
                <div
                    className="flex items-center justify-center gap-2 px-5 py-3.5 bg-success-bg border border-success-light rounded-xl text-success font-bold text-[13px]"
                    dusk="attendance-status-success"
                    data-testid="attendance-status-success"
                >
                    <FiCheckCircle className="text-[16px]" />
                    <span>Sudah presensi pukul {todayAttendance.check_in_time} WIB</span>
                </div>
            );
        }
        return (
            <Button
                type="button"
                variant="success"
                size={isMobile ? "md" : "lg"}
                onClick={handleSubmit}
                disabled={loading || !cameraReady}
                loading={loading}
                className="w-full font-bold shadow-md"
                dusk={isMobile ? "btn-submit-mobile" : "btn-submit-attendance"}
                data-testid={isMobile ? "btn-submit-mobile" : "btn-submit-attendance"}
                icon={<FiSend className="w-4 h-4" />}
            >
                {label}
            </Button>
        );
    };

    return (
        <AppShell title="Live Presensi Siswa">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                <div>
                    <h1 className="text-[22px] font-bold text-text-primary font-inter">Live Presensi Masuk</h1>
                    <p className="text-[13px] text-text-muted font-inter mt-0.5">
                        Posisikan wajah Anda di dalam lingkaran panduan dan pastikan GPS terkunci.
                    </p>
                </div>

                {currentTime && (
                    <div
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[13px] font-bold font-mono self-start sm:self-auto"
                        dusk="live-clock-badge"
                    >
                        <FiClock className="text-[12px]" />
                        <span>{currentTime}</span>
                    </div>
                )}
            </div>

            {/* Error banner */}
            {(error || errors?.message) && (
                <div className="mb-5" dusk="attendance-error-alert" data-testid="attendance-error-alert">
                    <ErrorAlert message={error || errors?.message || "Terjadi kesalahan presensi."} />
                </div>
            )}

            {/* ══ DESKTOP: 2 kolom webcam & peta geofence ════════════════════ */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-6">
                {/* Kiri — Webcam container */}
                <div
                    className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-card border border-border flex items-center justify-center"
                    dusk="webcam-container"
                    data-testid="webcam-container"
                >
                    {/* LIVE badge */}
                    {cameraReady && !todayAttendance && (
                        <div className="absolute top-3.5 left-3.5 z-10">
                            <LiveBadge label="LIVE WEBCAM" variant="dark" pulse size="md" dusk="webcam-live-badge" />
                        </div>
                    )}

                    {/* Video stream */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        dusk="video-preview"
                        data-testid="video-preview"
                        className={`w-full h-full object-cover transition-opacity duration-300 ${cameraReady ? "opacity-100" : "opacity-0"}`}
                    />

                    {/* Guide circle */}
                    {!todayAttendance && (
                        <div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            aria-hidden="true"
                        >
                            <div className="w-[210px] h-[210px] rounded-full border-2 border-dashed border-accent opacity-80 animate-pulse" />
                        </div>
                    )}

                    {/* Placeholder */}
                    {!cameraReady && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted/40">
                            <FiUser className="text-[80px] mb-3" />
                            <p className="text-[13px] font-medium text-white/60">Mengaktifkan kamera selfie...</p>
                        </div>
                    )}

                    {/* Success overlay */}
                    {todayAttendance && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm">
                            <div className="w-16 h-16 rounded-full bg-success text-white flex items-center justify-center text-[28px] mb-3 shadow-lg">
                                <FiCheck />
                            </div>
                            <p className="text-white font-bold text-[18px]">Presensi Berhasil</p>
                            <p className="text-white/80 text-[13px] mt-1 font-mono">
                                {todayAttendance.check_in_time} WIB
                            </p>
                        </div>
                    )}
                </div>

                {/* Kanan — Geofence & Submit */}
                <div className="flex flex-col">
                    <div className="flex-1 rounded-2xl bg-surface border border-border p-6 shadow-card flex flex-col justify-between mb-4">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <FiMapPin className="text-[15px]" />
                                    </div>
                                    <div>
                                        <h2 className="text-[15px] font-bold text-text-primary">
                                            {SMA_UII_LOCATION.name}
                                        </h2>
                                        <p className="text-[12px] text-text-muted">{SMA_UII_LOCATION.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Geofence Status Card */}
                            <div className="p-4 rounded-xl bg-muted border border-border/80 mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[12px] font-bold text-text-muted uppercase tracking-wider">
                                        Status Geofence Radius
                                    </span>
                                    {gpsStatus === "locked" ? (
                                        <LiveBadge
                                            label={isInsideRadius ? "DI DALAM RADIUS" : "DI LUAR RADIUS"}
                                            variant={isInsideRadius ? "success" : "warning"}
                                            size="sm"
                                        />
                                    ) : (
                                        <LiveBadge label="GPS ACQUIRING" variant="primary" size="sm" />
                                    )}
                                </div>

                                {coords ? (
                                    <div className="space-y-1.5 font-inter">
                                        <p className="text-[13px] font-bold text-text-primary flex items-center gap-2">
                                <FiMapPin
                                    className={
                                        isInsideRadius ? "text-success" : "text-warning"
                                    }
                                />
                                            <span>
                                                Jarak ke sekolah:{" "}
                                                <strong className="text-primary">
                                                    {distanceMeters !== null ? formatDistance(distanceMeters) : "-"}
                                                </strong>
                                            </span>
                                        </p>
                                        <p className="text-[11px] text-text-muted font-mono">
                                            Koordinat: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-[12px] text-text-muted flex items-center gap-2">
                                        <FiLoader className="animate-spin text-primary" />
                                        <span>Menghubungkan ke satelit GPS...</span>
                                    </p>
                                )}
                            </div>

                            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 text-[12px] text-text-secondary leading-relaxed">
                                    <FiInfo className="text-primary mr-1.5" />
                                Presensi wajib dilakukan dari lingkungan sekolah dengan toleransi radius maksimal{" "}
                                <strong>{SMA_UII_LOCATION.maxRadiusMeters} meter</strong>.
                            </div>
                        </div>

                        <div className="mt-6">{renderSubmitButton("KIRIM DATA PRESENSI")}</div>
                    </div>
                </div>
            </div>

            {/* ══ MOBILE: Full-screen stream layout ══════════════════════════ */}
            <div className="lg:hidden flex flex-col gap-4">
                {/* Video container */}
                <div className="relative w-full rounded-2xl overflow-hidden bg-black min-h-[350px] shadow-card flex items-center justify-center">
                    {cameraReady && !todayAttendance && (
                        <div className="absolute top-3.5 left-3.5 z-10">
                            <LiveBadge label="LIVE" variant="dark" pulse size="sm" dusk="mobile-live-badge" />
                        </div>
                    )}

                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full object-cover min-h-[350px] transition-opacity duration-300 ${cameraReady ? "opacity-100" : "opacity-0"}`}
                    />

                    {/* Guide circle */}
                    {!todayAttendance && (
                        <div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            aria-hidden="true"
                        >
                            <div className="w-[190px] h-[190px] rounded-full border-2 border-accent opacity-80 animate-pulse" />
                        </div>
                    )}

                    {/* Placeholder */}
                    {!cameraReady && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted/40">
                            <FiUser className="text-[70px] mb-2" />
                            <p className="text-[12px] text-white/60">Mengaktifkan kamera...</p>
                        </div>
                    )}

                    {/* Geofence status on mobile */}
                    {gpsStatus === "locked" && !todayAttendance && (
                        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-10">
                            <LiveBadge
                                label={
                                    isInsideRadius
                                        ? `DALAM RADIUS (${distanceMeters !== null ? formatDistance(distanceMeters) : ""})`
                                        : `LUAR RADIUS (${distanceMeters !== null ? formatDistance(distanceMeters) : ""})`
                                }
                                variant={isInsideRadius ? "success" : "warning"}
                                size="sm"
                                dusk="mobile-gps-badge"
                            />
                        </div>
                    )}

                    {/* Success overlay */}
                    {todayAttendance && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm">
                            <div className="w-14 h-14 rounded-full bg-success text-white flex items-center justify-center text-[24px] mb-2 shadow-lg">
                                <FiCheck />
                            </div>
                            <p className="text-white font-bold text-[16px]">Presensi Berhasil</p>
                            <p className="text-white/80 text-[12px] mt-1 font-mono">
                                {todayAttendance.check_in_time} WIB
                            </p>
                        </div>
                    )}
                </div>

                {/* Location card & action button */}
                <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-3.5 shadow-card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FiMapPin className="text-[16px]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-text-primary truncate">
                                {SMA_UII_LOCATION.name}
                            </p>
                            <p className="text-[11px] text-text-muted">
                                {gpsStatus === "locked"
                                    ? `Jarak: ${distanceMeters !== null ? formatDistance(distanceMeters) : "-"}`
                                    : "Mendeteksi posisi satelit..."}
                            </p>
                        </div>
                    </div>

                    {renderSubmitButton("KIRIM KEHADIRAN SEKARANG", true)}
                </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </AppShell>
    );
}
