import { useState } from "react";
import { Head } from "@inertiajs/react";
import { useLanguage } from "@/Contexts/LanguageContext";
import { PageHeader, Card, SelectInput, StatCard, Pagination, SearchBar } from "@/Components";
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
    const [studentSearch, setStudentSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const rawStudents = classDetail?.students ?? [];
    const filteredStudents = rawStudents.filter(
        (s) =>
            s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
            s.nis.includes(studentSearch) ||
            s.status.toLowerCase().includes(studentSearch.toLowerCase()),
    );

    const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
    const start = (currentPage - 1) * pageSize;
    const paginatedStudents = filteredStudents.slice(start, start + pageSize);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Present":
                return "text-success bg-success-bg";
            case "Late":
                return "text-warning bg-warning-bg";
            case "Sick":
                return "text-primary bg-primary-light";
            case "Permission":
                return "text-accent bg-accent/10";
            default:
                return "text-danger bg-danger-bg";
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
                            className="h-10 bg-surface border border-border rounded-lg px-3.5 text-[14px] text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <a
                            href={`/export/daily-recap?date=${selectedDate}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`}
                            className="h-10 inline-flex items-center gap-2 bg-primary text-white px-4 rounded-lg hover:bg-primary/90 text-[14px] font-semibold transition-colors"
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
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-text">
                                        {t("reports.classDetail").replace("{class}", classDetail.class.name)}
                                    </h3>
                                    <span className="text-sm text-text-inactive">
                                        {t("reports.totalStudents").replace(
                                            "{count}",
                                            classDetail.students.length.toString(),
                                        )} (10 anak per halaman)
                                    </span>
                                </div>
                                <div className="w-full sm:w-72">
                                    <SearchBar
                                        value={studentSearch}
                                        onChange={(v) => {
                                            setStudentSearch(v);
                                            setCurrentPage(1);
                                        }}
                                        onSearch={() => {}}
                                        placeholder="Cari siswa di kelas..."
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-text-inactive text-sm border-b border-border">
                                            <th className="pb-3 font-medium whitespace-nowrap">{t("reports.nis")}</th>
                                            <th className="pb-3 font-medium">{t("reports.name")}</th>
                                            <th className="pb-3 font-medium text-center whitespace-nowrap">{t("reports.status")}</th>
                                            <th className="pb-3 font-medium text-center whitespace-nowrap">{t("reports.checkInTime")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedStudents.map((student) => (
                                            <tr
                                                key={student.id}
                                                className="border-b border-border/50 hover:bg-primary/5"
                                            >
                                                <td className="py-3 text-text-inactive whitespace-nowrap">{student.nis}</td>
                                                <td className="py-3 font-medium">{student.name}</td>
                                                <td className="py-3 text-center whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}
                                                    >
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-center text-text-inactive whitespace-nowrap">
                                                    {student.check_in_time ? student.check_in_time.slice(0, 5) : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredStudents.length > pageSize && (
                                <div className="mt-4 pt-3 border-t border-border">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        totalItems={filteredStudents.length}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
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
                                                <td className="py-3 text-center text-success font-semibold">{cls.present}</td>
                                                <td className="py-3 text-center text-warning font-semibold">{cls.late}</td>
                                                <td className="py-3 text-center text-primary font-semibold">0</td>
                                                <td className="py-3 text-center text-danger font-semibold">
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
