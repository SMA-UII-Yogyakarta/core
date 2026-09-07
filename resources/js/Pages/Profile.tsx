import { Head, Link, router, useForm } from "@inertiajs/react";
import { useState, useMemo, useRef, useEffect } from "react";
import { useLanguage } from "@/Contexts/LanguageContext";
import {
    PageHeader,
    Button,
    ConfirmDialog,
    TabSwitcher,
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
    FiRefreshCw,
    FiChevronRight,
    FiLogOut,
} from "react-icons/fi";
import { profileInfoSchema, passwordSecuritySchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";
import type {
    ProfileUser,
    ProfileSession,
    ProfileSubPage,
} from "./Profile/types";
import ProfileHeroCard from "./Profile/components/ProfileHeroCard";
import ProfileInfoSection from "./Profile/components/ProfileInfoSection";
import SecuritySection from "./Profile/components/SecuritySection";
import NotificationSection from "./Profile/components/NotificationSection";
import SessionsSection from "./Profile/components/SessionsSection";

interface ProfileProps {
    user: ProfileUser;
    sessions: ProfileSession[];
}

const VALID_PROFILE_TABS: Record<string, ProfileSubPage> = {
    profile: "profile",
    security: "security",
    notifications: "notifications",
    sessions: "sessions",
};

const getInitialProfileTab = (): ProfileSubPage | null => {
    if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab");
        if (tab && VALID_PROFILE_TABS[tab]) {
            return VALID_PROFILE_TABS[tab];
        }
    }
    return null;
};

export default function Profile({ user, sessions }: ProfileProps) {
    const { t } = useLanguage();
    const initialTab = getInitialProfileTab();
    const [desktopTab, setDesktopTab] = useState<string>(initialTab || "profile");
    const [mobileSubPage, setMobileSubPage] = useState<ProfileSubPage | null>(initialTab);

    // Sync subpage state with browser popstate navigation (Back / Forward button)
    useEffect(() => {
        const handlePopState = () => {
            if (typeof window !== "undefined") {
                const params = new URLSearchParams(window.location.search);
                const tab = params.get("tab");
                if (tab && VALID_PROFILE_TABS[tab]) {
                    const mapped = VALID_PROFILE_TABS[tab];
                    setMobileSubPage(mapped);
                    setDesktopTab(mapped);
                } else {
                    setMobileSubPage(null);
                }
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const handleOpenMobileSubPage = (key: ProfileSubPage) => {
        setMobileSubPage(key);
        setDesktopTab(key);
        if (typeof window !== "undefined") {
            window.history.pushState({ tab: key }, "", `/profile?tab=${key}`);
        }
    };

    const handleMobileBack = () => {
        setMobileSubPage(null);
        if (typeof window !== "undefined") {
            window.history.pushState({ tab: null }, "", "/profile");
        }
    };

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

    const onBackAction = mobileSubPage !== null ? handleMobileBack : undefined;

    return (
        <AppShell
            title={mobileHeaderTitle}
            onBack={onBackAction}
            showBottomNav={mobileSubPage === null}
            showNotificationBell={mobileSubPage === null}
        >
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
                        <ProfileHeroCard
                            user={user}
                            avatarPreview={avatarPreview}
                            uploadingAvatar={uploadingAvatar}
                            avatarError={avatarError}
                            isDualRoleTeacher={Boolean(isDualRoleTeacher)}
                            getRoleLabel={getRoleLabel}
                            onSelectPhoto={() => fileInputRef.current?.click()}
                        />

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
                                    onClick={() => handleOpenMobileSubPage("profile")}
                                     className="group w-full flex items-center justify-between p-4 hover:bg-muted/30 active:scale-[0.99] active:bg-muted/60 transition-all text-left cursor-pointer"
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
                                     onClick={() => handleOpenMobileSubPage("security")}
                                     className="group w-full flex items-center justify-between p-4 hover:bg-muted/30 active:scale-[0.99] active:bg-muted/60 transition-all text-left cursor-pointer"
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
                                     onClick={() => handleOpenMobileSubPage("notifications")}
                                     className="group w-full flex items-center justify-between p-4 hover:bg-muted/30 active:scale-[0.99] active:bg-muted/60 transition-all text-left cursor-pointer"
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
                                     onClick={() => handleOpenMobileSubPage("sessions")}
                                     className="group w-full flex items-center justify-between p-4 hover:bg-muted/30 active:scale-[0.99] active:bg-muted/60 transition-all text-left cursor-pointer"
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
                            <ProfileInfoSection
                                user={user}
                                data={data}
                                setData={(k, v) => setData(k, v)}
                                errors={errors}
                                processing={processing}
                                avatarPreview={avatarPreview}
                                uploadingAvatar={uploadingAvatar}
                                avatarError={avatarError}
                                isDualRoleTeacher={Boolean(isDualRoleTeacher)}
                                getRoleLabel={getRoleLabel}
                                onSelectPhoto={() => fileInputRef.current?.click()}
                                onDeletePhoto={() => setShowDeleteAvatarModal(true)}
                                onSubmit={handleProfileSubmit}
                                isMobile
                            />
                        )}

                        {/* Sub-page 2: Keamanan & Kata Sandi */}
                        {mobileSubPage === "security" && (
                            <SecuritySection
                                data={data}
                                setData={(k, v) => setData(k, v)}
                                errors={errors}
                                processing={processing}
                                onSubmit={handlePasswordSubmit}
                                isMobile
                            />
                        )}

                        {/* Sub-page 3: Preferensi Notifikasi */}
                        {mobileSubPage === "notifications" && (
                            <NotificationSection
                                notifPrefs={notifPrefs}
                                setNotifPrefs={setNotifPrefs}
                                isMobile
                            />
                        )}

                        {/* Sub-page 4: Perangkat & Sesi Aktif */}
                        {mobileSubPage === "sessions" && (
                            <SessionsSection
                                sessions={sessions}
                                onRevoke={handleRevoke}
                                revoking={revoking}
                                isMobile
                            />
                        )}
                    </div>
                )}
            </div>

            {/* 📱 Sticky Mobile Bottom Action Bar (Docked at bottom of screen, only in form subpages) */}
            {mobileSubPage === "profile" && (
                <div className="fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-md border-t border-border/80 z-30 sm:hidden">
                    <div className="max-w-xl mx-auto">
                        <Button
                            type="submit"
                            form="mobile-profile-data-form"
                            loading={processing}
                            variant="primary"
                            size="lg"
                            className="w-full justify-center font-bold text-[14.5px] shadow-sm py-3"
                            icon={<FiSave className="text-[17px]" />}
                        >
                            Simpan Perubahan
                        </Button>
                    </div>
                </div>
            )}

            {mobileSubPage === "security" && (
                <div className="fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-md border-t border-border/80 z-30 sm:hidden">
                    <div className="max-w-xl mx-auto">
                        <Button
                            type="submit"
                            form="mobile-profile-password-form"
                            loading={processing}
                            variant="primary"
                            size="lg"
                            className="w-full justify-center font-bold text-[14.5px] shadow-sm py-3"
                            icon={<FiLock className="text-[17px]" />}
                        >
                            Perbarui Kata Sandi
                        </Button>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════════
                B. DESKTOP & TABLET VIEW (hidden sm:block)
            ═══════════════════════════════════════════════════════════════════════════ */}
            <div className="hidden sm:block">
                {/* 1. Desktop PageHeader (hidden on tablet, only visible on lg+) */}
                <PageHeader
                    title={t("profile.title")}
                    description={t("profile.description")}
                    className="hidden lg:flex shrink-0 mb-4"
                />

                {/* 2. Desktop & Tablet Tab Switcher + Pengaturan Sistem Action Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0 font-inter">
                    <div className="min-w-0 overflow-x-auto no-scrollbar">
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

                    {user.role === "admin" && (
                        <Link href="/settings" className="shrink-0 self-start sm:self-auto">
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
                </div>

                {/* 3. Desktop Tab 1: Profil */}
                <div className={`w-full ${desktopTab === "profile" ? "block" : "hidden"}`}>
                    <ProfileInfoSection
                        user={user}
                        data={data}
                        setData={(k, v) => setData(k, v)}
                        errors={errors}
                        processing={processing}
                        avatarPreview={avatarPreview}
                        uploadingAvatar={uploadingAvatar}
                        avatarError={avatarError}
                        isDualRoleTeacher={Boolean(isDualRoleTeacher)}
                        getRoleLabel={getRoleLabel}
                        onSelectPhoto={() => fileInputRef.current?.click()}
                        onDeletePhoto={() => setShowDeleteAvatarModal(true)}
                        onSubmit={handleProfileSubmit}
                    />
                </div>

                {/* 4. Desktop Tab 2: Keamanan */}
                <div className={`w-full ${desktopTab === "security" ? "block" : "hidden"}`}>
                    <SecuritySection
                        data={data}
                        setData={(k, v) => setData(k, v)}
                        errors={errors}
                        processing={processing}
                        onSubmit={handlePasswordSubmit}
                    />
                </div>

                {/* 5. Desktop Tab 3: Notifikasi */}
                <div className={`w-full ${desktopTab === "notifications" ? "block" : "hidden"}`}>
                    <NotificationSection
                        notifPrefs={notifPrefs}
                        setNotifPrefs={setNotifPrefs}
                    />
                </div>

                {/* 6. Desktop Tab 4: Sesi Aktif */}
                <div className={`w-full ${desktopTab === "sessions" ? "block" : "hidden"}`}>
                    <SessionsSection
                        sessions={sessions}
                        onRevoke={handleRevoke}
                        revoking={revoking}
                    />
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
