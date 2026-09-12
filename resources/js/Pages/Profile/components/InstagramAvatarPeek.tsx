import { useCallback, useEffect } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import type { ProfileUser } from "../types";

export interface InstagramAvatarPeekProps {
    open: boolean;
    onClose: () => void;
    user: ProfileUser;
    avatarPreview: string | null;
    getRoleLabel: (role: string) => string;
    onSelectPhoto: () => void;
    onDeletePhoto?: () => void;
}

function getInitials(name?: string): string {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function InstagramAvatarPeek({
    open,
    onClose,
    user,
    avatarPreview,
    getRoleLabel,
    onSelectPhoto,
    onDeletePhoto,
}: InstagramAvatarPeekProps) {
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

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-200 select-none animate-in fade-in"
            onClick={onClose}
            onTouchEnd={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Instagram Style Profile Picture Preview"
        >
            {/* Instagram Floating Circle Container */}
            <div
                className="relative flex flex-col items-center animate-in zoom-in-90 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Enlarged Circular Avatar */}
                <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl border-4 border-white/20 bg-neutral-900 relative flex items-center justify-center ring-8 ring-white/10">
                    {avatarPreview ? (
                        <img
                            src={avatarPreview}
                            alt={user.name}
                            className="w-full h-full object-cover select-none pointer-events-none"
                            draggable={false}
                        />
                    ) : (
                        <div className="w-full h-full bg-primary flex items-center justify-center text-accent text-5xl sm:text-6xl font-extrabold select-none">
                            {getInitials(user.name)}
                        </div>
                    )}
                </div>

                {/* Minimalist User Info */}
                <div className="mt-5 text-center font-inter">
                    <h3 className="text-white font-bold text-lg sm:text-xl tracking-tight leading-tight">
                        {user.name}
                    </h3>
                    <p className="text-white/70 text-xs sm:text-sm mt-1">
                        {getRoleLabel(user.role)}
                        {user.teacher && ` • Kode ${user.teacher.teacher_code}`}
                        {user.student && ` • NIS ${user.student.nis}`}
                    </p>
                </div>

                {/* Floating Minimalist Action Pills */}
                <div className="mt-5 flex items-center gap-2.5 font-inter">
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            onSelectPhoto();
                        }}
                        className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 text-white text-xs font-semibold flex items-center gap-2 backdrop-blur-sm transition-all shadow-lg cursor-pointer"
                        title="Unggah atau Ganti Foto Profil"
                    >
                        <FiCamera className="text-sm" />
                        <span>{avatarPreview ? "Ganti Foto" : "Unggah Foto"}</span>
                    </button>

                    {avatarPreview && onDeletePhoto && (
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onDeletePhoto();
                            }}
                            className="px-3.5 py-2 rounded-full bg-red-500/20 hover:bg-red-500/35 active:scale-95 border border-red-500/30 text-red-200 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm transition-all shadow-lg cursor-pointer"
                            title="Hapus Foto Profil"
                        >
                            <FiTrash2 className="text-sm" />
                            <span>Hapus</span>
                        </button>
                    )}
                </div>

                <p className="text-white/40 text-[11px] mt-4 font-inter">Ketuk atau klik di mana saja untuk menutup</p>
            </div>
        </div>
    );
}
