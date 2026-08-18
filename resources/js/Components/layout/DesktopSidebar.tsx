import { Link } from "@inertiajs/react";
import type { NavSection } from "@/Layouts/AppShell";

interface DesktopSidebarProps {
    navSections: NavSection[];
    activeItemKey?: string;
}

export default function DesktopSidebar({ navSections, activeItemKey }: DesktopSidebarProps) {
    return (
        <aside className="bg-primary py-[25px] px-[15px] flex flex-col gap-[8px] rounded-none hidden lg:flex w-[240px] shrink-0 select-none overflow-y-auto">
            {navSections.map((section) => (
                <div key={section.key} className="flex flex-col gap-1">
                    {section.items.map((item) => {
                        const isActive = activeItemKey === item.key;
                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={`flex items-center gap-3 py-3 px-[18px] rounded-lg transition-colors ${
                                    isActive
                                        ? "bg-accent text-primary font-bold"
                                        : "text-white/60 hover:text-white hover:bg-white/10 font-normal"
                                }`}
                            >
                                <i
                                    className={`fas ${item.icon} text-[14px] shrink-0 ${
                                        isActive ? "text-primary" : "text-white/60"
                                    }`}
                                />
                                <span className="text-[14px] truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            ))}
        </aside>
    );
}
