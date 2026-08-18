import { Link } from "@inertiajs/react";
import type { NavSection } from "@/Layouts/AppShell";

interface MobileSidebarDrawerProps {
    isOpen: boolean;
    userRole?: string;
    userName: string;
    userInitial: string;
    navSections: NavSection[];
    activeItemKey?: string;
    onClose: () => void;
    onLogout: () => void;
}

export default function MobileSidebarDrawer({
    isOpen,
    userRole,
    userName,
    userInitial,
    navSections,
    activeItemKey,
    onClose,
    onLogout,
}: MobileSidebarDrawerProps) {
    const roleLabel =
        userRole === "admin"
            ? "Administrator"
            : userRole === "student"
              ? "Siswa"
              : userRole === "guardian"
                ? "Wali Murid"
                : "Guru";

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Mobile Slide-out Sidebar Panel */}
            <div
                className={`fixed top-0 left-0 h-full w-[260px] bg-surface border-r border-border z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Header Brand */}
                <div className="px-5 py-5 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border border-primary/20 flex items-center justify-center bg-white shrink-0 overflow-hidden shadow-sm">
                            <img
                                src="/images/logo-sma-uii.png"
                                alt="SMA UII Logo"
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%232E3391'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 14l9-5-9-5-9 5 9 5z'/%3E%3C/svg%3E";
                                }}
                            />
                        </div>
                        <div>
                            <h2 className="text-[14px] font-bold text-text-primary font-brand leading-tight">
                                SMART Presensi
                            </h2>
                            <p className="text-[10px] text-text-muted">SMA UII Yogyakarta</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-text-inactive hover:text-text-primary transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted"
                        type="button"
                        aria-label="Tutup menu"
                    >
                        <i className="fas fa-times text-[16px]" />
                    </button>
                </div>

                {/* Nav Links */}
                <div className="flex-1 overflow-y-auto px-[15px] py-[25px]">
                    {navSections.map((section) => (
                        <div key={section.key} className="flex flex-col gap-1 mb-4">
                            {section.items.map((item) => {
                                const isActive = activeItemKey === item.key;
                                const activeClass =
                                    userRole === "admin"
                                        ? "bg-accent text-primary font-bold shadow-sm rounded-xl"
                                        : "bg-primary/10 text-primary font-bold rounded-xl";
                                return (
                                    <Link
                                        key={item.key}
                                        href={item.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 py-3 px-[18px] rounded-lg transition-all ${
                                            isActive
                                                ? activeClass
                                                : "text-text-secondary hover:text-text-primary hover:bg-muted font-normal"
                                        }`}
                                    >
                                        <i
                                            className={`fas ${item.icon} text-[14px] shrink-0 ${
                                                isActive ? "text-primary" : "text-text-inactive"
                                            }`}
                                        />
                                        <span className="text-[14px] truncate">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Bottom Profile Info */}
                <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-[12px] shrink-0 shadow-sm">
                            {userInitial}
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-[13px] font-bold text-text-primary truncate">{userName}</h4>
                            <p className="text-[10px] text-text-muted capitalize">{roleLabel}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-inactive hover:text-danger hover:bg-danger/10 transition-colors shrink-0"
                        title="Keluar"
                        type="button"
                    >
                        <i className="fas fa-sign-out-alt text-[15px]" />
                    </button>
                </div>
            </div>
        </>
    );
}
