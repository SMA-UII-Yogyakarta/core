import { FiAlertCircle, FiCamera, FiEye, FiRefreshCw, FiSave, FiTrash2, FiUser } from "react-icons/fi";
import { Avatar, Button, Card, Input, MobileSectionHeader, SectionHeader } from "@/Components";
import { useLanguage } from "@/Contexts/LanguageContext";
import type { ProfileUser } from "../types";

export interface ProfileInfoSectionProps {
    user: ProfileUser;
    data: { name: string; email: string };
    setData: (key: "name" | "email", value: string) => void;
    errors: { name?: string; email?: string };
    processing: boolean;
    avatarPreview: string | null;
    uploadingAvatar: boolean;
    avatarError: string | null;
    isDualRoleTeacher: boolean;
    getRoleLabel: (role: string) => string;
    onSelectPhoto: () => void;
    onDeletePhoto: () => void;
    onViewPhoto: () => void;
    onSubmit: (e: React.FormEvent) => void;
    isMobile?: boolean;
}

export default function ProfileInfoSection({
    user,
    data,
    setData,
    errors,
    processing,
    avatarPreview,
    uploadingAvatar,
    avatarError,
    isDualRoleTeacher,
    getRoleLabel,
    onSelectPhoto,
    onDeletePhoto,
    onViewPhoto,
    onSubmit,
    isMobile = false,
}: ProfileInfoSectionProps) {
    const { t } = useLanguage();

    if (isMobile) {
        return (
            <div className="flex flex-col gap-4 pb-24 font-inter">
                <form id="mobile-profile-data-form" onSubmit={onSubmit} className="flex flex-col gap-4">
                    <MobileSectionHeader
                        title="Informasi Data Akun"
                        description="Perbarui foto profil, nama lengkap, dan email resmi akun Anda."
                    />

                    {/* Native Grouped Card */}
                    <div className="bg-surface border border-border rounded-2xl p-4 shadow-card flex flex-col gap-4">
                        {/* Photo Uploader Widget */}
                        <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <button
                                    type="button"
                                    onClick={onViewPhoto}
                                    className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer group/avatar shrink-0"
                                    title="Klik untuk melihat foto profil"
                                    aria-label="Lihat Foto Profil"
                                >
                                    <Avatar
                                        name={user.name}
                                        src={avatarPreview}
                                        size="lg"
                                        className="shadow-sm ring-2 ring-surface group-hover/avatar:ring-primary/60 transition-all"
                                    />
                                    <span className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity text-white">
                                        <FiEye className="text-[14px] drop-shadow-sm" />
                                    </span>
                                </button>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-text-primary text-[14px] truncate">{user.name}</h4>
                                    <p className="text-[11.5px] text-text-muted truncate mt-0.5">
                                        {getRoleLabel(user.role)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={onSelectPhoto}
                                    disabled={uploadingAvatar}
                                    className="h-8 px-2.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold flex items-center gap-1.5 hover:bg-primary/20 transition-all"
                                >
                                    <FiCamera size={13} />
                                    <span>Ganti</span>
                                </button>
                                {avatarPreview && (
                                    <button
                                        type="button"
                                        onClick={onDeletePhoto}
                                        disabled={uploadingAvatar}
                                        className="w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center hover:bg-danger/20 transition-all"
                                    >
                                        <FiTrash2 size={13} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Input Fields */}
                        <div className="flex flex-col gap-3.5">
                            <div>
                                <label className="block text-[12px] font-bold text-text-muted mb-1">
                                    Nama Lengkap <span className="text-danger">*</span>
                                </label>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    error={errors.name}
                                    placeholder="Nama Lengkap"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[12px] font-bold text-text-muted mb-1">
                                    Email Resmi <span className="text-danger">*</span>
                                </label>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    error={errors.email}
                                    placeholder="nama@smauii.sch.id"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Metadata Information Banner */}
                    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card flex flex-col gap-2.5">
                        <div className="flex items-center justify-between text-[12px]">
                            <span className="text-text-muted font-medium">Peran Utama</span>
                            <span className="font-bold text-text-primary bg-muted/40 px-2 py-0.5 rounded-md">
                                {getRoleLabel(user.role)}
                            </span>
                        </div>
                        {user.teacher && (
                            <div className="flex items-center justify-between text-[12px] pt-2 border-t border-border/60">
                                <span className="text-text-muted font-medium">Kode Guru</span>
                                <span className="font-bold text-primary font-mono bg-primary/5 px-2 py-0.5 rounded-md">
                                    {user.teacher.teacher_code}
                                </span>
                            </div>
                        )}
                        {user.student && (
                            <div className="flex items-center justify-between text-[12px] pt-2 border-t border-border/60">
                                <span className="text-text-muted font-medium">NIS / NISN</span>
                                <span className="font-bold text-primary font-mono bg-primary/5 px-2 py-0.5 rounded-md">
                                    {user.student.nis || "-"} / {user.student.nisn || "-"}
                                </span>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        );
    }

    return (
        <Card className="p-6 font-inter shadow-card rounded-2xl">
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
                <SectionHeader
                    icon={<FiUser />}
                    title="Informasi Data Akun Pengguna"
                    description="Kelola nama lengkap, email resmi, dan foto profil akun Anda di SMA UII Yogyakarta."
                    divider
                    action={
                        <Button
                            type="submit"
                            loading={processing}
                            variant="primary"
                            className="shrink-0 h-10 font-bold px-4 rounded-xl shadow-xs"
                            icon={<FiSave className="text-[14px]" />}
                        >
                            {t("profile.saveChanges")}
                        </Button>
                    }
                />

                {/* Unified Account Identity & Avatar Card */}
                <div className="p-5 rounded-2xl border border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="relative group shrink-0">
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
                                    size="xl"
                                    className="shadow-sm ring-2 ring-surface group-hover/avatar:ring-primary/60 transition-all"
                                />
                                <span className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity text-white">
                                    <FiEye className="text-[18px] drop-shadow-md" />
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectPhoto();
                                }}
                                disabled={uploadingAvatar}
                                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 active:scale-90 transition-all border-2 border-surface cursor-pointer z-10"
                                title="Unggah / Ganti Foto Profil"
                                aria-label="Unggah / Ganti Foto Profil"
                            >
                                {uploadingAvatar ? (
                                    <FiRefreshCw className="animate-spin text-[10px]" />
                                ) : (
                                    <FiCamera className="text-[11px]" />
                                )}
                            </button>
                        </div>

                        <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-[16px] font-bold text-text-primary truncate">{user.name}</h3>
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                                    {getRoleLabel(user.role)}
                                </span>
                                {user.teacher && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-surface border border-border text-text-secondary">
                                        Kode Guru: {user.teacher.teacher_code} •{" "}
                                        {isDualRoleTeacher
                                            ? "Wali & Piket"
                                            : user.teacher.teacher_type?.includes("homeroom")
                                              ? "Wali Kelas"
                                              : "Guru Piket"}
                                    </span>
                                )}
                                {isDualRoleTeacher && (
                                    <button
                                        type="button"
                                        onClick={() => window.dispatchEvent(new CustomEvent("open-role-switcher"))}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer"
                                        title="Ganti Peran Aktif Guru"
                                    >
                                        <FiRefreshCw className="text-[11px]" />
                                        <span>Ganti Peran</span>
                                    </button>
                                )}
                                {user.student && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-surface border border-border text-text-secondary">
                                        Kelas: {user.student.class?.name ?? "Tanpa Kelas"} • NIS: {user.student.nis}
                                    </span>
                                )}
                                {user.guardian && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-surface border border-border text-text-secondary">
                                        WhatsApp: {user.guardian.phone || "—"}
                                    </span>
                                )}
                            </div>
                            <p className="text-[12px] text-text-muted">
                                Format foto profil: JPG, PNG, atau WebP (maksimal 2MB).
                            </p>
                        </div>
                    </div>

                    {avatarPreview && (
                        <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                            <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                disabled={uploadingAvatar}
                                onClick={onDeletePhoto}
                                className="h-9 px-3 text-[12px] rounded-xl"
                                title="Hapus Foto Profil"
                                icon={<FiTrash2 className="text-[13px]" />}
                            >
                                Hapus Foto
                            </Button>
                        </div>
                    )}
                </div>

                {avatarError && (
                    <div className="px-4 py-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-[12px] font-medium flex items-center gap-2">
                        <FiAlertCircle className="text-[14px] shrink-0" />
                        <span>{avatarError}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                    <div>
                        <label className="block text-[13px] font-bold text-text-primary mb-1.5">
                            {t("profile.name")} <span className="text-danger">*</span>
                        </label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            error={errors.name}
                            inputClassName="h-11 bg-surface border-border font-medium text-[13px] rounded-xl"
                            placeholder="Masukkan nama lengkap..."
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-bold text-text-primary mb-1.5">
                            {t("profile.email")} <span className="text-danger">*</span>
                        </label>
                        <Input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            error={errors.email}
                            inputClassName="h-11 bg-surface border-border font-medium text-[13px] rounded-xl"
                            placeholder="nama@smauii.sch.id"
                        />
                    </div>
                </div>
            </form>
        </Card>
    );
}
