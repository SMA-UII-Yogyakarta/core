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
import BrandLogo from "./BrandLogo";
import Badge from "./Badge";

interface MenuItem {
    label: string;
    icon: typeof FaHome;
    href: string;
    badge?: number;
}

const menuItems: MenuItem[] = [
    { label: "Dashboard", icon: FaHome, href: "/admin/dashboard" },
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
    { label: "Data Master", icon: FaDatabase, href: "/admin/data-master" },
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

interface SidebarAlternateProps {
    activePath?: string;
    className?: string;
}

export default function SidebarAlternate({
    activePath = "/admin/dashboard",
    className = "",
}: SidebarAlternateProps) {
    return (
        <aside
            className={`
                w-60 h-full bg-gradient-to-b from-[#5F718B] to-white
                flex flex-col
                ${className}
            `.trim()}
        >
            {/* Brand */}
            <div className="px-[18px] py-6">
                <BrandLogo variant="dark" />
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-0.5 px-3">
                {menuItems.map((item) => {
                    const isActive = activePath === item.href;
                    return (
                        <a key={item.href} href={item.href}>
                            <div
                                className={`
                                    flex items-center gap-3 px-[18px] py-3 w-full
                                    rounded-lg cursor-pointer transition-colors duration-150
                                    ${
                                        isActive
                                            ? "bg-yellow-300 text-blue-900 font-bold"
                                            : "text-white/60 font-normal hover:bg-white/10"
                                    }
                                `.trim()}
                            >
                                {/* Icon */}
                                <span className="w-4 h-3.5 flex items-center justify-center shrink-0">
                                    <item.icon className="w-3.5 h-3.5" />
                                </span>

                                {/* Label */}
                                <span className="text-sm leading-[17px] flex-1">
                                    {item.label}
                                </span>

                                {/* Badge notification */}
                                {item.badge !== undefined && item.badge > 0 && (
                                    <Badge variant="danger" size="sm">
                                        {item.badge}
                                    </Badge>
                                )}
                            </div>
                        </a>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-[18px] py-4 text-white/40 text-[10px] text-center">
                © 2026 SMA UII Yogyakarta
            </div>
        </aside>
    );
}
