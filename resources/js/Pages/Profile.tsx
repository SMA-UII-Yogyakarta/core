import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { useState, useMemo, useRef } from "react";
import { useLanguage } from "@/Contexts/LanguageContext";
import {
    PageHeader,
    Card,
    Button,
    Input,
    Toggle,
    Table,
    ConfirmDialog,
    TabSwitcher,
    Avatar,
} from "@/Components";
import AppShell from "@/Layouts/AppShell";
import {
    FiUser,
    FiBell,
    FiShield,
    FiSave,
    FiLock,
    FiSliders,
    FiSmartphone,
    FiMonitor,
    FiAlertCircle,
    FiRefreshCw,
    FiMail,
    FiChevronRight,
    FiLogOut,
    FiCamera,
    FiTrash2,
} from "react-icons/fi";
import { profileInfoSchema, passwordSecuritySchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";

interface ProfileProps {
    user: {
        id: number;
        name: string;
        email: string | null;
        role: string;
        avatar?: string | null;
        avatar_url?: string | null;
        teacher?: { id: number; name: string; teacher_code: string; teacher_type: string[] } | null;
        student?: {
            id: number;
            nis: string;
            nisn: string;
            name: string;
            class?: { id: number; name: string } | null;
        } | null;
        guardian?: { id: number; name: string; phone: string | null } | null;
    };
    sessions: Array<{
        id: number;
        name: string;
        last_used_at: string | null;
        created_at: string | null;
    }>;
}

export default function Profile({ user, sessions }: ProfileProps) {
    const { t } = useLanguage();
    const { url } = usePage();
    const [desktopTab, setDesktopTab] = useState<string>(() => {
        const query = url.includes("?") ? url.split("?")[1] : "";
        const params = new URLSearchParams(query);
        return params.get("tab") || "profile";
    });

    const [mobileSubPage, setMobileSubPage] = useState<"profile" | "security" | "notifications" | "sessions" | null>(null);

    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const avatarPreview = localPreview ?? (user.avatar || user.avatar_url || null);

    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [showDeleteAvatarModal, setShowDeleteAvatarModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [sessionToRevoke, setSessionToRevoke] = useState<number | null>(null);
    const [notifPrefs, setNotifPrefs] = useState({
        email: true,
        push: true,
        leave: true,
        attendance: true,
    });

    const { data, setData, put, processing, errors, setError, clearErrors } = useForm({
        name: user.name,
        email: user.email ?? "",
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const { put: putSession, processing: revoking } = useForm({
        _method: "delete",
    });

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarError(null);

        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            setAvatarError("Format file harus berupa JPG, PNG, atau WebP.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setAvatarError("Ukuran file foto maksimal 2MB.");
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setLocalPreview(previewUrl);

        setUploadingAvatar(true);
        router.post(
            "/profile/avatar",
            { avatar: file },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setUploadingAvatar(false);
                    setLocalPreview(null);
                },
                onError: (err) => {
                    setUploadingAvatar(false);
                    setAvatarError(err.avatar || "Gagal mengunggah foto profil.");
                },
            }
        );
    };

    const handleDeleteAvatar = () => {
        setUploadingAvatar(true);
        setLocalPreview(null);
        router.delete("/profile/avatar", {
            preserveScroll: true,
            onSuccess: () => {
                setUploadingAvatar(false);
                setShowDeleteAvatarModal(false);
            },
            onError: () => {
                setUploadingAvatar(false);
                setShowDeleteAvatarModal(false);
            },
        });
    };

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        const valid = validateForm(profileInfoSchema, { name: data.name, email: data.email });
        if (!valid.success) {
            for (const [key, msg] of Object.entries(valid.errors)) {
                setError(key as keyof typeof data, msg);
            }
            return;
        }

        put("/profile", {
            preserveScroll: true,
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        const valid = validateForm(passwordSecuritySchema, {
            current_password: data.current_password,
            password: data.password,
            password_confirmation: data.password_confirmation,
        });
        if (!valid.success) {
            for (const [key, msg] of Object.entries(valid.errors)) {
                setError(key as keyof typeof data, msg);
            }
            return;
        }

        put("/profile", {
            preserveScroll: true,
            onSuccess: () => {
                setData("current_password", "");
                setData("password", "");
                setData("password_confirmation", "");
            },
        });
    };

    const handleRevoke = (sessionId: number) => {
        setSessionToRevoke(sessionId);
        setShowRevokeModal(true);
    };

    const confirmRevoke = () => {
        if (sessionToRevoke) {
            putSession(`/profile/sessions/${sessionToRevoke}`, {
                onSuccess: () => {
                    setShowRevokeModal(false);
                    setSessionToRevoke(null);
                },
            });
        }
    };

    const tabs = [
        { key: "profile", label: t("profile.tabProfile"), icon: FiUser },
        { key: "security", label: t("profile.tabSecurity"), icon: FiShield },
        { key: "notifications", label: t("profile.tabNotifications"), icon: FiBell },
        { key: "sessions", label: t("profile.tabSessions"), icon: FiSmartphone },
    ];

    const getRoleLabel = (role: string) => {
        switch (role) {
            case "admin":
                return t("profile.roleAdmin");
            case "teacher":
                return t("profile.roleTeacher");
            case "guardian":
                return t("profile.roleGuardian");
            case "student":
                return t("profile.roleStudent");
            default:
                return role;
        }
    };

    const isDualRoleTeacher =
        user.teacher &&
        user.teacher.teacher_type?.includes("homeroom") &&
        user.teacher.teacher_type?.includes("duty");

    const mobileHeaderTitle = useMemo(() => {
        switch (mobileSubPage) {
            case "profile":
                return "Data Akun & Profil";
            case "security":
                return "Keamanan & Kata Sandi";
            case "notifications":
                return "Preferensi Notifikasi";
            case "sessions":
                return "Perangkat & Sesi Aktif";
            default:
                return "Profil Akun";
        }
    }, [mobileSubPage]);

    const handleMobileBack = mobileSubPage !== null ? () => setMobileSubPage(null) : undefined;

    return (
        <AppShell title={mobileHeaderTitle} onBack={handleMobileBack}>
            <Head>
                <title>Profil - SMART Presensi</title>
            </Head>

            {/* ═══════════════════════════════════════════════════════════════════════════
                A. NATIVE MOBILE STACK NAVIGATION (sm:hidden)
            ═══════════════════════════════════════════════════════════════════════════ */}
            <div className="sm:hidden flex flex-col font-inter pb-4">
                {/* ── Mode 1: Mobile Root Screen (Profile Card + Stack Shortcut Menu) ─── */}
                {mobileSubPage === null ? (
                    <div key="mobile-root" className="animate-mobile-pop flex flex-col gap-4">
                        {/* 1. Clean Profile Hero Card (Identity Only) */}
                        <div className="bg-surface border border-border rounded-2xl p-5 shadow-card flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

                            <div className="relative mb-3 mt-1">
                                <Avatar
                                    name={user.name}
                                    src={avatarPreview}
                                    size="2xl"
                                    className="ring-4 ring-surface shadow-md"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingAvatar}
                                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 active:scale-90 transition-all border-2 border-surface cursor-pointer"
                                    title="Ganti Foto Profil"
                                    aria-label="Ganti Foto Profil"
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

                            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                                    {getRoleLabel(user.role)}
                                </span>
                                {user.student && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-text-secondary">
                                        {user.student.class?.name ?? "Tanpa Kelas"} • NIS: {user.student.nis}
                                    </span>
                                )}
                                {user.teacher && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-text-secondary">
                                        Kode: {user.teacher.teacher_code} • {isDualRoleTeacher ? "Wali & Piket" : user.teacher.teacher_type?.includes("homeroom") ? "Wali Kelas" : "Guru Piket"}
                                    </span>
                                )}
                                {user.guardian && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-text-secondary">
                                        WA: {user.guardian.phone || "—"}
                                    </span>
                                )}
                            </div>

                            {avatarError && (
                                <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-[11px] font-medium text-center">
                                    {avatarError}
                                </div>
                            )}
                        </div>

                        {/* 2. Grouped Settings Stack Menu List (iOS / Android Native Style) */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[12px] font-bold text-text-muted uppercase tracking-wider px-1">
                                Pengaturan Akun
                            </span>

                            <div className="bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden shadow-card">
                                {/* Special Action Item: Role Switcher (for Dual-Role Teachers) */}
                                {isDualRoleTeacher && (
                                    <button
                                        type="button"
                                        onClick={() => window.dispatchEvent(new CustomEvent("open-role-switcher"))}
                                        className="group w-full flex items-center justify-between p-4 hover:bg-muted/30 active:scale-[0.99] active:bg-muted/60 transition-all text-left"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                                                <FiRefreshCw size={18} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-[14px] text-text-primary flex items-center gap-2">
                                                    <span>Ganti Peran Guru</span>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-primary">
                                                        Beralih
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-text-muted mt-0.5">
                                                    Beralih antara portal Guru Piket & Wali Kelas
                                                </div>
                                            </div>
                                        </div>
                                        <FiChevronRight className="text-text-inactive text-[18px] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                )}

                                {/* Special Action Item: System Settings (Admin Only) */}
                                {user.role === "admin" && (
                                    <Link
                                        href="/settings"
                                        className="group w-full flex items-center justify-between p-4 hover:bg-muted/30 active:scale-[0.99] active:bg-muted/60 transition-all text-left"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                <FiSliders size={18} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-[14px] text-text-primary">Pengaturan Sistem</div>
                                                <div className="text-[11px] text-text-muted mt-0.5">Konfigurasi core backend & operasional</div>
                                            </div>
                                        </div>
                                        <FiChevronRight className="text-text-inactive text-[18px] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                )}

                                {/* Stack Item 1: Edit Profile */}
                                <button
                                    type="button"
                                    onClick={() => setMobileSubPage("profile")}
                                    className="group w-full flex items-center justify-between p-4 hover:bg-muted/30 active:scale-[0.99] active:bg-muted/60 transition-all text-left"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <FiUser size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[14px] text-text-primary">Data Akun & Profil</div>
                                            <div className="text-[11px] text-text-muted mt-0.5">Ubah foto profil, nama & email resmi</div>
                                        </div>
                                    </div>
                                    <FiChevronRight className="text-text-inactive text-[18px] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                </button>

                                {/* Stack Item 2: Security */}
                                <button
                                    type="button"
                                    onClick={() => setMobileSubPage("security")}
                                    className="group w-full flex items-center justify-between p-4 hover:bg-muted/30 active:scale-[0.99] active:bg-muted/60 transition-all text-left"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                                            <FiShield size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[14px] text-text-primary">Keamanan & Kata Sandi</div>
                                            <div className="text-[11px] text-text-muted mt-0.5">Ganti kata sandi akun</div>
                                        </div>
                                    </div>
                                    <FiChevronRight className="text-text-inactive text-[18px] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                </button>

                                {/* Stack Item 3: Notifications */}
                                <button
                                    type="button"
                                    onClick={() => setMobileSubPage("notifications")}
                                    className="group w-full flex items-center justify-between p-4 hover:bg-muted/30 active:scale-[0.99] active:bg-muted/60 transition-all text-left"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent-dark flex items-center justify-center shrink-0">
                                            <FiBell size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[14px] text-text-primary">Preferensi Notifikasi</div>
                                            <div className="text-[11px] text-text-muted mt-0.5">Atur saluran pesan & push alerts</div>
                                        </div>
                                    </div>
                                    <FiChevronRight className="text-text-inactive text-[18px] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                </button>

                                {/* Stack Item 4: Sessions */}
                                <button
                                    type="button"
                                    onClick={() => setMobileSubPage("sessions")}
                                    className="group w-full flex items-center justify-between p-4 hover:bg-muted/30 active:scale-[0.99] active:bg-muted/60 transition-all text-left"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                                            <FiSmartphone size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[14px] text-text-primary">Perangkat & Sesi Aktif</div>
                                            <div className="text-[11px] text-text-muted mt-0.5">{sessions.length} perangkat terhubung</div>
                                        </div>
                                    </div>
                                    <FiChevronRight className="text-text-inactive text-[18px] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* 3. Logout Group */}
                        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card">
                            <button
                                type="button"
                                onClick={() => router.post("/logout")}
                                className="group w-full flex items-center justify-between p-4 hover:bg-danger/5 active:scale-[0.99] active:bg-danger/10 transition-all text-left text-danger"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center shrink-0">
                                        <FiLogOut size={18} />
                                    </div>
                                    <div className="font-bold text-[14px]">Keluar dari Akun</div>
                                </div>
                                <FiChevronRight className="text-danger/60 text-[18px] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ── Mode 2: Dedicated Mobile Sub-Pages ─────────────────────────── */
                    <div key={mobileSubPage} className="animate-mobile-push flex flex-col gap-4">
                        {/* Sub-page 1: Data Akun & Profil */}
                        {mobileSubPage === "profile" && (
                            <Card className="p-4 rounded-2xl shadow-card">
                                <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
                                    <div>
                                        <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                                            <FiUser className="text-primary" />
                                            Data Akun Pengguna
                                        </h3>
                                        <p className="text-[11px] text-text-muted mt-0.5">
                                            Perbarui foto profil, nama lengkap, dan email resmi akun Anda.
                                        </p>
                                    </div>

                                    {/* Photo Uploader Widget */}
                                    <div className="p-3.5 rounded-xl border border-border bg-muted/30 flex items-center justify-between gap-3">
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
                                                onClick={() => fileInputRef.current?.click()}
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
                                                    onClick={() => setShowDeleteAvatarModal(true)}
                                                    className="h-8 text-[11px] px-2 rounded-lg"
                                                    title="Hapus Foto"
                                                    icon={<FiTrash2 className="text-[12px]" />}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    {avatarError && (
                                        <div className="px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-[11px] font-medium">
                                            {avatarError}
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-3 pt-2 border-t border-border/60">
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

                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            loading={processing}
                                            variant="primary"
                                            className="w-full h-11 font-bold text-[14px] rounded-xl shadow-sm"
                                            icon={<FiSave className="text-[14px]" />}
                                        >
                                            Simpan Perubahan
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        )}

                        {/* Sub-page 2: Keamanan & Kata Sandi */}
                        {mobileSubPage === "security" && (
                            <Card className="p-4 rounded-2xl shadow-card">
                                <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                                    <div>
                                        <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                                            <FiShield className="text-primary" />
                                            Keamanan & Kata Sandi
                                        </h3>
                                        <p className="text-[11px] text-text-muted mt-0.5">
                                            Perbarui kata sandi akun Anda secara berkala.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3 pt-2 border-t border-border/60">
                                        <div>
                                            <label className="block text-[13px] font-bold text-text-primary mb-1">
                                                Kata Sandi Saat Ini <span className="text-danger">*</span>
                                            </label>
                                            <Input
                                                type="password"
                                                value={data.current_password}
                                                onChange={(e) => setData("current_password", e.target.value)}
                                                error={errors.current_password}
                                                placeholder="••••••••"
                                                inputClassName="h-11 bg-surface border-border text-[13px] rounded-xl"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[13px] font-bold text-text-primary mb-1">
                                                Kata Sandi Baru <span className="text-danger">*</span>
                                            </label>
                                            <Input
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData("password", e.target.value)}
                                                error={errors.password}
                                                placeholder="••••••••"
                                                inputClassName="h-11 bg-surface border-border text-[13px] rounded-xl"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[13px] font-bold text-text-primary mb-1">
                                                Konfirmasi Kata Sandi Baru <span className="text-danger">*</span>
                                            </label>
                                            <Input
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData("password_confirmation", e.target.value)}
                                                error={errors.password_confirmation}
                                                placeholder="••••••••"
                                                inputClassName="h-11 bg-surface border-border text-[13px] rounded-xl"
                                            />
                                        </div>

                                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-start gap-2 text-[12px] text-text-secondary mt-1">
                                            <FiAlertCircle className="text-primary text-[14px] shrink-0 mt-0.5" />
                                            <span>Kata sandi minimal 8 karakter dengan kombinasi huruf, angka, dan simbol.</span>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            loading={processing}
                                            variant="primary"
                                            className="w-full h-11 font-bold text-[14px] rounded-xl shadow-sm"
                                            icon={<FiLock className="text-[14px]" />}
                                        >
                                            Perbarui Kata Sandi
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        )}

                        {/* Sub-page 3: Preferensi Notifikasi */}
                        {mobileSubPage === "notifications" && (
                            <Card className="p-4 rounded-2xl shadow-card flex flex-col gap-4">
                                <div>
                                    <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                                        <FiBell className="text-primary" />
                                        Preferensi Notifikasi
                                    </h3>
                                    <p className="text-[11px] text-text-muted mt-0.5">
                                        Atur jenis notifikasi yang ingin Anda terima.
                                    </p>
                                </div>

                                <div className="border border-border rounded-xl divide-y divide-border bg-surface overflow-hidden">
                                    <div className="flex items-center justify-between p-3.5">
                                        <div>
                                            <div className="font-bold text-[13px] text-text-primary">Email Notifikasi</div>
                                            <div className="text-[11px] text-text-muted">Kirimkan salinan ke email</div>
                                        </div>
                                        <Toggle
                                            checked={notifPrefs.email}
                                            onChange={(e) => setNotifPrefs((prev) => ({ ...prev, email: e.target.checked }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3.5">
                                        <div>
                                            <div className="font-bold text-[13px] text-text-primary">Push Notifications</div>
                                            <div className="text-[11px] text-text-muted">Pemberitahuan pop-up real-time</div>
                                        </div>
                                        <Toggle
                                            checked={notifPrefs.push}
                                            onChange={(e) => setNotifPrefs((prev) => ({ ...prev, push: e.target.checked }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3.5">
                                        <div>
                                            <div className="font-bold text-[13px] text-text-primary">Notifikasi Pengajuan Izin</div>
                                            <div className="text-[11px] text-text-muted">Status persetujuan izin & sakit</div>
                                        </div>
                                        <Toggle
                                            checked={notifPrefs.leave}
                                            onChange={(e) => setNotifPrefs((prev) => ({ ...prev, leave: e.target.checked }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3.5">
                                        <div>
                                            <div className="font-bold text-[13px] text-text-primary">Notifikasi Rekap Presensi</div>
                                            <div className="text-[11px] text-text-muted">Pengingat & rekap harian</div>
                                        </div>
                                        <Toggle
                                            checked={notifPrefs.attendance}
                                            onChange={(e) => setNotifPrefs((prev) => ({ ...prev, attendance: e.target.checked }))}
                                        />
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Sub-page 4: Perangkat & Sesi Aktif */}
                        {mobileSubPage === "sessions" && (
                            <div className="flex flex-col gap-3">
                                <div>
                                    <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                                        <FiSmartphone className="text-primary" />
                                        Perangkat & Sesi Aktif
                                    </h3>
                                    <p className="text-[11px] text-text-muted mt-0.5">
                                        Daftar perangkat yang terhubung ke akun Anda.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    {sessions.map((s, idx) => (
                                        <div
                                            key={s.id}
                                            className="p-3.5 rounded-2xl border border-border bg-surface shadow-card flex flex-col gap-2.5"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                        {s.name.toLowerCase().includes("mobile") || s.name.toLowerCase().includes("android") || s.name.toLowerCase().includes("iphone") ? (
                                                            <FiSmartphone size={16} />
                                                        ) : (
                                                            <FiMonitor size={16} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-text-primary text-[13px]">{s.name}</h4>
                                                        <p className="text-[11px] text-text-muted">
                                                            {idx === 0 ? "Sesi Ini (Sedang Aktif)" : "Perangkat Tertaut"}
                                                        </p>
                                                    </div>
                                                </div>
                                                {idx === 0 ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleRevoke(s.id)}
                                                        disabled={revoking}
                                                        className="h-7 text-[11px] px-2.5 rounded-lg"
                                                    >
                                                        Cabut
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="pt-2 border-t border-border/60 text-[11px] text-text-secondary flex items-center justify-between">
                                                <span>Terakhir Aktif:</span>
                                                <strong className="text-text-primary font-medium">{s.last_used_at ?? "Baru saja"}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════════════════
                B. DESKTOP & TABLET VIEW (hidden sm:block)
            ═══════════════════════════════════════════════════════════════════════════ */}
            <div className="hidden sm:block">
                {/* 1. Desktop PageHeader */}
                <PageHeader
                    title={t("profile.title")}
                    description={t("profile.description")}
                    className="shrink-0 mb-4"
                >
                    {user.role === "admin" && (
                        <Link href="/settings">
                            <Button
                                variant="primary"
                                size="sm"
                                className="h-10 px-4 font-bold text-[13px] shadow-xs rounded-xl"
                                icon={<FiSliders className="text-[14px]" />}
                            >
                                Pengaturan Sistem
                            </Button>
                        </Link>
                    )}
                </PageHeader>

                {/* 2. Desktop Tab Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0 font-inter">
                    <TabSwitcher
                        tabs={tabs.map((tab) => ({
                            key: tab.key,
                            label: tab.label,
                            icon: <tab.icon className="text-[14px]" />,
                        }))}
                        activeKey={desktopTab}
                        onChange={(key) => {
                            setDesktopTab(key);
                            router.get("/profile", { tab: key }, { preserveState: true, replace: true });
                        }}
                        variant="segmented"
                    />
                </div>

                {/* 3. Desktop Tab 1: Profil */}
                <div className={`w-full ${desktopTab === "profile" ? "block" : "hidden"}`}>
                    <Card className="p-6 font-inter shadow-card rounded-2xl">
                        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6">
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
                                        onClick={() => fileInputRef.current?.click()}
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
                                                fileInputRef.current?.click();
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
                                            onClick={() => setShowDeleteAvatarModal(true)}
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
                </div>

                {/* 4. Desktop Tab 2: Keamanan */}
                <div className={`w-full ${desktopTab === "security" ? "block" : "hidden"}`}>
                    <Card className="p-6 font-inter shadow-card rounded-2xl">
                        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-6">
                            <div className="flex flex-row items-center justify-between gap-3 pb-4 border-b border-border">
                                <div>
                                    <h2 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                                        <FiShield className="text-primary text-[16px]" />
                                        Preferensi Keamanan & Kata Sandi
                                    </h2>
                                    <p className="text-[12px] text-text-muted mt-0.5">
                                        Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan akses.
                                    </p>
                                </div>
                                <Button
                                    type="submit"
                                    loading={processing}
                                    variant="primary"
                                    className="shrink-0 h-10 font-bold px-4 rounded-xl shadow-xs"
                                    icon={<FiLock className="text-[14px]" />}
                                >
                                    {t("profile.updatePassword")}
                                </Button>
                            </div>

                            <div className="flex flex-col gap-5 max-w-2xl">
                                <div>
                                    <label className="block text-[13px] font-bold text-text-primary mb-1.5">
                                        {t("profile.currentPassword")} <span className="text-danger">*</span>
                                    </label>
                                    <Input
                                        type="password"
                                        value={data.current_password}
                                        onChange={(e) => setData("current_password", e.target.value)}
                                        error={errors.current_password}
                                        placeholder="••••••••"
                                        inputClassName="h-11 bg-surface border-border font-medium text-[13px] rounded-xl"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[13px] font-bold text-text-primary mb-1.5">
                                            {t("profile.newPassword")} <span className="text-danger">*</span>
                                        </label>
                                        <Input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData("password", e.target.value)}
                                            error={errors.password}
                                            placeholder="••••••••"
                                            inputClassName="h-11 bg-surface border-border font-medium text-[13px] rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-bold text-text-primary mb-1.5">
                                            {t("profile.confirmPassword")} <span className="text-danger">*</span>
                                        </label>
                                        <Input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData("password_confirmation", e.target.value)}
                                            error={errors.password_confirmation}
                                            placeholder="••••••••"
                                            inputClassName="h-11 bg-surface border-border font-medium text-[13px] rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15 flex items-start gap-2.5 text-[12px] text-text-secondary">
                                    <FiAlertCircle className="text-primary text-[15px] shrink-0 mt-0.5" />
                                    <span>
                                        Kata sandi minimal harus terdiri dari 8 karakter, mengombinasikan huruf besar, huruf kecil, angka, dan simbol unik.
                                    </span>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* 5. Desktop Tab 3: Notifikasi */}
                <div className={`w-full ${desktopTab === "notifications" ? "block" : "hidden"}`}>
                    <Card className="p-6 font-inter shadow-card rounded-2xl">
                        <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
                            <div>
                                <h2 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                                    <FiBell className="text-primary text-[16px]" />
                                    Preferensi Notifikasi & Peringatan
                                </h2>
                                <p className="text-[12px] text-text-muted mt-0.5">
                                    Atur jenis notifikasi email, saluran push notification, dan pengumuman sistem absensi.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                                <div className="pr-3">
                                    <p className="font-bold text-[14px] text-text-primary">{t("profile.emailNotifications")}</p>
                                    <p className="text-[12px] text-text-muted mt-0.5">
                                        {t("profile.emailNotificationsDesc")}
                                    </p>
                                </div>
                                <Toggle
                                    checked={notifPrefs.email}
                                    onChange={(e) => setNotifPrefs((prev) => ({ ...prev, email: e.target.checked }))}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                                <div className="pr-3">
                                    <p className="font-bold text-[14px] text-text-primary">{t("profile.pushNotifications")}</p>
                                    <p className="text-[12px] text-text-muted mt-0.5">
                                        {t("profile.pushNotificationsDesc")}
                                    </p>
                                </div>
                                <Toggle
                                    checked={notifPrefs.push}
                                    onChange={(e) => setNotifPrefs((prev) => ({ ...prev, push: e.target.checked }))}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                                <div className="pr-3">
                                    <p className="font-bold text-[14px] text-text-primary">{t("profile.leaveNotifications")}</p>
                                    <p className="text-[12px] text-text-muted mt-0.5">
                                        {t("profile.leaveNotificationsDesc")}
                                    </p>
                                </div>
                                <Toggle
                                    checked={notifPrefs.leave}
                                    onChange={(e) => setNotifPrefs((prev) => ({ ...prev, leave: e.target.checked }))}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                                <div className="pr-3">
                                    <p className="font-bold text-[14px] text-text-primary">{t("profile.attendanceNotifications")}</p>
                                    <p className="text-[12px] text-text-muted mt-0.5">
                                        {t("profile.attendanceNotificationsDesc")}
                                    </p>
                                </div>
                                <Toggle
                                    checked={notifPrefs.attendance}
                                    onChange={(e) => setNotifPrefs((prev) => ({ ...prev, attendance: e.target.checked }))}
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 6. Desktop Tab 4: Sesi Aktif */}
                <div className={`w-full ${desktopTab === "sessions" ? "block" : "hidden"}`}>
                    <Card className="p-6 font-inter shadow-card rounded-2xl flex flex-col gap-5">
                        <div className="flex items-center justify-between pb-4 border-b border-border">
                            <div>
                                <h2 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                                    <FiSmartphone className="text-primary text-[16px]" />
                                    Perangkat & Sesi Aktif Akun
                                </h2>
                                <p className="text-[12px] text-text-muted mt-0.5">
                                    Daftar perangkat yang saat ini terhubung dan memiliki akses autentikasi aktif ke akun Anda.
                                </p>
                            </div>
                        </div>

                        <Table
                            columns={[
                                {
                                    key: "name",
                                    header: t("profile.device"),
                                    render: (s) => (
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                {s.name.toLowerCase().includes("mobile") || s.name.toLowerCase().includes("android") || s.name.toLowerCase().includes("iphone") ? (
                                                    <FiSmartphone size={15} />
                                                ) : (
                                                    <FiMonitor size={15} />
                                                )}
                                            </div>
                                            <span className="font-bold text-text-primary font-inter text-[13px]">{s.name}</span>
                                        </div>
                                    ),
                                },
                                {
                                    key: "last_used_at",
                                    header: t("profile.lastActive"),
                                    render: (s) => <span className="text-text-secondary text-[13px] font-inter">{s.last_used_at ?? t("profile.never")}</span>,
                                },
                                {
                                    key: "created_at",
                                    header: t("profile.created"),
                                    render: (s) => <span className="text-text-secondary text-[13px] font-inter">{s.created_at}</span>,
                                },
                                {
                                    key: "actions",
                                    header: <div className="text-center w-full">{t("profile.actions")}</div>,
                                    className: "w-28 text-center",
                                    render: (s) => (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="rounded-lg text-[12px] px-3 h-8"
                                            onClick={() => handleRevoke(s.id)}
                                            disabled={revoking}
                                        >
                                            {t("profile.revoke")}
                                        </Button>
                                    ),
                                },
                            ]}
                            data={sessions}
                            keyExtractor={(s) => s.id}
                            dense
                        />
                    </Card>
                </div>
            </div>

            {/* Hidden File Input for Avatar Upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
                onChange={handleAvatarSelect}
            />

            {/* Delete Avatar Confirm Modal */}
            <ConfirmDialog
                open={showDeleteAvatarModal}
                onClose={() => setShowDeleteAvatarModal(false)}
                title="Hapus Foto Profil"
                message="Apakah Anda yakin ingin menghapus foto profil ini? Foto akan dihapus dan digantikan kembali dengan inisial nama Anda."
                onConfirm={handleDeleteAvatar}
                confirmLabel="Ya, Hapus Foto"
                cancelLabel="Batal"
                loading={uploadingAvatar}
                variant="danger"
            />

            {/* Revoke Modal */}
            <ConfirmDialog
                open={showRevokeModal}
                onClose={() => setShowRevokeModal(false)}
                title={t("profile.revokeTitle")}
                message={t("profile.revokeDescription")}
                onConfirm={confirmRevoke}
                confirmLabel={t("profile.revoke")}
                loading={revoking}
                variant="danger"
            />
        </AppShell>
    );
}
