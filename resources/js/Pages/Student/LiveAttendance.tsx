import { router, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiCheck, FiCheckCircle, FiClock, FiMapPin, FiSend } from "react-icons/fi";
import { LiveBadge, PageHeader } from "@/Components";
import { toast } from "@/Components/common/Toast";
import { FaceLivenessOverlay } from "@/Components/student/FaceLivenessOverlay";
import { LiveAttendanceMap } from "@/Components/student/LiveAttendanceMap";
import Button from "@/Components/ui/Button";
import { useFaceLiveness } from "@/hooks/useFaceLiveness";
import AppShell from "@/Layouts/AppShell";
import { attendanceCheckInSchema } from "@/schemas/attendanceCheckIn.schema";
import { calculateDistance, formatDistance, isWithinSchoolGeofence, SMA_UII_LOCATION } from "@/utils/geoHelper";
import { compressImageFromVideo } from "@/utils/imageCompressor";
import { validateForm } from "@/utils/zodHelper";

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

interface SchoolLocation {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
}

interface PageProps {
    student: Student;
    todayAttendance: TodayAttendance | null;
    schoolLocation?: SchoolLocation | null;
}

type GpsStatus = "idle" | "acquiring" | "locked" | "error";

export default function LiveAttendance({ todayAttendance, schoolLocation }: PageProps) {
    const activeLocation = useMemo(() => {
        return (
            schoolLocation ?? {
                name: SMA_UII_LOCATION.name,
                address: SMA_UII_LOCATION.address,
                latitude: SMA_UII_LOCATION.latitude,
                longitude: SMA_UII_LOCATION.longitude,
                radius_meters: SMA_UII_LOCATION.maxRadiusMeters,
            }
        );
    }, [schoolLocation]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [currentTime, setCurrentTime] = useState<string>("");

    const desktopVideoRef = useRef<HTMLVideoElement>(null);
    const mobileVideoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const videoRefs = useMemo(() => [desktopVideoRef, mobileVideoRef], []);

    // Face Recognition & Liveness Detection Hook
    const {
        status: livenessStatus,
        isModelLoaded,
        isHeadAligned,
        hasBlinked,
        isLivenessVerified,
        feedbackMessage,
    } = useFaceLiveness(videoRefs, cameraReady);

    const { errors } = usePage().props as { errors?: Record<string, string> };

    // Toast notifications for errors to avoid pushing layout down
    useEffect(() => {
        if (error) {
            toast.error(error, { id: "attendance-error", duration: 5000 });
        }
    }, [error]);

    useEffect(() => {
        if (errors?.message) {
            toast.error(errors.message, { id: "attendance-server-error", duration: 5000 });
        }
    }, [errors]);

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

    // Sync stream to both desktop and mobile video elements whenever stream is ready
    useEffect(() => {
        if (!stream) return;
        if (desktopVideoRef.current && desktopVideoRef.current.srcObject !== stream) {
            desktopVideoRef.current.srcObject = stream;
            desktopVideoRef.current.play().catch(() => {});
        }
        if (mobileVideoRef.current && mobileVideoRef.current.srcObject !== stream) {
            mobileVideoRef.current.srcObject = stream;
            mobileVideoRef.current.play().catch(() => {});
        }
    }, [stream, cameraReady]);

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
                    mediaStream.getTracks().forEach((t) => {
                        t.stop();
                    });
                    return;
                }
                setStream(mediaStream);
                if (desktopVideoRef.current) {
                    desktopVideoRef.current.srcObject = mediaStream;
                    desktopVideoRef.current.play().catch(() => {});
                }
                if (mobileVideoRef.current) {
                    mobileVideoRef.current.srcObject = mediaStream;
                    mobileVideoRef.current.play().catch(() => {});
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
            if (stream) {
                stream.getTracks().forEach((t) => {
                    t.stop();
                });
            }
        };
    }, [stream]);

    // Distance calculation
    const distanceMeters = useMemo(() => {
        if (!coords) return null;
        return calculateDistance(coords.lat, coords.lng, activeLocation.latitude, activeLocation.longitude);
    }, [coords, activeLocation]);

    const isInsideRadius = useMemo(() => {
        if (!coords) return false;
        return isWithinSchoolGeofence(
            coords.lat,
            coords.lng,
            activeLocation.radius_meters,
            activeLocation.latitude,
            activeLocation.longitude,
        );
    }, [coords, activeLocation]);

    const canSubmit = cameraReady && (isLivenessVerified || livenessStatus === "unsupported" || !isModelLoaded);

    const handleSubmit = () => {
        setError(null);

        const video =
            desktopVideoRef.current && desktopVideoRef.current.videoWidth > 0
                ? desktopVideoRef.current
                : mobileVideoRef.current || desktopVideoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) {
            setError("Kamera belum siap. Mohon tunggu sejenak.");
            return;
        }

        // Liveness verification check
        if (cameraReady && isModelLoaded && !isLivenessVerified && livenessStatus !== "unsupported") {
            setError(feedbackMessage || "Harap posisikan wajah di dalam lingkaran dan kedipkan mata 1x.");
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
            is_liveness_verified: isLivenessVerified,
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
        formData.append("is_liveness_verified", isLivenessVerified ? "1" : "0");

        router.post("/student/attendance/check-in", formData, {
            preserveState: true,
            headers: { "Content-Type": "multipart/form-data" },
            onSuccess: () => {
                setLoading(false);
                if (stream) {
                    stream.getTracks().forEach((t) => {
                        t.stop();
                    });
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
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-success-bg border border-success-light rounded-xl text-success font-bold text-[13px] shadow-xs w-full"
                    dusk="attendance-status-success"
                    data-testid="attendance-status-success"
                >
                    <FiCheckCircle className="text-[16px] shrink-0" />
                    <span>Sudah presensi masuk pukul {todayAttendance.check_in_time} WIB</span>
                </div>
            );
        }
        return (
            <Button
                type="button"
                variant={canSubmit ? "success" : "secondary"}
                size={isMobile ? "md" : "lg"}
                onClick={handleSubmit}
                disabled={loading || !cameraReady}
                loading={loading}
                className={`w-full font-extrabold text-[14px] sm:text-[15px] py-3 sm:py-3.5 shadow-md rounded-xl justify-center transition-all ${
                    canSubmit
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.99]"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-border"
                }`}
                dusk={isMobile ? "btn-submit-mobile" : "btn-submit-attendance"}
                data-testid={isMobile ? "btn-submit-mobile" : "btn-submit-attendance"}
                icon={<FiSend className="w-4 h-4" />}
            >
                <span>
                    {isLivenessVerified || !isModelLoaded || livenessStatus === "unsupported"
                        ? label
                        : "VERIFIKASI WAJAH DULU"}
                </span>
            </Button>
        );
    };

    // GPS status pill — injected into the mobile blue header bar via headerActions
    const mobileGpsPill = (
        <div
            className={`md:hidden inline-flex items-center gap-1.5 px-2.5 h-7 rounded-lg border text-[11px] font-semibold transition-colors shrink-0 ${
                coords
                    ? isInsideRadius
                        ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/40"
                        : "bg-amber-500/20 text-amber-200 border-amber-400/40"
                    : "bg-white/10 text-white/60 border-white/20"
            }`}
            dusk="mobile-header-gps-pill"
        >
            <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    coords ? (isInsideRadius ? "bg-emerald-400" : "bg-amber-400") : "bg-white/40 animate-pulse"
                }`}
            />
            <FiMapPin className="text-[11px] shrink-0" />
            <span className="font-mono">
                {coords && distanceMeters !== null
                    ? isInsideRadius
                        ? `${distanceMeters}m ✓`
                        : `-${distanceMeters - activeLocation.radius_meters}m`
                    : gpsStatus === "error"
                      ? "GPS ✗"
                      : "GPS..."}
            </span>
        </div>
    );

    return (
        <AppShell
            title="AMBIL PRESENSI"
            onBack={() => router.get("/student/dashboard")}
            showBottomNav={false}
            showSearch={false}
            showNotificationBellOnMobile={false}
            mobileTopSpacing="auto"
            mainClassName="h-full flex-1 overflow-hidden p-3 sm:p-4 lg:px-6 lg:py-5 flex flex-col"
            headerActions={mobileGpsPill}
        >
            {/* Hidden live region for accessibility & dusk test selector */}
            {(error || errors?.message) && (
                <div
                    className="sr-only"
                    role="alert"
                    aria-live="assertive"
                    dusk="attendance-error-alert"
                    data-testid="attendance-error-alert"
                >
                    {error || errors?.message}
                </div>
            )}

            {/* ══ DESKTOP & TABLET: 2 kolom webcam & peta geofence (Figma Gambar 1) ══ */}
            <div className="hidden md:flex flex-col flex-1 min-h-0 h-full font-inter">
                {/* Header row using standard PageHeader */}
                <PageHeader
                    title="Ambil Foto & Lokasi Presensi"
                    description="Pastikan wajah Anda berada di dalam lingkaran dan GPS aktif."
                    className="mb-3 lg:mb-4"
                >
                    {/* Label Di Luar Radius – hanya muncul jika pengguna berada di luar radius geofence */}
                    {coords && !isInsideRadius && (
                        <div
                            className="inline-flex items-center gap-1.5 px-3 h-9 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-[12px] font-semibold shrink-0 animate-in fade-in"
                            dusk="user-coords-radius-badge"
                        >
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                            <FiMapPin className="text-[12px] text-amber-600 shrink-0" />
                            <span>Di Luar Radius</span>
                        </div>
                    )}

                    {currentTime && (
                        <div
                            className="inline-flex items-center gap-2 px-3.5 h-9 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[13px] font-bold font-mono shrink-0"
                            dusk="live-clock-badge"
                        >
                            <FiClock className="text-[13px]" />
                            <span>{currentTime}</span>
                        </div>
                    )}
                </PageHeader>

                {/* 2-Column Grid filling the remaining height (No Scroll) */}
                <div className="grid grid-cols-2 gap-4 lg:gap-6 flex-1 min-h-0 h-full">
                    {/* Kolom Kiri: Webcam Preview */}
                    <div
                        className="relative rounded-2xl overflow-hidden bg-black shadow-card border border-border flex items-center justify-center h-full min-h-0"
                        dusk="webcam-container"
                        data-testid="webcam-container"
                    >
                        {/* LIVE WEBCAM badge */}
                        {cameraReady && !todayAttendance && (
                            <div className="absolute top-3.5 left-3.5 z-10">
                                <LiveBadge
                                    label="LIVE WEBCAM"
                                    variant="dark"
                                    pulse
                                    size="md"
                                    dusk="webcam-live-badge"
                                />
                            </div>
                        )}

                        {/* Video stream */}
                        <video
                            ref={desktopVideoRef}
                            autoPlay
                            playsInline
                            muted
                            dusk="video-preview"
                            data-testid="video-preview"
                            className={`w-full h-full object-cover transition-opacity duration-300 ${cameraReady ? "opacity-100" : "opacity-0"}`}
                        />

                        {/* Face Liveness AI Overlay */}
                        <FaceLivenessOverlay
                            cameraReady={cameraReady}
                            status={livenessStatus}
                            isHeadAligned={isHeadAligned}
                            hasBlinked={hasBlinked}
                            isLivenessVerified={isLivenessVerified}
                            feedbackMessage={feedbackMessage}
                            todayAttendance={todayAttendance}
                        />

                        {/* Success overlay */}
                        {todayAttendance && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm z-20">
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

                    {/* Kolom Kanan: Peta Visual & Info Lokasi & Tombol Presensi */}
                    <div className="flex flex-col h-full min-h-0 justify-between gap-3">
                        {/* Visual Map Card (Figma Gambar 1) */}
                        <div className="flex-1 min-h-0 rounded-2xl bg-surface border border-border shadow-card overflow-hidden flex flex-col">
                            {/* Real Geographical Map Area */}
                            <div className="relative flex-1 min-h-[160px] overflow-hidden">
                                <LiveAttendanceMap
                                    schoolLat={activeLocation.latitude}
                                    schoolLng={activeLocation.longitude}
                                    schoolName={activeLocation.name}
                                    radiusMeters={activeLocation.radius_meters}
                                    userCoords={coords}
                                    isInsideRadius={isInsideRadius}
                                    gpsStatus={gpsStatus}
                                />
                            </div>

                            {/* Location Info Footer Bar (matching Gambar 1) */}
                            <div className="px-4 py-3 bg-surface border-t border-border flex items-center justify-between shrink-0">
                                <div className="min-w-0 pr-2">
                                    <h2 className="text-[13px] font-bold text-text-primary leading-tight truncate">
                                        Lokasi Terkunci: {activeLocation.name}
                                    </h2>
                                    <p className="text-[11px] text-text-muted mt-0.5 font-mono truncate">
                                        {coords
                                            ? `Lat: ${coords.lat.toFixed(5)} | Long: ${coords.lng.toFixed(5)}`
                                            : gpsStatus === "error"
                                              ? "GPS Tidak Aktif"
                                              : "Menghubungkan ke satelit GPS..."}
                                    </p>
                                </div>

                                <div className="text-right shrink-0">
                                    <span
                                        className={`text-[12px] font-bold block ${isInsideRadius ? "text-success" : "text-warning"}`}
                                    >
                                        {distanceMeters !== null
                                            ? isInsideRadius
                                                ? `Tepat di dalam (${formatDistance(distanceMeters)})`
                                                : `Kurang ${distanceMeters - activeLocation.radius_meters}m (${formatDistance(distanceMeters)})`
                                            : "—"}
                                    </span>
                                    <span className="text-[10px] text-text-muted">jarak ke sekolah</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Submit Action */}
                        <div className="shrink-0">{renderSubmitButton("KIRIM DATA PRESENSI", false)}</div>
                    </div>
                </div>
            </div>

            {/* ══ MOBILE: Full-screen native camera layout (Figma Gambar 3) ═══════ */}
            <div className="md:hidden flex flex-col flex-1 min-h-0 h-full gap-2.5 font-inter">
                {/* Upper Camera Preview Container (Figma Gambar 3) */}
                <div className="relative w-full flex-1 min-h-0 rounded-2xl overflow-hidden bg-black shadow-card flex items-center justify-center">
                    {/* LIVE badge on top-left */}
                    {cameraReady && !todayAttendance && (
                        <div className="absolute top-3 left-3 z-10">
                            <LiveBadge label="LIVE" variant="dark" pulse size="sm" dusk="mobile-live-badge" />
                        </div>
                    )}

                    {/* Video stream */}
                    <video
                        ref={mobileVideoRef}
                        autoPlay
                        playsInline
                        muted
                        dusk="video-preview-mobile"
                        data-testid="video-preview-mobile"
                        className={`w-full h-full object-cover transition-opacity duration-300 ${cameraReady ? "opacity-100" : "opacity-0"}`}
                    />

                    {/* Face Liveness AI Overlay */}
                    <FaceLivenessOverlay
                        cameraReady={cameraReady}
                        status={livenessStatus}
                        isHeadAligned={isHeadAligned}
                        hasBlinked={hasBlinked}
                        isLivenessVerified={isLivenessVerified}
                        feedbackMessage={feedbackMessage}
                        todayAttendance={todayAttendance}
                    />

                    {/* Success overlay */}
                    {todayAttendance && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm z-20">
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

                {/* Bottom Sheet Card: Compact Location & Action Button (Figma Gambar 3) */}
                <div className="bg-surface border border-border rounded-2xl p-3 sm:p-3.5 flex flex-col gap-2.5 shadow-card shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[16px]">
                            <FiMapPin />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-text-primary leading-tight truncate">
                                {activeLocation.name}
                            </p>
                            <p className="text-[11px] text-text-muted mt-0.5 truncate">
                                {coords && distanceMeters !== null
                                    ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)} • ${
                                          isInsideRadius
                                              ? `Tepat di dalam (${distanceMeters}m)`
                                              : `Kurang ${distanceMeters - activeLocation.radius_meters}m (${distanceMeters}m)`
                                      }`
                                    : gpsStatus === "error"
                                      ? "GPS Tidak Terdeteksi"
                                      : "Mendeteksi posisi satelit..."}
                            </p>
                        </div>
                        {isInsideRadius && <span className="w-2 h-2 rounded-full bg-success shrink-0" />}
                    </div>

                    {renderSubmitButton("KIRIM KEHADIRAN", true)}
                </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </AppShell>
    );
}
