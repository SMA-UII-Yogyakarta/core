import { Head, Link, usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/Contexts/LanguageContext";
import PublicLayout from "@/Layouts/PublicLayout";
import { motion } from "framer-motion";
import {
    FiUsers,
    FiShield,
    FiSettings,
    FiMapPin,
    FiCamera,
    FiFileText,
    FiActivity,
    FiChevronRight,
    FiCode,
    FiSmartphone,
    FiCpu,
} from "react-icons/fi";

export default function Welcome() {
    const { auth } = usePage().props as unknown as {
        auth: {
            user: {
                id?: number;
                name?: string;
                role?: string;
                teacher?: { teacher_type?: string } | null;
            } | null;
        };
    };
    const isLoading = !!auth.user;
    const [showDevShortcuts, setShowDevShortcuts] = useState(false);
    const { locale, setLanguage, t } = useLanguage();

    useEffect(() => {
        if (auth.user) {
            const userRole = auth.user.role;
            const homeHref =
                userRole === "admin"
                    ? "/dashboard"
                    : userRole === "student"
                      ? "/student/dashboard"
                      : userRole === "guardian"
                        ? "/guardian"
                        : userRole === "teacher"
                          ? auth.user.teacher?.teacher_type === "homeroom"
                              ? "/teacher/homeroom"
                              : "/teacher/duty"
                          : "/overview";

            const timer = setTimeout(() => {
                router.visit(homeHref);
            }, 1800);

            return () => clearTimeout(timer);
        }
    }, [auth.user]);

    if (isLoading) {
        return (
            <>
                <Head title="Loading - SMART Absen" />
                <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                    <div className="flex flex-col items-center max-w-sm text-center select-none">
                        {/* Animated Logo */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-accent font-bold text-3xl shadow-lg shadow-primary/30 mb-6"
                        >
                            UII
                        </motion.div>

                        {/* Title & Welcome message */}
                        <motion.h2
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="font-brand font-bold text-2xl text-text-primary tracking-tight"
                        >
                            SMART Absen
                        </motion.h2>

                        <motion.p
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="text-text-inactive text-sm font-medium mt-2"
                        >
                            Selamat datang kembali,{" "}
                            <span className="text-text-primary font-semibold">{auth.user?.name}</span>
                        </motion.p>

                        {/* Progress Bar Container */}
                        <div className="w-48 h-1 bg-border rounded-full overflow-hidden mt-8 relative">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="h-full bg-primary"
                            />
                        </div>

                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                            className="text-[11px] text-text-inactive uppercase tracking-widest font-bold mt-4 animate-pulse"
                        >
                            Mempersiapkan dasbor Anda...
                        </motion.span>
                    </div>
                </div>
            </>
        );
    }

    const roles = [
        {
            title: t("welcome.roleStudentTitle"),
            description: t("welcome.roleStudentDesc"),
            icon: FiSmartphone,
            color: "border-blue-500/20 hover:border-blue-500 dark:hover:border-blue-400",
            iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
            link: "/login",
            badge: t("welcome.roleStudentBadge"),
        },
        {
            title: t("welcome.roleGuardianTitle"),
            description: t("welcome.roleGuardianDesc"),
            icon: FiUsers,
            color: "border-emerald-500/20 hover:border-emerald-500 dark:hover:border-emerald-400",
            iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
            link: "/login",
            badge: t("welcome.roleGuardianBadge"),
        },
        {
            title: t("welcome.roleTeacherTitle"),
            description: t("welcome.roleTeacherDesc"),
            icon: FiShield,
            color: "border-amber-500/20 hover:border-amber-500 dark:hover:border-amber-400",
            iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
            link: "/login",
            badge: t("welcome.roleTeacherBadge"),
        },
        {
            title: t("welcome.roleAdminTitle"),
            description: t("welcome.roleAdminDesc"),
            icon: FiSettings,
            color: "border-purple-500/20 hover:border-purple-500 dark:hover:border-purple-400",
            iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
            link: "/login",
            badge: t("welcome.roleAdminBadge"),
        },
    ];

    const features = [
        {
            title: t("welcome.featGeofencingTitle"),
            description: t("welcome.featGeofencingDesc"),
            icon: FiMapPin,
        },
        {
            title: t("welcome.featBiometricTitle"),
            description: t("welcome.featBiometricDesc"),
            icon: FiCamera,
        },
        {
            title: t("welcome.featLeaveTitle"),
            description: t("welcome.featLeaveDesc"),
            icon: FiFileText,
        },
        {
            title: t("welcome.featMonitoringTitle"),
            description: t("welcome.featMonitoringDesc"),
            icon: FiActivity,
        },
    ];

    return (
        <PublicLayout title={t("welcome.documentTitle")}>
            <div className="min-h-screen bg-[#FDFDFC] dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 selection:bg-primary selection:text-white font-sans transition-colors duration-300">
                {/* --- HEADER --- */}
                <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-neutral-950/80 border-b border-slate-200/80 dark:border-neutral-900/80">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-accent font-bold text-xl shadow-md shadow-primary/20">
                                UII
                            </div>
                            <div>
                                <span className="font-brand font-bold text-lg tracking-tight text-primary dark:text-white">
                                    SMART Absen
                                </span>
                                <span className="block text-[10px] text-neutral-500 font-semibold tracking-wider uppercase -mt-1">
                                    SMA UII Yogyakarta
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                {t("welcome.systemOnline")}
                            </div>

                            {/* --- LANGUAGE SWITCHER --- */}
                            <div className="flex items-center border border-slate-200 dark:border-neutral-800 rounded-lg p-1 bg-slate-50 dark:bg-neutral-900">
                                <button
                                    onClick={() => setLanguage("id")}
                                    className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                                        locale === "id"
                                            ? "bg-white dark:bg-neutral-800 text-primary dark:text-white shadow-xs"
                                            : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
                                    }`}
                                >
                                    ID
                                </button>
                                <button
                                    onClick={() => setLanguage("en")}
                                    className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                                        locale === "en"
                                            ? "bg-white dark:bg-neutral-800 text-primary dark:text-white shadow-xs"
                                            : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
                                    }`}
                                >
                                    EN
                                </button>
                            </div>

                            <Link
                                href="/login"
                                className="px-4 py-2 bg-primary hover:bg-primary/95 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 rounded-lg text-sm font-semibold transition-all shadow-sm"
                            >
                                {t("welcome.loginButton")}
                            </Link>
                        </div>
                    </div>
                </header>

                {/* --- HERO SECTION --- */}
                <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
                    {/* Background Ambient Glows */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-light/50 dark:bg-neutral-900 border border-primary/10 dark:border-neutral-800 text-primary dark:text-indigo-300 text-xs font-semibold mb-6">
                            {t("welcome.badge")}
                        </div>

                        <h1 className="font-brand font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight max-w-4xl mx-auto">
                            <span className="block text-neutral-900 dark:text-white">{t("welcome.titleLine1")}</span>
                            <span className="block mt-2 bg-linear-to-r from-primary to-indigo-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-accent">
                                {t("welcome.titleLine2")}
                            </span>
                        </h1>

                        <p className="mt-6 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                            {t("welcome.subtitle")}
                        </p>

                        <div className="mt-10 flex flex-wrap justify-center gap-4">
                            <a
                                href="#portal-masuk"
                                className="px-6 py-3 bg-primary hover:bg-primary/95 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 rounded-xl font-semibold shadow-lg shadow-primary/15 transition-all text-sm flex items-center gap-2"
                            >
                                {t("welcome.ctaButton")} <FiChevronRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </section>

                {/* --- ROLE ACCESS SELECTOR --- */}
                <section
                    id="portal-masuk"
                    className="py-16 bg-slate-50 dark:bg-neutral-900/40 border-y border-slate-200/50 dark:border-neutral-900/50"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <h2 className="font-brand font-bold text-2xl sm:text-3xl text-neutral-900 dark:text-white">
                                {t("welcome.portalTitle")}
                            </h2>
                            <p className="mt-3 text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">
                                {t("welcome.portalSubtitle")}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {roles.map((role, idx) => {
                                const IconComponent = role.icon;
                                return (
                                    <Link
                                        key={idx}
                                        href={role.link}
                                        className={`group relative flex flex-col p-6 bg-white dark:bg-neutral-900 border rounded-2xl shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${role.color}`}
                                    >
                                        <div className="flex justify-between items-start mb-5">
                                            <div
                                                className={`p-3 rounded-xl ${role.iconBg} transition-transform group-hover:scale-110`}
                                            >
                                                <IconComponent className="w-6 h-6" />
                                            </div>
                                            <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-md">
                                                {role.badge}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-white flex items-center gap-1.5">
                                            {role.title}
                                            <FiChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-250" />
                                        </h3>

                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed grow">
                                            {role.description}
                                        </p>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* --- FEATURES GRID --- */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="font-brand font-bold text-2xl sm:text-3xl text-neutral-900 dark:text-white">
                                {t("welcome.featuresTitle")}
                            </h2>
                            <p className="mt-3 text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">
                                {t("welcome.featuresSubtitle")}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((feat, idx) => {
                                const IconComponent = feat.icon;
                                return (
                                    <div key={idx} className="flex flex-col items-center text-center p-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/5 dark:bg-neutral-900 border border-primary/10 dark:border-neutral-800 text-primary dark:text-indigo-400 flex items-center justify-center mb-5 shadow-inner">
                                            <IconComponent className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-2">
                                            {feat.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                            {feat.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* --- DEV TOOLBAR SHORTCUT (For Testing) --- */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                    <div className="border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl p-4 bg-slate-50/50 dark:bg-neutral-900/20 text-center">
                        <button
                            onClick={() => setShowDevShortcuts(!showDevShortcuts)}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-primary dark:hover:text-white transition-colors"
                        >
                            <FiCode className="w-3.5 h-3.5" />
                            {showDevShortcuts ? t("welcome.devToggleHide") : t("welcome.devToggle")}
                        </button>

                        {showDevShortcuts && (
                            <div className="mt-4 flex flex-wrap justify-center gap-3 animate-fadeIn">
                                <Link
                                    href="/login"
                                    className="px-3.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    {t("welcome.devLogin")}
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="px-3.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    {t("welcome.devDashboard")}
                                </Link>
                                <Link
                                    href="/master-data"
                                    className="px-3.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    {t("welcome.devMaster")}
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* --- FOOTER --- */}
                <footer className="border-t border-slate-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            &copy; {new Date().getFullYear()} {t("welcome.footerCopyright")}
                        </div>
                        <div className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
                            <FiCpu className="w-3.5 h-3.5" />
                            {t("welcome.footerDev")}
                        </div>
                    </div>
                </footer>
            </div>
        </PublicLayout>
    );
}
