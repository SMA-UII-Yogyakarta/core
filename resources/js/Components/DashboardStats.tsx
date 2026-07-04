import { useState } from "react";

type Period = "harian" | "bulanan" | "semester";

const tabs: { key: Period; label: string }[] = [
    { key: "harian", label: "Harian" },
    { key: "bulanan", label: "Bulanan" },
    { key: "semester", label: "Semester" },
];

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

export default function DashboardStats() {
    const [period, setPeriod] = useState<Period>("harian");

    return (
        <section className="font-inter">
            {/* Period Filter — mobile.css pill pattern */}
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

            {/* Mobile Stat Cards — mobile.css 2-col grid pattern */}
            <div className="grid grid-cols-2 gap-2.5">
                <MobileStatCard
                    label="Hadir"
                    value="560 || 94%"
                    valueColor="text-primary"
                />
                <MobileStatCard
                    label="Alpa"
                    value="18"
                    valueColor="text-danger"
                />
                <MobileStatCard
                    label="Ijin"
                    value="40 || 2%"
                    valueColor="text-success"
                />
                <MobileStatCard
                    label="Sakit"
                    value="40 || 2%"
                    valueColor="text-warning"
                />
            </div>
        </section>
    );
}
