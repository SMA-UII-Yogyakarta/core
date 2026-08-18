import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import TabSwitcher from "@/Components/common/TabSwitcher";
import DatePicker from "@/Components/common/DatePicker";
import DailyTable from "./DailyTable";
import MonthlyTable from "./MonthlyTable";
import SemesterTable from "./SemesterTable";
import { useLanguage } from "@/Contexts/LanguageContext";

interface DailyStudent {
    id: number;
    name: string;
    nis: string;
    status: string;
    check_in_time: string | null;
}

interface RecapStudent {
    id: number;
    name: string;
    nis: string;
    masuk: number;
    izin: number;
    sakit: number;
    alpha: number;
}

interface PageProps {
    teacher: { id: number; name: string };
    class: { id: number; name: string } | null;
    tab: string;
    students: DailyStudent[] | RecapStudent[];
    selectedDate?: string;
    selectedMonth?: number;
    selectedYear?: number;
    selectedSemester?: string;
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
    selectedDate = "",
    selectedMonth = new Date().getMonth() + 1,
    selectedYear = new Date().getFullYear(),
    selectedSemester = "1",
}: PageProps) {
    const { t } = useLanguage();

    const TABS = [
        { key: "daily", label: t("reports.tabDaily") },
        { key: "monthly", label: t("reports.tabMonthly") },
        { key: "semester", label: t("reports.tabSemester") },
    ];

    const MONTH_NAMES = MONTH_KEYS.map((key) => t(key));

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
        const classId = kelas?.id ?? "";
        if (tab === "daily") window.location.href = buildExportUrl("/export/daily-recap-pdf", { date: selectedDate, class_id: classId });
        else if (tab === "monthly") window.location.href = buildExportUrl("/export/monthly-recap-pdf", { month: selectedMonth, year: selectedYear, class_id: classId });
        else window.location.href = buildExportUrl("/export/semester-recap-pdf", { semester: selectedSemester, year: selectedYear, class_id: classId });
    };

    const handleExportExcel = () => {
        const classId = kelas?.id ?? "";
        if (tab === "daily") window.location.href = buildExportUrl("/export/daily-recap", { date: selectedDate, class_id: classId });
        else if (tab === "monthly") window.location.href = buildExportUrl("/export/monthly-recap", { month: selectedMonth, year: selectedYear, class_id: classId });
        else window.location.href = buildExportUrl("/export/semester-recap", { semester: selectedSemester, year: selectedYear, class_id: classId });
    };

    if (!kelas) {
        return (
            <AppShell title="Laporan Rekap">
                <div className="bg-surface border border-border rounded-xl p-12 text-center">
                    <i className="fas fa-chalkboard-teacher text-[40px] text-text-muted mb-4 block" />
                    <p className="text-text-muted text-[14px]">Anda belum ditugaskan sebagai wali kelas.</p>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell title="Laporan Rekap">
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-[22px] font-bold text-text-primary font-inter">{t("reports.title")}</h1>
                        <p className="text-[13px] text-text-muted font-inter mt-1">
                            {t("reports.subtitle").replace("{class}", kelas.name)}
                        </p>
                    </div>
                </div>

                {/* Tab + Filters + Export */}
                <div className="bg-surface border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <TabSwitcher tabs={TABS} activeKey={tab} onChange={handleTabChange} variant="pills" />

                        <div className="flex items-center gap-4">
                            {/* Daily filter */}
                            {tab === "daily" && (
                                <DatePicker
                                    value={selectedDate}
                                    onChange={(val) => handleDateChange(val)}
                                />
                            )}

                            {/* Monthly filter */}
                            {tab === "monthly" && (
                                <>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => handleMonthChange(e.target.value)}
                                        className="border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        {MONTH_NAMES.map((name, i) => (
                                            <option key={i + 1} value={i + 1}>{name}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => handleYearChange(e.target.value)}
                                        className="border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 w-24"
                                    >
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </>
                            )}

                            {/* Semester filter */}
                            {tab === "semester" && (
                                <>
                                    <select
                                        value={selectedSemester}
                                        onChange={(e) => handleSemesterChange(e.target.value)}
                                        className="border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="1">Semester 1 (Jul - Des)</option>
                                        <option value="2">Semester 2 (Jan - Jun)</option>
                                    </select>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => handleYearChange(e.target.value)}
                                        className="border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 w-24"
                                    >
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </>
                            )}

                            {/* Export buttons */}
                            <button
                                type="button"
                                onClick={handleExportPdf}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold text-white bg-danger hover:bg-danger/90 transition-colors"
                            >
                                <i className="fas fa-file-pdf text-[12px]" />
                                PDF
                            </button>
                            <button
                                type="button"
                                onClick={handleExportExcel}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold text-white bg-success hover:bg-success/90 transition-colors"
                            >
                                <i className="fas fa-file-excel text-[12px]" />
                                Excel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                    {tab === "daily" && <DailyTable students={students as DailyStudent[]} />}
                    {tab === "monthly" && <MonthlyTable students={students as RecapStudent[]} />}
                    {tab === "semester" && <SemesterTable students={students as RecapStudent[]} />}
                </div>

                {/* Footer note */}
                <p className="text-[12px] text-text-muted italic">
                    {t("reports.footerNote")}
                </p>
            </div>
        </AppShell>
    );
}
