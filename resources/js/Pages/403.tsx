import { Link } from "@inertiajs/react";
import { FiAlertTriangle, FiLock, FiHome, FiUser, FiShield, FiRefreshCw } from "react-icons/fi";
import { useLanguage } from "@/Contexts/LanguageContext";
import PublicLayout from "@/Layouts/PublicLayout";

export default function Forbidden() {
    const { t } = useLanguage();

    return (
        <PublicLayout title="403 - Akses Ditolak">
            <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
                <div className="text-center space-y-6 max-w-md">
                    <div className="w-20 h-20 mx-auto mb-4 bg-danger-bg border border-danger-light rounded-2xl flex items-center justify-center">
                        <FiAlertTriangle className="text-3xl text-danger" />
                    </div>
                    
                    <div>
                        <h1 className="text-5xl font-bold text-text-primary font-inter mb-2">
                            403
                        </h1>
                        <h2 className="text-xl font-semibold text-text-primary mb-4">
                            {t("errors.forbidden.title")}
                        </h2>
                        <p className="text-text-muted text-base mb-8 max-w-sm mx-auto">
                            {t("errors.forbidden.description")}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-surface border border-border rounded-xl p-4 text-left">
                            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                                <FiShield className="text-primary" />
                                {t("errors.forbidden.reasonsTitle")}
                            </h3>
                            <ul className="text-sm text-text-muted space-y-2 text-left">
                                <li className="flex items-center gap-2">
                                    <FiLock className="text-text-muted" />
                                    {t("errors.forbidden.reasonNoPermission")}
                                </li>
                                <li className="flex items-center gap-2">
                                    <FiUser className="text-text-muted" />
                                    {t("errors.forbidden.reasonWrongRole")}
                                </li>
                                <li className="flex items-center gap-2">
                                    <FiShield className="text-text-muted" />
                                    {t("errors.forbidden.reasonSessionExpired")}
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl text-base hover:bg-primary/90 transition-all shadow-lg"
                            >
                                <FiHome className="text-[16px]" />
                                {t("errors.forbidden.backHome")}
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 bg-surface border border-border text-text-primary font-semibold px-6 py-3 rounded-xl text-base hover:bg-background transition-all"
                            >
                                <FiRefreshCw className="text-[16px]" />
                                {t("errors.forbidden.loginAgain")}
                            </Link>
                        </div>
                    </div>

                    <p className="text-sm text-text-muted mt-8">
                        {t("errors.forbidden.helpText")}
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
}