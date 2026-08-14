import { useState, useRef, useEffect } from "react";
import { Link, router } from "@inertiajs/react";

export interface NotificationItem {
    id: number;
    title: string;
    content: string;
    created_at: string | null;
    is_read: boolean;
}

export interface NotificationPopoverProps {
    unreadCount?: number;
    notifications?: NotificationItem[];
    dusk?: string;
}

export default function NotificationPopover({
    unreadCount = 0,
    notifications = [],
    dusk = "notification-popover",
}: NotificationPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const handleMarkAllRead = () => {
        router.post(
            "/notifications/read/all",
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <div className="relative inline-block" ref={containerRef} dusk={dusk} data-testid={dusk}>
            {/* Bell Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer ${
                    isOpen ? "bg-white/15 text-white" : ""
                }`}
                aria-label={`Notifikasi (${unreadCount} belum dibaca)`}
                aria-expanded={isOpen}
                dusk="btn-bell-popover"
                data-testid="btn-bell-popover"
            >
                <i className="fas fa-bell text-[17px]" />
                {unreadCount > 0 && (
                    <span
                        className="absolute -top-1 -right-1 bg-danger text-white text-[9px] font-bold w-[16px] h-[16px] flex items-center justify-center rounded-full border-2 border-primary shadow-sm select-none animate-pulse"
                        dusk="notification-badge"
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Popover Dropdown */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-3 w-[360px] sm:w-[400px] bg-surface rounded-2xl shadow-modal border border-border overflow-hidden z-50 animate-slide-in font-inter text-text-primary"
                    dusk="notification-dropdown-panel"
                    data-testid="notification-dropdown-panel"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 bg-background/50">
                        <div className="flex items-center gap-2">
                            <h2 className="text-[16px] font-bold text-text-primary font-inter">Notifikasi</h2>
                            {unreadCount > 0 && (
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[11px] font-bold">
                                    {unreadCount} Baru
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className="text-[12px] font-medium text-primary hover:underline cursor-pointer"
                                dusk="btn-mark-all-read"
                            >
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[360px] overflow-y-auto divide-y divide-border/40">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-text-muted mb-3 text-lg">
                                    <i className="fas fa-bell-slash" />
                                </div>
                                <p className="text-[14px] font-semibold text-text-primary">Tidak ada notifikasi baru</p>
                                <p className="text-[12px] text-text-muted mt-1 max-w-[240px]">
                                    Semua pemberitahuan dan status presensi akan muncul di sini.
                                </p>
                            </div>
                        ) : (
                            notifications.map((item) => (
                                <Link
                                    key={item.id}
                                    href="/notifications"
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-start gap-3.5 p-4 hover:bg-muted/60 transition-colors block ${
                                        !item.is_read ? "bg-primary/5" : ""
                                    }`}
                                >
                                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 text-[14px]">
                                        <i className="fas fa-bell" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p
                                                className={`text-[13px] font-semibold truncate ${
                                                    !item.is_read ? "text-primary font-bold" : "text-text-primary"
                                                }`}
                                            >
                                                {item.title}
                                            </p>
                                            {!item.is_read && (
                                                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                            )}
                                        </div>

                                        <p className="text-[12px] text-text-secondary line-clamp-2 leading-relaxed">
                                            {item.content}
                                        </p>

                                        {item.created_at && (
                                            <p className="text-[10px] text-text-muted mt-1.5 font-medium">
                                                {item.created_at}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Footer Shortcut */}
                    <div className="p-3 bg-muted/40 border-t border-border">
                        <Link
                            href="/notifications"
                            onClick={() => setIsOpen(false)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[13px] font-bold text-primary hover:bg-primary/10 transition-colors text-center cursor-pointer"
                            dusk="btn-view-all-notifications"
                            data-testid="btn-view-all-notifications"
                        >
                            <span>Lihat Semua Notifikasi</span>
                            <i className="fas fa-arrow-right text-[11px]" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
