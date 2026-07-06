import SidebarItem from "@/Components/SidebarItem";
import type { SidebarMenuItem } from "@/types/component";

interface SidebarProps {
    activeMenu?: string;
    className?: string;
}

const menuItems: SidebarMenuItem[] = [
    {
        label: "Dashboard",
        icon: "fa-th-large",
        status: "active",
        href: "/dashboard",
    },
    {
        label: "Data Master",
        icon: "fa-database",
        status: "default",
        href: "/admin/master-data",
    },
    {
        label: "Enrolment Kelas",
        icon: "fa-chalkboard-teacher",
        status: "default",
        href: "/admin/class-enrolment",
    },
    {
        label: "Atur Waktu & Libur",
        icon: "fa-calendar-alt",
        status: "default",
        href: "/admin/settings",
    },
    {
        label: "Laporan Rekap",
        icon: "fa-file-alt",
        status: "default",
        href: "/admin/monthly-recap",
    },
    {
        label: "Riwayat",
        icon: "fa-history",
        status: "default",
        href: "/admin/daily-recap",
    },
    {
        label: "Live Presensi",
        icon: "fa-video",
        status: "default",
        href: "/admin/monitoring",
    },
    {
        label: "Pengajuan Izin",
        icon: "fa-file-signature",
        status: "default",
        href: "/admin/leave-requests",
        badge: 2,
    },
    {
        label: "Pantauan Izin",
        icon: "fa-eye",
        status: "default",
        href: "/admin/leave-requests",
    },
    {
        label: "Verifikasi Izin",
        icon: "fa-check-circle",
        status: "default",
        href: "/admin/leave-verification",
    },
];

function applyActive(
    items: SidebarMenuItem[],
    activeLabel?: string,
): SidebarMenuItem[] {
    return items.map((item) => ({
        ...item,
        status: (
            activeLabel ? item.label === activeLabel : item.status === "active"
        )
            ? ("active" as const)
            : ("default" as const),
    }));
}

export default function Sidebar({ activeMenu, className = "" }: SidebarProps) {
    const items = applyActive(menuItems, activeMenu);

    return (
        <aside
            className={`bg-primary p-[15px] flex flex-col gap-[8px] rounded-none ${className}`}
        >
            {items.map((item) => (
                <SidebarItem key={item.label} {...item} />
            ))}
        </aside>
    );
}
