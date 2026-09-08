import { FiCamera, FiEye, FiMail, FiRefreshCw } from "react-icons/fi";
import { Avatar } from "@/Components";
import type { ProfileUser } from "../types";

export interface ProfileHeroCardProps {
    user: ProfileUser;
    avatarPreview: string | null;
    uploadingAvatar: boolean;
    avatarError: string | null;
    isDualRoleTeacher: boolean;
    getRoleLabel: (role: string) => string;
    onSelectPhoto: () => void;
    onViewPhoto: () => void;
}

export default function ProfileHeroCard({
    user,
    avatarPreview,
    uploadingAvatar,
    avatarError,
    isDualRoleTeacher,
    getRoleLabel,
    onSelectPhoto,
    onViewPhoto,
}: ProfileHeroCardProps) {
    return (
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-card flex flex-col items-center text-center relative overflow-hidden font-inter">
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

            {/* Role Badge in Top-Right Corner */}
            <div className="absolute top-3.5 right-3.5 z-10">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                    {getRoleLabel(user.role)}
                </span>
            </div>

            <div className="relative mb-3 mt-1">
                <button
                    type="button"
                    onClick={onViewPhoto}
                    className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer group/avatar block"
                    title="Klik untuk melihat foto profil"
                    aria-label="Lihat Foto Profil"
                >
                    <Avatar
                        name={user.name}
                        src={avatarPreview}
                        size="2xl"
                        className="ring-4 ring-surface shadow-md group-hover/avatar:ring-primary/50 transition-all"
                    />
                    <span className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <FiEye className="text-[20px] drop-shadow-md" />
                    </span>
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectPhoto();
                    }}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 active:scale-90 transition-all border-2 border-surface cursor-pointer z-10"
                    title="Unggah / Ganti Foto Profil"
                    aria-label="Unggah / Ganti Foto Profil"
                >
                    {uploadingAvatar ? (
                        <FiRefreshCw className="animate-spin text-[12px]" />
                    ) : (
                        <FiCamera className="text-[13px]" />
                    )}
                </button>
            </div>

            <h2 className="text-[17px] font-bold text-text-primary leading-tight px-2">{user.name}</h2>
            <p className="text-[12px] text-text-muted mt-0.5 flex items-center gap-1.5 justify-center">
                <FiMail className="text-text-inactive shrink-0 text-[11px]" />
                <span className="truncate max-w-[240px]">{user.email || "Email belum didaftarkan"}</span>
            </p>

            {(user.student || user.teacher || user.guardian) && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5">
                    {user.student && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-text-secondary">
                            {user.student.class?.name ?? "Tanpa Kelas"} • NIS: {user.student.nis}
                        </span>
                    )}
                    {user.teacher && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-text-secondary">
                            Kode: {user.teacher.teacher_code} •{" "}
                            {isDualRoleTeacher
                                ? "Wali & Piket"
                                : user.teacher.teacher_type?.includes("homeroom")
                                  ? "Wali Kelas"
                                  : "Guru Piket"}
                        </span>
                    )}
                    {user.guardian && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-text-secondary">
                            WA: {user.guardian.phone || "—"}
                        </span>
                    )}
                </div>
            )}

            {avatarError && (
                <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-[11px] font-medium text-center">
                    {avatarError}
                </div>
            )}
        </div>
    );
}
