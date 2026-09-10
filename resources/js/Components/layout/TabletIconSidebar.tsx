import { Link, usePage } from "@inertiajs/react";
import { FiLogOut } from "react-icons/fi";
import type { NavSection } from "@/Layouts/AppShell";

interface TabletIconSidebarProps {
    navSections: NavSection[];
    activeItemKey?: string;
    onLogout?: () => void;
}

export default function TabletIconSidebar({ navSections, activeItemKey, onLogout }: TabletIconSidebarProps) {
    const { schoolName } = usePage().props as { schoolName?: string };
    return (
        <aside className="bg-primary py-3 px-2 flex flex-col items-center gap-2 rounded-none hidden sm:flex lg:hidden w-16 shrink-0 select-none overflow-y-auto overflow-x-hidden no-scrollbar border-r border-white/10 z-20 h-full">
            {/* Top Logo */}
            <Link
                href="/dashboard"
                className="w-10 h-10 rounded-xl bg-accent text-primary font-brand font-extrabold text-[13px] flex items-center justify-center shrink-0 shadow-md shadow-accent/20 hover:scale-105 transition-transform"
                title={schoolName}
            >
                UII
            </Link>

            <div className="w-8 h-[1px] bg-white/10 shrink-0 my-1" />

            {/* Navigation Icons */}
            <div className="flex flex-col gap-2.5 w-full items-center flex-1">
                {navSections.map((section) =>
                    section.items.map((item) => {
                        const isActive = activeItemKey === item.key;
                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                title={item.label}
                                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 relative group ${
                                    isActive
                                        ? "bg-accent text-primary font-bold shadow-md shadow-accent/20"
                                        : "text-white/70 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                <i className={`fas ${item.icon} text-[16px]`} />

                                {/* Floating Tooltip on Hover */}
                                <div className="absolute left-full ml-3 px-2.5 py-1 bg-surface-dark text-white text-[12px] font-medium font-inter rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            </Link>
                        );
                    }),
                )}
            </div>

            {/* Bottom Logout Button */}
            {onLogout && (
                <div className="mt-auto pt-2 shrink-0 w-full flex flex-col items-center">
                    <div className="w-8 h-[1px] bg-white/10 shrink-0 mb-2" />
                    <button
                        type="button"
                        onClick={onLogout}
                        title="Keluar Akun"
                        aria-label="Keluar Akun"
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white/70 hover:text-danger hover:bg-danger/20 transition-all duration-150 relative group cursor-pointer"
                    >
                        <FiLogOut className="text-[18px] rotate-180" />
                        <div className="absolute left-full ml-3 px-2.5 py-1 bg-surface-dark text-white text-[12px] font-medium font-inter rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                            Keluar Akun
                        </div>
                    </button>
                </div>
            )}
        </aside>
    );
}
