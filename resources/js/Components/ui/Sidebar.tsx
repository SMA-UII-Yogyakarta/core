import {
    FaHome,
    FaDatabase,
    FaChalkboardTeacher,
    FaCalendarAlt,
    FaFileAlt,
    FaHistory,
    FaVideo,
    FaFileSignature,
    FaEye,
    FaCheckCircle,
} from "react-icons/fa";
import SidebarItem from "./SidebarItem";
import BrandLogo from "./BrandLogo";

interface MenuItem {
    label: string;
    icon: typeof FaHome;
    href: string;
    badge?: number;
}

const menuItems: MenuItem[] = [
    { label: "Dashboard", icon: FaHome, href: "/admin/dashboard" },
    { label: "Data Master", icon: FaDatabase, href: "/admin/data-master" },
    {
        label: "Enrolment Kelas",
        icon: FaChalkboardTeacher,
        href: "/admin/enrolment-kelas",
    },
    {
        label: "Atur Waktu & Libur",
        icon: FaCalendarAlt,
        href: "/admin/atur-waktu",
    },
    { label: "Laporan Rekap", icon: FaFileAlt, href: "/admin/rekap" },
    { label: "Riwayat", icon: FaHistory, href: "/siswa/riwayat" },
    { label: "Live Presensi", icon: FaVideo, href: "/siswa/presensi" },
    {
        label: "Pengajuan Izin",
        icon: FaFileSignature,
        href: "/wali/pengajuan-izin",
    },
    {
        label: "Pantauan Izin",
        icon: FaEye,
        href: "/admin/pantauan-izin",
        badge: 2,
    },
    {
        label: "Verifikasi Izin",
        icon: FaCheckCircle,
        href: "/admin/verifikasi-izin",
    },
];

interface SidebarProps {
    activePath?: string;
    className?: string;
}

export default function Sidebar({
    activePath = "/admin/dashboard",
    className = "",
}: SidebarProps) {
    return (
        <aside
            className={`
        w-60 h-full bg-primary flex flex-col
        ${className}
      `.trim()}
        >
            {/* Brand */}
            <div className="px-[18px] py-6">
                <BrandLogo variant="light" />
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-0.5 px-3">
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.href}
                        icon={item.icon}
                        label={item.label}
                        href={item.href}
                        active={activePath === item.href}
                        badge={item.badge}
                    />
                ))}
            </nav>

            {/* Footer */}
            <div className="px-[18px] py-4 text-white/40 text-[10px] text-center">
                © 2026 SMA UII Yogyakarta
            </div>
        </aside>
    );
}
