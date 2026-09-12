import { router } from "@inertiajs/react";
import { useState } from "react";
import {
    FiChevronRight,
    FiDownload,
    FiFileText,
    FiFilter,
    FiGrid,
    FiLoader,
    FiUsers,
} from "react-icons/fi";
import DatePicker from "@/Components/common/DatePicker";
import Drawer from "@/Components/common/Drawer";
import BottomSheet from "@/Components/common/BottomSheet";
import TabSwitcher from "@/Components/common/TabSwitcher";
import { useLanguage } from "@/Contexts/LanguageContext";
import AppShell from "@/Layouts/AppShell";
import type { DailyBreakdown, DailyStudent, MonthlyBreakdown, RecapStudent, Summary } from "@/types/Report";
import { formatIndonesianDate } from "@/utils/helpers";
import DailyTable from "./DailyTable";
import RecapTable from "./RecapTable";
import {
    Button,
    FilterPopover,
    FilterTriggerButton,
    HeaderIconButton,
    Input,
    NativeSelect,
    PageHeader,
    ReportExportMenu,
    ReportToolbar,
} from "@/Components";

interface PageProps {
    teacher: { id: number; name: string };
    class: { id: number; name: string } | null;
    tab: string;
    students: DailyStudent[] | RecapStudent[];
    summary?: Summary;
    dailyBreakdown?: DailyBreakdown[];
    monthlyBreakdown?: MonthlyBreakdown[];
    selectedDate?: string;
    selectedMonth?: number;
    selectedYear?: number;
    selectedSemester?: string;
    isHoliday?: boolean;
}

const MONTH_KEYS = [
    "month.january",
    "month.february",
    "month.march",
    "month.april",
    "month.may",
    "month.june",
    "month.july",
    "month.august",
    "month.september",
    "month.october",
    "month.november",
    "month.december",
];

export default function HomeroomReportIndex({
    teacher: _teacher,
    class: kelas,
    tab,
    students,
    summary,
    dailyBreakdown,
    monthlyBreakdown,
    selectedDate = "",
    selectedMonth = new Date().getMonth() + 1,
    selectedYear = new Date().getFullYear(),
    selectedSemester = "1",
    isHoliday = false,
}: PageProps) {
    const { t } = useLanguage();

    const [exportSheetOpen, setExportSheetOpen] = useState(false);
    const [exportingType, setExportingType] = useState<"pdf" | "excel" | null>(null);
    const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const TABS = [
        { key: "daily", label: t("reports.tabDaily") },
        { key: "monthly", label: t("reports.tabMonthly") },
        { key: "semester", label: t("reports.tabSemester") },
    ];

    const MONTH_NAMES = MONTH_KEYS.map((key) => t(key));

    const formatSubtitleDate = (dateStr: string) => {
        return formatIndonesianDate(dateStr);
    };

    const formatSubtitleMonth = (month: number, year: number) => {
        const d = new Date(year, month - 1, 1);
        return formatIndonesianDate(d, { month: "long", year: "numeric" });
    };

    const buildUrl = (newTab: string, params: Record<string, string | number | undefined | null> = {}) => {
        const queryParts = [`tab=${encodeURIComponent(newTab)}`];
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== "") {
                queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
            }
        }
        return `/reports?${queryParts.join("&")}`;
    };

    const buildExportUrl = (path: string, params: Record<string, string | number | undefined | null> = {}) => {
        const queryParts: string[] = [];
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== "") {
                queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
            }
        }
        return queryParts.length > 0 ? `${path}?${queryParts.join("&")}` : path;
    };

    const handleTabChange = (newTab: string) => {
        if (newTab === "daily")
            router.visit(buildUrl("daily", { date: selectedDate || new Date().toISOString().split("T")[0] }));
        else if (newTab === "monthly") router.visit(buildUrl("monthly", { month: selectedMonth, year: selectedYear }));
        else router.visit(buildUrl("semester", { semester: selectedSemester, year: selectedYear }));
    };

    const handleDateChange = (date: string) => {
        router.get(buildUrl("daily", { date }), {}, { preserveState: true });
    };

    const handleMonthChange = (month: string) => {
        router.get(buildUrl("monthly", { month, year: selectedYear }), {}, { preserveState: true });
    };

    const handleYearChange = (year: string) => {
        router.get(
            buildUrl(tab, { month: selectedMonth, year, semester: selectedSemester }),
            {},
            { preserveState: true },
        );
    };

    const handleSemesterChange = (semester: string) => {
        router.get(buildUrl("semester", { semester, year: selectedYear }), {}, { preserveState: true });
    };

    const handleExportPdf = () => {
        setExportingType("pdf");
        const classId = kelas?.id ?? "";
        if (tab === "daily")
            window.location.href = buildExportUrl("/export/daily-recap-pdf", { date: selectedDate, class_id: classId });
        else if (tab === "monthly")
            window.location.href = buildExportUrl("/export/monthly-recap-pdf", {
                month: selectedMonth,
                year: selectedYear,
                class_id: classId,
            });
        else
            window.location.href = buildExportUrl("/export/semester-recap-pdf", {
                semester: selectedSemester,
                year: selectedYear,
                class_id: classId,
            });
        setTimeout(() => setExportingType(null), 3000);
    };

    const handleExportExcel = () => {
        setExportingType("excel");
        const classId = kelas?.id ?? "";
        if (tab === "daily")
            window.location.href = buildExportUrl("/export/daily-recap", { date: selectedDate, class_id: classId });
        else if (tab === "monthly")
            window.location.href = buildExportUrl("/export/monthly-recap", {
                month: selectedMonth,
                year: selectedYear,
                class_id: classId,
            });
        else
            window.location.href = buildExportUrl("/export/semester-recap", {
                semester: selectedSemester,
                year: selectedYear,
                class_id: classId,
            });
        setTimeout(() => setExportingType(null), 3000);
    };

    if (!kelas) {
        return (
            <AppShell title={t("reports.title")}>
                <div className="bg-surface border border-border rounded-xl p-12 text-center">
                    <FiUsers className="text-[40px] text-text-muted mb-4 block" />
                    <p className="text-text-muted text-[14px]">{t("reports.notAssigned")}</p>
                </div>
            </AppShell>
        );
    }

    const mobileHeaderActions = (
        <div className="flex items-center gap-2 sm:hidden font-inter">
            <HeaderIconButton
                icon={<FiFilter className="text-[14px]" />}
                label={t("reports.filterTitle")}
                onClick={() => setIsMobileFilterOpen(true)}
            />
            <HeaderIconButton
                variant="accent"
                icon={<FiDownload className="text-[15px]" />}
                label={t("reports.export")}
                onClick={() => setExportSheetOpen(true)}
            />
        </div>
    );

    return (
        <AppShell
            title={t("reports.title")}
            hasTopTabs={true}
            hasTopCard={true}
            headerActions={mobileHeaderActions}
            showSearch={false}
            showNotificationBellOnMobile={false}
            mainClassName="sm:overflow-hidden"
        >
            {/* Page Header */}
                <PageHeader
                    title={t("reports.headerTitle", { class: kelas.name })}
                    description={t("reports.subtitle", { class: kelas.name })}
                    className="hidden lg:flex shrink-0 mb-4"
                />

                {/* Tablet & Desktop Tab + Filters + Corner Export Buttons */}
                <ReportToolbar>
                    <div className="min-w-0 overflow-x-auto no-scrollbar">
                        <TabSwitcher tabs={TABS} activeKey={tab} onChange={handleTabChange} iconOnly="lg" />
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 ml-auto">
                        <FilterPopover
                            open={isDesktopFilterOpen}
                            onClose={() => setIsDesktopFilterOpen(false)}
                            align="right"
                            trigger={
                                <FilterTriggerButton
                                    type="button"
                                    onClick={() => setIsDesktopFilterOpen((previous) => !previous)}
                                />
                            }
                        >
                            <div className="flex flex-col gap-3 font-inter">
                                <div className="border-b border-border pb-2">
                                    <h4 className="text-[13.5px] font-bold text-text-primary">Filter Laporan</h4>
                                </div>

                                {tab === "daily" && (
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-bold text-text-secondary">Tanggal Laporan</label>
                                        <DatePicker
                                            value={selectedDate}
                                            onChange={(value) => {
                                                handleDateChange(value);
                                                setIsDesktopFilterOpen(false);
                                            }}
                                            className="w-full"
                                        />
                                    </div>
                                )}

                                {tab === "monthly" && (
                                    <>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[12px] font-bold text-text-secondary">Bulan Laporan</label>
                                            <NativeSelect
                                                value={String(selectedMonth)}
                                                onChange={(event) => {
                                                    handleMonthChange(event.target.value);
                                                    setIsDesktopFilterOpen(false);
                                                }}
                                                aria-label={t("reports.monthLabel")}
                                                className="h-10 rounded-xl"
                                            >
                                                {MONTH_NAMES.map((name, index) => (
                                                    <option key={index + 1} value={index + 1}>
                                                        {name}
                                                    </option>
                                                ))}
                                            </NativeSelect>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[12px] font-bold text-text-secondary">Tahun Laporan</label>
                                            <NativeSelect
                                                value={String(selectedYear)}
                                                onChange={(event) => {
                                                    handleYearChange(event.target.value);
                                                    setIsDesktopFilterOpen(false);
                                                }}
                                                aria-label={t("reports.yearLabel")}
                                                className="h-10 rounded-xl"
                                            >
                                                {Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - index).map(
                                                    (year) => (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    ),
                                                )}
                                            </NativeSelect>
                                        </div>
                                    </>
                                )}

                                {tab === "semester" && (
                                    <>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[12px] font-bold text-text-secondary">Semester</label>
                                            <NativeSelect
                                                value={selectedSemester}
                                                onChange={(event) => {
                                                    handleSemesterChange(event.target.value);
                                                    setIsDesktopFilterOpen(false);
                                                }}
                                                aria-label={t("reports.semesterLabel")}
                                                className="h-10 rounded-xl"
                                            >
                                                <option value="1">{t("reports.odd")} (Jul-Des)</option>
                                                <option value="2">{t("reports.even")} (Jan-Jun)</option>
                                            </NativeSelect>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[12px] font-bold text-text-secondary">Tahun Laporan</label>
                                            <NativeSelect
                                                value={String(selectedYear)}
                                                onChange={(event) => {
                                                    handleYearChange(event.target.value);
                                                    setIsDesktopFilterOpen(false);
                                                }}
                                                aria-label={t("reports.yearLabel")}
                                                className="h-10 rounded-xl"
                                            >
                                                {Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - index).map(
                                                    (year) => (
                                                        <option key={year} value={year}>
                                                            TA {year}/{year + 1}
                                                        </option>
                                                    ),
                                                )}
                                            </NativeSelect>
                                        </div>
                                    </>
                                )}
                            </div>
                        </FilterPopover>

                        <ReportExportMenu onExportPdf={handleExportPdf} onExportExcel={handleExportExcel} />
                    </div>
                </ReportToolbar>

                {/* Mobile Tabs + Filter (Full Width, with Export Icon in Mobile Header) */}
                <div className="sm:hidden flex flex-col font-inter mb-3">
                    <TabSwitcher tabs={TABS} activeKey={tab} onChange={handleTabChange} fullWidth />
                </div>

                <BottomSheet
                    open={isMobileFilterOpen}
                    onClose={() => setIsMobileFilterOpen(false)}
                    title={t("reports.mobileFilterTitle")}
                    subtitle={t("reports.mobileFilterSubtitle")}
                >
                    <div className="flex flex-col gap-4 font-inter pb-2">
                        {tab === "daily" && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold text-text-secondary">
                                    {t("reports.attendanceDate")}
                                </label>
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(event) => handleDateChange(event.target.value)}
                                    inputClassName="h-10 text-[13px]"
                                />
                            </div>
                        )}

                        {tab === "monthly" && (
                            <>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-text-secondary">
                                        {t("reports.monthLabel")}
                                    </label>
                                    <NativeSelect
                                        value={String(selectedMonth)}
                                        onChange={(event) => {
                                            handleMonthChange(event.target.value);
                                            setIsMobileFilterOpen(false);
                                        }}
                                        aria-label={t("reports.monthLabel")}
                                    >
                                        {MONTH_NAMES.map((name, index) => (
                                            <option key={index + 1} value={index + 1}>
                                                {name}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-text-secondary">
                                        {t("reports.yearLabel")}
                                    </label>
                                    <NativeSelect
                                        value={String(selectedYear)}
                                        onChange={(event) => {
                                            handleYearChange(event.target.value);
                                            setIsMobileFilterOpen(false);
                                        }}
                                        aria-label={t("reports.yearLabel")}
                                    >
                                        {Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - index).map(
                                            (year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ),
                                        )}
                                    </NativeSelect>
                                </div>
                            </>
                        )}

                        {tab === "semester" && (
                            <>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-text-secondary">
                                        {t("reports.semesterLabel")}
                                    </label>
                                    <NativeSelect
                                        value={selectedSemester}
                                        onChange={(event) => {
                                            handleSemesterChange(event.target.value);
                                            setIsMobileFilterOpen(false);
                                        }}
                                        aria-label={t("reports.semesterLabel")}
                                    >
                                        <option value="1">{t("reports.odd")} (Jul-Des)</option>
                                        <option value="2">{t("reports.even")} (Jan-Jun)</option>
                                    </NativeSelect>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-text-secondary">
                                        {t("reports.yearLabel")}
                                    </label>
                                    <NativeSelect
                                        value={String(selectedYear)}
                                        onChange={(event) => {
                                            handleYearChange(event.target.value);
                                            setIsMobileFilterOpen(false);
                                        }}
                                        aria-label={t("reports.yearLabel")}
                                    >
                                        {Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - index).map(
                                            (year) => (
                                                <option key={year} value={year}>
                                                    TA {year}/{year + 1}
                                                </option>
                                            ),
                                        )}
                                    </NativeSelect>
                                </div>
                            </>
                        )}
                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                variant="primary"
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="flex-1 h-10 text-[13px] font-bold rounded-xl"
                            >
                                {t("reports.applyFilter")}
                            </Button>
                        </div>
                    </div>
                </BottomSheet>

                {/* Export Responsive Drawer (Bottom Sheet on Mobile, Slide Drawer on Tablet/Desktop) */}
                <Drawer
                    open={exportSheetOpen}
                    onClose={() => setExportSheetOpen(false)}
                    title={t("reports.exportOptions")}
                    description={
                        tab === "daily"
                            ? `${t("reports.rekapDaily")} • ${formatSubtitleDate(selectedDate)}`
                            : tab === "monthly"
                              ? `${t("reports.rekapMonthly")} • ${formatSubtitleMonth(selectedMonth, selectedYear)}`
                              : `${t("reports.rekapSemester")} • ${selectedSemester === "1" ? t("reports.odd") : t("reports.even")} ${selectedYear}/${selectedYear + 1}`
                    }
                    showFooter={false}
                    width="sm"
                >
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => {
                                handleExportPdf();
                                setExportSheetOpen(false);
                            }}
                            disabled={!!exportingType}
                            className="w-full flex items-center gap-3.5 p-4 rounded-2xl border border-border bg-surface hover:border-danger/40 hover:bg-danger/5 active:scale-[0.98] transition-all text-left group cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <div className="w-11 h-11 rounded-xl bg-danger/10 text-danger flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                                {exportingType === "pdf" ? (
                                    <FiLoader className="w-5 h-5 animate-spin" />
                                ) : (
                                    <FiFileText className="w-5 h-5" />
                                )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <span className="text-[14px] font-bold text-text-primary block leading-tight">PDF</span>
                                <span className="text-[12px] text-text-muted mt-0.5 block leading-normal">
                                    {exportingType === "pdf" ? t("reports.preparing") : t("reports.exportPdfDesc")}
                                </span>
                            </div>
                            {exportingType !== "pdf" && (
                                <FiChevronRight className="w-4 h-4 text-text-muted group-hover:text-danger group-hover:translate-x-0.5 transition-all shrink-0" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                handleExportExcel();
                                setExportSheetOpen(false);
                            }}
                            disabled={!!exportingType}
                            className="w-full flex items-center gap-3.5 p-4 rounded-2xl border border-border bg-surface hover:border-success/40 hover:bg-success/5 active:scale-[0.98] transition-all text-left group cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <div className="w-11 h-11 rounded-xl bg-success/10 text-success flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                                {exportingType === "excel" ? (
                                    <FiLoader className="w-5 h-5 animate-spin" />
                                ) : (
                                    <FiGrid className="w-5 h-5" />
                                )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <span className="text-[14px] font-bold text-text-primary block leading-tight">
                                    Excel
                                </span>
                                <span className="text-[12px] text-text-muted mt-0.5 block leading-normal">
                                    {exportingType === "excel" ? t("reports.preparing") : t("reports.exportExcelDesc")}
                                </span>
                            </div>
                            {exportingType !== "excel" && (
                                <FiChevronRight className="w-4 h-4 text-text-muted group-hover:text-success group-hover:translate-x-0.5 transition-all shrink-0" />
                            )}
                        </button>
                    </div>
                </Drawer>

                {/* Tab Content */}
                {tab === "daily" && (
                    <DailyTable students={students as DailyStudent[]} isHoliday={isHoliday} />
                )}

                {tab === "monthly" && (
                    <RecapTable
                        mode="monthly"
                        students={students as RecapStudent[]}
                        summary={summary}
                        chartData={dailyBreakdown}
                        month={selectedMonth}
                        year={selectedYear}
                    />
                )}

                {tab === "semester" && (
                    <RecapTable
                        mode="semester"
                        students={students as RecapStudent[]}
                        summary={summary}
                        chartData={monthlyBreakdown}
                        semester={selectedSemester}
                        year={selectedYear}
                    />
                )}
        </AppShell>
    );
}
