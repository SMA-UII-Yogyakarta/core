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

    const classes = `flex items-center gap-3 px-[18px] py-3 w-[210px] h-[41px] rounded-lg transition-all duration-150 font-inter
        ${
            isActive
                ? "bg-accent text-primary font-bold"
                : "bg-transparent text-white/60 font-normal hover:bg-white/10"
        }`;

    const content = (
        <>
            <span className="flex items-center justify-center w-4 h-3.5 text-sm shrink-0">
                <i className={`fas ${icon}`} />
            </span>
            <span className="text-[14px] leading-4.25 flex-1 truncate">
                {label}
            </span>
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
            className={`${classes} w-full text-left`}
            type="button"
        >
            {content}
        </button>
    );
}
