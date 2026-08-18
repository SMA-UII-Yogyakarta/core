import { Head } from "@inertiajs/react";
import { useLanguage } from "@/Contexts/LanguageContext";
import { PageHeader, Card, SelectInput, StatCard, AttendanceChart } from "@/Components";
import AppShell from "@/Layouts/AppShell";
import { FiDownload } from "react-icons/fi";

interface MonthlyReportProps {
    monthlyStats: { year: number; months: Array<{ label: string; present: number; late: number; absent: number }> };
    classes: Array<{ id: number; name: string }>;
    selectedMonth: number;
    selectedYear: number;
    selectedClassId: number | null;
}

export default function MonthlyReport({
    monthlyStats,
    classes,
    selectedMonth,
    selectedYear,
    selectedClassId,
}: MonthlyReportProps) {
    const { t } = useLanguage();

    const monthNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];

    return (
        <AppShell title="Rekap Bulanan">
            <Head>
                <title>Rekap Bulanan - SMART Presensi</title>
            </Head>

            <div className="space-y-6">
                <PageHeader title={t("reports.monthlyTitle")}>
                    <div className="flex items-center gap-3">
                        <SelectInput
                            value={selectedMonth.toString()}
                            onChange={(value: string | number | null) =>
                                (window.location.href = `/reports/monthly?month=${value ?? ""}&year=${selectedYear}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`)
                            }
                            options={monthNames.map((name, i) => ({ value: (i + 1).toString(), label: name }))}
                            className="w-40"
                        />
                        <SelectInput
                            value={selectedYear.toString()}
                            onChange={(value: string | number | null) =>
                                (window.location.href = `/reports/monthly?month=${selectedMonth}&year=${value ?? ""}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`)
                            }
                            options={Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => ({
                                value: y.toString(),
                                label: y.toString(),
                            }))}
                            className="w-28"
                        />
                        <SelectInput
                            value={selectedClassId?.toString() ?? ""}
                            onChange={(value: string | number | null) =>
                                (window.location.href = `/reports/monthly?month=${selectedMonth}&year=${selectedYear}&class_id=${value ?? ""}`)
                            }
                            options={[
                                { value: "", label: t("reports.allClasses") },
                                ...classes.map((c) => ({ value: c.id.toString(), label: c.name })),
                            ]}
                            className="w-48"
                        />
                        <a
                            href={`/export/monthly-recap?month=${selectedMonth}&year=${selectedYear}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`}
                            className="h-10 inline-flex items-center gap-2 bg-primary text-white px-4 rounded-lg hover:bg-primary/90 text-[14px] font-semibold transition-colors shrink-0"
                        >
                            <FiDownload className="text-[14px]" />
                            {t("reports.export")}
                        </a>
                    </div>
                </PageHeader>

                {/* Monthly Trend Chart */}
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-text mb-4">{t("reports.monthlyTrend")}</h3>
                        <AttendanceChart data={monthlyStats.months} type="bar" height={300} />
                    </div>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        label={t("reports.totalPresent")}
                        value={monthlyStats.months.reduce((sum, m) => sum + m.present, 0).toLocaleString("id-ID")}
                        color="green"
                    />
                    <StatCard
                        label={t("reports.totalLate")}
                        value={monthlyStats.months.reduce((sum, m) => sum + m.late, 0).toLocaleString("id-ID")}
                        color="amber"
                    />
                    <StatCard
                        label={t("reports.totalAbsent")}
                        value={monthlyStats.months.reduce((sum, m) => sum + m.absent, 0).toLocaleString("id-ID")}
                        color="red"
                    />
                </div>

                {/* Monthly Breakdown Table */}
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-text mb-4">{t("reports.monthlyBreakdown")}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-text-inactive text-sm border-b border-border">
                                        <th className="pb-3 font-medium">{t("reports.month")}</th>
                                        <th className="pb-3 font-medium text-center">{t("reports.present")}</th>
                                        <th className="pb-3 font-medium text-center">{t("reports.late")}</th>
                                        <th className="pb-3 font-medium text-center">{t("reports.absent")}</th>
                                        <th className="pb-3 font-medium text-center">{t("reports.rate")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyStats.months.map((month) => {
                                        const total = month.present + month.late + month.absent;
                                        const rate =
                                            total > 0
                                                ? (((month.present + month.late) / total) * 100).toFixed(1)
                                                : "0.0";
                                        return (
                                            <tr
                                                key={month.label}
                                                className="border-b border-border/50 hover:bg-primary/5"
                                            >
                                                <td className="py-3 font-medium">{month.label}</td>
                                                <td className="py-3 text-center text-green-600">{month.present}</td>
                                                <td className="py-3 text-center text-amber-600">{month.late}</td>
                                                <td className="py-3 text-center text-red-600">{month.absent}</td>
                                                <td className="py-3 text-center font-medium">{rate}%</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>
            </div>
        </AppShell>
    );
}
