import { useState } from "react";
import { router, Head } from "@inertiajs/react";
import { useLanguage } from "@/Contexts/LanguageContext";
import { PageHeader, Card, SelectInput, Pagination, MobileNativePagination, SearchBar, Table, TableFooter, Input, BottomSheet, Button } from "@/Components";
import ExportButtonGroup from "@/Components/features/ExportButtonGroup";
import { FiInfo, FiFilter } from "react-icons/fi";
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
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const pageSize = 10;

    const hasActiveFilters = Boolean(selectedClassId);

    const mobileHeaderActions = (
        <div className="flex items-center gap-2 sm:hidden font-inter">
            <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                    hasActiveFilters
                        ? "bg-primary text-white"
                        : "bg-muted/60 text-text-primary hover:bg-muted"
                }`}
                title="Filter Rekap Harian"
                aria-label="Filter Rekap Harian"
            >
                <FiFilter className="text-[14px]" />
            </button>
        </div>
    );

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
        <AppShell title={t("reports.dailyTitle")} headerActions={mobileHeaderActions}>
            <Head title={t("reports.dailyTitle")} />
            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <PageHeader 
                    title={t("reports.dailyTitle")}
                    description="Rekapitulasi kehadiran siswa berdasarkan periode dan kategori kelas."
                    className="hidden lg:flex shrink-0 mb-4"
                />

                {/* Filters & Export Toolbar Card */}
                <Card className="p-4 sm:p-5 mb-4 font-inter">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
                        {/* Left (Pojok Kiri): Filters (hidden on mobile, sm:flex on tablet/desktop) */}
                        <div className="hidden sm:flex flex-row items-center gap-3 w-auto">
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    router.get(`/reports/daily?date=${e.target.value}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`, {}, { preserveState: true })
                                }
                                inputClassName="h-10 w-[150px]"
                            />
                            
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
                                className="h-10 w-[220px] text-[13px] font-medium border-border/80"
                            />
                        </div>

                        {/* Right (Pojok Kanan): Export Actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 sm:ml-auto justify-end">
                            <ExportButtonGroup
                                onExportExcel={() => window.open(`/export/daily-recap?date=${selectedDate}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`, "_blank")}
                                onExportPdf={() => window.open(`/export/daily-recap-pdf?date=${selectedDate}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`, "_blank")}
                            />
                        </div>
                    </div>
                </Card>

                {classDetail ? (
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
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
                        {/* Mobile Card Stack (< sm) */}
                        <div className="sm:hidden space-y-3">
                            {paginatedStudents.length === 0 ? (
                                <div className="p-6 text-center text-text-muted bg-surface border border-border rounded-xl">
                                    Tidak ada data siswa.
                                </div>
                            ) : (
                                paginatedStudents.map((s) => (
                                    <div key={s.id} className="bg-surface border border-border rounded-xl p-4 shadow-card space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h4 className="text-[14px] font-bold text-text-primary truncate">{s.name}</h4>
                                                <p className="text-[11px] text-text-muted">NIS: {s.nis}</p>
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>
                                                {s.status}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-text-secondary pt-2 border-t border-border flex justify-between">
                                            <span>Jam Masuk</span>
                                            <span className="font-semibold text-text-primary">{s.check_in_time ? s.check_in_time.slice(0, 5) : "-"}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                            {filteredStudents.length > pageSize && (
                                <div className="pt-2 font-inter">
                                    <MobileNativePagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        totalItems={filteredStudents.length}
                                        perPage={pageSize}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Tablet & Desktop View (>= sm) */}
                        <div className="hidden sm:block">
                            <Table
                                columns={studentColumns}
                                data={paginatedStudents}
                                keyExtractor={(s) => s.id}
                                emptyMessage="Tidak ada data siswa."
                            />
                            <TableFooter
                                info={
                                    filteredStudents.length > 0 ? (
                                        <span>
                                            Menampilkan <strong className="text-text-primary">{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredStudents.length)}</strong> dari total <strong className="text-text-primary">{filteredStudents.length}</strong> siswa.
                                        </span>
                                    ) : undefined
                                }
                                pagination={
                                    filteredStudents.length > pageSize ? (
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            totalItems={filteredStudents.length}
                                            onPageChange={setCurrentPage}
                                        />
                                    ) : undefined
                                }
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="mb-1">
                            <h3 className="text-lg font-bold text-primary">
                                {t("reports.allClassesSummary")}
                            </h3>
                            <span className="text-sm text-text-inactive">
                                Menampilkan rekapitulasi data dari {overview.classes.length} kelas
                            </span>
                        </div>
                        <Table
                            columns={classColumns}
                            data={overview.classes}
                            keyExtractor={(c) => c.id}
                            emptyMessage="Tidak ada data kelas."
                        />
                        <TableFooter
                            info="Tampilan kolom menyesuaikan secara otomatis berdasarkan data yang ditampilkan."
                        />
                    </div>
                )}
            </div>

            {/* 📱 MOBILE FILTER BOTTOM SHEET */}
            <BottomSheet
                open={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                title="Filter Rekap Harian"
                subtitle="Atur tanggal dan kelas rekapitulasi presensi"
            >
                <div className="flex flex-col gap-4 font-inter pb-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-text-secondary">
                            Tanggal Absensi
                        </label>
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                router.get(`/reports/daily?date=${e.target.value}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`, {}, { preserveState: true })
                            }
                            inputClassName="h-10 text-[13px]"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-text-secondary">
                            Pilih Kelas
                        </label>
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
                            className="h-10 text-[13px]"
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        {hasActiveFilters && (
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    router.get(`/reports/daily?date=${selectedDate}`, {}, { preserveState: true })
                                }
                                className="flex-1 h-10 text-[13px] font-bold rounded-xl"
                            >
                                Reset Filter
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            onClick={() => setIsMobileFilterOpen(false)}
                            className="flex-1 h-10 text-[13px] font-bold rounded-xl"
                        >
                            Terapkan
                        </Button>
                    </div>
                </div>
            </BottomSheet>
        </AppShell>
    );
}


