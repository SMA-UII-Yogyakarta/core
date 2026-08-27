import { Head, router, useForm, usePage } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { useLanguage } from "@/Contexts/LanguageContext";
import { PageHeader, Card, Button, Input, Toggle, Table, ConfirmDialog } from "@/Components";
import AppShell from "@/Layouts/AppShell";
import { FiUser, FiLogOut, FiBell, FiShield, FiSave, FiLock } from "react-icons/fi";
import { profileInfoSchema, passwordSecuritySchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";

interface ProfileProps {
    user: {
        id: number;
        name: string;
        email: string | null;
        role: string;
        teacher?: { id: number; name: string; teacher_code: string; teacher_type: string } | null;
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
    const activeTab = useMemo(() => {
        const query = url.includes("?") ? url.split("?")[1] : "";
        const params = new URLSearchParams(query);
        return params.get("tab") || "profile";
    }, [url]);

    const [showRevokeModal, setShowRevokeModal] = useState(false);
    const [sessionToRevoke, setSessionToRevoke] = useState<number | null>(null);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        if (activeTab === "profile") {
            const valid = validateForm(profileInfoSchema, { name: data.name, email: data.email });
            if (!valid.success) {
                for (const [key, msg] of Object.entries(valid.errors)) {
                    setError(key as keyof typeof data, msg);
                }
                return;
            }
        } else if (activeTab === "security") {
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
        }

        put("/profile", {
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
        { key: "sessions", label: t("profile.tabSessions"), icon: FiLogOut },
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

    return (
        <AppShell title="Profil Akun">
            <Head>
                <title>Profil - SMART Presensi</title>
            </Head>

            <PageHeader title={t("profile.title")} description={t("profile.description")} />

            {/* Navigation Tabs (Full Width Compatible Pill Bar) */}
            <div className="mb-6 font-inter">
                <div className="flex border border-border bg-surface rounded-xl p-1 shadow-xs max-w-xl overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => {
                                router.get("/profile", { tab: tab.key }, { preserveState: true, replace: true });
                            }}
                            className={`flex-1 py-2.5 px-4 text-[13px] font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                                activeTab === tab.key
                                    ? "bg-primary text-white shadow-sm font-bold"
                                    : "text-text-muted hover:text-text-primary hover:bg-muted/60"
                            }`}
                        >
                            <tab.icon className="text-[14px]" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab 1: Profil (Full Width & Header Action Button) */}
            <div className={`w-full ${activeTab === "profile" ? "block" : "hidden"}`}>
                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-inter">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                            <div>
                                <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
                                    <FiUser className="text-primary text-[16px]" />
                                    Informasi Data Akun Pengguna
                                </h2>
                                <p className="text-[12px] text-text-muted mt-0.5">
                                    Kelola nama lengkap, email resmi, dan informasi peranan akun Anda di SMA UII Yogyakarta.
                                </p>
                            </div>
                            <Button type="submit" loading={processing} variant="primary" className="shrink-0" icon={<FiSave className="text-[14px]" />}>
                                {t("profile.saveChanges")}
                            </Button>
                        </div>

                        {/* Profile Header Avatar Strip */}
                        <div className="flex items-center gap-5 p-4 rounded-xl border border-border bg-muted/20">
                            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-extrabold text-2xl shrink-0 shadow-sm">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-[18px] font-bold text-text-primary truncate">{user.name}</h3>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                                        {getRoleLabel(user.role)}
                                    </span>
                                    {user.teacher && (
                                        <span className="text-[12px] text-text-muted font-medium">
                                            • {user.teacher.teacher_type === "wali" ? "Wali Kelas" : user.teacher.teacher_type === "piket" ? "Guru Piket" : "Wali & Piket"} ({user.teacher.teacher_code})
                                        </span>
                                    )}
                                    {user.student && (
                                        <span className="text-[12px] text-text-muted font-medium">
                                            • Rombel: {user.student.class?.name ?? "Belum Masuk Kelas"} (NIS: {user.student.nis})
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form Inputs Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                            <div>
                                <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-inter">
                                    {t("profile.name")}
                                </label>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    error={errors.name}
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-inter">
                                    {t("profile.email")}
                                </label>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    error={errors.email}
                                />
                            </div>
                        </div>
                    </form>
                </Card>
            </div>

            {/* Tab 2: Keamanan (Full Width & Header Action Button) */}
            <div className={`w-full ${activeTab === "security" ? "block" : "hidden"}`}>
                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-inter">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                            <div>
                                <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
                                    <FiShield className="text-primary text-[16px]" />
                                    Preferensi Keamanan & Kata Sandi
                                </h2>
                                <p className="text-[12px] text-text-muted mt-0.5">
                                    Perbarui kata sandi akun Anda secara berkala untuk menjaga integritas keamanan akses.
                                </p>
                            </div>
                            <Button type="submit" loading={processing} variant="primary" className="shrink-0" icon={<FiLock className="text-[14px]" />}>
                                {t("profile.updatePassword")}
                            </Button>
                        </div>

                        <div className="flex flex-col gap-5 max-w-2xl">
                            <div>
                                <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-inter">
                                    {t("profile.currentPassword")}
                                </label>
                                <Input
                                    type="password"
                                    value={data.current_password}
                                    onChange={(e) => setData("current_password", e.target.value)}
                                    error={errors.current_password}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-inter">
                                        {t("profile.newPassword")}
                                    </label>
                                    <Input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        error={errors.password}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-text-primary mb-1.5 font-inter">
                                        {t("profile.confirmPassword")}
                                    </label>
                                    <Input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData("password_confirmation", e.target.value)}
                                        error={errors.password_confirmation}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </Card>
            </div>

            {/* Tab 3: Notifikasi (Full Width & Clean Card Grid) */}
            <div className={`w-full ${activeTab === "notifications" ? "block" : "hidden"}`}>
                <Card className="p-6 font-inter">
                    <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
                        <div>
                            <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
                                <FiBell className="text-primary text-[16px]" />
                                Preferensi Notifikasi & Peringatan
                            </h2>
                            <p className="text-[12px] text-text-muted mt-0.5">
                                Atur jenis notifikasi email, saluran push notification, dan pengumuman sistem absensi.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20">
                            <div>
                                <p className="font-bold text-[14px] text-text-primary">{t("profile.emailNotifications")}</p>
                                <p className="text-[12px] text-text-muted mt-0.5">
                                    {t("profile.emailNotificationsDesc")}
                                </p>
                            </div>
                            <Toggle checked defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20">
                            <div>
                                <p className="font-bold text-[14px] text-text-primary">{t("profile.pushNotifications")}</p>
                                <p className="text-[12px] text-text-muted mt-0.5">
                                    {t("profile.pushNotificationsDesc")}
                                </p>
                            </div>
                            <Toggle checked defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20">
                            <div>
                                <p className="font-bold text-[14px] text-text-primary">{t("profile.leaveNotifications")}</p>
                                <p className="text-[12px] text-text-muted mt-0.5">
                                    {t("profile.leaveNotificationsDesc")}
                                </p>
                            </div>
                            <Toggle checked defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20">
                            <div>
                                <p className="font-bold text-[14px] text-text-primary">{t("profile.attendanceNotifications")}</p>
                                <p className="text-[12px] text-text-muted mt-0.5">
                                    {t("profile.attendanceNotificationsDesc")}
                                </p>
                            </div>
                            <Toggle checked />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tab 4: Sesi (Full Width & Clean Standalone Table) */}
            <div className={`w-full ${activeTab === "sessions" ? "block" : "hidden"}`}>
                <Card className="p-6 font-inter mb-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                        <div>
                            <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
                                <FiLogOut className="text-primary text-[16px]" />
                                Perangkat & Sesi Aktif Akun
                            </h2>
                            <p className="text-[12px] text-text-muted mt-0.5">
                                Daftar perangkat yang saat ini terhubung dan memiliki akses autentikasi aktif ke akun Anda.
                            </p>
                        </div>
                    </div>
                </Card>

                <Table
                    columns={[
                        {
                            key: "name",
                            header: t("profile.device"),
                            render: (s) => <span className="font-bold text-text-primary font-inter">{s.name}</span>,
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
                />
            </div>

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
