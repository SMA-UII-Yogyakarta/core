import { FiUser, FiSave, FiCamera, FiTrash2, FiRefreshCw, FiAlertCircle } from "react-icons/fi";
import { Avatar, Button, Input, Card, MobileSectionHeader } from "@/Components";
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
                                <Avatar
                                    name={user.name}
                                    src={avatarPreview}
                                    size="lg"
                                    className="shadow-xs ring-2 ring-surface shrink-0"
                                />
                                <div className="min-w-0">
                                    <div className="text-[13px] font-bold text-text-primary">Foto Profil</div>
                                    <div className="text-[11px] text-text-muted">JPG, PNG, WebP (maks. 2MB)</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    loading={uploadingAvatar}
                                    onClick={onSelectPhoto}
                                    className="h-8 text-[11px] px-3 rounded-lg font-bold"
                                    icon={<FiCamera className="text-[12px]" />}
                                >
                                    Pilih Foto
                                </Button>
                                {avatarPreview && (
                                    <Button
                                        type="button"
                                        variant="danger"
                                        size="sm"
                                        disabled={uploadingAvatar}
                                        onClick={onDeletePhoto}
                                        className="h-8 text-[11px] px-2 rounded-lg"
                                        title="Hapus Foto"
                                        icon={<FiTrash2 className="text-[12px]" />}
                                    />
                                )}
                            </div>
                        </div>
                        {avatarError && (
                            <div className="px-3 py-1.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-[11px] font-medium">
                                {avatarError}
                            </div>
                        )}

                        <div className="flex flex-col gap-3.5">
                            <div>
                                <label className="block text-[13px] font-bold text-text-primary mb-1">
                                    Nama Lengkap <span className="text-danger">*</span>
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
                                <label className="block text-[13px] font-bold text-text-primary mb-1">
                                    Email Resmi <span className="text-danger">*</span>
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
                    </div>
                </form>
            </div>
        );
    }

    return (
        <Card className="p-6 font-inter shadow-card rounded-2xl">
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
                <div className="flex flex-row items-center justify-between gap-3 pb-4 border-b border-border">
                    <div>
                        <h2 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                            <FiUser className="text-primary text-[16px]" />
                            Informasi Data Akun Pengguna
                        </h2>
                        <p className="text-[12px] text-text-muted mt-0.5">
                            Kelola nama lengkap, email resmi, dan foto profil akun Anda di SMA UII Yogyakarta.
                        </p>
                    </div>
                    <Button
                        type="submit"
                        loading={processing}
                        variant="primary"
                        className="shrink-0 h-10 font-bold px-4 rounded-xl shadow-xs"
                        icon={<FiSave className="text-[14px]" />}
                    >
                        {t("profile.saveChanges")}
                    </Button>
                </div>

                {/* Unified Account Identity & Avatar Card */}
                <div className="p-5 rounded-2xl border border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <div
                            className="relative group shrink-0 cursor-pointer"
                            onClick={onSelectPhoto}
                            title="Klik untuk mengganti foto profil"
                        >
                            <Avatar
                                name={user.name}
                                src={avatarPreview}
                                size="xl"
                                className="shadow-sm ring-2 ring-surface group-hover:ring-primary/40 transition-all"
                            />
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectPhoto();
                                }}
                                disabled={uploadingAvatar}
                                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 active:scale-90 transition-all border-2 border-surface cursor-pointer"
                                title="Ganti Foto Profil"
                                aria-label="Ganti Foto Profil"
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
                                        Kode Guru: {user.teacher.teacher_code} • {isDualRoleTeacher ? "Wali & Piket" : user.teacher.teacher_type?.includes("homeroom") ? "Wali Kelas" : "Guru Piket"}
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
