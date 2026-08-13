import { Head } from "@inertiajs/react";
import { useLanguage } from "@/Contexts/LanguageContext";
import { PageHeader, Card, SelectInput, StatCard } from "@/Components";
import AppShell from "@/Layouts/AppShell";
import { FiDownload } from "react-icons/fi";

interface DailyReportProps {
    overview: {
        date: string;
        total_students: number;
        verified_present: number;
        present: number;
        late: number;
        sick_permission: number;
        absent: number;
        classes: Array<{
            id: number;
            name: string;
            total: number;
            present: number;
            late: number;
        }>;
    };
    classDetail: {
        class: { id: number; name: string };
        date: string;
        students: Array<{
            id: number;
            name: string;
            nis: string;
            status: string;
            check_in_time: string | null;
        }>;
    } | null;
    classes: Array<{ id: number; name: string }>;
    selectedDate: string;
    selectedClassId: number | null;
}

export default function DailyReport({
    overview,
    classDetail,
    classes,
    selectedDate,
    selectedClassId,
}: DailyReportProps) {
    const { t } = useLanguage();

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Present":
                return "text-green-600 bg-green-50";
            case "Late":
                return "text-amber-600 bg-amber-50";
            case "Sick":
                return "text-blue-600 bg-blue-50";
            case "Permission":
                return "text-purple-600 bg-purple-50";
            default:
                return "text-red-600 bg-red-50";
        }
    };

    return (
        <AppShell title="Rekap Harian">
            <Head>
                <title>Rekap Harian - SMART Presensi</title>
            </Head>

            <div className="space-y-6">
                <PageHeader title={t("reports.dailyTitle")}>
                    <div className="flex items-center gap-3">
                        <SelectInput
                            value={selectedClassId?.toString() ?? ""}
                            onChange={(value: string | number | null) =>
                                (window.location.href = `/reports/daily?date=${selectedDate}&class_id=${value ?? ""}`)
                            }
                            options={[
                                { value: "", label: t("reports.allClasses") },
                                ...classes.map((c) => ({ value: c.id.toString(), label: c.name })),
                            ]}
                            className="w-48"
                        />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                (window.location.href = `/reports/daily?date=${e.target.value}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`)
                            }
                            className="bg-surface border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <a
                            href={`/export/daily-recap?date=${selectedDate}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`}
                            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <FiDownload className="text-[14px]" />
                            {t("reports.export")}
                        </a>
                    </div>
                </PageHeader>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    <StatCard
                        label={t("reports.totalStudents")}
                        value={overview.total_students.toLocaleString("id-ID")}
                        color="blue"
                    />
                    <StatCard
                        label={t("reports.present")}
                        value={overview.present.toLocaleString("id-ID")}
                        color="green"
                    />
                    <StatCard label={t("reports.late")} value={overview.late.toLocaleString("id-ID")} color="amber" />
                    <StatCard label={t("reports.absent")} value={overview.absent.toLocaleString("id-ID")} color="red" />
                </div>

                {classDetail && (
                    <Card>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-text">
                                    {t("reports.classDetail").replace("{class}", classDetail.class.name)}
                                </h3>
                                <span className="text-sm text-text-inactive">
                                    {t("reports.totalStudents").replace(
                                        "{count}",
                                        classDetail.students.length.toString(),
                                    )}
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-text-inactive text-sm border-b border-border">
                                            <th className="pb-3 font-medium">{t("reports.nis")}</th>
                                            <th className="pb-3 font-medium">{t("reports.name")}</th>
                                            <th className="pb-3 font-medium text-center">{t("reports.status")}</th>
                                            <th className="pb-3 font-medium text-center">{t("reports.checkInTime")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classDetail.students.map((student) => (
                                            <tr
                                                key={student.id}
                                                className="border-b border-border/50 hover:bg-primary/5"
                                            >
                                                <td className="py-3 text-text-inactive">{student.nis}</td>
                                                <td className="py-3 font-medium">{student.name}</td>
                                                <td className="py-3 text-center">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}
                                                    >
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-center text-text-inactive">
                                                    {student.check_in_time ? student.check_in_time.slice(0, 5) : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Card>
                )}

                {/* All Classes Summary */}
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-text mb-4">{t("reports.allClassesSummary")}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-text-inactive text-sm border-b border-border">
                                        <th className="pb-3 font-medium">{t("reports.class")}</th>
                                        <th className="pb-3 font-medium text-center">{t("reports.total")}</th>
                                        <th className="pb-3 font-medium text-center">{t("reports.present")}</th>
                                        <th className="pb-3 font-medium text-center">{t("reports.late")}</th>
                                        <th className="pb-3 font-medium text-center">{t("reports.sickPermission")}</th>
                                        <th className="pb-3 font-medium text-center">{t("reports.absent")}</th>
                                        <th className="pb-3 font-medium text-center">{t("reports.rate")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overview.classes.map((cls) => {
                                        const rate =
                                            cls.total > 0
                                                ? (((cls.present + cls.late) / cls.total) * 100).toFixed(1)
                                                : "0.0";
                                        return (
                                            <tr key={cls.id} className="border-b border-border/50 hover:bg-primary/5">
                                                <td className="py-3 font-medium">{cls.name}</td>
                                                <td className="py-3 text-center text-text-inactive">{cls.total}</td>
                                                <td className="py-3 text-center text-green-600">{cls.present}</td>
                                                <td className="py-3 text-center text-amber-600">{cls.late}</td>
                                                <td className="py-3 text-center text-blue-600">0</td>
                                                <td className="py-3 text-center text-red-600">
                                                    {cls.total - cls.present - cls.late}
                                                </td>
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
