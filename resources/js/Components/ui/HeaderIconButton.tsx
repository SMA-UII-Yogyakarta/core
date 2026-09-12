import type { ButtonHTMLAttributes, ReactNode } from "react";

export type HeaderIconButtonVariant = "filter" | "accent" | "neutral";

interface HeaderIconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    icon: ReactNode;
    label: string;
    active?: boolean;
    variant?: HeaderIconButtonVariant;
}

const variantClasses: Record<HeaderIconButtonVariant, string> = {
    filter: "text-white/90 hover:text-white hover:bg-white/10 active:bg-white/20",
    accent: "bg-accent text-primary hover:brightness-95 shadow-xs",
    neutral: "bg-white/10 border border-white/20 text-white hover:bg-white/20 active:bg-white/25",
};

/** Shared icon-only action for the primary mobile/tablet header. */
export default function HeaderIconButton({
    icon,
    label,
    active = false,
    variant = "filter",
    className = "",
    type = "button",
    ...props
}: HeaderIconButtonProps) {
    return (
        <button
            {...props}
            type={type}
            title={props.title ?? label}
            aria-label={props["aria-label"] ?? label}
            aria-pressed={variant === "filter" ? active : undefined}
            className={`relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-inter text-[15px] transition-all duration-150 select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer ${
                active && variant === "filter" ? "bg-white/20 text-white hover:bg-white/25" : variantClasses[variant]
            } ${className}`}
        >
            {icon}
            {active && variant === "filter" && (
                <span aria-hidden="true" className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-accent ring-2 ring-primary" />
            )}
        </button>
    );
}
