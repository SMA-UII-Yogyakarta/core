import { useMemo } from "react";
import type { NavSection } from "@/Layouts/AppShell";

export interface BottomNavItem {
    label: string;
    icon: string;
    href: string;
    badge?: number;
    labelKey?: string;
}

interface UseBottomNavItemsParams {
    role?: string;
    teacherType?: string;
    navSections?: NavSection[];
    pendingLeaveCount?: number;
}

export function useBottomNavItems({ role, teacherType, navSections = [], pendingLeaveCount = 0 }: UseBottomNavItemsParams): BottomNavItem[] {
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
            if (teacherType === "duty") {
                return [
                    { label: "Home", icon: "fa-home", href: "/teacher/duty" },
                    { label: "Pantauan", icon: "fa-clipboard-list", href: "/leave-requests" },
                    { label: "Rekap", icon: "fa-chart-bar", href: "/reports" },
                ];
            }
            return [
                { label: "Dasbor", labelKey: "nav.dasbor", icon: "fa-home", href: "/teacher/homeroom" },
                { label: "Verifikasi Izin", labelKey: "nav.verifikasiIzin", icon: "fa-check-circle", href: "/leave-requests/verification", badge: pendingLeaveCount },
                { label: "Rekap", labelKey: "nav.rekap", icon: "fa-chart-bar", href: "/reports" },
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
    }, [role, teacherType, navSections, pendingLeaveCount]);
}
