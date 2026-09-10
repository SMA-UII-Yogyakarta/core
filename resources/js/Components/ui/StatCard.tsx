import type { StatColor } from "@/types/component";

export interface StatCardProps {
    label: string;
    value: number | string;
    subtitle?: string;
    color?: StatColor;
    variant?: "default" | "success" | "warning" | "danger" | "info" | "primary";
    bgVariant?: "surface" | "success-light" | "warning-light" | "primary-light" | "danger-light";
    indicatorDot?: boolean | "green" | "amber" | "red" | "blue" | "grey";
    percentage?: string | number;
    percentageColor?: string;
    compact?: boolean;
    className?: string;
}

const valueColorMap: Record<string, string> = {
    green: "text-success",
    amber: "text-warning",
    blue: "text-primary",
    red: "text-danger",
    grey: "text-text-primary",
    default: "text-text-primary",
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    info: "text-primary",
};

const dotColorMap: Record<string, string> = {
    green: "bg-success",
    amber: "bg-warning",
    blue: "bg-primary",
    red: "bg-danger",
    grey: "bg-text-muted",
    default: "bg-primary",
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-primary",
};

export default function StatCard({
    label,
    value,
    subtitle,
    color,
    variant = "default",
    bgVariant = "surface",
    indicatorDot,
    percentage,
    percentageColor,
    compact = false,
    className = "",
}: StatCardProps) {
    const isZero = value === 0 || value === "0";
    const textColor = isZero
        ? "text-text-muted"
        : (color ? valueColorMap[color] : valueColorMap[variant] || "text-text-primary");
    const dotKey = typeof indicatorDot === "string" ? indicatorDot : color || variant;
    const dotClass = indicatorDot ? dotColorMap[dotKey] || "bg-primary" : null;
    const bgClass = bgVariant === "surface" ? "bg-surface" : `bg-${bgVariant}`;

    return (
        <article
            className={`flex flex-col justify-between ${bgClass} border border-border rounded-2xl p-3 sm:p-4 lg:p-5 min-w-0 shadow-card min-h-[92px] sm:min-h-[105px] font-inter ${className}`}
        >
            <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] sm:text-[12px] lg:text-[13px] font-bold sm:font-semibold text-text-muted uppercase tracking-wide truncate">
                    {label}
                </span>
                {dotClass && <span className={`w-2 h-2 rounded-full ${dotClass} shrink-0`} />}
            </div>

            <div className={compact ? "" : "mt-2 sm:mt-2.5"}>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span
                        className={`text-[20px] sm:text-[24px] lg:text-[30px] font-extrabold leading-tight ${textColor}`}
                    >
                        {value}
                    </span>
                    {percentage !== undefined && (
                        <span className={`text-[10.5px] sm:text-[12px] font-bold ${percentageColor || textColor}`}>
                            ({percentage}%)
                        </span>
                    )}
                </div>
                {subtitle && (
                    <span className="text-[10px] sm:text-[11px] text-text-muted block mt-0.5 truncate">{subtitle}</span>
                )}
            </div>
        </article>
    );
}
