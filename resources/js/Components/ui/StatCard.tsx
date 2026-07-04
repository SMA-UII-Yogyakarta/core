import type { StatColor } from "@/types/component";

interface StatCardProps {
    label: string;
    value: number | string;
    subtitle?: string;
    color?: StatColor;
}

const topBorder: Record<StatColor, string> = {
    green: "border-t-success",
    amber: "border-t-warning",
    blue: "border-t-primary",
    red: "border-t-danger",
    grey: "border-t-text-muted",
};

const valueColor: Record<StatColor, string> = {
    green: "text-success",
    amber: "text-warning",
    blue: "text-primary",
    red: "text-danger",
    grey: "text-text-primary",
};

export default function StatCard({
    label,
    value,
    subtitle,
    color = "grey",
}: StatCardProps) {
    return (
        <article
            className={`flex flex-col gap-1 bg-surface border border-border border-t-4 ${topBorder[color]} rounded-lg p-4 min-w-[140px]`}
        >
            <span className="text-[11px] font-bold uppercase text-text-muted font-inter tracking-wide">
                {label}
            </span>
            <span
                className={`text-[32px] font-bold font-inter leading-tight ${valueColor[color]}`}
            >
                {value}
            </span>
            {subtitle && (
                <span className="text-[12px] text-text-inactive font-inter">
                    {subtitle}
                </span>
            )}
        </article>
    );
}
