import type { HTMLAttributes } from "react";

export type LiveBadgeVariant = "danger" | "success" | "warning" | "primary" | "dark";

export interface LiveBadgeProps extends HTMLAttributes<HTMLDivElement> {
    label: string;
    variant?: LiveBadgeVariant;
    pulse?: boolean;
    size?: "sm" | "md";
    dusk?: string;
}

const variantStyles: Record<
    LiveBadgeVariant,
    { badge: string; dot: string; text: string }
> = {
    danger: {
        badge: "bg-danger-bg border border-danger-light text-danger",
        dot: "bg-danger",
        text: "text-danger",
    },
    success: {
        badge: "bg-success-bg border border-success-light text-success",
        dot: "bg-success",
        text: "text-success",
    },
    warning: {
        badge: "bg-warning-bg border border-warning-light text-warning",
        dot: "bg-warning",
        text: "text-warning",
    },
    primary: {
        badge: "bg-primary-light/50 border border-primary/20 text-primary",
        dot: "bg-primary",
        text: "text-primary",
    },
    dark: {
        badge: "bg-black/60 border border-white/10 text-white backdrop-blur-sm",
        dot: "bg-danger",
        text: "text-white",
    },
};

const sizeStyles = {
    sm: {
        container: "px-2 py-0.5 text-[10px] gap-1.5",
        dot: "w-1.5 h-1.5",
    },
    md: {
        container: "px-2.5 py-1 text-[11px] gap-2",
        dot: "w-2 h-2",
    },
};

export default function LiveBadge({
    label,
    variant = "danger",
    pulse = true,
    size = "md",
    className = "",
    dusk,
    ...props
}: LiveBadgeProps) {
    const v = variantStyles[variant];
    const s = sizeStyles[size];

    return (
        <div
            className={`inline-flex items-center rounded-full font-bold font-inter tracking-wider select-none ${v.badge} ${s.container} ${className}`}
            dusk={dusk}
            data-testid={dusk}
            {...props}
        >
            <span
                className={`rounded-full shrink-0 ${v.dot} ${s.dot} ${pulse ? "animate-pulse" : ""}`}
                aria-hidden="true"
            />
            <span className={v.text}>{label}</span>
        </div>
    );
}
