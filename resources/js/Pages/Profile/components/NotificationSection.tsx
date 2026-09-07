import { FiBell } from "react-icons/fi";
import { Card, Toggle, MobileSectionHeader } from "@/Components";
import { useLanguage } from "@/Contexts/LanguageContext";
import type { NotificationPreferences } from "../types";

export interface NotificationSectionProps {
    notifPrefs: NotificationPreferences;
    setNotifPrefs: React.Dispatch<React.SetStateAction<NotificationPreferences>>;
    isMobile?: boolean;
}

export default function NotificationSection({
    notifPrefs,
    setNotifPrefs,
    isMobile = false,
}: NotificationSectionProps) {
    const { t } = useLanguage();

    const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
        setNotifPrefs((prev) => ({ ...prev, [key]: value }));
    };

    if (isMobile) {
        return (
            <div className="flex flex-col gap-4 pb-8 font-inter">
                <MobileSectionHeader
                    title="Saluran Notifikasi System"
                    description="Atur jenis notifikasi yang ingin Anda terima di aplikasi."
                />

                <div className="border border-border rounded-2xl divide-y divide-border bg-surface overflow-hidden shadow-card">
                    <div className="flex items-center justify-between p-4">
                        <div>
                            <div className="font-bold text-[13.5px] text-text-primary">Email Notifikasi</div>
                            <div className="text-[11.5px] text-text-muted mt-0.5">Kirimkan salinan pesan ke email resmi</div>
                        </div>
                        <Toggle
                            checked={notifPrefs.email}
                            onChange={(e) => handleToggle("email", e.target.checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4">
                        <div>
                            <div className="font-bold text-[13.5px] text-text-primary">Push Notifications</div>
                            <div className="text-[11.5px] text-text-muted mt-0.5">Pemberitahuan pop-up real-time di perangkat</div>
                        </div>
                        <Toggle
                            checked={notifPrefs.push}
                            onChange={(e) => handleToggle("push", e.target.checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4">
                        <div>
                            <div className="font-bold text-[13.5px] text-text-primary">Notifikasi Pengajuan Izin</div>
                            <div className="text-[11.5px] text-text-muted mt-0.5">Status persetujuan izin & sakit</div>
                        </div>
                        <Toggle
                            checked={notifPrefs.leave}
                            onChange={(e) => handleToggle("leave", e.target.checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4">
                        <div>
                            <div className="font-bold text-[13.5px] text-text-primary">Notifikasi Rekap Presensi</div>
                            <div className="text-[11.5px] text-text-muted mt-0.5">Pengingat & rekap harian presensi</div>
                        </div>
                        <Toggle
                            checked={notifPrefs.attendance}
                            onChange={(e) => handleToggle("attendance", e.target.checked)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
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
                        onChange={(e) => handleToggle("email", e.target.checked)}
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
                        onChange={(e) => handleToggle("push", e.target.checked)}
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
                        onChange={(e) => handleToggle("leave", e.target.checked)}
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
                        onChange={(e) => handleToggle("attendance", e.target.checked)}
                    />
                </div>
            </div>
        </Card>
    );
}
