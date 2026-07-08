import { Link } from "@inertiajs/react";
import Badge from "@/Components/ui/Badge";
import type { SidebarMenuItem } from "@/types/component";

interface SidebarItemProps extends SidebarMenuItem {
    onClick?: () => void;
}

export default function SidebarItem({
    label,
    icon,
    status,
    badge,
    href,
    onClick,
}: SidebarItemProps) {
    const isActive = status === "active";

    // Disamakan persis dengan SiswaLayout & GuruLayout
    const classes = [
        "flex items-center gap-3 px-4 py-3 rounded-lg font-inter text-[14px] transition-all",
        isActive
            ? "bg-accent text-primary font-bold"
            : "text-white/70 hover:bg-white/10 hover:text-white"
    ].join(" ");

    const content = (
        <>
            {/* Icon */}
            <i className={`fas ${icon} w-5 text-center shrink-0`} />

            {/* Label */}
            <span className="flex-1 truncate tracking-normal">
                {label}
            </span>

            {/* Badge */}
            {badge !== undefined && badge > 0 && <Badge count={badge} />}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={classes}>
                {content}
            </Link>
        );
    }

    return (
        <button
            onClick={onClick}
            className={`${classes} text-left w-full`}
            type="button"
        >
            {content}
        </button>
    );
}
