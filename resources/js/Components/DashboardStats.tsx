import { useState } from "react";

type Period = "daily" | "monthly" | "semester";

const tabs: { key: Period; label: string }[] = [
    { key: "daily", label: "Harian" },
    { key: "monthly", label: "Bulanan" },
    { key: "semester", label: "Semester" },
];

interface DashboardStatsProps {
    present?: number;
    absent?: number;
    sick?: number;
    late?: number;
}

interface MobileStatCardProps {
    label: string;
    value: string | number;
    valueColor?: string;
}

function MobileStatCard({
    label,
    value,
    valueColor = "text-primary",
}: MobileStatCardProps) {
    return (
        <div className="bg-surface border border-border rounded-lg p-3">
            <p className="text-[9px] text-text-muted font-inter font-normal leading-tight">
                {label}
            </p>
            <p
                className={`text-[18px] font-bold font-inter leading-tight mt-1 ${valueColor}`}
            >
                {value}
            </p>
        </div>
    );
}

export default function DashboardStats({
    present = 0,
    absent = 0,
    sick = 0,
    late = 0,
}: DashboardStatsProps) {
    const [period, setPeriod] = useState<Period>("daily");

    return (
        <section className="font-inter">
            <div className="flex gap-2 mb-4">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setPeriod(t.key)}
                        className={`px-4 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
                            period === t.key
                                ? "bg-border text-primary"
                                : "bg-muted text-text-muted hover:bg-border"
                        }`}
                        type="button"
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
                <MobileStatCard
                    label="Hadir"
                    value={present}
                    valueColor="text-primary"
                />
                <MobileStatCard
                    label="Tidak Hadir"
                    value={absent}
                    valueColor="text-danger"
                />
                <MobileStatCard
                    label="Ijin"
                    value={sick}
                    valueColor="text-success"
                />
                <MobileStatCard
                    label="Sakit"
                    value={late}
                    valueColor="text-warning"
                />
            </div>
        </section>
    );
}
