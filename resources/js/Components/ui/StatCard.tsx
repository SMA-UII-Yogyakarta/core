import type { StatColor } from "@/types/component";

export interface StatCardProps {
    label: string;
    value: number | string;
    subtitle?: string;
    color?: StatColor;
    variant?: "default" | "success" | "warning" | "danger" | "info" | "primary";
}

const valueColorMap: Record<string, string> = {
    green: "text-success",
    amber: "text-warning",
    blue: "text-primary",
    red: "text-danger",
    grey: "text-primary",
    default: "text-primary",
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    info: "text-primary",
};

export default function StatCard({ label, value, subtitle, color, variant = "default" }: StatCardProps) {
    const textColor = color ? valueColorMap[color] : valueColorMap[variant] || "text-primary";

    return (
        <article className="flex flex-col justify-between bg-surface border border-border rounded-xl p-6 min-w-[130px] shadow-card min-h-[110px]">
            <div className="flex flex-col gap-1">
                <span className="text-[13px] font-medium text-text-secondary font-inter">{label}</span>
                <span className={`text-[34px] font-bold font-inter leading-none mt-1.5 ${textColor}`}>
                    {value}
                </span>
            </div>
            {subtitle && <span className="text-[12px] text-text-inactive font-inter mt-1.5">{subtitle}</span>}
        </article>
    );
}
