import { FiAlertCircle, FiLock, FiShield } from "react-icons/fi";
import { Button, Card, Input, MobileSectionHeader, SectionHeader } from "@/Components";
import { useLanguage } from "@/Contexts/LanguageContext";

export interface SecuritySectionProps {
    data: { current_password: string; password: string; password_confirmation: string };
    setData: (key: "current_password" | "password" | "password_confirmation", value: string) => void;
    errors: { current_password?: string; password?: string; password_confirmation?: string };
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    isMobile?: boolean;
}

export default function SecuritySection({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    isMobile = false,
}: SecuritySectionProps) {
    const { t } = useLanguage();

    if (isMobile) {
        return (
            <div className="flex flex-col gap-4 pb-24 font-inter">
                <form id="mobile-profile-password-form" onSubmit={onSubmit} className="flex flex-col gap-4">
                    <MobileSectionHeader
                        title="Ganti Kata Sandi Akun"
                        description="Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan."
                    />

                    {/* Native Grouped Card */}
                    <div className="bg-surface border border-border rounded-2xl p-4 shadow-card flex flex-col gap-3.5">
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

                        <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15 flex items-start gap-2.5 text-[12px] text-text-secondary mt-1">
                            <FiAlertCircle className="text-primary text-[15px] shrink-0 mt-0.5" />
                            <span>Kata sandi minimal 8 karakter dengan kombinasi huruf, angka, dan simbol.</span>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <Card className="p-6 font-inter shadow-card rounded-2xl">
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
                <SectionHeader
                    icon={<FiShield />}
                    title="Preferensi Keamanan & Kata Sandi"
                    description="Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan akses."
                    divider
                    action={
                        <Button
                            type="submit"
                            loading={processing}
                            variant="primary"
                            className="shrink-0 h-10 font-bold px-4 rounded-xl shadow-xs"
                            icon={<FiLock className="text-[14px]" />}
                        >
                            {t("profile.updatePassword")}
                        </Button>
                    }
                />

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
                            Kata sandi minimal harus terdiri dari 8 karakter, mengombinasikan huruf besar, huruf kecil,
                            angka, dan simbol unik.
                        </span>
                    </div>
                </div>
            </form>
        </Card>
    );
}
