import { Head, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { FiFilter } from "react-icons/fi";
import {
    AttendanceChart,
    BottomSheet,
    Button,
    Card,
    ExportButtonGroup,
    HeaderIconButton,
    PageHeader,
    SelectInput,
    StatCard,
    Table,
} from "@/Components";
import { useLanguage } from "@/Contexts/LanguageContext";
import AppShell from "@/Layouts/AppShell";
import { INDONESIAN_MONTHS } from "@/utils/helpers";
import { getRecapColumns } from "./reportColumns";

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

    const monthNames = INDONESIAN_MONTHS;

    const filteredMonths = monthlyStats.months.filter((m) =>
        semesterMonths.includes((monthNames as readonly string[]).indexOf(m.label) + 1),
    );

    const columns = useMemo(() => getRecapColumns(t), [t]);

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const hasActiveFilters = Boolean(selectedClassId);

    const mobileHeaderActions = (
        <div className="flex items-center gap-2 sm:hidden font-inter">
            <HeaderIconButton
                icon={<FiFilter className="text-[14px]" />}
                active={hasActiveFilters}
                label="Filter Rekap Semester"
                onClick={() => setIsMobileFilterOpen(true)}
            />
        </div>
    );

    return (
        <AppShell title="Rekap Semester" headerActions={mobileHeaderActions}>
            <Head>
                <title>Rekap Semester - SMART Presensi</title>
            </Head>

            <div className="space-y-6 font-inter">
                <PageHeader title={t("reports.semesterTitle")} className="hidden lg:flex shrink-0 mb-4">
                    <div className="flex items-center gap-3">
                        <SelectInput
                            value={selectedYear.toString()}
                            onChange={(value: string | number | null) =>
                                router.get(
                                    "/reports/semester",
                                    { year: value, semester: selectedSemester, class_id: selectedClassId || undefined },
                                    { preserveState: true },
                                )
                            }
                            options={Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => ({
                                value: y.toString(),
                                label: `TA ${y}/${y + 1}`,
                            }))}
                            className="w-32"
                        />
                        <SelectInput
                            value={selectedSemester.toString()}
                            onChange={(value: string | number | null) =>
                                router.get(
                                    "/reports/semester",
                                    { year: selectedYear, semester: value, class_id: selectedClassId || undefined },
                                    { preserveState: true },
                                )
                            }
                            options={[
                                { value: "1", label: `${t("reports.semester1")} (Jul-Des)` },
                                { value: "2", label: `${t("reports.semester2")} (Jan-Jun)` },
                            ]}
                            className="w-48"
                        />
                        <SelectInput
                            value={selectedClassId?.toString() ?? ""}
                            onChange={(value: string | number | null) =>
                                router.get(
                                    "/reports/semester",
                                    { year: selectedYear, semester: selectedSemester, class_id: value || undefined },
                                    { preserveState: true },
                                )
                            }
                            options={[
                                { value: "", label: t("reports.allClasses") },
                                ...classes.map((c) => ({ value: c.id.toString(), label: c.name })),
                            ]}
                            className="w-48"
                        />
                        <ExportButtonGroup
                            onExportExcel={() =>
                                window.open(
                                    `/export/monthly-recap?year=${selectedYear}&semester=${selectedSemester}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`,
                                    "_blank",
                                )
                            }
                        />
                    </div>
                </PageHeader>

                {/* Mobile & Tablet Toolbar Card (< lg) */}
                <Card className="p-4 lg:hidden mb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full">
                        {/* Left: Year, Semester, Class filters (hidden on mobile, sm:flex on tablet) */}
                        <div className="hidden sm:flex flex-nowrap items-center gap-2.5 w-auto">
                            <div className="w-32">
                                <SelectInput
                                    value={selectedYear.toString()}
                                    onChange={(value: string | number | null) =>
                                        router.get(
                                            "/reports/semester",
                                            {
                                                year: value,
                                                semester: selectedSemester,
                                                class_id: selectedClassId || undefined,
                                            },
                                            { preserveState: true },
                                        )
                                    }
                                    options={Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
                                        (y) => ({
                                            value: y.toString(),
                                            label: `TA ${y}/${y + 1}`,
                                        }),
                                    )}
                                    className="w-full h-10 text-[13px]"
                                />
                            </div>
                            <div className="w-44">
                                <SelectInput
                                    value={selectedSemester.toString()}
                                    onChange={(value: string | number | null) =>
                                        router.get(
                                            "/reports/semester",
                                            {
                                                year: selectedYear,
                                                semester: value,
                                                class_id: selectedClassId || undefined,
                                            },
                                            { preserveState: true },
                                        )
                                    }
                                    options={[
                                        { value: "1", label: `${t("reports.semester1")} (Jul-Des)` },
                                        { value: "2", label: `${t("reports.semester2")} (Jan-Jun)` },
                                    ]}
                                    className="w-full h-10 text-[13px]"
                                />
                            </div>
                            <div className="w-44">
                                <SelectInput
                                    value={selectedClassId?.toString() ?? ""}
                                    onChange={(value: string | number | null) =>
                                        router.get(
                                            "/reports/semester",
                                            {
                                                year: selectedYear,
                                                semester: selectedSemester,
                                                class_id: value || undefined,
                                            },
                                            { preserveState: true },
                                        )
                                    }
                                    options={[
                                        { value: "", label: t("reports.allClasses") },
                                        ...classes.map((c) => ({ value: c.id.toString(), label: c.name })),
                                    ]}
                                    className="w-full h-10 text-[13px]"
                                />
                            </div>
                        </div>

                        {/* Right: Export button */}
                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 sm:ml-auto justify-end">
                            <ExportButtonGroup
                                onExportExcel={() =>
                                    window.open(
                                        `/export/monthly-recap?year=${selectedYear}&semester=${selectedSemester}${selectedClassId ? `&class_id=${selectedClassId}` : ""}`,
                                        "_blank",
                                    )
                                }
                            />
                        </div>
                    </div>
                </Card>

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
                            columns={columns}
                            data={filteredMonths}
                            keyExtractor={(m) => m.label}
                            emptyMessage="Tidak ada data."
                        />
                    </div>
                </Card>
            </div>

            {/* 📱 MOBILE FILTER BOTTOM SHEET */}
            <BottomSheet
                open={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                title="Filter Rekap Semester"
                subtitle="Atur tahun ajaran, semester, dan kelas"
            >
                <div className="flex flex-col gap-4 font-inter pb-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-text-secondary">Tahun Ajaran</label>
                        <SelectInput
                            value={selectedYear.toString()}
                            onChange={(value: string | number | null) =>
                                router.get(
                                    "/reports/semester",
                                    { year: value, semester: selectedSemester, class_id: selectedClassId || undefined },
                                    { preserveState: true },
                                )
                            }
                            options={Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => ({
                                value: y.toString(),
                                label: `TA ${y}/${y + 1}`,
                            }))}
                            className="h-10 text-[13px]"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-text-secondary">Semester</label>
                        <SelectInput
                            value={selectedSemester.toString()}
                            onChange={(value: string | number | null) =>
                                router.get(
                                    "/reports/semester",
                                    { year: selectedYear, semester: value, class_id: selectedClassId || undefined },
                                    { preserveState: true },
                                )
                            }
                            options={[
                                { value: "1", label: `${t("reports.semester1")} (Jul-Des)` },
                                { value: "2", label: `${t("reports.semester2")} (Jan-Jun)` },
                            ]}
                            className="h-10 text-[13px]"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-text-secondary">Pilih Kelas</label>
                        <SelectInput
                            value={selectedClassId?.toString() ?? ""}
                            onChange={(value: string | number | null) =>
                                router.get(
                                    "/reports/semester",
                                    { year: selectedYear, semester: selectedSemester, class_id: value || undefined },
                                    { preserveState: true },
                                )
                            }
                            options={[
                                { value: "", label: t("reports.allClasses") },
                                ...classes.map((c) => ({ value: c.id.toString(), label: c.name })),
                            ]}
                            className="h-10 text-[13px]"
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        {hasActiveFilters && (
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    router.get(
                                        "/reports/semester",
                                        { year: selectedYear, semester: selectedSemester },
                                        { preserveState: true },
                                    )
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
