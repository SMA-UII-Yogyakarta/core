import { router } from "@inertiajs/react";
import { useState, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import AppShell from "@/Layouts/AppShell";
import TabSwitcher from "@/Components/common/TabSwitcher";
import DatePicker from "@/Components/common/DatePicker";
import BottomSheet from "@/Components/common/BottomSheet";
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
    tertunda: number;
    alpha: number;
    tepat_waktu: number;
    terlambat: number;
    discipline_rate: number;
    attendance_rate: number;
}

interface Summary {
    tepat_waktu: number;
    terlambat: number;
    izin: number;
    sakit: number;
    tertunda: number;
    alpa: number;
    attendance_rate: number;
    school_days?: number;
    discipline_rate?: number;
}

interface DailyBreakdown {
    date: string;
    label: string;
    tepat_waktu: number;
    terlambat: number;
    izin: number;
    sakit: number;
    tertunda: number;
    alpa: number;
}

interface MonthlyBreakdown {
    month_label: string;
    tepat_waktu: number;
    terlambat: number;
    izin: number;
    sakit: number;
    tertunda: number;
    alpa: number;
}

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
    const mobileTabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const [mobileIndicator, setMobileIndicator] = useState({ left: 0, width: 0 });

    useLayoutEffect(() => {
        const btn = mobileTabRefs.current.get(tab);
        if (btn) {
            setMobileIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
        }
    }, [tab]);

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
                <div>
                    <div className="hidden lg:block">
                        <h1 className="text-[22px] font-bold text-text-primary font-inter">
                            Laporan &amp; Ekspor Rekap {kelas.name}
                        </h1>
                        <p className="text-[13px] text-text-muted font-inter mt-1">
                            Rekapitulasi kehadiran siswa berdasarkan periode dan kategori kelas.
                        </p>
                    </div>
                    <h1 className="lg:hidden text-[22px] font-bold text-text-primary font-inter">
                        {kelas.name}
                    </h1>
                </div>

                {/* Desktop Tab + Filters + Export */}
                <div className="hidden lg:block bg-surface border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <TabSwitcher tabs={TABS} activeKey={tab} onChange={handleTabChange} variant="pills" />
                        <div className="flex items-center gap-4">
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
                                        <option value="1">Ganjil {selectedYear}/{selectedYear + 1}</option>
                                        <option value="2">Genap {selectedYear - 1}/{selectedYear}</option>
                                    </select>
                                    <select value={selectedYear} onChange={(e) => handleYearChange(e.target.value)} className="border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 w-24">
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (<option key={y} value={y}>{y}</option>))}
                                    </select>
                                </>
                            )}
                            {tab === "daily" && (
                                <>
                                    <button type="button" onClick={handleExportPdf} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold text-white bg-danger hover:bg-danger/90 transition-colors">
                                        <i className="fas fa-file-pdf text-[12px]" /> PDF
                                    </button>
                                    <button type="button" onClick={handleExportExcel} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold text-white bg-success hover:bg-success/90 transition-colors">
                                        <i className="fas fa-file-excel text-[12px]" /> Excel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Tabs + Filter + Export */}
                <div className="lg:hidden">
                    <div className="flex relative border-b border-border">
                        {TABS.map((te) => (
                            <button key={te.key} ref={(el) => { if (el) mobileTabRefs.current.set(te.key, el); }} type="button" onClick={() => handleTabChange(te.key)}
                                className={`flex-1 inline-flex items-center justify-center px-4 py-3 text-[14px] font-medium whitespace-nowrap transition-colors ${tab === te.key ? "text-primary font-semibold" : "text-text-muted"}`}>
                                {te.label}
                            </button>
                        ))}
                        <motion.div className="absolute bottom-0 h-0.5 bg-primary rounded-full" animate={{ left: mobileIndicator.left, width: mobileIndicator.width }} transition={{ type: "spring", stiffness: 500, damping: 35 }} />
                    </div>
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                        <div>
                            {tab === "daily" && (<DatePicker value={selectedDate} onChange={(val) => handleDateChange(val)} />)}
                            {tab === "monthly" && (
                                <div className="flex gap-2">
                                    <select value={selectedMonth} onChange={(e) => handleMonthChange(e.target.value)} className="flex-1 border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20">
                                        {MONTH_NAMES.map((name, i) => (<option key={i + 1} value={i + 1}>{name}</option>))}
                                    </select>
                                    <select value={selectedYear} onChange={(e) => handleYearChange(e.target.value)} className="border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 w-24">
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (<option key={y} value={y}>{y}</option>))}
                                    </select>
                                </div>
                            )}
                            {tab === "semester" && (
                                <div className="flex gap-2">
                                    <select value={selectedSemester} onChange={(e) => handleSemesterChange(e.target.value)} className="flex-1 border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20">
                                        <option value="1">Ganjil {selectedYear}/{selectedYear + 1}</option>
                                        <option value="2">Genap {selectedYear - 1}/{selectedYear}</option>
                                    </select>
                                    <select value={selectedYear} onChange={(e) => handleYearChange(e.target.value)} className="border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 w-24">
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (<option key={y} value={y}>{y}</option>))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <button type="button" onClick={() => setExportSheetOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold text-primary border border-primary hover:bg-primary/5 transition-colors shrink-0">
                            <i className="fas fa-file-export text-[12px]" /> {t("reports.export")}
                        </button>
                    </div>
                </div>

                {/* Export BottomSheet */}
                <BottomSheet
                    open={exportSheetOpen}
                    onClose={() => setExportSheetOpen(false)}
                    title={t("reports.exportOptions")}
                >
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => { handleExportPdf(); setExportSheetOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-background transition-colors"
                        >
                            <i className="fas fa-file-pdf text-[18px] text-danger" />
                            <span className="text-[14px] font-semibold text-text-primary">PDF</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { handleExportExcel(); setExportSheetOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-background transition-colors"
                        >
                            <i className="fas fa-file-excel text-[18px] text-success" />
                            <span className="text-[14px] font-semibold text-text-primary">Excel</span>
                        </button>
                    </div>
                </BottomSheet>

                {/* Tab Content */}
                {tab === "daily" && (
                    <div className="bg-surface border border-border rounded-xl overflow-hidden">
                        {isHoliday && (
                            <div className="px-4 py-3 text-[13px] font-bold text-warning bg-warning-light flex items-center gap-2 border-b border-border">
                                <i className="fas fa-calendar-day text-[12px]" />
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
                <p className="text-[12px] text-text-muted italic">
                    Tampilan kolom menyesuaikan secara otomatis berdasarkan filter periode yang dipilih.
                </p>
            </div>
        </AppShell>
    );
}
