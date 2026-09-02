import { useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import Navbar from "@/Components/layout/Navbar";
import MobileHeader from "@/Components/layout/MobileHeader";
import MobileSidebarDrawer from "@/Components/layout/MobileSidebarDrawer";
import MobileBottomNav from "@/Components/layout/MobileBottomNav";
import DesktopSidebar from "@/Components/layout/DesktopSidebar";
import TabletIconSidebar from "@/Components/layout/TabletIconSidebar";
import RoleSwitcherModal from "@/Components/layout/RoleSwitcherModal";
import { CommandPalette } from "@/Components";
import ErrorBoundary from "@/Components/common/ErrorBoundary";
import Toast from "@/Components/common/Toast";
import type { NavItem, NavSection } from "@/types/component";
import { useInertiaPolling } from "@/hooks/useInertiaPolling";
import { useBottomNavItems } from "@/hooks/useBottomNavItems";

export interface AppShellProps {
    title?: string;
    onBack?: () => void;
    headerActions?: ReactNode;
    showBottomNav?: boolean;
    showSearch?: boolean;
    showNotificationBell?: boolean;
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

export default function AppShell({
    title,
    onBack,
    headerActions,
    showBottomNav = true,
    showSearch = true,
    showNotificationBell,
    children,
}: AppShellProps) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

    const { url, props: pageProps } = usePage<{
        auth?: {
            user?: {
                id?: number;
                role?: string;
                teacher?: { teacher_type?: string[] };
                active_teacher_role?: string;
                name?: string;
                avatar?: string | null;
                avatar_url?: string | null;
            };
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

    const isNotificationPage = url.split("?")[0] === "/notifications";
    const resolvedShowNotificationBell = showNotificationBell ?? !isNotificationPage;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setCommandPaletteOpen((open) => !open);
            }
        };
        
        const openRoleSwitcher = () => setRoleSwitcherOpen(true);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("open-role-switcher", openRoleSwitcher);
        
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("open-role-switcher", openRoleSwitcher);
        };
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
    const userAvatar = user?.avatar || user?.avatar_url || null;
    const userRole = user?.role;
    const teacherType = user?.active_teacher_role ?? "duty";
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

            <div className="fixed inset-0 flex flex-col bg-primary overflow-hidden">
                <Toast />

                {/* Desktop Navbar (lg:block - full width top bar matching Figma Dekstop Dashboard.png & Siswa Dashboard.png) */}
                <div className="hidden lg:block shrink-0">
                    <Navbar
                        brand="SMA UII YOGYAKARTA"
                        username={userName}
                        userInitial={userInitial}
                        userAvatar={userAvatar}
                        userRole={userRole}
                        teacherTypes={user?.teacher?.teacher_type || []}
                        headerActions={headerActions}
                        showSearch={showSearch}
                        showNotificationBell={resolvedShowNotificationBell}
                        onLogout={handleLogout}
                        onSearchClick={() => setCommandPaletteOpen(true)}
                        unreadCount={pageProps.auth?.unreadCount ?? 0}
                        notifications={pageProps.auth?.recentNotifications ?? []}
                    />
                </div>

                {/* Main Body Layout Below Desktop Header / Mobile Header Container */}
                <div className="flex flex-1 min-h-0">
                    {/* Tablet Icon Sidebar (visible sm to lg) */}
                    <TabletIconSidebar navSections={navSections} activeItemKey={activeItem?.key} />

                    {/* Desktop Sidebar (visible lg+) */}
                    <DesktopSidebar navSections={navSections} activeItemKey={activeItem?.key} />

                    {/* Right Column: Mobile Header (lg:hidden) + Main Content Area */}
                    <div className="flex-1 flex flex-col min-w-0 min-h-0">
                        {/* Mobile Header (lg:hidden) */}
                        <MobileHeader
                            title={title}
                            mobileBrand={mobileBrand}
                            userRole={userRole}
                            userInitial={userInitial}
                            userAvatar={userAvatar}
                            unreadCount={pageProps.auth?.unreadCount ?? 0}
                            headerActions={headerActions}
                            showSearch={showSearch}
                            showNotificationBell={resolvedShowNotificationBell}
                            onBack={onBack}
                            onOpenSidebar={() => setMobileSidebarOpen(true)}
                            onOpenSearch={() => setCommandPaletteOpen(true)}
                        />

                        {/* Main Content Card Container */}
                        <div className="flex-1 flex flex-col min-w-0 bg-background rounded-t-2xl sm:rounded-none lg:rounded-tr-none lg:rounded-tl-[16px] overflow-hidden">
                            <main className={`flex-1 min-h-0 overflow-y-auto flex flex-col p-4 sm:p-5 lg:p-6 ${showBottomNav ? "max-sm:pb-24" : ""}`}>
                                <ErrorBoundary>{children}</ErrorBoundary>
                            </main>
                        </div>
                    </div>
                </div>

                {/* Mobile Bottom Nav */}
                {showBottomNav && <MobileBottomNav items={bottomNavItems} currentUrl={url} />}

                {/* Mobile Sidebar Drawer */}
                <MobileSidebarDrawer
                    isOpen={mobileSidebarOpen}
                    userRole={userRole}
                    userName={userName}
                    userInitial={userInitial}
                    userAvatar={userAvatar}
                    teacherTypes={user?.teacher?.teacher_type || []}
                    teacherType={teacherType}
                    navSections={navSections}
                    activeItemKey={activeItem?.key}
                    onClose={() => setMobileSidebarOpen(false)}
                    onLogout={handleLogout}
                />
            </div>

            <RoleSwitcherModal
                isOpen={roleSwitcherOpen}
                onClose={() => setRoleSwitcherOpen(false)}
                activeRole={teacherType}
                availableRoles={user?.teacher?.teacher_type || []}
            />
            <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
        </>
    );
}
