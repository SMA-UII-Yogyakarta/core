import { useMemo } from "react";
import type { NavSection } from "@/Layouts/AppShell";

export interface BottomNavItem {
    label: string;
    icon: string;
    href: string;
}

interface UseBottomNavItemsParams {
    role?: string;
    teacherType?: string;
    navSections?: NavSection[];
}

export function useBottomNavItems({ role, teacherType, navSections = [] }: UseBottomNavItemsParams): BottomNavItem[] {
    return useMemo(() => {
        if (role === "student") {
            return [
                { label: "Home", icon: "fa-home", href: "/student/dashboard" },
                { label: "Presensi", icon: "fa-clock", href: "/student/attendance" },
                { label: "Izin", icon: "fa-file-alt", href: "/student/history" },
            ];
        }

        if (role === "guardian") {
            return [
                { label: "Home", icon: "fa-home", href: "/guardian" },
                { label: "Ajukan Izin", icon: "fa-paper-plane", href: "/guardian/leave-application" },
                { label: "Riwayat", icon: "fa-history", href: "/guardian/history" },
            ];
        }

        if (role === "teacher") {
            if (teacherType === "piket") {
                return [
                    { label: "Home", icon: "fa-home", href: "/teacher/duty" },
                    { label: "Pantauan", icon: "fa-clipboard-list", href: "/leave-requests" },
                    { label: "Rekap", icon: "fa-chart-bar", href: "/reports/daily" },
                ];
            }
            return [
                { label: "Home", icon: "fa-home", href: "/teacher/homeroom" },
                { label: "Verifikasi", icon: "fa-check-circle", href: "/leave-requests/verification" },
                { label: "Rekap", icon: "fa-chart-bar", href: "/reports/daily" },
            ];
        }

        if (role === "admin") {
            return [
                { label: "Home", icon: "fa-home", href: "/dashboard" },
                { label: "Data Master", icon: "fa-database", href: "/master-data" },
                { label: "Atur Waktu", icon: "fa-clock", href: "/settings" },
            ];
        }

        // Fallback: search dynamically from navSections but max 3 items
        const seen = new Set<string>();
        const items: BottomNavItem[] = [];
        for (const section of navSections) {
            for (const item of section.items) {
                if (!seen.has(item.href)) {
                    seen.add(item.href);
                    items.push({
                        label: item.label,
                        icon: item.icon,
                        href: item.href,
                    });
                    if (items.length === 3) return items;
                }
            }
        }

        return items;
    }, [role, teacherType, navSections]);
}
