import type { StatColor } from "@/types/component";

interface StatCardProps {
    label: string;
    value: number | string;
    subtitle?: string;
    color?: StatColor;
}

const valueColor: Record<StatColor, string> = {
    green: "text-success",
    amber: "text-warning",
    blue: "text-primary",
    red: "text-danger",
    grey: "text-primary", // Default to primary dark blue in Figma
};

export default function StatCard({ label, value, subtitle, color = "grey" }: StatCardProps) {
    return (
        <article className="flex flex-col justify-between bg-surface border border-border rounded-xl p-6 min-w-[130px] shadow-card min-h-[110px]">
            <div className="flex flex-col gap-1">
                <span className="text-[13px] font-medium text-text-secondary font-inter">{label}</span>
                <span className={`text-[34px] font-bold font-inter leading-none mt-1.5 ${valueColor[color]}`}>
                    {value}
                </span>
            </div>
            {subtitle && <span className="text-[12px] text-text-inactive font-inter mt-1.5">{subtitle}</span>}
        </article>
    );
}
