import type { ReactNode } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import ErrorBoundary from "@/Components/ErrorBoundary";
import Toast from "@/Components/Toast";

interface GuardianLayoutProps {
    title?: string;
    children: ReactNode;
    username?: string;
    userInitial?: string;
}

const bottomNavItems = [
    { label: "Beranda", icon: "fa-home", href: "/guardian" },
    {
        label: "Pengajuan",
        icon: "fa-paper-plane",
        href: "/guardian/leave-application",
    },
];

export default function GuardianLayout({
    title,
    children,
    username,
    userInitial,
}: GuardianLayoutProps) {
    const { url } = usePage();

    const isActive = (href: string) => url.startsWith(href);

    return (
        <>
            {title && <Head title={title} />}

            <div className="min-h-screen bg-background">
                <Toast />
                {/* Mobile Header (lg:hidden) */}
                <header className="lg:hidden bg-primary text-white px-4 py-3 flex items-center justify-between">
                    <div>
                        <h1 className="text-[14px] font-bold">
                            SMA UII YOGYAKARTA
                        </h1>
                        {title && (
                            <p className="text-[11px] text-white/70">{title}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-white/60 hover:text-white text-[14px]"
                            type="button"
                            aria-label="Keluar"
                        >
                            <i className="fas fa-sign-out-alt" />
                        </Link>
                        {userInitial && (
                            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-[12px]">
                                {userInitial}
                            </div>
                        )}
                    </div>
                </header>

                {/* Desktop Header */}
                <header className="hidden lg:flex bg-primary text-white px-6 py-3 items-center justify-between">
                    <h1 className="text-[16px] font-bold">
                        {title || "SMA UII YOGYAKARTA"}
                    </h1>
                    <div className="flex items-center gap-4">
                        {username && (
                            <span className="text-[13px] text-white/80">
                                {username}
                            </span>
                        )}
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-[12px] text-white/50 hover:text-white transition-colors flex items-center gap-1"
                        >
                            <i className="fas fa-sign-out-alt" />
                            Keluar
                        </Link>
                    </div>
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
