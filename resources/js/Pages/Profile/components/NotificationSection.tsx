import { FiBell } from "react-icons/fi";
import { Card, MobileSectionHeader, SectionHeader, Toggle } from "@/Components";
import { useLanguage } from "@/Contexts/LanguageContext";
import type { NotificationPreferences } from "../types";

export interface NotificationSectionProps {
    notifPrefs: NotificationPreferences;
    setNotifPrefs: React.Dispatch<React.SetStateAction<NotificationPreferences>>;
    isMobile?: boolean;
}

export default function NotificationSection({ notifPrefs, setNotifPrefs, isMobile = false }: NotificationSectionProps) {
    const { t } = useLanguage();

    const handleToggle = (key: keyof NotificationPreferences, val: boolean) => {
        setNotifPrefs((prev) => ({ ...prev, [key]: val }));
    };

    if (isMobile) {
        return (
            <div className="flex flex-col gap-4 pb-20 font-inter">
                <MobileSectionHeader
                    title="Preferensi Notifikasi"
                    description="Atur jenis pesan dan saluran peringatan yang ingin Anda terima."
                />

                <div className="border border-border rounded-2xl divide-y divide-border bg-surface overflow-hidden shadow-card">
                    <div className="flex items-center justify-between p-4">
                        <div>
                            <div className="font-bold text-[13.5px] text-text-primary">Email Notifikasi</div>
                            <div className="text-[11.5px] text-text-muted mt-0.5">
                                Kirimkan salinan pesan ke email resmi
                            </div>
                        </div>
                        <Toggle checked={notifPrefs.email} onChange={(e) => handleToggle("email", e.target.checked)} />
                    </div>

                    <div className="flex items-center justify-between p-4">
                        <div>
                            <div className="font-bold text-[13.5px] text-text-primary">Push Notifications</div>
                            <div className="text-[11.5px] text-text-muted mt-0.5">
                                Pemberitahuan pop-up real-time di perangkat
                            </div>
                        </div>
                        <Toggle checked={notifPrefs.push} onChange={(e) => handleToggle("push", e.target.checked)} />
                    </div>

                    <div className="flex items-center justify-between p-4">
                        <div>
                            <div className="font-bold text-[13.5px] text-text-primary">Notifikasi Pengajuan Izin</div>
                            <div className="text-[11.5px] text-text-muted mt-0.5">Status persetujuan izin & sakit</div>
                        </div>
                        <Toggle checked={notifPrefs.leave} onChange={(e) => handleToggle("leave", e.target.checked)} />
                    </div>

                    <div className="flex items-center justify-between p-4">
                        <div>
                            <div className="font-bold text-[13.5px] text-text-primary">Notifikasi Rekap Presensi</div>
                            <div className="text-[11.5px] text-text-muted mt-0.5">
                                Pengingat & rekap harian presensi
                            </div>
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
            <SectionHeader
                icon={<FiBell />}
                title="Preferensi Notifikasi & Peringatan"
                description="Atur jenis notifikasi email, saluran push notification, dan pengumuman sistem absensi."
                divider
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                    <div className="pr-3">
                        <p className="font-bold text-[14px] text-text-primary">{t("profile.emailNotifications")}</p>
                        <p className="text-[12px] text-text-muted mt-0.5">{t("profile.emailNotificationsDesc")}</p>
                    </div>
                    <Toggle checked={notifPrefs.email} onChange={(e) => handleToggle("email", e.target.checked)} />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                    <div className="pr-3">
                        <p className="font-bold text-[14px] text-text-primary">{t("profile.pushNotifications")}</p>
                        <p className="text-[12px] text-text-muted mt-0.5">{t("profile.pushNotificationsDesc")}</p>
                    </div>
                    <Toggle checked={notifPrefs.push} onChange={(e) => handleToggle("push", e.target.checked)} />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                    <div className="pr-3">
                        <p className="font-bold text-[14px] text-text-primary">{t("profile.leaveNotifications")}</p>
                        <p className="text-[12px] text-text-muted mt-0.5">{t("profile.leaveNotificationsDesc")}</p>
                    </div>
                    <Toggle checked={notifPrefs.leave} onChange={(e) => handleToggle("leave", e.target.checked)} />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                    <div className="pr-3">
                        <p className="font-bold text-[14px] text-text-primary">
                            {t("profile.attendanceNotifications")}
                        </p>
                        <p className="text-[12px] text-text-muted mt-0.5">{t("profile.attendanceNotificationsDesc")}</p>
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
