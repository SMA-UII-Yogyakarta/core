import { useState, useCallback, useRef, useEffect } from "react";
import { FiX, FiRefreshCw, FiRepeat, FiRotateCcw, FiSearch, FiZoomOut } from "react-icons/fi";
import { useLanguage } from "@/Contexts/LanguageContext";

interface PreviewImageModalProps {
    url: string | null;
    onClose: () => void;
}

export default function PreviewImageModal({ url, onClose }: PreviewImageModalProps) {
    const { t } = useLanguage();
    const [zoomLevel, setZoomLevel] = useState(100);
    const [rotateLevel, setRotateLevel] = useState(0);

    const previewRef = useRef<HTMLDivElement>(null);
    const lastDistance = useRef<number | null>(null);
    const lastAngle = useRef<number | null>(null);
    const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);

    const handleWheelZoom = useCallback((e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoomLevel((prev) => Math.min(1000, Math.max(50, prev + (e.deltaY < 0 ? 10 : -10))));
        }
    }, []);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            const now = Date.now();
            const touch = e.touches[0];
            const lastTap = lastTapRef.current;
            if (
                lastTap &&
                now - lastTap.time < 300 &&
                Math.abs(touch.clientX - lastTap.x) < 30 &&
                Math.abs(touch.clientY - lastTap.y) < 30
            ) {
                setZoomLevel((prev) => (prev === 100 ? 150 : 100));
                lastTapRef.current = null;
            } else {
                lastTapRef.current = { time: now, x: touch.clientX, y: touch.clientY };
            }
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastDistance.current = Math.sqrt(dx * dx + dy * dy);
            lastAngle.current = Math.atan2(dy, dx) * (180 / Math.PI);
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2 && lastDistance.current !== null && lastAngle.current !== null) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;

            const distance = Math.sqrt(dx * dx + dy * dy);
            const scale = distance / lastDistance.current;
            setZoomLevel((prev) => Math.min(1000, Math.max(50, Math.round(prev * scale))));
            lastDistance.current = distance;

            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            let angleDelta = angle - lastAngle.current;
            if (angleDelta > 180) angleDelta -= 360;
            if (angleDelta < -180) angleDelta += 360;
            setRotateLevel((prev) => prev + angleDelta);
            lastAngle.current = angle;
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        lastDistance.current = null;
        lastAngle.current = null;
    }, []);

    useEffect(() => {
        const el = previewRef.current;
        if (!el || !url) return;

        el.addEventListener("wheel", handleWheelZoom, { passive: false });
        return () => el.removeEventListener("wheel", handleWheelZoom);
    }, [url, handleWheelZoom]);

    if (!url) return null;

    return (
        <div
            ref={previewRef}
            className="fixed inset-0 z-50 flex flex-col bg-black/70 touch-none md:items-center md:p-4"
            onClick={() => {
                onClose();
                setZoomLevel(100);
                setRotateLevel(0);
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-3 md:hidden shrink-0 bg-surface border-b border-border">
                <h3 className="text-base font-bold text-text-primary">
                    {t("reports.documentPreview")}
                </h3>
                <div className="flex items-center gap-2">
                    {rotateLevel % 360 !== 0 && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setRotateLevel(0); }}
                            className="w-11 h-11 flex items-center justify-center rounded-full bg-muted hover:bg-border text-text-muted hover:text-text-primary transition-colors"
                        >
                            <FiRefreshCw className="text-sm" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            setZoomLevel(100);
                            setRotateLevel(0);
                        }}
                        className="w-11 h-11 flex items-center justify-center rounded-full bg-muted hover:bg-border text-text-muted hover:text-text-primary transition-colors"
                    >
                        <FiX className="text-base" />
                    </button>
                </div>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 min-h-0 overflow-auto md:hidden bg-background p-2">
                <div className="flex items-center justify-center p-4 h-full">
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ transform: `scale(${zoomLevel / 100}) rotate(${rotateLevel}deg)`, transformOrigin: "center center", transition: "transform 150ms ease-out" }}
                    >
                        {url.toLowerCase().endsWith(".pdf") ? (
                            <div className="w-full h-full max-w-4xl aspect-[7/10] bg-surface rounded-lg border border-border overflow-hidden">
                                <iframe
                                    src={url}
                                    className="w-full h-full border-none"
                                    title={t("reports.pdfPreview")}
                                />
                            </div>
                        ) : (
                            <img
                                src={url}
                                alt={t("reports.documentPreview")}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-md border border-border bg-surface"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Zoom Pill */}
            {zoomLevel !== 100 && (
                <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setZoomLevel(100); }}
                        className="flex items-center gap-2 px-4 py-2 bg-surface/90 backdrop-blur-sm rounded-full shadow-lg border border-border text-sm font-medium text-text-primary"
                    >
                        <FiZoomOut className="text-xs" />
                        <span>{zoomLevel}%</span>
                    </button>
                </div>
            )}

            {/* Desktop Panel */}
            <div
                className="hidden md:flex relative bg-surface rounded-xl w-full h-full max-w-6xl max-h-[95vh] flex-col p-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
                    <h3 className="text-base font-bold text-text-primary">
                        {t("reports.documentPreview")}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-muted/40 p-1.5 sm:p-2 rounded-xl border border-border/40">
                        <div className="flex items-center gap-2">
                            <FiSearch className="text-text-muted text-xs" />
                            <input
                                type="range"
                                min={50}
                                max={1000}
                                step={10}
                                value={zoomLevel}
                                onChange={(e) => setZoomLevel(Number(e.target.value))}
                                className="w-24 sm:w-36 h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                            />
                            <button
                                type="button"
                                onClick={() => setZoomLevel(100)}
                                className="px-1.5 py-0.5 text-xs font-medium text-text-secondary hover:bg-background rounded transition-colors min-w-[40px] text-center"
                            >
                                {zoomLevel}%
                            </button>
                        </div>
                        <div className="w-px h-4 bg-border self-center" />
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setRotateLevel(0)}
                                disabled={rotateLevel % 360 === 0}
                                className={`p-1 text-xs font-medium rounded transition-colors ${
                                    rotateLevel % 360 === 0
                                        ? "text-text-muted/40 cursor-not-allowed"
                                        : "text-text-secondary hover:bg-background"
                                }`}
                                title={t("reports.resetRotation")}
                            >
                                <FiRefreshCw className="text-sm" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setRotateLevel((prev) => prev + 90)}
                                className="p-1 text-xs font-medium text-text-secondary hover:bg-background rounded transition-colors"
                                title={t("reports.rotateRight")}
                            >
                                <FiRepeat className="text-sm" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setRotateLevel((prev) => prev - 90)}
                                className="p-1 text-xs font-medium text-text-secondary hover:bg-background rounded transition-colors"
                                title={t("reports.rotateLeft")}
                            >
                                <FiRotateCcw className="text-sm" />
                            </button>
                        </div>
                        <div className="w-px h-4 bg-border self-center" />
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                setZoomLevel(100);
                                setRotateLevel(0);
                            }}
                            className="w-11 h-11 flex items-center justify-center rounded-full bg-muted hover:bg-border text-text-muted hover:text-text-primary transition-colors"
                        >
                            <FiX className="text-base" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-center p-6 h-full">
                        <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ transform: `scale(${zoomLevel / 100}) rotate(${rotateLevel}deg)`, transformOrigin: "center center", transition: "transform 150ms ease-out" }}
                        >
                            {url.toLowerCase().endsWith(".pdf") ? (
                                <div className="w-full h-full max-w-4xl aspect-[7/10] bg-surface rounded-lg border border-border overflow-hidden">
                                    <iframe
                                        src={url}
                                        className="w-full h-full border-none"
                                        title={t("reports.pdfPreview")}
                                    />
                                </div>
                            ) : (
                                <img
                                    src={url}
                                    alt={t("reports.documentPreview")}
                                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-md border border-border bg-surface"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
