import { Link } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import { useLanguage } from "@/Contexts/LanguageContext";
import type { NavSection } from "@/Layouts/AppShell";

interface DesktopSidebarProps {
    navSections: NavSection[];
    activeItemKey?: string;
}

export default function DesktopSidebar({ navSections, activeItemKey }: DesktopSidebarProps) {
    const { props: pageProps } = usePage<{ pendingLeaveCount?: number }>();
    const pendingLeaveCount = pageProps.pendingLeaveCount ?? 0;
    const { t } = useLanguage();

    return (
        <aside className="bg-primary py-6 px-4 flex flex-col gap-2 rounded-none hidden lg:flex w-[240px] shrink-0 select-none overflow-y-auto">
            <div className="flex flex-col gap-1">
                {navSections.map((section) => (
                    <div key={section.key} className="flex flex-col gap-1">
                        {section.items.map((item) => {
                            const isActive = activeItemKey === item.key;
                            const badgeValue = item.badge === "pendingLeaveCount" ? pendingLeaveCount : null;
                            return (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    className={`flex items-center gap-3 py-3 px-[18px] rounded-lg transition-colors ${
                                        isActive
                                            ? "bg-accent text-primary font-bold shadow-xs"
                                            : "text-white/60 hover:text-white hover:bg-white/10 font-normal"
                                    }`}
                                >
                                    <i
                                        className={`fas ${item.icon} text-[14px] shrink-0 ${
                                            isActive ? "text-primary" : "text-white/60"
                                        }`}
                                    />
                                    <span className="text-[14px] truncate flex-1">{t(item.labelKey ?? item.label)}</span>
                                    {badgeValue !== null && badgeValue > 0 && (
                                        <span className="bg-danger text-white text-[11px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center">
                                            {badgeValue}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </div>
        </aside>
    );
}
