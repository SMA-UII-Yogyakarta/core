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
    { label: "Dashboard",  icon: "fa-th-large",      href: "/dashboard" },
    { label: "Data",       icon: "fa-database",       href: "/admin/data-master" },
    { label: "Kelas",      icon: "fa-chalkboard-teacher", href: "/admin/enrolment-kelas" },
    { label: "Laporan",    icon: "fa-file-alt",       href: "/admin/rekap-bulanan" },
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

            <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F9FB]">
                <Toast />

                {/* ── Mobile Header ── */}
                <header className="lg:hidden bg-primary text-white px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50 h-[60px]">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="text-white/80 hover:text-white"
                            type="button"
                            aria-label="Buka menu"
                        >
                            <i className="fas fa-bars text-[18px]" />
                        </button>
                        <h1 className="text-[14px] font-bold">SMA UII YOGYAKARTA</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {userInitial && (
                            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-[12px]">
                                {userInitial}
                            </div>
                        )}
                    </div>
                </header>

                {/* Spacer for fixed mobile header */}
                <div className="lg:hidden h-[60px]" />

                {/* ── Desktop Sidebar ── */}
                <Sidebar
                    activeMenu={activeMenu}
                    className="hidden lg:flex"
                />

                {/* ── Main Content Area ── */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Desktop Navbar */}
                    <div className="hidden lg:block">
                        <Navbar
                            username={username}
                            userInitial={userInitial}
                            onLogout={handleLogout}
                        />
                    </div>

                    {/* Content */}
                    <main className="flex-1 overflow-auto p-4 lg:p-10">
                        <ErrorBoundary>{children}</ErrorBoundary>
                    </main>
                </div>

                {/* ── Mobile Bottom Nav ── */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around py-3 z-30">
                    {bottomNavItems.map((item) => {
                        const isActive = url.startsWith(item.href);
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 transition-colors ${
                                    isActive
                                        ? "text-primary"
                                        : "text-text-inactive hover:text-primary"
                                }`}
                            >
                                <i className={`fas ${item.icon} text-[18px]`} />
                                <span className="text-[10px] font-inter">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* ── Mobile Sidebar Overlay ── */}
                {mobileSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                )}

                {/* ── Mobile Slide-out Sidebar ── */}
                <div
                    className={`fixed top-0 left-0 h-full w-64 bg-primary z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
                        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <div className="px-5 py-5 flex items-center justify-between">
                        <h2 className="text-[14px] font-bold text-white font-inter">
                            Menu Admin
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
                    <Sidebar
                        activeMenu={activeMenu}
                        className="!w-full !rounded-none !p-0 !bg-transparent"
                    />
                </div>
            </div>
        </>
    );
}
