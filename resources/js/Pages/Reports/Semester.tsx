import { Head, router } from "@inertiajs/react";
import { useLanguage } from "@/Contexts/LanguageContext";
import { PageHeader, Card, SelectInput, StatCard, AttendanceChart, Table, ExportButtonGroup } from "@/Components";
import type { Column } from "@/Components/ui/Table";
import AppShell from "@/Layouts/AppShell";

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

const columns: Column<{ label: string; present: number; late: number; absent: number }>[] = [
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
                                router.get("/reports/semester", { year: value, semester: selectedSemester, class_id: selectedClassId || undefined }, { preserveState: true })
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
                                router.get("/reports/semester", { year: selectedYear, semester: value, class_id: selectedClassId || undefined }, { preserveState: true })
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
                                router.get("/reports/semester", { year: selectedYear, semester: selectedSemester, class_id: value || undefined }, { preserveState: true })
                            }
                            options={[
                                { value: "", label: t("reports.allClasses") },
                                ...classes.map((c) => ({ value: c.id.toString(), label: c.name })),
                            ]}
                            className="w-48"
                        />
                        <ExportButtonGroup
                            onExportExcel={() => window.open(`/export/monthly-recap?year=${selectedYear}&semester=${selectedSemester}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`, "_blank")}
                        />
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
                        <Table columns={columns} data={filteredMonths} keyExtractor={(m) => m.label} emptyMessage="Tidak ada data." />
                    </div>
                </Card>
            </div>
        </AppShell>
    );
}

