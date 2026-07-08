import type { StatColor } from "@/types/component";

interface StatCardProps {
    label: string;
    value: number | string;
    subtitle?: string;
    color?: StatColor;
}

/*
 * Figma: cards have a thin colored left-border (border-l-4) and subtle border around.
 * The "Total Siswa" (grey) card has no special left-border color.
 * Number is large (text-[34px]), bold, colored.
 * Label is small (text-[11px]), uppercase, muted.
 */
const accentBorder: Record<StatColor, string> = {
    green: "border-l-[3px] border-l-success",
    amber: "border-l-[3px] border-l-warning",
    blue:  "border-l-[3px] border-l-primary",
    red:   "border-l-[3px] border-l-danger",
    grey:  "",
};

const valueColor: Record<StatColor, string> = {
    green: "text-success",
    amber: "text-warning",
    blue:  "text-primary",
    red:   "text-danger",
    grey:  "text-text-primary",
};

export default function StatCard({
    label,
    value,
    subtitle,
    color = "grey",
}: StatCardProps) {
    return (
        <article
            className={`flex flex-col gap-0.5 bg-surface border border-border rounded-lg px-5 py-4 min-w-[130px] shadow-sm ${accentBorder[color]}`}
        >
            <span
                className={`text-[34px] font-bold font-inter leading-none ${valueColor[color]}`}
            >
                {value}
            </span>
            <span className="text-[11px] font-semibold uppercase text-text-muted font-inter tracking-[0.06em] mt-1.5">
                {label}
            </span>
            {subtitle && (
                <span className="text-[12px] text-text-inactive font-inter mt-0.5">
                    {subtitle}
                </span>
            )}
        </article>
    );
}
