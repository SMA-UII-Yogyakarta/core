import type { ReactNode } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import ErrorBoundary from "@/Components/ErrorBoundary";
import Toast from "@/Components/Toast";

interface SiswaLayoutProps {
    title?: string;
    children: ReactNode;
    username?: string;
    userInitial?: string;
    showBack?: boolean;
    backHref?: string;
    backLabel?: string;
}

const bottomNavItems = [
    { label: "Beranda", icon: "fa-home", href: "/student/dashboard" },
    { label: "Presensi", icon: "fa-clock", href: "/student/live-attendance" },
    { label: "Riwayat", icon: "fa-history", href: "/student/history" },
];

export default function SiswaLayout({
    title,
    children,
    username,
    userInitial,
    showBack,
    backHref = "/student/dashboard",
    backLabel = "Kembali",
}: SiswaLayoutProps) {
    const { url } = usePage();

    const isActive = (href: string) => url.startsWith(href);

    return (
        <>
            {title && <Head title={title} />}

            <div className="min-h-screen bg-background">
                <Toast />
                {/* Mobile Header (lg:hidden) */}
                <header className="bg-primary text-white px-4 py-3 flex items-center justify-between lg:hidden">
                    <div className="flex items-center gap-3">
                        {showBack && (
                            <Link
                                href={backHref}
                                className="text-white/80 hover:text-white text-sm"
                            >
                                <i className="fas fa-arrow-left text-[12px]" />
                            </Link>
                        )}
                        <div>
                            <h1 className="text-[14px] font-bold">
                                SMA UII YOGYAKARTA
                            </h1>
                            {title && (
                                <p className="text-[11px] text-white/70">
                                    {title}
                                </p>
                            )}
                        </div>
                    </div>
                    {userInitial && (
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-[12px]">
                            {userInitial}
                        </div>
                    )}
                </header>

                {/* Desktop Header (hidden lg:block) */}
                <header className="hidden lg:flex bg-primary text-white px-6 py-3 items-center justify-between">
                    <div className="flex items-center gap-4">
                        {showBack && (
                            <Link
                                href={backHref}
                                className="text-white/70 hover:text-white text-sm flex items-center gap-1"
                            >
                                <i className="fas fa-arrow-left text-[12px]" />
                                {backLabel}
                            </Link>
                        )}
                        <h1 className="text-[16px] font-bold">
                            {title || "SMA UII YOGYAKARTA"}
                        </h1>
                    </div>
                    {username && (
                        <span className="text-[13px] text-white/80">
                            {username}
                        </span>
                    )}
                </header>

                {/* Content */}
                <main className="max-w-4xl mx-auto p-4 lg:p-8 pb-20 lg:pb-8">
                    <ErrorBoundary>{children}</ErrorBoundary>
                </main>

                {/* Mobile Bottom Nav (lg:hidden) */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around py-2 z-30">
                    {bottomNavItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${
                                isActive(item.href)
                                    ? "text-primary"
                                    : "text-text-inactive hover:text-primary"
                            }`}
                        >
                            <i className={`fas ${item.icon} text-[16px]`} />
                            <span className="text-[10px]">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Spacer for mobile bottom nav */}
                <div className="lg:hidden h-16" />
            </div>
        </>
    );
}
