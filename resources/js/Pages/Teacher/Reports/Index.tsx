import { router } from "@inertiajs/react";
import { useState } from "react";
import AppShell from "@/Layouts/AppShell";
import TabSwitcher from "@/Components/common/TabSwitcher";
import DatePicker from "@/Components/common/DatePicker";
import Drawer from "@/Components/common/Drawer";
import DailyTable from "./DailyTable";
import MonthlyTable from "./MonthlyTable";
import SemesterTable from "./SemesterTable";
import { useLanguage } from "@/Contexts/LanguageContext";
import { FiAlertCircle, FiFileText, FiGrid, FiCalendar, FiUsers, FiChevronRight, FiLoader } from "react-icons/fi";
import type { DailyStudent, RecapStudent, Summary, DailyBreakdown, MonthlyBreakdown } from "@/types/Report";

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
    "month.january", "month.february", "month.march", "month.april",
    "month.may", "month.june", "month.july", "month.august",
    "month.september", "month.october", "month.november", "month.december",
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

    const TABS = [
        { key: "daily", label: t("reports.tabDaily") },
        { key: "monthly", label: t("reports.tabMonthly") },
        { key: "semester", label: t("reports.tabSemester") },
    ];

    const MONTH_NAMES = MONTH_KEYS.map((key) => t(key));

    const formatSubtitleDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    };

    const formatSubtitleMonth = (month: number, year: number) => {
        const d = new Date(year, month - 1, 1);
        return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
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
        if (newTab === "daily") router.visit(buildUrl("daily", { date: selectedDate || new Date().toISOString().split("T")[0] }));
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
        router.get(buildUrl(tab, { month: selectedMonth, year, semester: selectedSemester }), {}, { preserveState: true });
    };

    const handleSemesterChange = (semester: string) => {
        router.get(buildUrl("semester", { semester, year: selectedYear }), {}, { preserveState: true });
    };

    const handleExportPdf = () => {
        setExportingType("pdf");
        const classId = kelas?.id ?? "";
        if (tab === "daily") window.location.href = buildExportUrl("/export/daily-recap-pdf", { date: selectedDate, class_id: classId });
        else if (tab === "monthly") window.location.href = buildExportUrl("/export/monthly-recap-pdf", { month: selectedMonth, year: selectedYear, class_id: classId });
        else window.location.href = buildExportUrl("/export/semester-recap-pdf", { semester: selectedSemester, year: selectedYear, class_id: classId });
        setTimeout(() => setExportingType(null), 3000);
    };

    const handleExportExcel = () => {
        setExportingType("excel");
        const classId = kelas?.id ?? "";
        if (tab === "daily") window.location.href = buildExportUrl("/export/daily-recap", { date: selectedDate, class_id: classId });
        else if (tab === "monthly") window.location.href = buildExportUrl("/export/monthly-recap", { month: selectedMonth, year: selectedYear, class_id: classId });
        else window.location.href = buildExportUrl("/export/semester-recap", { semester: selectedSemester, year: selectedYear, class_id: classId });
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

    const exportHeaderAction = (
        <button
            type="button"
            onClick={() => setExportSheetOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer sm:hidden"
            title={t("reports.export")}
            aria-label={t("reports.export")}
        >
            <i className="fas fa-download text-[14px]" />
        </button>
    );

    return (
        <AppShell title={t("reports.title")} headerActions={exportHeaderAction} showSearch={false}>
            <div className="space-y-3 lg:space-y-6">
                {/* Page Header */}
                <div>
                    <div className="hidden sm:block">
                        <h1 className="text-[22px] font-bold text-text-primary font-inter">
                            {t("reports.headerTitle", { class: kelas.name })}
                        </h1>
                        <p className="text-[13px] text-text-muted font-inter mt-1">
                            {t("reports.subtitle", { class: kelas.name })}
                        </p>
                    </div>
                    <h1 className="sm:hidden text-[20px] font-bold text-text-primary font-inter">
                        {kelas.name}
                    </h1>
                </div>

                {/* Tablet & Desktop Tab + Filters + Corner Export Buttons */}
                <div className="hidden sm:block sticky top-0 z-20 pt-1 bg-background border-b border-border">
                    <div className="flex items-center justify-between flex-wrap gap-4 px-2 lg:px-4 pb-2">
                        <TabSwitcher tabs={TABS} activeKey={tab} onChange={handleTabChange} />
                        <div className="flex items-center gap-3">
                            {tab === "daily" && (
                                <DatePicker value={selectedDate} onChange={(val) => handleDateChange(val)} />
                            )}
                            {tab === "monthly" && (
                                <>
                                    <select value={selectedMonth} onChange={(e) => handleMonthChange(e.target.value)} className="border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20">
                                        {MONTH_NAMES.map((name, i) => (<option key={i + 1} value={i + 1}>{name}</option>))}
                                    </select>
                                    <select value={selectedYear} onChange={(e) => handleYearChange(e.target.value)} className="border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 w-24">
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (<option key={y} value={y}>{y}</option>))}
                                    </select>
                                </>
                            )}
                            {tab === "semester" && (
                                <>
                                    <select value={selectedSemester} onChange={(e) => handleSemesterChange(e.target.value)} className="border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20">
                                        <option value="1">{t("reports.odd")} (Jul-Des)</option>
                                        <option value="2">{t("reports.even")} (Jan-Jun)</option>
                                    </select>
                                    <select value={selectedYear} onChange={(e) => handleYearChange(e.target.value)} className="border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 w-32">
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (<option key={y} value={y}>TA {y}/{y + 1}</option>))}
                                    </select>
                                </>
                            )}

                            {/* Corner Export Actions (Visible on Tablet & Desktop across all tabs) */}
                            <div className="flex items-center gap-2 pl-2 border-l border-border/80">
                                <button
                                    type="button"
                                    onClick={handleExportPdf}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold text-white bg-danger hover:bg-danger/90 active:scale-95 transition-all shadow-xs cursor-pointer"
                                    title="Export PDF"
                                >
                                    <FiFileText className="text-[12px]" /> PDF
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExportExcel}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold text-white bg-success hover:bg-success/90 active:scale-95 transition-all shadow-xs cursor-pointer"
                                    title="Export Excel"
                                >
                                    <FiGrid className="text-[12px]" /> Excel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Tabs + Filter (Full Width, with Export Icon in Mobile Header) */}
                <div className="sm:hidden sticky top-0 z-20 bg-background space-y-2">
                    <TabSwitcher tabs={TABS} activeKey={tab} onChange={handleTabChange} />
                    <div className="bg-surface border border-border rounded-xl p-2.5 shadow-xs">
                        {tab === "daily" && (
                            <div className="w-full">
                                <DatePicker value={selectedDate} onChange={(val) => handleDateChange(val)} className="w-full" />
                            </div>
                        )}
                        {tab === "monthly" && (
                            <div className="flex gap-2 w-full">
                                <select value={selectedMonth} onChange={(e) => handleMonthChange(e.target.value)} className="flex-1 border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium">
                                    {MONTH_NAMES.map((name, i) => (<option key={i + 1} value={i + 1}>{name}</option>))}
                                </select>
                                <select value={selectedYear} onChange={(e) => handleYearChange(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 w-24 font-medium">
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (<option key={y} value={y}>{y}</option>))}
                                </select>
                            </div>
                        )}
                        {tab === "semester" && (
                            <div className="flex gap-2 w-full">
                                <select value={selectedSemester} onChange={(e) => handleSemesterChange(e.target.value)} className="flex-1 border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium">
                                    <option value="1">{t("reports.odd")} (Jul-Des)</option>
                                    <option value="2">{t("reports.even")} (Jan-Jun)</option>
                                </select>
                                <select value={selectedYear} onChange={(e) => handleYearChange(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 w-28 font-medium">
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (<option key={y} value={y}>TA {y}/{y + 1}</option>))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

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
                            onClick={() => { handleExportPdf(); setExportSheetOpen(false); }}
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
                            {exportingType !== "pdf" && <FiChevronRight className="w-4 h-4 text-text-muted group-hover:text-danger group-hover:translate-x-0.5 transition-all shrink-0" />}
                        </button>
                        <button
                            type="button"
                            onClick={() => { handleExportExcel(); setExportSheetOpen(false); }}
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
                                <span className="text-[14px] font-bold text-text-primary block leading-tight">Excel</span>
                                <span className="text-[12px] text-text-muted mt-0.5 block leading-normal">
                                    {exportingType === "excel" ? t("reports.preparing") : t("reports.exportExcelDesc")}
                                </span>
                            </div>
                            {exportingType !== "excel" && <FiChevronRight className="w-4 h-4 text-text-muted group-hover:text-success group-hover:translate-x-0.5 transition-all shrink-0" />}
                        </button>
                    </div>
                </Drawer>

                {/* Tab Content */}
                {tab === "daily" && (
                    <div className="bg-background lg:bg-surface border border-border rounded-xl overflow-hidden">
                        {isHoliday && (
                            <div className="px-4 py-3 text-[13px] font-bold text-warning bg-warning-light flex items-center gap-2">
                                <FiCalendar className="text-[12px]" />
                                {t("reports.holidayNotice")}
                            </div>
                        )}
                        <DailyTable students={students as DailyStudent[]} />
                    </div>
                )}

                {tab === "monthly" && (
                    <MonthlyTable
                        students={students as RecapStudent[]}
                        summary={summary}
                        chartData={dailyBreakdown}
                        month={selectedMonth}
                        year={selectedYear}
                        onExportPdf={handleExportPdf}
                        onExportExcel={handleExportExcel}
                    />
                )}

                {tab === "semester" && (
                    <SemesterTable
                        students={students as RecapStudent[]}
                        summary={summary}
                        chartData={monthlyBreakdown}
                        semester={selectedSemester}
                        year={selectedYear}
                        onExportPdf={handleExportPdf}
                        onExportExcel={handleExportExcel}
                    />
                )}

                {/* Footer note */}
                <p className="text-[12px] text-text-muted italic pb-12 lg:pb-0">
                    <span className="inline-flex items-center mr-1 relative -top-px">
                        <FiAlertCircle className="text-[11px]" />
                    </span>
                    Tampilan kolom menyesuaikan secara otomatis berdasarkan filter periode yang dipilih.
                </p>
            </div>
        </AppShell>
    );
}
