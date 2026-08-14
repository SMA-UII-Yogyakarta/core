import { useState, useRef, useEffect } from "react";
import { Link } from "@inertiajs/react";
import Avatar from "../ui/Avatar";
import NotificationPopover, { NotificationItem } from "./NotificationPopover";

interface NavbarProps {
    brand: string;
    username?: string;
    userInitial?: string;
    showLogout?: boolean;
    onLogout?: () => void;
    onSearchClick?: () => void;
    unreadCount?: number;
    notifications?: NotificationItem[];
}

export default function Navbar({
    brand,
    username = "Administrator IT",
    userInitial = "AD",
    showLogout = true,
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
            {/* Left — Brand */}
            <div className="flex items-center gap-3">
                <Avatar name="SMA UII" size="sm" variant="accent" alt="SMA UII Logo" />
                <span className="text-white font-bold text-[16px] font-inter tracking-wide hidden sm:block">
                    {brand}
                </span>
            </div>

            {/* Right — Icons + User */}
            <div className="flex items-center gap-4 sm:gap-5">
                <button
                    onClick={onSearchClick}
                    className="text-white/80 hover:text-white transition-colors text-[16px] cursor-pointer"
                    aria-label="Cari"
                    type="button"
                >
                    <i className="fas fa-search" />
                </button>

                {/* Facebook-style Desktop Notification Popover */}
                <NotificationPopover
                    unreadCount={unreadCount}
                    notifications={notifications}
                    dusk="desktop-notification-popover"
                />

                {/* Vertical Divider */}
                <div className="h-6 w-[1px] bg-white/20 mx-1" />

                {/* Mobile: Simple Link to Profile */}
                <Link
                    href="/profile"
                    className="sm:hidden shrink-0"
                    aria-label="Profil Pengguna"
                >
                    <Avatar name={username || userInitial} size="sm" variant="accent" />
                </Link>

                {/* Desktop/Tablet: Profile Dropdown */}
                <div className="hidden sm:block relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/10 p-1.5 pr-4 rounded-full transition-colors focus:outline-none cursor-pointer"
                    >
                        <Avatar name={username || userInitial} size="xs" variant="accent" />
                        <span className="text-white/90 text-[13px] font-medium font-inter">{username}</span>
                        <i
                            className={`fas fa-chevron-down text-[10px] text-white/70 ml-1 transition-transform ${
                                dropdownOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-dropdown border border-border overflow-hidden z-50">
                            <Link
                                href="/profile"
                                className="flex items-center gap-3 px-4 py-3 text-[13px] text-text-primary font-medium hover:bg-background transition-colors"
                            >
                                <i className="fas fa-user text-text-muted text-[14px] w-4 text-center" />
                                Profil Saya
                            </Link>

                            {showLogout && (
                                <button
                                    onClick={onLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-danger font-medium hover:bg-danger/10 transition-colors border-t border-border"
                                >
                                    <i className="fas fa-sign-out-alt text-[14px] w-4 text-center" />
                                    Keluar
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
