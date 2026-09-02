import type { ReactNode } from "react";
import { Link } from "@inertiajs/react";
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
    onBack?: () => void;
    onOpenSidebar: () => void;
    onOpenSearch?: () => void;
}

export default function MobileHeader({
    title,
    mobileBrand,
    userInitial,
    userAvatar,
    unreadCount,
    headerActions,
    showNotificationBell = true,
    onBack,
    onOpenSidebar,
}: MobileHeaderProps) {
    return (
        <header className="lg:hidden flex items-center justify-between h-[52px] px-3.5 sm:px-6 bg-primary text-white shrink-0 shadow-md transition-all duration-200">
            <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                {onBack ? (
                    <button
                        key="btn-back"
                        onClick={onBack}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 active:scale-90 active:bg-white/20 transition-all shrink-0 cursor-pointer animate-mobile-header"
                        type="button"
                        aria-label="Kembali"
                    >
                        <i className="fas fa-arrow-left text-[15px]" />
                    </button>
                ) : (
                    <button
                        key="btn-menu"
                        onClick={onOpenSidebar}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 active:scale-90 active:bg-white/20 transition-all shrink-0 cursor-pointer animate-mobile-header"
                        type="button"
                        aria-label="Buka menu"
                    >
                        <i className="fas fa-bars text-[18px]" />
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
                {showNotificationBell && (
                    <Link
                        href="/notifications"
                        className="w-8 h-8 flex items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all relative"
                        aria-label="Notifikasi"
                    >
                        <i className="fas fa-bell text-[14px]" />
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
