import type React from "react";
import { FiCheck, FiCrosshair, FiEye, FiLoader, FiUser } from "react-icons/fi";
import type { LivenessStatus } from "@/hooks/useFaceLiveness";

interface FaceLivenessOverlayProps {
    cameraReady: boolean;
    status: LivenessStatus;
    isHeadAligned: boolean;
    hasBlinked: boolean;
    isLivenessVerified: boolean;
    feedbackMessage: string;
    todayAttendance?: { check_in_time: string } | null;
}

export const FaceLivenessOverlay: React.FC<FaceLivenessOverlayProps> = ({
    cameraReady,
    status,
    isHeadAligned,
    hasBlinked,
    isLivenessVerified,
    feedbackMessage,
    todayAttendance,
}) => {
    if (todayAttendance) {
        return null;
    }

    // Determine circle border styling based on status
    const getCircleStyle = () => {
        if (!cameraReady) return "border-white/30 border-dashed animate-pulse";
        if (isLivenessVerified) {
            return "border-emerald-400 border-solid shadow-[0_0_30px_rgba(52,211,153,0.5)] scale-[1.02] transition-all duration-300";
        }
        if (status === "blinking" || isHeadAligned) {
            return "border-sky-400 border-solid shadow-[0_0_20px_rgba(56,189,248,0.4)] animate-pulse transition-all duration-300";
        }
        if (status === "aligning") {
            return "border-amber-400 border-dashed animate-pulse transition-all duration-300";
        }
        if (status === "searching") {
            return "border-amber-300/70 border-dashed animate-pulse";
        }
        return "border-white/40 border-dashed";
    };

    // Badge styling on top-right
    const getBadgeStyle = () => {
        if (!cameraReady || status === "initializing") {
            return {
                bg: "bg-slate-900/75 border-slate-700/60 text-slate-300",
                dot: "bg-slate-400 animate-pulse",
                label: "AI MEMUAT",
            };
        }
        if (isLivenessVerified) {
            return {
                bg: "bg-emerald-950/80 border-emerald-600/60 text-emerald-300",
                dot: "bg-emerald-400",
                label: "LIVENESS VALID",
            };
        }
        if (status === "blinking" || isHeadAligned) {
            return {
                bg: "bg-sky-950/80 border-sky-600/60 text-sky-300",
                dot: "bg-sky-400 animate-ping",
                label: "KEDIPKAN MATA",
            };
        }
        if (status === "aligning") {
            return {
                bg: "bg-amber-950/80 border-amber-600/60 text-amber-300",
                dot: "bg-amber-400 animate-pulse",
                label: "POSISIKAN WAJAH",
            };
        }
        return {
            bg: "bg-slate-900/80 border-slate-700/60 text-slate-300",
            dot: "bg-amber-400/80",
            label: "AI SIAP",
        };
    };

    const badge = getBadgeStyle();

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 select-none z-10">
            {/* Top Bar: Live Status Badge & Step 2 Kedip Mata Badge */}
            <div className="flex flex-col items-end justify-start gap-1.5 w-full">
                <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold backdrop-blur-md transition-colors shadow-sm ${badge.bg}`}
                    dusk="liveness-status-badge"
                >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                    <span className="tracking-wide uppercase font-mono text-[10px] sm:text-[11px]">{badge.label}</span>
                </div>

                {cameraReady && !isLivenessVerified && (
                    <div
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] sm:text-[11px] font-medium backdrop-blur-md transition-all shadow-sm ${
                            hasBlinked
                                ? "bg-emerald-950/80 border-emerald-600/50 text-emerald-300"
                                : isHeadAligned
                                  ? "bg-sky-950/80 border-sky-600/50 text-sky-300 animate-pulse"
                                  : "bg-black/60 border-white/10 text-white/60"
                        }`}
                        dusk="liveness-step-blink"
                    >
                        <span
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                                hasBlinked ? "bg-emerald-500 text-white font-bold" : "bg-white/20 text-white/50"
                            }`}
                        >
                            {hasBlinked ? "✓" : "2"}
                        </span>
                        <span>Kedip Mata</span>
                    </div>
                )}
            </div>

            {/* Center Guide Viewfinder Circle */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
                <div
                    className={`w-[170px] h-[170px] xs:w-[190px] xs:h-[190px] lg:w-[220px] lg:h-[220px] rounded-full border-2 flex flex-col items-center justify-center relative transition-all duration-300 ${getCircleStyle()}`}
                    dusk="liveness-guide-circle"
                >
                    {!cameraReady ? (
                        <div className="flex flex-col items-center justify-center text-center px-4">
                            <FiUser className="text-[48px] lg:text-[56px] text-white/30 mb-1" />
                            <p className="text-[11px] font-medium text-white/70">Mengaktifkan kamera...</p>
                        </div>
                    ) : isLivenessVerified ? (
                        <div className="flex flex-col items-center justify-center text-center scale-up">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/90 text-white flex items-center justify-center text-[22px] shadow-lg mb-1 animate-bounce">
                                <FiCheck />
                            </div>
                            <span className="text-[11px] font-bold text-emerald-300 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                                OK
                            </span>
                        </div>
                    ) : status === "blinking" || isHeadAligned ? (
                        <div className="flex flex-col items-center justify-center text-center animate-pulse">
                            <FiEye className="text-[36px] lg:text-[42px] text-sky-300 mb-1 drop-shadow-md" />
                            <span className="text-[10px] lg:text-[11px] font-semibold text-sky-200 bg-sky-950/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
                                Kedipkan Mata
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center">
                            <FiCrosshair className="text-[36px] lg:text-[40px] text-white/30 mb-1" />
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section: Feedback Message Toast (Moved to very bottom edge) */}
            {cameraReady && (
                <div className="flex items-center justify-center w-full pb-0.5 sm:pb-1" dusk="liveness-checklist">
                    <div
                        className="px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-full border border-white/15 text-white shadow-xl flex items-center gap-2 max-w-[95%] transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
                        dusk="liveness-feedback-message"
                    >
                        {isLivenessVerified ? (
                            <FiCheck className="text-emerald-400 shrink-0 text-[13px]" />
                        ) : status === "blinking" || isHeadAligned ? (
                            <FiEye className="text-sky-400 shrink-0 text-[13px] animate-pulse" />
                        ) : status === "initializing" ? (
                            <FiLoader className="text-amber-400 shrink-0 text-[13px] animate-spin" />
                        ) : (
                            <FiCrosshair className="text-amber-400 shrink-0 text-[13px]" />
                        )}
                        <span className="text-[11px] sm:text-[12px] font-medium text-white/90 truncate">
                            {feedbackMessage}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
