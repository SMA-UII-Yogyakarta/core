import SidebarItem from "@/Components/SidebarItem";
import type { SidebarMenuItem } from "@/types/component";

interface SidebarProps {
    activeMenu?: string;
    className?: string;
}

const menuItems: SidebarMenuItem[] = [
    {
        label: "Dashboard",
        icon: "fa-home",
        status: "active",
        href: "/dashboard",
    },
    {
        label: "Data Master",
        icon: "fa-database",
        status: "default",
        href: "/admin/data-master",
    },
    {
        label: "Enrolment Kelas",
        icon: "fa-chalkboard-teacher",
        status: "default",
        href: "/admin/enrolment-kelas",
    },
    {
        label: "Atur Waktu & Libur",
        icon: "fa-calendar-alt",
        status: "default",
        href: "/admin/pengaturan",
    },
    {
        label: "Laporan Rekap",
        icon: "fa-file-alt",
        status: "default",
        href: "/admin/rekap-bulanan",
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
            className={`flex w-[260px] bg-primary flex-col py-6 shrink-0 z-10 ${className}`}
        >
            {/* Brand */}
            <div className="flex items-center gap-3 px-6 mb-10">
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-[13px] shrink-0">
                    UII
                </div>
                <span className="text-white font-bold text-[14px] tracking-wide leading-tight">
                    SMA UII YOGYAKARTA
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 px-4 flex-1">
                {items.map((item) => (
                    <SidebarItem key={item.label} {...item} />
                ))}
            </nav>
        </aside>
    );
}
