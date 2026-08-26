import { useState } from "react";
import { router, Head } from "@inertiajs/react";
import { useLanguage } from "@/Contexts/LanguageContext";
import { PageHeader, Card, SelectInput, Pagination, SearchBar, Table, Input } from "@/Components";
import ExportButtonGroup from "@/Components/features/ExportButtonGroup";
import type { Column } from "@/Components/ui/Table";
import AppShell from "@/Layouts/AppShell";

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

    type StudentDetail = NonNullable<DailyReportProps["classDetail"]>["students"][0];
    const studentColumns: Column<StudentDetail>[] = [
        { key: "nis", header: t("reports.nis"), className: "text-text-inactive whitespace-nowrap" },
        { key: "name", header: t("reports.name"), className: "font-medium" },
        {
            key: "status",
            header: <div className="text-center w-full">{t("reports.status")}</div>,
            render: (s) => (
                <div className="flex justify-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>
                        {s.status}
                    </span>
                </div>
            ),
            className: "whitespace-nowrap",
        },
        {
            key: "check_in_time",
            header: <div className="text-center w-full">{t("reports.checkInTime")}</div>,
            render: (s) => (
                <div className="text-center text-text-inactive">
                    {s.check_in_time ? s.check_in_time.slice(0, 5) : "-"}
                </div>
            ),
            className: "whitespace-nowrap",
        },
    ];

    type ClassSummary = DailyReportProps["overview"]["classes"][0];
    const classColumns: Column<ClassSummary>[] = [
        { key: "name", header: t("reports.class"), className: "font-medium whitespace-nowrap" },
        { key: "total", header: <div className="text-center w-full">{t("reports.total")}</div>, render: (c) => <div className="text-center text-text-inactive">{c.total}</div> },
        { key: "present", header: <div className="text-center w-full">{t("reports.present")}</div>, render: (c) => <div className="text-center text-success">{c.present}</div> },
        { key: "late", header: <div className="text-center w-full">{t("reports.late")}</div>, render: (c) => <div className="text-center text-warning">{c.late}</div> },
        { key: "sickPermission", header: <div className="text-center w-full">{t("reports.sickPermission")}</div>, render: () => <div className="text-center text-primary">0</div> },
        { key: "absent", header: <div className="text-center w-full">{t("reports.absent")}</div>, render: (c) => <div className="text-center text-danger">{c.total - c.present - c.late}</div> },
        {
            key: "rate",
            header: <div className="text-center w-full">{t("reports.rate")}</div>,
            render: (c) => {
                const rate = c.total > 0 ? (((c.present + c.late) / c.total) * 100).toFixed(1) : "0.0";
                return <div className="text-center font-medium">{rate}%</div>;
            }
        },
    ];

    return (
        <AppShell>
            <Head title={t("reports.dailyTitle")} />
            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <PageHeader 
                    title={t("reports.dailyTitle")}
                    description="Rekapitulasi kehadiran siswa berdasarkan periode dan kategori kelas."
                />

                {/* Main Card */}
                <Card className="overflow-hidden">
                    {/* Filters & Export Toolbar */}
                    <div className="bg-surface p-5 sm:p-6 border-b border-border flex flex-col sm:flex-row justify-end items-center gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                            {/* Date Picker */}
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    router.get(`/reports/daily?date=${e.target.value}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`, {}, { preserveState: true })
                                }
                                inputClassName="h-10 w-full sm:w-[150px]"
                            />
                            
                            {/* Class Selector */}
                            <SelectInput
                                value={selectedClassId || ""}
                                onChange={(v) => {
                                    const val = v ? Number(v) : null;
                                    const classQuery = val ? `&class_id=${val}` : "";
                                    router.get(`/reports/daily?date=${selectedDate}${classQuery}`, {}, { preserveState: true });
                                }}
                                options={[
                                    { value: "", label: t("reports.allClasses") },
                                    ...classes.map((c) => ({
                                        value: c.id,
                                        label: c.name,
                                    })),
                                ]}
                                className="h-10 w-full sm:w-[240px] text-[13px] font-medium text-primary border-border/80"
                            />

                            {/* Export Buttons */}
                            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                <ExportButtonGroup
                                    onExportExcel={() => window.open(`/export/daily-recap?date=${selectedDate}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`, "_blank")}
                                    onExportPdf={() => window.open(`/export/daily-recap-pdf?date=${selectedDate}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`, "_blank")}
                                />
                            </div>
                        </div>
                    </div>



                {classDetail ? (
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-primary">
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
                        <div>
                            <Table
                                columns={studentColumns}
                                data={paginatedStudents}
                                keyExtractor={(s) => s.id}
                                emptyMessage="Tidak ada data siswa."
                                bare
                            />
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
                ) : (
                    <div className="p-4 sm:p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-primary">
                                {t("reports.allClassesSummary")}
                            </h3>
                            <span className="text-sm text-text-inactive">
                                Menampilkan rekapitulasi data dari {overview.classes.length} kelas
                            </span>
                        </div>
                        <div className="overflow-x-auto -mx-4 sm:-mx-6">
                            <Table
                                columns={classColumns}
                                data={overview.classes}
                                keyExtractor={(c) => c.id}
                                emptyMessage="Tidak ada data kelas."
                                bare
                            />
                        </div>
                        
                        {/* Notes at the bottom as per Figma */}
                        <div className="px-4 sm:px-6 py-4 mt-2 sm:mt-4 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 border-t border-border bg-slate-50/50 flex flex-col sm:flex-row sm:items-center gap-2 text-text-muted text-[12px]">
                            <i className="fas fa-info-circle hidden sm:block"></i>
                            Tampilan kolom menyesuaikan secara otomatis berdasarkan filter periode yang dipilih.
                        </div>
                    </div>
                )}
                </Card>
            </div>
        </AppShell>
    );
}
