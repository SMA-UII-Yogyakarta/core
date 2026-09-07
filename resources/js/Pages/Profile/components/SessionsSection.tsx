import { FiSmartphone, FiMonitor } from "react-icons/fi";
import { Card, Button, Table, MobileSectionHeader } from "@/Components";
import { useLanguage } from "@/Contexts/LanguageContext";
import type { ProfileSession } from "../types";

export interface SessionsSectionProps {
    sessions: ProfileSession[];
    onRevoke: (sessionId: number) => void;
    revoking: boolean;
    isMobile?: boolean;
}

export default function SessionsSection({
    sessions,
    onRevoke,
    revoking,
    isMobile = false,
}: SessionsSectionProps) {
    const { t } = useLanguage();

    if (isMobile) {
        return (
            <div className="flex flex-col gap-3 pb-8 font-inter">
                <MobileSectionHeader
                    title="Sesi & Perangkat Terhubung"
                    description="Daftar perangkat yang saat ini aktif terhubung ke akun Anda."
                />

                <div className="flex flex-col gap-2.5">
                    {sessions.map((s, idx) => (
                        <div
                            key={s.id}
                            className="p-4 rounded-2xl border border-border bg-surface shadow-card flex flex-col gap-2.5"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        {s.name.toLowerCase().includes("mobile") ||
                                        s.name.toLowerCase().includes("android") ||
                                        s.name.toLowerCase().includes("iphone") ? (
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
                                        onClick={() => onRevoke(s.id)}
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
        );
    }

    return (
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
                        render: (s: ProfileSession) => (
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    {s.name.toLowerCase().includes("mobile") ||
                                    s.name.toLowerCase().includes("android") ||
                                    s.name.toLowerCase().includes("iphone") ? (
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
                        render: (s: ProfileSession) => (
                            <span className="text-text-secondary text-[13px] font-inter">
                                {s.last_used_at ?? t("profile.never")}
                            </span>
                        ),
                    },
                    {
                        key: "created_at",
                        header: t("profile.created"),
                        render: (s: ProfileSession) => (
                            <span className="text-text-secondary text-[13px] font-inter">{s.created_at}</span>
                        ),
                    },
                    {
                        key: "actions",
                        header: <div className="text-center w-full">{t("profile.actions")}</div>,
                        className: "w-28 text-center",
                        render: (s: ProfileSession) => (
                            <Button
                                variant="danger"
                                size="sm"
                                className="rounded-lg text-[12px] px-3 h-8"
                                onClick={() => onRevoke(s.id)}
                                disabled={revoking}
                            >
                                {t("profile.revoke")}
                            </Button>
                        ),
                    },
                ]}
                data={sessions}
                keyExtractor={(s: ProfileSession) => s.id}
                dense
            />
        </Card>
    );
}
