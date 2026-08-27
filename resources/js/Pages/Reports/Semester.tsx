import { Head } from "@inertiajs/react";
import { useLanguage } from "@/Contexts/LanguageContext";
import { PageHeader, Card, SelectInput, StatCard, AttendanceChart, Table } from "@/Components";
import type { Column } from "@/Components/ui/Table";
import AppShell from "@/Layouts/AppShell";
import { FiDownload } from "react-icons/fi";

interface SemesterReportProps {
    monthlyStats: { year: number; months: Array<{ label: string; present: number; late: number; absent: number }> };
    classes: Array<{ id: number; name: string }>;
    selectedYear: number;
    selectedSemester: number;
    semesterMonths: number[];
    selectedClassId: number | null;
}

export default function SemesterReport({
    monthlyStats,
    classes,
    selectedYear,
    selectedSemester,
    semesterMonths,
    selectedClassId,
}: SemesterReportProps) {
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

    const filteredMonths = monthlyStats.months.filter((m) => semesterMonths.includes(monthNames.indexOf(m.label) + 1));

    type MonthItem = SemesterReportProps["monthlyStats"]["months"][number];

    const monthColumns: Column<MonthItem>[] = [
        {
            key: "label",
            header: t("reports.month"),
            render: (month) => <span className="font-medium">{month.label}</span>,
        },
        {
            key: "present",
            header: t("reports.present"),
            className: "text-center",
            render: (month) => <span className="text-success font-semibold">{month.present}</span>,
        },
        {
            key: "late",
            header: t("reports.late"),
            className: "text-center",
            render: (month) => <span className="text-warning font-semibold">{month.late}</span>,
        },
        {
            key: "absent",
            header: t("reports.absent"),
            className: "text-center",
            render: (month) => <span className="text-danger font-semibold">{month.absent}</span>,
        },
        {
            key: "rate",
            header: t("reports.rate"),
            className: "text-center",
            render: (month) => {
                const total = month.present + month.late + month.absent;
                const rate =
                    total > 0
                        ? (((month.present + month.late) / total) * 100).toFixed(1)
                        : "0.0";
                return <span className="font-medium">{rate}%</span>;
            },
        },
    ];

    return (
        <AppShell title="Rekap Semester">
            <Head>
                <title>Rekap Semester - SMART Presensi</title>
            </Head>

            <div className="space-y-6">
                <PageHeader title={t("reports.semesterTitle")}>
                    <div className="flex items-center gap-3">
                        <SelectInput
                            value={selectedYear.toString()}
                            onChange={(value: string | number | null) =>
                                (window.location.href = `/reports/semester?year=${value ?? ""}&semester=${selectedSemester}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`)
                            }
                            options={Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => ({
                                value: y.toString(),
                                label: y.toString(),
                            }))}
                            className="w-28"
                        />
                        <SelectInput
                            value={selectedSemester.toString()}
                            onChange={(value: string | number | null) =>
                                (window.location.href = `/reports/semester?year=${selectedYear}&semester=${value ?? ""}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`)
                            }
                            options={[
                                { value: "1", label: t("reports.semester1") },
                                { value: "2", label: t("reports.semester2") },
                            ]}
                            className="w-40"
                        />
                        <SelectInput
                            value={selectedClassId?.toString() ?? ""}
                            onChange={(value: string | number | null) =>
                                (window.location.href = `/reports/semester?year=${selectedYear}&semester=${selectedSemester}&class_id=${value ?? ""}`)
                            }
                            options={[
                                { value: "", label: t("reports.allClasses") },
                                ...classes.map((c) => ({ value: c.id.toString(), label: c.name })),
                            ]}
                            className="w-48"
                        />
                        <a
                            href={`/export/monthly-recap?year=${selectedYear}&semester=${selectedSemester}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`}
                            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <FiDownload className="text-[14px]" />
                            {t("reports.export")}
                        </a>
                    </div>
                </PageHeader>

                {/* Semester Trend Chart */}
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-text mb-4">{t("reports.semesterTrend")}</h3>
                        <AttendanceChart data={filteredMonths} type="bar" height={300} />
                    </div>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        label={t("reports.totalPresent")}
                        value={filteredMonths.reduce((sum, m) => sum + m.present, 0).toLocaleString("id-ID")}
                        color="green"
                    />
                    <StatCard
                        label={t("reports.totalLate")}
                        value={filteredMonths.reduce((sum, m) => sum + m.late, 0).toLocaleString("id-ID")}
                        color="amber"
                    />
                    <StatCard
                        label={t("reports.totalAbsent")}
                        value={filteredMonths.reduce((sum, m) => sum + m.absent, 0).toLocaleString("id-ID")}
                        color="red"
                    />
                </div>

                {/* Semester Breakdown Table */}
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-text mb-4">{t("reports.semesterBreakdown")}</h3>
                        <Table
                            columns={monthColumns}
                            data={filteredMonths}
                            keyExtractor={(m) => m.label}
                            emptyMessage="Tidak ada data."
                        />
                    </div>
                </Card>
            </div>
        </AppShell>
    );
}
