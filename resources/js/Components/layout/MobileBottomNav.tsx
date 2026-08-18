import { Link } from "@inertiajs/react";
import type { BottomNavItem } from "@/hooks/useBottomNavItems";

interface MobileBottomNavProps {
    items: BottomNavItem[];
    currentUrl: string;
}

function renderSvgIcon(iconName: string, isFab: boolean) {
    if (iconName === "fa-home" || iconName === "home") {
        return (
            <svg className={isFab ? "h-6 w-6" : "h-[1.375rem] w-[1.375rem]"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
        );
    }

    if (iconName === "fa-clock" || iconName === "clock" || iconName === "fa-camera") {
        return (
            <svg className={isFab ? "h-6 w-6" : "h-[1.375rem] w-[1.375rem]"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    }

    if (iconName === "fa-file-alt" || iconName === "fa-history" || iconName === "fa-paper-plane" || iconName === "fa-check-circle" || iconName === "fa-clipboard-list" || iconName === "fa-database" || iconName === "fa-chart-bar") {
        return (
            <svg className={isFab ? "h-6 w-6" : "h-[1.375rem] w-[1.375rem]"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        );
    }

    return <i className={`fas ${iconName} ${isFab ? "text-[22px]" : "text-[18px]"}`} />;
}

export default function MobileBottomNav({ items, currentUrl }: MobileBottomNavProps) {
    if (items.length === 0) return null;

    return (
        <nav className="mobile-nav sm:hidden" role="navigation" aria-label="Navigasi utama">
            <div className="mobile-nav-inner">
                {items.map((item, index) => {
                    const baseUrl = currentUrl.split("?")[0];
                    const itemBaseUrl = item.href.split("?")[0];
                    const isActive =
                        baseUrl === itemBaseUrl ||
                        (itemBaseUrl !== "/" && baseUrl.startsWith(itemBaseUrl + "/"));

                    const isCenter = items.length === 3 && index === 1;

                    if (isCenter) {
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`mobile-nav-item mobile-nav-item--primary ${isActive ? "is-active" : ""}`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <span className="mobile-nav-fab" aria-hidden="true">
                                    {renderSvgIcon(item.icon, true)}
                                </span>
                                <span className="mobile-nav-label">{item.label}</span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`mobile-nav-item ${isActive ? "is-active" : ""}`}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <span className="mobile-nav-icon" aria-hidden="true">
                                {renderSvgIcon(item.icon, false)}
                            </span>
                            <span className="mobile-nav-label">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
