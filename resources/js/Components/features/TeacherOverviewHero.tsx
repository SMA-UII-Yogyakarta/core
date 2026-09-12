import type { ReactNode } from "react";
import DashboardHero, { type DashboardHeroBadge } from "@/Components/ui/DashboardHero";

export type TeacherOverviewStatusTone = "success" | "warning" | "primary";

export interface TeacherOverviewHeroProps {
    eyebrow: string;
    title: ReactNode;
    description: ReactNode;
    statusLabel: string;
    statusDetail?: ReactNode;
    statusTone?: TeacherOverviewStatusTone;
    badges?: DashboardHeroBadge[];
    action?: ReactNode;
    className?: string;
}

const statusStyles: Record<TeacherOverviewStatusTone, string> = {
    success: "bg-success/20 text-white border-success/30",
    warning: "bg-warning/20 text-white border-warning/30",
    primary: "bg-white/10 text-white border-white/15",
};

/**
 * Shared context header for teacher overviews.
 * The hero is deliberately the same across breakpoints; density changes below it.
 */
export default function TeacherOverviewHero({
    eyebrow,
    title,
    description,
    statusLabel,
    statusDetail,
    statusTone = "primary",
    badges,
    action,
    className = "",
}: TeacherOverviewHeroProps) {
    return (
        <DashboardHero subtitle={eyebrow} title={title} description={description} badges={badges} className={className}>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3.5">
                <div className="flex min-w-0 items-center gap-2.5">
                    <span
                        className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusStyles[statusTone]}`}
                    >
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                        {statusLabel}
                    </span>
                    {statusDetail && (
                        <span className="truncate text-[11px] font-medium text-white/70">{statusDetail}</span>
                    )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
        </DashboardHero>
    );
}
