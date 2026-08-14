import type { HTMLAttributes, ReactNode } from "react";

export type MetricPillVariant = "success" | "warning" | "danger" | "primary" | "neutral";

export interface MetricPillProps extends HTMLAttributes<HTMLDivElement> {
    label: string;
    value: string | number;
    icon?: ReactNode;
    variant?: MetricPillVariant;
    size?: "sm" | "md";
    dusk?: string;
}

const variantStyles: Record<
    MetricPillVariant,
    { valueText: string; bg: string; border: string }
> = {
    success: {
        valueText: "text-success",
        bg: "bg-surface",
        border: "border-border",
    },
    warning: {
        valueText: "text-warning",
        bg: "bg-surface",
        border: "border-border",
    },
    danger: {
        valueText: "text-danger",
        bg: "bg-surface",
        border: "border-border",
    },
    primary: {
        valueText: "text-primary",
        bg: "bg-surface",
        border: "border-border",
    },
    neutral: {
        valueText: "text-text-primary",
        bg: "bg-surface",
        border: "border-border",
    },
};

const sizeStyles = {
    sm: {
        container: "p-2.5 gap-1",
        value: "text-[18px]",
        label: "text-[9px]",
    },
    md: {
        container: "p-3.5 gap-1.5",
        value: "text-[22px]",
        label: "text-[10px]",
    },
};

export default function MetricPill({
    label,
    value,
    icon,
    variant = "neutral",
    size = "sm",
    className = "",
    dusk,
    ...props
}: MetricPillProps) {
    const v = variantStyles[variant];
    const s = sizeStyles[size];

    return (
        <div
            className={`border rounded-xl flex flex-col items-center justify-center shadow-card font-inter ${v.bg} ${v.border} ${s.container} ${className}`}
            dusk={dusk}
            data-testid={dusk}
            {...props}
        >
            <div className="flex items-center gap-1.5">
                {icon}
                <span className={`font-bold leading-none ${v.valueText} ${s.value}`}>
                    {value}
                </span>
            </div>
            <span className={`font-bold text-text-inactive uppercase tracking-wide ${s.label}`}>
                {label}
            </span>
        </div>
    );
}
