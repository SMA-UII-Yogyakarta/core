import type { ButtonHTMLAttributes, ReactNode } from "react";

export type IconButtonVariant = "ghost" | "surface" | "accent" | "primary" | "danger";
export type IconButtonSize = "xs" | "sm" | "md";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    icon: ReactNode;
    label: string;
    variant?: IconButtonVariant;
    size?: IconButtonSize;
}

const variantClasses: Record<IconButtonVariant, string> = {
    ghost: "text-text-muted hover:text-text-primary hover:bg-muted",
    surface: "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-muted",
    accent: "bg-accent text-primary hover:brightness-95 shadow-xs",
    primary: "bg-primary text-white hover:bg-primary/90 shadow-xs",
    danger: "bg-danger/10 border border-danger/20 text-danger hover:bg-danger/20",
};

const sizeClasses: Record<IconButtonSize, string> = {
    xs: "w-7 h-7 rounded-lg text-[13px]",
    sm: "w-8 h-8 rounded-xl text-[14px]",
    md: "w-10 h-10 rounded-xl text-[16px]",
};

export default function IconButton({
    icon,
    label,
    title,
    variant = "ghost",
    size = "sm",
    className = "",
    type = "button",
    ...props
}: IconButtonProps) {
    return (
        <button
            {...props}
            type={type}
            aria-label={props["aria-label"] ?? label}
            title={title ?? label}
            className={`inline-flex items-center justify-center shrink-0 font-inter transition-all duration-150 select-none cursor-pointer active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        >
            {icon}
        </button>
    );
}
