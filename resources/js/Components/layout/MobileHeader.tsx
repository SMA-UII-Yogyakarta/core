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
    userRole,
    userInitial,
    unreadCount,
    onOpenSidebar,
    onOpenSearch,
}: MobileHeaderProps) {
    const isAdmin = userRole === "admin";

    return (
        <>
            <header
                className={`lg:hidden flex items-center justify-between fixed top-0 left-0 right-0 z-40 h-[50px] px-4 transition-all duration-200 ${
                    isAdmin
                        ? "bg-primary text-white shadow-md"
                        : "bg-surface text-text-primary border-b border-border shadow-sm"
                }`}
            >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Logo Aplikasi UII (Tampil di Tablet di sebelah kiri hamburger, Sembunyi di Mobile) */}
                    <Link
                        href="/dashboard"
                        className="hidden sm:inline-flex items-center justify-center px-2 py-1 rounded-lg bg-accent text-primary font-brand font-extrabold text-[13px] leading-none shrink-0 shadow-xs hover:scale-105 transition-transform"
                        title="SMA UII Yogyakarta"
                    >
                        UII
                    </Link>

                    <button
                        onClick={onOpenSidebar}
                        className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-95 transition-all shrink-0 ${
                            isAdmin ? "text-white/90 hover:text-white" : "text-text-secondary hover:text-text-primary"
                        }`}
                        type="button"
                        aria-label="Buka menu"
                    >
                        <i className="fas fa-bars text-[18px]" />
                    </button>

                    <h1 className="text-[14px] font-bold tracking-wide truncate text-left font-brand leading-none ml-0.5">
                        {title || mobileBrand}
                    </h1>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={onOpenSearch}
                        className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-95 transition-all ${
                            isAdmin ? "text-white/90 hover:text-white" : "text-text-secondary hover:text-text-primary"
                        }`}
                        aria-label="Cari"
                        type="button"
                    >
                        <i className="fas fa-search text-[14px]" />
                    </button>
                    <Link
                        href="/notifications"
                        className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-95 transition-all relative ${
                            isAdmin ? "text-white/90 hover:text-white" : "text-text-secondary hover:text-text-primary"
                        }`}
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
                        className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-[11px] shrink-0 shadow-sm border border-primary/10"
                    >
                        {userInitial}
                    </Link>
                </div>
            </header>

            {/* Spacer for fixed mobile header */}
            <div className="lg:hidden h-[50px]" />
        </>
    );
}
