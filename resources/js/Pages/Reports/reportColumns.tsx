import type { Column } from "@/Components/ui/Table";

export interface MonthStatRow {
    label: string;
    present: number;
    late: number;
    absent: number;
}

export function getRecapColumns(t: (key: string) => string): Column<MonthStatRow>[] {
    return [
        {
            key: "label",
            header: t("reports.month"),
            render: (m) => <span className="font-medium">{m.label}</span>,
        },
        {
            key: "present",
            header: <div className="text-center w-full">{t("reports.present")}</div>,
            render: (m) => <span className="text-success font-semibold">{m.present}</span>,
            className: "text-center",
        },
        {
            key: "late",
            header: <div className="text-center w-full">{t("reports.late")}</div>,
            render: (m) => <span className="text-warning font-semibold">{m.late}</span>,
            className: "text-center",
        },
        {
            key: "absent",
            header: <div className="text-center w-full">{t("reports.absent")}</div>,
            render: (m) => <span className="text-danger font-semibold">{m.absent}</span>,
            className: "text-center",
        },
        {
            key: "rate",
            header: <div className="text-center w-full">{t("reports.rate")}</div>,
            render: (m) => {
                const total = m.present + m.late + m.absent;
                const rate = total > 0 ? (((m.present + m.late) / total) * 100).toFixed(1) : "0.0";
                return <span className="font-medium">{rate}%</span>;
            },
            className: "text-center",
        },
    ];
}
