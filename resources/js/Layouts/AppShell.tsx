import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import Navbar from "@/Components/Navbar";
import ErrorBoundary from "@/Components/ErrorBoundary";
import Toast from "@/Components/Toast";
import type { NavItem, NavSection } from "@/types/component";

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
    const { url, props: pageProps } = usePage<{
        auth?: { user?: { role?: string; teacher?: { teacher_type?: string }; name?: string } };
        navSections?: NavSection[];
    }>();
    
    const user = pageProps.auth?.user;
    const userName = user?.name ?? "User";
    const userInitial = getInitials(userName);
    
    const handleLogout = () => router.post("/logout");

    const navSections = useMemo<NavSection[]>(
        () => pageProps.navSections ?? [],
        [pageProps.navSections],
    );

    const bottomNavItems = useMemo(() => {
        const seen = new Set<string>();
        const items: { label: string; icon: string; href: string }[] = [];

        for (const section of navSections) {
            for (const item of section.items) {
                if (seen.has(item.href)) continue;
                seen.add(item.href);
                items.push({ label: item.label, icon: item.icon, href: item.href });
                if (items.length === 4) return items;
            }
        }

        return items;
    }, [navSections]);

    const activeItem = useMemo<NavItem | null>(() => {
        let best: { item: NavItem; hrefLength: number } | null = null;

        for (const section of navSections) {
            for (const item of section.items) {
                const isMatch =
                    url === item.href ||
                    (item.href !== "/" && url.startsWith(item.href + "/"));

                if (isMatch && (!best || item.href.length > best.hrefLength)) {
                    best = { item, hrefLength: item.href.length };
                }
            }
        }

        return best?.item ?? null;
    }, [url, navSections]);

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
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-[12px]">
                        {userInitial}
                    </div>
                </header>

                {/* Spacer for fixed mobile header */}
                <div className="lg:hidden h-[45px]" />

                {/* Desktop Navbar (hidden on mobile) */}
                <div className="hidden lg:block">
                    <Navbar
                        brand="SMA UII YOGYAKARTA"
                        username={userName}
                        userInitial={userInitial}
                        onLogout={handleLogout}
                    />
                </div>

                <div className="flex flex-1">
                    {/* Desktop Sidebar */}
                    <aside className="bg-primary py-[25px] px-[15px] flex flex-col gap-[8px] rounded-none hidden lg:flex w-[240px] shrink-0 select-none">
                        {navSections.map((section) => (
                            <div key={section.key} className="flex flex-col gap-1">
                                {section.items.map((item) => {
                                    const isSubmenu = item.key === "class-enrolment";
                                    const isActive = activeItem?.key === item.key;
                                    return (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            className={`flex items-center gap-3 py-3 px-[18px] rounded-lg transition-colors ${
                                                isSubmenu ? "pl-9" : ""
                                            } ${
                                                isActive
                                                    ? "bg-accent text-primary font-bold"
                                                    : "text-white/60 hover:text-white hover:bg-white/10 font-normal"
                                            }`}
                                        >
                                            {!isSubmenu && (
                                                <i className={`fas ${item.icon} text-[14px] shrink-0 ${isActive ? 'text-primary' : 'text-white/60'}`} />
                                            )}
                                            <span className="text-[14px] truncate">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </aside>

                    <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 min-h-0">
                        {/* Breadcrumb */}
                        <nav className="mb-4 lg:mb-6" aria-label="Breadcrumb">
                            <ol className="flex items-center gap-2 text-sm text-text-inactive">
                                <li>
                                    <Link href="/overview" className="hover:text-primary transition-colors">
                                        Beranda
                                    </Link>
                                </li>
                                {activeItem && activeItem.href !== "/overview" && (
                                    <>
                                        <i className="fas fa-chevron-right text-[10px]" />
                                        <li className="text-text capitalize">{activeItem.label}</li>
                                    </>
                                )}
                            </ol>
                        </nav>

                        <ErrorBoundary>{children}</ErrorBoundary>
                    </main>
                </div>

                {/* Mobile Bottom Nav (lg:hidden) */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around py-2 z-30">
                    {bottomNavItems.map((item) => {
                        const isActive = url === item.href || (item.href !== "/" && url.startsWith(item.href + "/"));
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
                    className={`fixed top-0 left-0 h-full w-[240px] bg-primary z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
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
                    <div className="px-[15px] py-[25px]">
                        {navSections.map((section) => (
                            <div key={section.key} className="flex flex-col gap-1 mb-4">
                                {section.items.map((item) => {
                                    const isSubmenu = item.key === "class-enrolment";
                                    const isActive = activeItem?.key === item.key;
                                    return (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            onClick={() => setMobileSidebarOpen(false)}
                                            className={`flex items-center gap-3 py-3 px-[18px] rounded-lg transition-colors ${
                                                isSubmenu ? "pl-9" : ""
                                            } ${
                                                isActive
                                                    ? "bg-accent text-primary font-bold"
                                                    : "text-white/60 hover:text-white hover:bg-white/10 font-normal"
                                            }`}
                                        >
                                            {!isSubmenu && (
                                                <i className={`fas ${item.icon} text-[14px] shrink-0 ${isActive ? 'text-primary' : 'text-white/60'}`} />
                                            )}
                                            <span className="text-[14px] truncate">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}