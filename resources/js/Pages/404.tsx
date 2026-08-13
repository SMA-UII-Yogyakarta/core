import { Link } from "@inertiajs/react";
import { FiSearch, FiHome, FiRefreshCw } from "react-icons/fi";
import { useLanguage } from "@/Contexts/LanguageContext";
import PublicLayout from "@/Layouts/PublicLayout";

export default function NotFound() {
    const { t } = useLanguage();

    return (
        <PublicLayout title="404 - Halaman Tidak Ditemukan">
            <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
                <div className="text-center space-y-6 max-w-md">
                    <FiSearch className="text-6xl text-primary/20 mx-auto" />

                    <div>
                        <h1 className="text-5xl font-bold text-text-primary font-inter mb-2">404</h1>
                        <h2 className="text-xl font-semibold text-text-primary mb-4">{t("errors.notFound.title")}</h2>
                        <p className="text-text-muted text-base mb-8 max-w-sm mx-auto">
                            {t("errors.notFound.description")}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl text-base hover:bg-primary/90 transition-all shadow-lg"
                        >
                            <FiHome className="text-[16px]" />
                            {t("errors.notFound.backHome")}
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 bg-surface border border-border text-text-primary font-semibold px-6 py-3 rounded-xl text-base hover:bg-background transition-all"
                        >
                            <FiRefreshCw className="text-[16px]" />
                            {t("errors.notFound.login")}
                        </Link>
                    </div>

                    <p className="text-sm text-text-muted mt-8">{t("errors.notFound.helpText")}</p>
                </div>
            </div>
        </PublicLayout>
    );
}
