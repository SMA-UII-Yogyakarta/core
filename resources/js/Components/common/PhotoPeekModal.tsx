import { useCallback, useEffect, useRef, useState } from "react";
import { FiCamera, FiFileText, FiX } from "react-icons/fi";

export interface PhotoPeekModalProps {
    open: boolean;
    onClose: () => void;
    url: string | null;
    title?: string;
    subtitle?: string;
}

export default function PhotoPeekModal({
    open,
    onClose,
    url,
    title = "Bukti Presensi",
    subtitle,
}: PhotoPeekModalProps) {
    const [imgLoadError, setImgLoadError] = useState(false);
    const [dragY, setDragY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const touchStartYRef = useRef<number | null>(null);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        },
        [onClose],
    );

    useEffect(() => {
        if (open) {
            setImgLoadError(false);
            setDragY(0);
            setIsDragging(false);
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, handleKeyDown]);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            touchStartYRef.current = e.touches[0].clientY;
            setIsDragging(true);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartYRef.current !== null && e.touches.length === 1) {
            const currentY = e.touches[0].clientY;
            const deltaY = currentY - touchStartYRef.current;
            if (deltaY > 0) {
                setDragY(deltaY);
            }
        }
    };

    const handleTouchEnd = () => {
        if (dragY > 75) {
            onClose();
        } else {
            setDragY(0);
        }
        touchStartYRef.current = null;
        setIsDragging(false);
    };

    if (!open || !url) return null;

    const dragOpacity = Math.max(0.3, 1 - dragY / 300);

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md transition-opacity duration-200 select-none animate-in fade-in"
            style={{ opacity: isDragging ? dragOpacity : undefined }}
            onClick={onClose}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            {/* Top Right Floating Close Button */}
            <div className="absolute top-4 right-4 z-50">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white/90 hover:text-white border border-white/20 flex items-center justify-center backdrop-blur-xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    aria-label="Tutup Preview"
                    title="Tutup Preview"
                >
                    <FiX className="text-xl" />
                </button>
            </div>

            {/* Instagram Style Floating Image (Tight fit, no black side bars) */}
            <div
                className="relative flex flex-col items-center animate-in zoom-in-95 duration-200 max-w-[90vw] sm:max-w-[85vw] md:max-w-[80vw]"
                style={{
                    transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
                    transition: isDragging ? "none" : "transform 200ms ease-out",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image Frame - Inline block tightly hugging the image */}
                <div className="relative inline-block rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/25 ring-4 ring-white/10 shrink-0 max-h-[70vh] sm:max-h-[78vh]">
                    {imgLoadError ? (
                        <div className="w-72 sm:w-80 py-12 px-4 text-center flex flex-col items-center justify-center bg-neutral-900">
                            <FiFileText className="w-10 h-10 sm:w-12 sm:h-12 text-white/40 mb-2.5" />
                            <p className="font-bold text-white text-sm sm:text-base">Berkas Tidak Ditemukan</p>
                            <p className="text-[11px] sm:text-[12px] text-white/60 mt-1 max-w-xs leading-relaxed">
                                Foto atau bukti presensi belum diunggah atau tidak dapat dimuat.
                            </p>
                        </div>
                    ) : (
                        <img
                            src={url}
                            alt={title}
                            onError={() => setImgLoadError(true)}
                            className="max-h-[70vh] sm:max-h-[78vh] w-auto h-auto max-w-[88vw] sm:max-w-[80vw] object-contain block select-none pointer-events-none rounded-2xl sm:rounded-3xl"
                            draggable={false}
                        />
                    )}
                </div>

                {/* Minimalist Info Caption Pill */}
                <div className="mt-3.5 sm:mt-4 flex flex-col items-center text-center font-inter shrink-0 max-w-full">
                    <div className="px-4 py-2 rounded-full bg-white/15 border border-white/20 backdrop-blur-xl shadow-lg flex items-center gap-2 text-white text-xs sm:text-sm font-semibold tracking-wide">
                        <FiCamera className="text-white/80 text-sm shrink-0" />
                        <span className="truncate max-w-[75vw] sm:max-w-md">{title}</span>
                    </div>
                    {subtitle && (
                        <p className="text-white/70 text-[11px] sm:text-xs mt-1.5 font-medium truncate max-w-[75vw] sm:max-w-md">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Touch / Click Hint */}
                <p className="text-white/40 text-[10px] sm:text-[11px] mt-2.5 font-inter">
                    Ketuk di mana saja untuk menutup
                </p>
            </div>
        </div>
    );
}
