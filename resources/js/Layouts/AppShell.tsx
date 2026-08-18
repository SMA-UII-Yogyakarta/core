import { useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import Navbar from "@/Components/layout/Navbar";
import MobileHeader from "@/Components/layout/MobileHeader";
import MobileSidebarDrawer from "@/Components/layout/MobileSidebarDrawer";
import MobileBottomNav from "@/Components/layout/MobileBottomNav";
import DesktopSidebar from "@/Components/layout/DesktopSidebar";
import TabletIconSidebar from "@/Components/layout/TabletIconSidebar";
import { CommandPalette } from "@/Components";
import ErrorBoundary from "@/Components/common/ErrorBoundary";
import Toast from "@/Components/common/Toast";
import type { NavItem, NavSection } from "@/types/component";
import { useInertiaPolling } from "@/hooks/useInertiaPolling";
import { useBottomNavItems } from "@/hooks/useBottomNavItems";

export interface AppShellProps {
    title?: string;
    children: ReactNode;
}

export type { NavItem, NavSection };

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
            recentNotifications?: {
                id: number;
                title: string;
                content: string;
                created_at: string | null;
                is_read: boolean;
            }[];
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

    useInertiaPolling({
        only: ["auth"],
        intervalMs: 60000,
        enabled: Boolean(user),
        onlyWhenVisible: true,
    });

    const userName = user?.name ?? "User";
    const userInitial = getInitials(userName);
    const userRole = user?.role;
    const teacherType = user?.teacher?.teacher_type;
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

    const bottomNavItems = useBottomNavItems({
        role: userRole,
        teacherType,
        navSections,
    });

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

            <div className="h-full flex flex-col bg-primary overflow-hidden">
                <Toast />

                {/* Mobile Header (lg:hidden) */}
                <MobileHeader
                    title={title}
                    mobileBrand={mobileBrand}
                    userRole={userRole}
                    userInitial={userInitial}
                    unreadCount={pageProps.auth?.unreadCount ?? 0}
                    onOpenSidebar={() => setMobileSidebarOpen(true)}
                    onOpenSearch={() => setCommandPaletteOpen(true)}
                />

                {/* Desktop Navbar (hidden on mobile) */}
                <div className="hidden lg:block shrink-0">
                    <Navbar
                        brand="SMA UII YOGYAKARTA"
                        username={userName}
                        userInitial={userInitial}
                        onLogout={handleLogout}
                        onSearchClick={() => setCommandPaletteOpen(true)}
                        unreadCount={pageProps.auth?.unreadCount ?? 0}
                        notifications={pageProps.auth?.recentNotifications ?? []}
                    />
                </div>

                <div className="flex flex-1 min-h-0">
                    {/* Tablet Icon Sidebar (visible on tablet sm to lg) */}
                    <TabletIconSidebar navSections={navSections} activeItemKey={activeItem?.key} />

                    {/* Desktop Sidebar (visible on desktop lg+) */}
                    <DesktopSidebar navSections={navSections} activeItemKey={activeItem?.key} />

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-w-0 bg-background rounded-t-2xl sm:rounded-none lg:rounded-tr-none lg:rounded-tl-[16px] overflow-hidden">
                        <main className="flex-1 min-h-0 overflow-y-auto">
                            <div className="p-4 sm:p-6 pb-20 sm:pb-6 lg:pb-6">
                                <ErrorBoundary>{children}</ErrorBoundary>
                            </div>
                        </main>
                    </div>
                </div>

                {/* Mobile Bottom Nav */}
                <MobileBottomNav items={bottomNavItems} currentUrl={url} />

                {/* Mobile Sidebar Drawer */}
                <MobileSidebarDrawer
                    isOpen={mobileSidebarOpen}
                    userRole={userRole}
                    userName={userName}
                    userInitial={userInitial}
                    navSections={navSections}
                    activeItemKey={activeItem?.key}
                    onClose={() => setMobileSidebarOpen(false)}
                    onLogout={handleLogout}
                />
            </div>

            <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
        </>
    );
}
