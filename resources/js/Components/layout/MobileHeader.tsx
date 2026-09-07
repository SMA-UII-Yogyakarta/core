import type { ReactNode } from "react";
import { Link } from "@inertiajs/react";
import { FiArrowLeft, FiMenu, FiSearch, FiX, FiBell } from "react-icons/fi";
import Avatar from "../ui/Avatar";

interface MobileHeaderProps {
    title?: string;
    mobileBrand: string;
    userRole?: string;
    userInitial: string;
    userAvatar?: string | null;
    unreadCount: number;
    headerActions?: ReactNode;
    showSearch?: boolean;
    showNotificationBell?: boolean;
    showNotificationBellOnMobile?: boolean;
    onBack?: () => void;
    onOpenSidebar: () => void;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
}

export default function MobileHeader({
    title,
    mobileBrand,
    userInitial,
    userAvatar,
    unreadCount,
    headerActions,
    showSearch = true,
    showNotificationBell = true,
    showNotificationBellOnMobile = true,
    onBack,
    onOpenSidebar,
    searchValue,
    onSearchChange,
    searchPlaceholder,
}: MobileHeaderProps) {
    return (
        <header className="lg:hidden flex items-center justify-between h-13 px-3.5 bg-primary text-white shrink-0 shadow-md transition-all duration-200">
            <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                {onBack ? (
                    <button
                        key="btn-back"
                        onClick={onBack}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 active:scale-90 active:bg-white/20 transition-all shrink-0 cursor-pointer animate-mobile-header"
                        type="button"
                        aria-label="Kembali"
                    >
                        <FiArrowLeft className="text-[17px]" />
                    </button>
                ) : (
                    <button
                        key="btn-menu"
                        onClick={onOpenSidebar}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 active:scale-90 active:bg-white/20 transition-all shrink-0 cursor-pointer animate-mobile-header"
                        type="button"
                        aria-label="Buka menu"
                    >
                        <FiMenu className="text-[18px]" />
                    </button>
                )}

                <h1
                    key={title || mobileBrand}
                    className="text-[14px] font-bold tracking-wide truncate text-left font-brand leading-none ml-0.5 text-white animate-mobile-header"
                >
                    {title || mobileBrand}
                </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                {headerActions && (
                    <div className="flex items-center gap-1.5 shrink-0">
                        {headerActions}
                    </div>
                )}

                {/* Tablet Header Search Input (hidden sm:flex lg:hidden) placed right beside Notification Bell */}
                {showSearch && onSearchChange && (
                    <div className="hidden sm:flex items-center relative w-44 md:w-56 lg:hidden shrink-0" dusk="tablet-header-search-container">
                        <FiSearch className="absolute left-3 text-white/50 text-[13px] pointer-events-none" />
                        <input
                            type="text"
                            value={searchValue || ""}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={searchPlaceholder || "Cari..."}
                            className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-white/50 text-white placeholder-white/50 text-[12px] rounded-lg pl-8 pr-7 py-1.5 outline-none transition-all font-inter"
                            dusk="tablet-header-search-input"
                        />
                        {searchValue && (
                            <button
                                type="button"
                                onClick={() => onSearchChange("")}
                                className="absolute right-2.5 text-white/50 hover:text-white text-[12px] p-0.5 cursor-pointer"
                                aria-label="Bersihkan pencarian"
                            >
                                <FiX />
                            </button>
                        )}
                    </div>
                )}

                {showNotificationBell && (
                    <Link
                        href="/notifications"
                        className={`w-8 h-8 ${
                            showNotificationBellOnMobile ? "flex" : "hidden sm:flex"
                        } items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all relative`}
                        aria-label="Notifikasi"
                    >
                        <FiBell className="text-[16px]" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 bg-danger text-white text-[8px] font-bold w-[13px] h-[13px] flex items-center justify-center rounded-full border border-surface shrink-0 select-none">
                                {unreadCount}
                            </span>
                        )}
                    </Link>
                )}
                <Link
                    href="/profile"
                    className="shrink-0 hover:scale-105 transition-transform"
                    aria-label="Profil"
                >
                    <Avatar name={userInitial} src={userAvatar} size="sm" variant="accent" />
                </Link>
            </div>
        </header>
    );
}
