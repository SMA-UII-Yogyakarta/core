import { useState } from "react";
import type { ReactNode } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import Navbar from "@/Components/Navbar";
import Sidebar from "@/Components/Sidebar";
import ErrorBoundary from "@/Components/ErrorBoundary";
import Toast from "@/Components/Toast";

interface AdminLayoutProps {
    title?: string;
    activeMenu?: string;
    children: ReactNode;
    username?: string;
    userInitial?: string;
}

const bottomNavItems = [
    { label: "Dashboard", icon: "fa-th-large", href: "/dashboard" },
    { label: "Data", icon: "fa-database", href: "/admin/master-data" },
    { label: "Presensi", icon: "fa-video", href: "/admin/monitoring" },
    { label: "Izin", icon: "fa-file-signature", href: "/admin/leave-requests" },
];

export default function AdminLayout({
    title,
    activeMenu,
    children,
    username,
    userInitial,
}: AdminLayoutProps) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const { url } = usePage();
    const handleLogout = () => router.post("/logout");

    return (
        <>
            {title && <Head title={title} />}

            <div className="min-h-screen flex flex-col bg-background">
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
                    <h1 className="text-[14px] font-bold">
                        SMA UII YOGYAKARTA
                    </h1>
                    {userInitial && (
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-[12px]">
                            {userInitial}
                        </div>
                    )}
                </header>

                {/* Spacer for fixed mobile header */}
                <div className="lg:hidden h-[45px]" />

                {/* Desktop Navbar (hidden on mobile) */}
                <div className="hidden lg:block">
                    <Navbar
                        brand="SMA UII YOGYAKARTA"
                        username={username}
                        userInitial={userInitial}
                        onLogout={handleLogout}
                    />
                </div>

                <div className="flex flex-1">
                    {/* Desktop Sidebar */}
                    <Sidebar
                        activeMenu={activeMenu}
                        className="rounded-none hidden lg:flex"
                    />

                    <main className="flex-1 p-4 lg:p-6 overflow-auto pb-20 lg:pb-6">
                        <ErrorBoundary>{children}</ErrorBoundary>
                    </main>
                </div>

                {/* Mobile Bottom Nav (lg:hidden) */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around py-2 z-30">
                    {bottomNavItems.map((item) => {
                        const isActive = url.startsWith(item.href);
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${
                                    isActive
                                        ? "text-primary"
                                        : "text-text-inactive hover:text-primary"
                                }`}
                            >
                                <i className={`fas ${item.icon} text-[16px]`} />
                                <span className="text-[10px]">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

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
                            Menu
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
                    <div className="px-3 py-4">
                        <Sidebar
                            activeMenu={activeMenu}
                            className="!rounded-none !p-0 !bg-transparent"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
