import type { ReactNode } from "react";
import type { IconType } from "react-icons";

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: IconType;
    color?: "primary" | "success" | "danger" | "warning" | "accent";
    topBorder?: boolean;
    largeNumber?: boolean;
    className?: string;
}

const colorStyles: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    danger: "bg-danger/10 text-danger",
    warning: "bg-amber-100 text-amber-600",
    accent: "bg-accent/20 text-primary",
};

const topBorderStyles: Record<string, string> = {
    primary: "border-t-primary",
    success: "border-t-success",
    danger: "border-t-danger",
    warning: "border-t-amber-500",
    accent: "border-t-accent",
};

export default function StatCard({
    title,
    value,
    icon: Icon,
    color = "primary",
    topBorder = false,
    largeNumber = false,
    className = "",
}: StatCardProps) {
    return (
        <div
            className={`
        bg-surface rounded-lg border border-border
        flex items-center gap-4
        ${topBorder ? `border-t-4 ${topBorderStyles[color]} pt-3 px-4 pb-4` : "p-4"}
        ${className}
      `.trim()}
        >
            {Icon && (
                <div
                    className={`
            w-12 h-12 rounded-lg flex items-center justify-center shrink-0
            ${colorStyles[color] ?? colorStyles.primary}
          `.trim()}
                >
                    <Icon className="w-5 h-5" />
                </div>
            )}

            <div className="flex flex-col">
                <span className="text-xs text-text-muted">{title}</span>
                <span
                    className={`font-bold text-text-primary ${
                        largeNumber ? "text-3xl" : "text-lg"
                    }`}
                >
                    {value}
                </span>
            </div>
        </div>
    );
}
