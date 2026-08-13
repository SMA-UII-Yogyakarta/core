import { useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import Navbar from "@/Components/layout/Navbar";
import { CommandPalette } from "@/Components";
import ErrorBoundary from "@/Components/common/ErrorBoundary";
import Toast from "@/Components/common/Toast";
import type { NavItem, NavSection } from "@/types/component";
import { useInertiaPolling } from "@/hooks/useInertiaPolling";

interface AppShellProps {
    title?: string;
    children: ReactNode;
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export default function AppShell({ title, children }: AppShellProps) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

    const { url, props: pageProps } = usePage<{
        auth?: {
            user?: { role?: string; teacher?: { teacher_type?: string }; name?: string };
            unreadCount?: number;
        };
        navSections?: NavSection[];
    }>();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setCommandPaletteOpen((open) => !open);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const user = pageProps.auth?.user;

    // Background polling for unread notifications count (60s)
    useInertiaPolling({
        only: ["auth"],
        intervalMs: 60000,
        enabled: Boolean(user),
        onlyWhenVisible: true,
    });
    const userName = user?.name ?? "User";
    const userInitial = getInitials(userName);
    const userRole = user?.role;
    const mobileBrand =
        userRole === "admin"
            ? "ADMIN SMA UII"
            : userRole === "student"
              ? "SISWA SMA UII"
              : userRole === "guardian"
                ? "WALI MURID"
                : userRole === "teacher"
                  ? "GURU SMA UII"
                  : "SMA UII YOGYAKARTA";

    const handleLogout = () => router.post("/logout");

    const navSections = useMemo<NavSection[]>(() => pageProps.navSections ?? [], [pageProps.navSections]);

    const bottomNavItems = useMemo(() => {
        const role = pageProps.auth?.user?.role;
        const teacherType = pageProps.auth?.user?.teacher?.teacher_type;

        if (role === "student") {
            return [
                { label: "Dashboard", icon: "fa-th-large", href: "/student/dashboard" },
                { label: "Live Presensi", icon: "fa-camera", href: "/student/attendance" },
                { label: "Riwayat", icon: "fa-history", href: "/student/history" },
            ];
        }

        if (role === "guardian") {
            return [
                { label: "Dashboard", icon: "fa-th-large", href: "/guardian" },
                { label: "Ajukan Izin", icon: "fa-paper-plane", href: "/guardian/leave-application" },
                { label: "Riwayat", icon: "fa-history", href: "/guardian/history" },
            ];
        }

        if (role === "teacher") {
            if (teacherType === "piket") {
                return [
                    { label: "Dashboard", icon: "fa-th-large", href: "/teacher/duty" },
                    { label: "Pantauan Izin", icon: "fa-file-signature", href: "/leave-requests" },
                    { label: "Rekap Harian", icon: "fa-history", href: "/reports/daily" },
                ];
            }
            // Wali or both
            return [
                { label: "Dashboard", icon: "fa-th-large", href: "/teacher/homeroom" },
                { label: "Verifikasi Izin", icon: "fa-check-circle", href: "/leave-requests/verification" },
                { label: "Rekap Harian", icon: "fa-history", href: "/reports/daily" },
            ];
        }

        if (role === "admin") {
            return [
                { label: "Dashboard", icon: "fa-th-large", href: "/dashboard" },
                { label: "Data Master", icon: "fa-database", href: "/master-data" },
                { label: "Atur Waktu", icon: "fa-clock", href: "/settings" },
            ];
        }

        // Fallback: search dynamically from navSections but max 3 items
        const seen = new Set<string>();
        const items: { label: string; icon: string; href: string }[] = [];
        for (const section of navSections) {
            for (const item of section.items) {
                if (seen.has(item.href)) continue;
                seen.add(item.href);
                items.push({ label: item.label, icon: item.icon, href: item.href });
                if (items.length === 3) return items;
            }
        }
        return items;
    }, [pageProps.auth?.user, navSections]);

    const activeItem = useMemo<NavItem | null>(() => {
        let best: { item: NavItem; hrefLength: number } | null = null;
        const baseUrl = url.split("?")[0];

        for (const section of navSections) {
            for (const item of section.items) {
                const itemBaseUrl = item.href.split("?")[0];
                const isMatch =
                    baseUrl === itemBaseUrl || (itemBaseUrl !== "/" && baseUrl.startsWith(itemBaseUrl + "/"));

                if (isMatch && (!best || itemBaseUrl.length > best.hrefLength)) {
                    best = { item, hrefLength: itemBaseUrl.length };
                }
            }
        }

        return best?.item ?? null;
    }, [url, navSections]);

    return (
        <>
            {title && <Head title={title} />}

            <div className="h-dvh flex flex-col bg-primary overflow-hidden">
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
                    <h1 className="text-[13px] font-bold tracking-wide truncate max-w-[120px] sm:max-w-none">
                        {mobileBrand}
                    </h1>
                    <div className="flex items-center gap-4 shrink-0">
                        <button
                            onClick={() => setCommandPaletteOpen(true)}
                            className="text-white/80 hover:text-white text-[15px]"
                            aria-label="Cari"
                            type="button"
                        >
                            <i className="fas fa-search" />
                        </button>
                        <Link
                            href="/notifications"
                            className="text-white/80 hover:text-white text-[15px] relative"
                            aria-label="Notifikasi"
                        >
                            <i className="fas fa-bell" />
                            {(pageProps.auth?.unreadCount ?? 0) > 0 && (
                                <span className="absolute -top-1 -right-1 bg-danger text-white text-[8px] font-bold w-[12px] h-[12px] flex items-center justify-center rounded-full border border-primary shrink-0 select-none">
                                    {pageProps.auth?.unreadCount}
                                </span>
                            )}
                        </Link>
                        <Link
                            href="/profile"
                            className="w-7 h-7 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-[11px] shrink-0"
                        >
                            {userInitial}
                        </Link>
                    </div>
                </header>

                {/* Spacer for fixed mobile header */}
                <div className="lg:hidden h-[45px]" />

                {/* Desktop Navbar (hidden on mobile) */}
                <div className="hidden lg:block shrink-0">
                    <Navbar
                        brand="SMA UII YOGYAKARTA"
                        username={userName}
                        userInitial={userInitial}
                        onLogout={handleLogout}
                        onSearchClick={() => setCommandPaletteOpen(true)}
                        unreadCount={pageProps.auth?.unreadCount ?? 0}
                    />
                </div>

                <div className="flex flex-1 min-h-0">
                    {/* Desktop Sidebar */}
                    <aside className="bg-primary py-[25px] px-[15px] flex flex-col gap-[8px] rounded-none hidden lg:flex w-[240px] shrink-0 select-none overflow-y-auto">
                        {navSections.map((section) => (
                            <div key={section.key} className="flex flex-col gap-1">
                                {section.items.map((item) => {
                                    const isActive = activeItem?.key === item.key;
                                    return (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            className={`flex items-center gap-3 py-3 px-[18px] rounded-lg transition-colors ${
                                                isActive
                                                    ? "bg-accent text-primary font-bold"
                                                    : "text-white/60 hover:text-white hover:bg-white/10 font-normal"
                                            }`}
                                        >
                                            <i
                                                className={`fas ${item.icon} text-[14px] shrink-0 ${isActive ? "text-primary" : "text-white/60"}`}
                                            />
                                            <span className="text-[14px] truncate">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </aside>
                    <div className="flex-1 flex flex-col min-w-0 bg-background rounded-t-2xl lg:rounded-tr-none lg:rounded-tl-[16px] overflow-hidden">
                        <main className="flex-1 min-h-0 overflow-y-auto">
                            <div className="p-4 lg:p-6 pb-20 lg:pb-6">
                                <ErrorBoundary>{children}</ErrorBoundary>
                            </div>
                        </main>
                    </div>
                </div>

                {/* Mobile Bottom Nav (lg:hidden) */}
                <div className="lg:hidden fixed bottom-5 left-4 right-4 z-30">
                    <nav className="bg-surface/90 backdrop-blur-md border border-border/40 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] flex justify-around items-center py-2 px-4">
                        {bottomNavItems.map((item) => {
                            const baseUrl = url.split("?")[0];
                            const itemBaseUrl = item.href.split("?")[0];
                            const isActive =
                                baseUrl === itemBaseUrl ||
                                (itemBaseUrl !== "/" && baseUrl.startsWith(itemBaseUrl + "/"));
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="flex flex-col items-center gap-1 px-3 py-1 transition-all duration-200"
                                >
                                    <div
                                        className={`w-12 h-8 rounded-full transition-all duration-300 flex items-center justify-center ${
                                            isActive
                                                ? "bg-primary/10 text-primary scale-105"
                                                : "bg-transparent text-text-inactive hover:text-text-secondary"
                                        }`}
                                    >
                                        <i className={`fas ${item.icon} text-[16px]`} />
                                    </div>
                                    <span
                                        className={`text-[9px] tracking-wider transition-all ${
                                            isActive ? "font-bold text-primary" : "font-medium text-text-inactive"
                                        }`}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Mobile Sidebar Overlay */}
                {mobileSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                )}

                {/* Mobile Slide-out Sidebar Panel */}
                <div
                    className={`fixed top-0 left-0 h-full w-[240px] bg-primary z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
                        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
                        <h2 className="text-[14px] font-bold text-white">Menu</h2>
                        <button
                            onClick={() => setMobileSidebarOpen(false)}
                            className="text-white/60 hover:text-white"
                            type="button"
                            aria-label="Tutup menu"
                        >
                            <i className="fas fa-times text-[16px]" />
                        </button>
                    </div>
                    <div className="px-[15px] py-[25px]">
                        {navSections.map((section) => (
                            <div key={section.key} className="flex flex-col gap-1 mb-4">
                                {section.items.map((item) => {
                                    const isActive = activeItem?.key === item.key;
                                    return (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            onClick={() => setMobileSidebarOpen(false)}
                                            className={`flex items-center gap-3 py-3 px-[18px] rounded-lg transition-colors ${
                                                isActive
                                                    ? "bg-accent text-primary font-bold"
                                                    : "text-white/60 hover:text-white hover:bg-white/10 font-normal"
                                            }`}
                                        >
                                            <i
                                                className={`fas ${item.icon} text-[14px] shrink-0 ${isActive ? "text-primary" : "text-white/60"}`}
                                            />
                                            <span className="text-[14px] truncate">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
        </>
    );
}
