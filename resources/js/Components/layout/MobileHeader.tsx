import { Link } from "@inertiajs/react";

interface MobileHeaderProps {
    title?: string;
    mobileBrand: string;
    userRole?: string;
    userInitial: string;
    unreadCount: number;
    onOpenSidebar: () => void;
    onOpenSearch: () => void;
}

export default function MobileHeader({
    title,
    mobileBrand,
    userInitial,
    unreadCount,
    onOpenSidebar,
    onOpenSearch,
}: MobileHeaderProps) {
    return (
        <header className="lg:hidden flex items-center justify-between h-[50px] px-4 sm:px-6 bg-primary text-white shrink-0 shadow-md transition-all duration-200">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <button
                    onClick={onOpenSidebar}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all shrink-0 cursor-pointer"
                    type="button"
                    aria-label="Buka menu"
                >
                    <i className="fas fa-bars text-[18px]" />
                </button>

                <h1 className="text-[14px] font-bold tracking-wide truncate text-left font-brand leading-none ml-0.5 text-white">
                    {title || mobileBrand}
                </h1>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <button
                    onClick={onOpenSearch}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                    aria-label="Cari"
                    type="button"
                >
                    <i className="fas fa-search text-[14px]" />
                </button>
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
                <Link
                    href="/profile"
                    className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-[11px] shrink-0 shadow-sm border border-primary/10 hover:scale-105 transition-transform"
                >
                    {userInitial}
                </Link>
            </div>
        </header>
    );
}
