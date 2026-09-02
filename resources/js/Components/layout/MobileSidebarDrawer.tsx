import { useState } from "react";
import { Link } from "@inertiajs/react";
import type { NavSection } from "@/Layouts/AppShell";
import Avatar from "../ui/Avatar";

interface MobileSidebarDrawerProps {
    isOpen: boolean;
    userRole?: string;
    userName: string;
    userInitial: string;
    userAvatar?: string | null;
    teacherTypes?: string[];
    teacherType?: string;
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
    userAvatar,
    teacherTypes = [],
    teacherType,
    navSections,
    activeItemKey,
    onClose,
    onLogout,
}: MobileSidebarDrawerProps) {
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const roleLabel =
        userRole === "admin"
            ? "Administrator"
            : userRole === "student"
              ? "Siswa"
              : userRole === "guardian"
                ? "Wali Murid"
                : teacherType === "homeroom"
                  ? "Wali Kelas"
                  : teacherType === "duty"
                    ? "Guru Piket"
                    : "Guru";

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => {
                        setProfileMenuOpen(false);
                        onClose();
                    }}
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
                        onClick={() => {
                            setProfileMenuOpen(false);
                            onClose();
                        }}
                        className="text-text-inactive hover:text-text-primary transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted cursor-pointer"
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
                                        onClick={() => {
                                            setProfileMenuOpen(false);
                                            onClose();
                                        }}
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

                {/* Bottom Profile Info with Interactive Dropdown/Popover */}
                <div className="relative border-t border-border bg-muted/30 shrink-0">
                    {/* Popover Dropdown Menu (Upward) */}
                    {profileMenuOpen && (
                        <div className="absolute bottom-full left-2 right-2 mb-2 bg-surface rounded-2xl shadow-xl border border-border p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 font-inter">
                            <div className="px-3 py-2 border-b border-border/80">
                                <p className="text-[13px] font-bold text-text-primary truncate">{userName}</p>
                                <p className="text-[11px] text-text-muted capitalize">{roleLabel}</p>
                            </div>

                            <div className="py-1">
                                <Link
                                    href="/profile"
                                    onClick={() => {
                                        setProfileMenuOpen(false);
                                        onClose();
                                    }}
                                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-text-primary hover:bg-muted rounded-xl transition-colors"
                                >
                                    <i className="fas fa-user-cog text-[13px] text-primary" />
                                    Profil Saya
                                </Link>

                                {userRole === "admin" && (
                                    <Link
                                        href="/settings"
                                        onClick={() => {
                                            setProfileMenuOpen(false);
                                            onClose();
                                        }}
                                        className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-text-primary hover:bg-muted rounded-xl transition-colors"
                                    >
                                        <i className="fas fa-sliders-h text-[13px] text-primary" />
                                        Pengaturan Sistem
                                    </Link>
                                )}

                                {teacherTypes.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileMenuOpen(false);
                                            onClose();
                                            window.dispatchEvent(new CustomEvent("open-role-switcher"));
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-primary hover:bg-primary/10 rounded-xl transition-colors cursor-pointer text-left"
                                    >
                                        <i className="fas fa-sync-alt text-[13px] text-primary" />
                                        Ganti Peran Guru
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bottom Profile Bar Trigger */}
                    <div
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        className="p-3.5 flex items-center justify-between gap-2 cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <Avatar name={userName || userInitial} src={userAvatar} size="sm" variant="accent" />
                            <div className="min-w-0 flex-1">
                                <h4 className="text-[13px] font-bold text-text-primary truncate leading-tight">{userName}</h4>
                                <p className="text-[10px] text-text-muted capitalize leading-tight mt-0.5">{roleLabel}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                type="button"
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                                aria-label="Menu profil"
                            >
                                <i className={`fas fa-chevron-up text-[10px] transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setProfileMenuOpen(false);
                                    onClose();
                                    onLogout();
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-inactive hover:text-danger hover:bg-danger/10 transition-colors shrink-0 cursor-pointer"
                                title="Keluar Akun"
                                type="button"
                                aria-label="Keluar Akun"
                            >
                                <i className="fas fa-sign-out-alt text-[14px]" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
