import type { HTMLAttributes } from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarVariant = "primary" | "accent" | "muted" | "surface";
export type AvatarStatus = "online" | "offline" | "busy" | "away";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
    name?: string;
    src?: string | null;
    size?: AvatarSize;
    variant?: AvatarVariant;
    status?: AvatarStatus;
    alt?: string;
    dusk?: string;
}

const sizeMap: Record<AvatarSize, { container: string; text: string; dot: string }> = {
    xs: { container: "w-6 h-6", text: "text-[10px]", dot: "w-1.5 h-1.5 ring-1" },
    sm: { container: "w-8 h-8", text: "text-[11px]", dot: "w-2 h-2 ring-1" },
    md: { container: "w-10 h-10", text: "text-[13px]", dot: "w-2.5 h-2.5 ring-2" },
    lg: { container: "w-12 h-12", text: "text-[15px]", dot: "w-3 h-3 ring-2" },
    xl: { container: "w-16 h-16", text: "text-[20px]", dot: "w-3.5 h-3.5 ring-2" },
    "2xl": { container: "w-20 h-20", text: "text-[26px]", dot: "w-4 h-4 ring-2" },
};

const variantMap: Record<AvatarVariant, string> = {
    primary: "bg-primary text-accent font-extrabold",
    accent: "bg-accent text-primary font-extrabold",
    muted: "bg-muted text-text-secondary font-bold",
    surface: "bg-surface text-text-primary border border-border font-bold",
};

const statusMap: Record<AvatarStatus, string> = {
    online: "bg-success",
    offline: "bg-slate-400",
    busy: "bg-danger",
    away: "bg-warning",
};

function getInitials(name?: string): string {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
    name = "",
    src,
    size = "md",
    variant = "primary",
    status,
    alt,
    className = "",
    dusk,
    ...props
}: AvatarProps) {
    const { container, text, dot } = sizeMap[size];
    const initials = getInitials(name);
    const ariaLabel = alt || name || "User Avatar";

    return (
        <div
            className={`relative inline-flex shrink-0 select-none rounded-full ${container} ${className}`}
            dusk={dusk}
            data-testid={dusk}
            {...props}
        >
            <div
                className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden font-inter ${variantMap[variant]} shadow-sm`}
                aria-label={ariaLabel}
                role="img"
            >
                {src ? (
                    <img
                        src={src}
                        alt={ariaLabel}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // If image fails to load, fallback to initials
                            (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                    />
                ) : (
                    <span className={`${text} leading-none tracking-wider`}>{initials}</span>
                )}
            </div>

            {status && (
                <span
                    className={`absolute bottom-0 right-0 rounded-full ${dot} ${statusMap[status]} ring-white dark:ring-neutral-900`}
                    aria-label={`Status: ${status}`}
                />
            )}
        </div>
    );
}
