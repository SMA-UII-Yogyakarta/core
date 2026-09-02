import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Link } from "@inertiajs/react";
import Avatar from "../ui/Avatar";
import NotificationPopover, { NotificationItem } from "./NotificationPopover";

interface NavbarProps {
    brand: string;
    username?: string;
    userInitial?: string;
    userAvatar?: string | null;
    userRole?: string;
    teacherTypes?: string[];
    showLogout?: boolean;
    headerActions?: ReactNode;
    showSearch?: boolean;
    showNotificationBell?: boolean;
    onLogout?: () => void;
    onSearchClick?: () => void;
    unreadCount?: number;
    notifications?: NotificationItem[];
}

export default function Navbar({
    brand,
    username = "Administrator IT",
    userInitial = "AD",
    userAvatar,
    userRole = "admin",
    teacherTypes = [],
    showLogout = true,
    headerActions,
    showSearch = true,
    showNotificationBell = true,
    onLogout,
    onSearchClick,
    unreadCount = 0,
    notifications = [],
}: NavbarProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="flex items-center justify-between px-6 sm:px-10 py-4 bg-primary h-[70px] w-full shrink-0">
            {/* Left — Brand Logo & Name */}
            <div className="flex items-center gap-3">
                <Link
                    href="/dashboard"
                    className="px-2.5 py-1 rounded-lg bg-accent text-primary font-brand font-extrabold text-[13px] leading-none shrink-0 shadow-xs hover:scale-105 transition-transform"
                    title="SMA UII Yogyakarta"
                >
                    UII
                </Link>
                <span className="text-white font-bold text-[16px] font-brand tracking-wide">
                    {brand}
                </span>
            </div>

            {/* Right — Page Header Actions + Icons + User */}
            <div className="flex items-center gap-3 sm:gap-4">
                {headerActions && (
                    <div className="flex items-center gap-2 mr-1">
                        {headerActions}
                    </div>
                )}

                {showSearch && (
                    <button
                        onClick={onSearchClick}
                        className="w-9 h-9 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors text-[16px] focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer"
                        aria-label="Cari"
                        type="button"
                    >
                        <i className="fas fa-search" />
                    </button>
                )}

                {/* Facebook-style Desktop Notification Popover */}
                {showNotificationBell && (
                    <NotificationPopover
                        unreadCount={unreadCount}
                        notifications={notifications}
                        dusk="desktop-notification-popover"
                    />
                )}

                {/* Vertical Divider */}
                <div className="h-6 w-[1px] bg-white/20 mx-1" />

                {/* Mobile: Simple Link to Profile */}
                <Link
                    href="/profile"
                    className="sm:hidden shrink-0"
                    aria-label="Profil Pengguna"
                >
                    <Avatar name={username || userInitial} src={userAvatar} size="sm" variant="accent" />
                </Link>

                {/* Desktop/Tablet: Profile Dropdown */}
                <div className="hidden sm:block relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/10 p-1.5 pr-4 rounded-full transition-colors focus:outline-none cursor-pointer"
                    >
                        <Avatar name={username || userInitial} src={userAvatar} size="xs" variant="accent" />
                        <span className="text-white/90 text-[13px] font-medium font-inter">{username}</span>
                        <i
                            className={`fas fa-chevron-down text-[10px] text-white/70 ml-1 transition-transform ${
                                dropdownOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-lg border border-border py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                            <div className="px-4 py-2 border-b border-border">
                                <p className="text-[13px] font-semibold text-text-primary truncate">{username}</p>
                                <p className="text-[11px] text-text-secondary capitalize">{userRole}</p>
                            </div>

                            <Link
                                href="/profile"
                                className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-text-secondary hover:text-text-primary hover:bg-muted transition-colors"
                                onClick={() => setDropdownOpen(false)}
                            >
                                <i className="fas fa-user-cog text-[13px] text-text-muted" />
                                Profil Saya
                            </Link>

                            {userRole === "admin" && (
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-text-secondary hover:text-text-primary hover:bg-muted transition-colors"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    <i className="fas fa-sliders-h text-[13px] text-text-muted" />
                                    Pengaturan Sistem
                                </Link>
                            )}

                            {teacherTypes.length > 1 && (
                                <button
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        window.dispatchEvent(new CustomEvent("open-role-switcher"));
                                    }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-text-secondary hover:text-text-primary hover:bg-muted transition-colors cursor-pointer text-left"
                                >
                                    <i className="fas fa-sync text-[13px] text-text-muted" />
                                    Ganti Peran Guru
                                </button>
                            )}

                            {showLogout && (
                                <div className="border-t border-border mt-1 pt-1">
                                    <button
                                        onClick={onLogout}
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-danger hover:bg-danger/10 transition-colors cursor-pointer text-left font-medium"
                                    >
                                        <i className="fas fa-sign-out-alt text-[13px]" />
                                        Keluar Akun
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
