import { Link } from "@inertiajs/react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiLogOut, FiRefreshCw, FiSliders, FiUser } from "react-icons/fi";
import Avatar from "../ui/Avatar";
import NotificationPopover, { type NotificationItem } from "./NotificationPopover";

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
    headerActions: _headerActions,
    showSearch: _showSearch = true,
    showNotificationBell = true,
    onLogout,
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
                <span className="text-white font-bold text-[16px] font-brand tracking-wide">{brand}</span>
            </div>

            {/* Right — Icons + User Profile */}
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Facebook-style Desktop Notification Popover */}
                {showNotificationBell && (
                    <>
                        <NotificationPopover
                            unreadCount={unreadCount}
                            notifications={notifications}
                            dusk="desktop-notification-popover"
                        />
                        {/* Vertical Divider */}
                        <div className="h-6 w-[1px] bg-white/20 mx-1" />
                    </>
                )}

                {/* Mobile: Simple Link to Profile */}
                <Link href="/profile" className="sm:hidden shrink-0" aria-label="Profil Pengguna">
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
                        <FiChevronDown
                            className={`text-[12px] text-white/70 ml-1 transition-transform duration-200 ${
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
                                <FiUser className="text-[14px] text-text-muted" />
                                Profil Saya
                            </Link>

                            {userRole === "admin" && (
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-text-secondary hover:text-text-primary hover:bg-muted transition-colors"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    <FiSliders className="text-[14px] text-text-muted" />
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
                                    <FiRefreshCw className="text-[14px] text-text-muted" />
                                    Ganti Peran Guru
                                </button>
                            )}

                            {showLogout && (
                                <div className="border-t border-border mt-1 pt-1">
                                    <button
                                        onClick={onLogout}
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-danger hover:bg-danger/10 transition-colors cursor-pointer text-left font-medium"
                                    >
                                        <FiLogOut className="text-[14px]" />
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
