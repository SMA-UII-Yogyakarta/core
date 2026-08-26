import { Head, router, useForm, usePage } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { useLanguage } from "@/Contexts/LanguageContext";
import { PageHeader, Card, Button, Input, Toggle, StickyContainer, Table, ConfirmDialog } from "@/Components";
import AppShell from "@/Layouts/AppShell";
import { FiUser, FiLogOut, FiBell, FiShield } from "react-icons/fi";
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
        <AppShell title="Profil">
            <Head>
                <title>Profil - SMART Presensi</title>
            </Head>

            <div className="space-y-6">
                <PageHeader title={t("profile.title")} description={t("profile.description")} />

                {/* Tabs */}
                <StickyContainer>
                    <div className="flex gap-8 border-b border-border select-none overflow-x-auto scrollbar-none">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => {
                                    router.get("/profile", { tab: tab.key }, { preserveState: true, replace: true });
                                }}
                                className={`pb-2 text-[14px] font-semibold transition-colors border-b-2 -mb-px inline-flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                                    activeTab === tab.key
                                        ? "text-primary border-primary font-bold"
                                        : "text-text-inactive border-transparent hover:text-text-primary"
                                }`}
                            >
                                <tab.icon className="text-[15px]" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </StickyContainer>

                <div className="max-w-4xl">
                    <Card>
                        <div className="p-6">
                            {activeTab === "profile" && (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-text">{user.name}</h3>
                                            <p className="text-text-inactive">
                                                {getRoleLabel(user.role)}
                                                {user.teacher &&
                                                    ` • ${user.teacher.teacher_type === "wali" ? "Wali Kelas" : user.teacher.teacher_type === "piket" ? "Guru Piket" : "Keduanya"}`}
                                                {user.student && ` • ${user.student.class?.name ?? "Belum di kelas"}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-text mb-2">
                                                {t("profile.name")}
                                            </label>
                                            <Input
                                                value={data.name}
                                                onChange={(e) => setData("name", e.target.value)}
                                                error={errors.name}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text mb-2">
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

                                    <div className="pt-4 border-t border-border">
                                        <Button type="submit" loading={processing}>
                                            {t("profile.saveChanges")}
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {activeTab === "security" && (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-text mb-2">
                                                {t("profile.currentPassword")}
                                            </label>
                                            <Input
                                                type="password"
                                                value={data.current_password}
                                                onChange={(e) => setData("current_password", e.target.value)}
                                                error={errors.current_password}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-text mb-2">
                                                    {t("profile.newPassword")}
                                                </label>
                                                <Input
                                                    type="password"
                                                    value={data.password}
                                                    onChange={(e) => setData("password", e.target.value)}
                                                    error={errors.password}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-text mb-2">
                                                    {t("profile.confirmPassword")}
                                                </label>
                                                <Input
                                                    type="password"
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData("password_confirmation", e.target.value)}
                                                    error={errors.password_confirmation}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <Button type="submit" loading={processing} variant="primary">
                                            {t("profile.updatePassword")}
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {activeTab === "notifications" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-text">{t("profile.emailNotifications")}</p>
                                            <p className="text-sm text-text-inactive">
                                                {t("profile.emailNotificationsDesc")}
                                            </p>
                                        </div>
                                        <Toggle checked defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-text">{t("profile.pushNotifications")}</p>
                                            <p className="text-sm text-text-inactive">
                                                {t("profile.pushNotificationsDesc")}
                                            </p>
                                        </div>
                                        <Toggle checked defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-text">{t("profile.leaveNotifications")}</p>
                                            <p className="text-sm text-text-inactive">
                                                {t("profile.leaveNotificationsDesc")}
                                            </p>
                                        </div>
                                        <Toggle checked defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-text">
                                                {t("profile.attendanceNotifications")}
                                            </p>
                                            <p className="text-sm text-text-inactive">
                                                {t("profile.attendanceNotificationsDesc")}
                                            </p>
                                        </div>
                                        <Toggle checked />
                                    </div>
                                </div>
                            )}

                            {activeTab === "sessions" && (
                                <div className="space-y-4">
                                    <Table
                                        columns={[
                                            {
                                                key: "name",
                                                header: t("profile.device"),
                                                render: (s) => <span className="font-medium">{s.name}</span>,
                                            },
                                            {
                                                key: "last_used_at",
                                                header: t("profile.lastActive"),
                                                render: (s) => <span className="text-text-inactive">{s.last_used_at ?? t("profile.never")}</span>,
                                            },
                                            {
                                                key: "created_at",
                                                header: t("profile.created"),
                                                render: (s) => <span className="text-text-inactive">{s.created_at}</span>,
                                            },
                                            {
                                                key: "actions",
                                                header: <div className="text-right w-full">{t("profile.actions")}</div>,
                                                render: (s) => (
                                                    <div className="flex justify-end">
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => handleRevoke(s.id)}
                                                            disabled={revoking}
                                                        >
                                                            {t("profile.revoke")}
                                                        </Button>
                                                    </div>
                                                ),
                                                className: "text-right",
                                            },
                                        ]}
                                        data={sessions}
                                        keyExtractor={(s) => s.id}
                                    />
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
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
