import { useState } from "react";
import type { ReactNode } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import ErrorBoundary from "@/Components/ErrorBoundary";
import Toast from "@/Components/Toast";

interface GuruLayoutProps {
    title?: string;
    children: ReactNode;
    username?: string;
    userInitial?: string;
    activeMenu?: "piket" | "walas" | "verifikasi";
}

const menuItems = [
    {
        key: "piket",
        label: "Dashboard Piket",
        href: "/guru/piket",
        icon: "fa-clipboard-list",
    },
    {
        key: "walas",
        label: "Wali Kelas",
        href: "/guru/wali-kelas",
        icon: "fa-chalkboard-teacher",
    },
    {
        key: "verifikasi",
        label: "Verifikasi Izin",
        href: "/admin/verifikasi-izin",
        icon: "fa-check-circle",
    },
];

export default function GuruLayout({
    title,
    children,
    username,
    userInitial,
    activeMenu,
}: GuruLayoutProps) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const { url } = usePage();

    const isActive = (href: string) => url.startsWith(href);

    return (
        <>
            {title && <Head title={title} />}

            <div className="min-h-screen bg-background flex flex-col lg:flex-row">
                <Toast />
                {/* Mobile Header (lg:hidden) */}
                <header className="lg:hidden bg-primary text-white px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50 h-[45px]">
                    <button
                        onClick={() => setMobileSidebarOpen(true)}
                        className="text-white/80 hover:text-white"
                        type="button"
                        aria-label="Buka menu"
                    >
                        <i className="fas fa-bars text-[18px]" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-[14px] font-bold">
                            SMA UII YOGYAKARTA
                        </h1>
                        {title && (
                            <p className="text-[11px] text-white/70">{title}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {userInitial && (
                            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-[12px]">
                                {userInitial}
                            </div>
                        )}
                    </div>
                </header>

                {/* Spacer for fixed mobile header */}
                <div className="lg:hidden h-[45px]" />

                {/* Desktop Sidebar (hidden lg:block) */}
                <aside className="hidden lg:flex lg:flex-col w-56 bg-primary min-h-screen shrink-0">
                    {/* Brand */}
                    <div className="px-5 py-5 border-b border-white/10">
                        <h1 className="text-[14px] font-bold text-white">
                            SMA UII YOGYAKARTA
                        </h1>
                        <p className="text-[11px] text-white/60 mt-0.5">
                            {username ?? "Guru"}
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                                    activeMenu === item.key
                                        ? "bg-accent text-primary font-bold"
                                        : "text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                <i
                                    className={`fas ${item.icon} w-4 h-4 text-center text-[14px] shrink-0`}
                                />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* User info bottom */}
                    <div className="px-5 py-4 border-t border-white/10">
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-[12px] text-white/50 hover:text-white transition-colors"
                        >
                            <i className="fas fa-sign-out-alt mr-2" />
                            Keluar
                        </Link>
                    </div>
                </aside>

                {/* Mobile Bottom Nav (lg:hidden) */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around py-2 z-30">
                    {menuItems.map((item) => (
                        <Link
                            key={item.key}
                            href={item.href}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                                isActive(item.href)
                                    ? "text-primary"
                                    : "text-text-inactive hover:text-primary"
                            }`}
                        >
                            <i className={`fas ${item.icon} text-[16px]`} />
                            <span className="text-[10px] text-center leading-tight">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>

                {/* Main Content */}
                <main className="flex-1 p-4 lg:p-6 overflow-auto pb-20 lg:pb-6">
                    <ErrorBoundary>{children}</ErrorBoundary>
                </main>

                {/* Spacer for mobile bottom nav */}
                <div className="lg:hidden h-16" />

                {/* Mobile Sidebar Overlay */}
                {mobileSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                )}

                {/* Mobile Slide-out Sidebar Panel */}
                <div
                    className={`fixed top-0 left-0 h-full w-64 bg-primary z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
                        mobileSidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }`}
                >
                    <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
                        <h2 className="text-[14px] font-bold text-white">
                            Menu Guru
                        </h2>
                        <button
                            onClick={() => setMobileSidebarOpen(false)}
                            className="text-white/60 hover:text-white"
                            type="button"
                            aria-label="Tutup menu"
                        >
                            <i className="fas fa-times text-[16px]" />
                        </button>
                    </div>
                    <nav className="flex-1 px-3 py-4 space-y-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.key}
                                href={item.href}
                                onClick={() => setMobileSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                                    activeMenu === item.key
                                        ? "bg-accent text-primary font-bold"
                                        : "text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                <i
                                    className={`fas ${item.icon} w-4 h-4 text-center text-[14px] shrink-0`}
                                />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="px-5 py-4 border-t border-white/10 mt-auto">
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            onClick={() => setMobileSidebarOpen(false)}
                            className="text-[12px] text-white/50 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <i className="fas fa-sign-out-alt" />
                            Keluar
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
