import { useState, useRef, useCallback, useEffect } from "react";
import { useLanguage } from "@/Contexts/LanguageContext";
import { FiAlertTriangle, FiBarChart2, FiFileText, FiGrid } from "react-icons/fi";
import AttendanceChart from "@/Components/features/AttendanceChart";
import type { ChartDataPoint } from "@/Components/features/AttendanceChart";

interface StudentRecap {
    id: number;
    name: string;
    nis: string;
    present: number;
    permission: number;
    sick: number;
    pending: number;
    absent: number;
    on_time: number;
    late: number;
    discipline_rate: number;
    attendance_rate: number;
}

interface Summary {
    on_time: number;
    late: number;
    permission: number;
    sick: number;
    pending: number;
    absent: number;
    attendance_rate: number;
    total_students?: number;
    school_days?: number;
    discipline_rate?: number;
}

interface DailyBreakdown {
    date: string;
    label: string;
    on_time: number;
    late: number;
    permission: number;
    sick: number;
    pending: number;
    absent: number;
    is_non_school?: boolean;
    is_past?: boolean;
    note?: string;
}

interface MonthlyTableProps {
    students: StudentRecap[];
    summary?: Summary;
    chartData?: DailyBreakdown[];
    month: number;
    year: number;
    onExportPdf?: () => void;
    onExportExcel?: () => void;
}

const MONTH_KEYS = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
];

function getMonthKey(month: number): string {
    return MONTH_KEYS[month - 1] ?? "january";
}

export default function MonthlyTable({ students, summary, chartData, month, year, onExportPdf, onExportExcel }: MonthlyTableProps) {
    const { t } = useLanguage();

    const scrollRef = useRef<HTMLDivElement>(null);
    const [hasOverflow, setHasOverflow] = useState({ left: false, right: false });

    const checkOverflow = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const canScroll = el.scrollWidth > el.clientWidth;
        setHasOverflow({
            left: canScroll && el.scrollLeft > 0,
            right: canScroll && el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
        });
    }, []);

    useEffect(() => {
        checkOverflow();
    }, [students, checkOverflow]);

    const chartPoints: ChartDataPoint[] = (chartData ?? []).map((d) => ({
        label: d.label,
        date: d.date,
        present: d.on_time,
        late: d.late,
        permission: d.permission,
        sick: d.sick,
        pending: d.pending,
        absent: d.absent,
        isNonSchool: d.is_non_school,
        isPast: d.is_past,
        note: d.note,
        totalStudents: summary?.total_students,
    }));

    interface StatCardEntry {
        label: string;
        value: string | number;
        color: string;
        info?: string;
    }

    const statCards: StatCardEntry[] = summary
        ? [
              { label: t("reports.statusPending"), value: summary.pending, color: "text-info" },
              { label: t("reports.statusAbsent"), value: summary.absent, color: "text-danger" },
              { label: t("reports.statusLate"), value: summary.late, color: "text-warning" },
              { label: t("reports.permission"), value: summary.permission, color: "text-primary" },
              { label: t("reports.statusSick"), value: summary.sick, color: "text-medical" },
              { label: t("reports.headerOnTime"), value: summary.on_time, color: "text-success" },
          ]
        : [];

    const desktopStatCards: StatCardEntry[] = summary
        ? [
              { label: t("reports.headerOnTime"), value: summary.on_time, color: "text-success" },
              { label: t("reports.statusLate"), value: summary.late, color: "text-warning" },
              { label: t("reports.permission"), value: summary.permission, color: "text-primary" },
              { label: t("reports.statusPending"), value: summary.pending, color: "text-info" },
              { label: t("reports.statusSick"), value: summary.sick, color: "text-medical" },
              { label: t("reports.statusAbsent"), value: summary.absent, color: "text-danger" },
          ]
        : [];

    const statCardBg: Record<string, string> = {
        "text-success": "bg-success-light",
        "text-warning": "bg-warning-light",
        "text-primary": "bg-primary-light",
        "text-info": "bg-info-light",
        "text-medical": "bg-medical-light",
        "text-danger": "bg-danger-light",
    };

    const mainStatCards: StatCardEntry[] = summary
        ? [
              {
                  label: t("reports.headerAttendance"),
                  value: `${summary.attendance_rate}%`,
                  color: "text-text-primary",
                  info: `Rumus: (Tepat + Terlambat) ÷ (Tepat + Terlambat + Izin + Sakit + Alpa) → (${summary.on_time} + ${summary.late}) ÷ (${summary.on_time} + ${summary.late} + ${summary.permission} + ${summary.sick} + ${summary.absent}) = ${summary.attendance_rate}%. Izin Tertunda (${summary.pending}) tidak dihitung karena belum divalidasi.`,
              },
              {
                  label: t("reports.headerDiscipline"),
                  value: `${summary.discipline_rate ?? 0}%`,
                  color: "text-text-primary",
                  info: `Rumus (tingkat kelas): Tepat Waktu seluruh siswa ÷ (Hari Efektif × Jumlah Siswa) × 100 → ${summary.on_time} ÷ (${summary.school_days} × ${summary.total_students ?? 0}) = ${summary.discipline_rate ?? 0}%.`,
              },
          ]
        : [];

    const HEADERS = [
        { label: t("reports.headerNo"), align: "left" as const },
        { label: t("reports.headerName"), align: "left" as const, sticky: true },
        { label: t("reports.headerNis"), align: "left" as const },
        { label: t("reports.headerOnTime"), align: "center" as const },
        { label: t("reports.statusLate"), align: "center" as const },
        { label: t("reports.permission"), align: "center" as const },
        { label: t("reports.statusSick"), align: "center" as const },
        { label: t("reports.statusPending"), align: "center" as const },
        { label: t("reports.statusAbsent"), align: "center" as const },
        { label: t("reports.headerAttendance"), align: "center" as const },
        { label: t("reports.headerDiscipline"), align: "center" as const },
    ];

    return (
        <div className="space-y-6">
            {/* Desktop Chart + Stats */}
            {summary && (
                <div className="hidden lg:block bg-surface border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <FiBarChart2 className="text-primary" />
                        <span className="text-[14px] font-semibold text-text-primary">{t("reports.summary")}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {mainStatCards.map((card) => (
                            <div
                                key={card.label}
                                className="relative group bg-background border border-border rounded-xl p-4 text-center"
                            >
                                <p className={`font-bold text-[32px] ${card.color}`}>{card.value}</p>
                                <p className="text-[11px] text-text-muted uppercase tracking-wide mt-1">
                                    {card.label}
                                    {card.info && (
                                        <i className="fa-solid fa-circle-info text-text-muted ml-1" />
                                    )}
                                </p>
                                {card.info && (
                                    <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 w-80 -translate-x-1/2 rounded-lg border border-border bg-surface p-3 text-left shadow-lg opacity-0 transition-opacity group-hover:opacity-100">
                                        <p className="text-[11px] leading-relaxed text-text-muted">{card.info}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-6 gap-3 mb-4">
                        {desktopStatCards.map((card) => (
                            <div
                                key={card.label}
                                className={`relative group rounded-xl p-3 text-center ${statCardBg[card.color] ?? "bg-background"}`}
                            >
                                <p className={`font-bold text-[22px] ${card.color}`}>{card.value}</p>
                                <p className="text-[10px] text-text-muted uppercase tracking-wide mt-1">
                                    {card.label}
                                </p>
                            </div>
                        ))}
                    </div>
                    {chartPoints.length > 0 && (
                        <AttendanceChart data={chartPoints} type="stacked" height={300} showHolidayBar />
                    )}
                </div>
            )}

            {/* Mobile Ringkasan */}
            {summary && (
                <div className="lg:hidden bg-surface border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <FiBarChart2 className="text-primary" />
                        <span className="text-[14px] font-semibold text-text-primary">{t("reports.summary")}</span>
                    </div>

                    {/* Two ratios side by side */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-background border border-border rounded-xl p-3">
                            <p className="text-[11px] text-text-muted uppercase tracking-wide">{t("reports.ratioAttendance")}</p>
                            <p className="text-[22px] font-bold text-text-primary mt-1">{summary.attendance_rate}%</p>
                        </div>
                        <div className="bg-background border border-border rounded-xl p-3">
                            <p className="text-[11px] text-text-muted uppercase tracking-wide">{t("reports.ratioDiscipline")}</p>
                            <p className="text-[22px] font-bold text-text-primary mt-1">{summary.discipline_rate ?? 0}%</p>
                        </div>
                    </div>

                    {/* Progress bar 6 segments */}
                    {(() => {
                        const total = summary.on_time + summary.late + summary.permission + summary.sick + summary.pending + summary.absent;
                        if (total === 0) return null;
                        const segments = [
                            { value: summary.on_time, color: "var(--color-success)" },
                            { value: summary.late, color: "var(--color-warning)" },
                            { value: summary.permission, color: "var(--color-primary)" },
                            { value: summary.sick, color: "var(--color-medical)" },
                            { value: summary.pending, color: "var(--color-info)" },
                            { value: summary.absent, color: "var(--color-danger)" },
                        ];
                        return (
                            <div className="flex h-3 rounded-full overflow-hidden">
                                {segments.map((seg, idx) => (
                                    <div
                                        key={idx}
                                        style={{ width: `${(seg.value / total) * 100}%`, backgroundColor: seg.color }}
                                    />
                                ))}
                            </div>
                        );
                    })()}

                    {/* 6 stat cards — horizontal scroll */}
                    <div className="relative -mx-4 px-4">
                        {hasOverflow.right && (
                            <div className="absolute right-4 top-0 bottom-2 w-4 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
                        )}
                        {hasOverflow.left && (
                            <div className="absolute left-4 top-0 bottom-2 w-4 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                        )}
                        <div ref={scrollRef} onScroll={checkOverflow} className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {statCards.map((card) => (
                                <div
                                    key={card.label}
                                    className={`shrink-0 rounded-xl p-3 pl-4 min-w-[110px] ${statCardBg[card.color] ?? "bg-background"}`}
                                >
                                    <p className={`font-bold text-[18px] ${card.color}`}>{card.value}</p>
                                    <p className="text-[9px] text-text-muted uppercase tracking-wide mt-0.5">{card.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Table (Desktop only) */}
            <div className="hidden lg:block bg-surface border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-4">
                    <h3 className="text-[14px] font-semibold text-text-primary">
                        {t("reports.dataRecapMonthly", { month: t(`month.${getMonthKey(month)}`), year })}
                    </h3>
                    <div className="flex items-center gap-3 shrink-0">
                        <button type="button" onClick={onExportPdf} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold text-white bg-danger hover:bg-danger/90 transition-colors">
                            <FiFileText className="text-[12px]" /> PDF
                        </button>
                        <button type="button" onClick={onExportExcel} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold text-white bg-success hover:bg-success/90 transition-colors">
                            <FiGrid className="text-[12px]" /> Excel
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse font-inter min-w-[720px]">
                        <thead>
                            <tr className="bg-background border-b border-border">
                                {HEADERS.map((h) => (
                                    <th
                                        key={h.label}
                                        className={`px-4 py-3 text-${h.align} text-[12px] font-semibold text-text-muted uppercase tracking-wide ${
                                            h.sticky ? "max-xl:sticky max-xl:left-0 max-xl:z-10 max-xl:bg-background" : ""
                                        }`}
                                    >
                                        {h.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="text-center text-text-muted text-[13px] py-10">
                                        {t("reports.emptyMonthly")}
                                    </td>
                                </tr>
                            ) : (
                                students.map((s, i) => (
                                    <tr
                                        key={s.id}
                                        className="border-b border-border last:border-b-0 hover:bg-background transition-colors"
                                    >
                                        <td className="px-4 py-3 text-[13px] text-text-muted">{i + 1}</td>
                                        <td className="px-4 py-3 text-[13px] font-bold text-text-primary max-xl:sticky max-xl:left-0 max-xl:bg-white max-xl:z-5">
                                            {s.name}
                                        </td>
                                        <td className="px-4 py-3 text-[13px] text-text-primary">{s.nis}</td>
                                        <td className="px-4 py-3 text-[13px] text-center text-success font-semibold">
                                            {s.on_time}
                                        </td>
                                        <td className="px-4 py-3 text-[13px] text-center text-warning font-semibold">
                                            {s.present - s.on_time}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-[13px] text-center font-semibold"
                                            style={{ color: s.permission > 0 ? "#2E3391" : "#64748B" }}
                                        >
                                            {s.permission}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-[13px] text-center font-semibold"
                                            style={{ color: s.sick > 0 ? "#A855F7" : "#64748B" }}
                                        >
                                            {s.sick}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-[13px] text-center font-semibold"
                                            style={{ color: s.pending > 0 ? "#0EA5E9" : "#64748B" }}
                                        >
                                            {s.pending}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-[13px] text-center font-semibold"
                                            style={{ color: s.absent > 0 ? "#EF4444" : "#64748B" }}
                                        >
                                            {s.absent}
                                        </td>
                                        <td className="px-4 py-3 text-[13px] text-center font-bold">
                                            <span className={s.attendance_rate <= 75 ? "text-warning" : "text-text-primary"}>
                                                {s.attendance_rate}%
                                                {s.attendance_rate <= 75 && <FiAlertTriangle className="inline align-middle ml-0.5 text-[11px] relative -top-px" />}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-[13px] text-center font-bold">
                                            <span className={s.discipline_rate <= 75 ? "text-warning" : "text-text-primary"}>
                                                {s.discipline_rate}%
                                                {s.discipline_rate <= 75 && <FiAlertTriangle className="inline align-middle ml-0.5 text-[11px] relative -top-px" />}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Student Cards */}
            <div className="lg:hidden space-y-2">
                {students.length === 0 ? (
                    <div className="py-12 text-center text-text-muted text-[13px]">
                        {t("reports.emptyMonthly")}
                    </div>
                ) : (
                    students.map((s) => (
                        <div
                            key={s.id}
                            className="bg-surface border border-border rounded-xl p-3"
                            style={{
                                borderLeftColor: s.absent > 0 ? "var(--color-danger)" : s.pending > 0 ? "var(--color-info)" : s.sick > 0 ? "var(--color-medical)" : s.permission > 0 ? "var(--color-primary)" : "var(--color-success)",
                                borderLeftWidth: "3px",
                            }}
                        >
                            <div className="min-w-0 mb-1 flex items-center gap-2">
                                <p className="text-[14px] font-bold text-text-primary truncate flex-1 min-w-0">{s.name}</p>
                                {s.pending > 0 && (
                                    <span className="shrink-0 inline-flex items-center gap-1 bg-info-light text-info text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {s.pending} {t("reports.statusPending")}
                                    </span>
                                )}
                            </div>
                            <p className="text-[12px] text-text-muted mb-1">NIS: {s.nis}</p>
                            <div className="bg-background rounded-lg p-2 mt-1 space-y-1">
                                <div className="flex items-center justify-center rounded-lg">
                                    <div className="flex-1 text-center px-1 border-l-[4px] border-white/50 first:border-l-0">
                                        <span className="font-bold text-[13px] text-success">{s.on_time}</span>
                                        <span className="text-[10px] text-text-muted block">{t("reports.headerOnTime")}</span>
                                    </div>
                                    <div className="flex-1 text-center px-1 border-l-[4px] border-white/50">
                                        <span className="font-bold text-[13px] text-warning">{s.late}</span>
                                        <span className="text-[10px] text-text-muted block">{t("reports.statusLate")}</span>
                                    </div>
                                    <div className="flex-1 text-center px-1 border-l-[4px] border-white/50">
                                        <span className="font-semibold text-[13px]" style={{ color: s.permission > 0 ? "var(--color-primary)" : "var(--color-text-muted)" }}>{s.permission}</span>
                                        <span className="text-[10px] text-text-muted block">{t("reports.permission")}</span>
                                    </div>
                                    <div className="flex-1 text-center px-1 border-l-[4px] border-white/50">
                                        <span className="font-semibold text-[13px]" style={{ color: s.sick > 0 ? "var(--color-medical)" : "var(--color-text-muted)" }}>{s.sick}</span>
                                        <span className="text-[10px] text-text-muted block">{t("reports.statusSick")}</span>
                                    </div>
                                    <div className="flex-1 text-center px-1 border-l-[4px] border-white/50">
                                        <span className="font-semibold text-[13px]" style={{ color: s.absent > 0 ? "var(--color-danger)" : "var(--color-text-muted)" }}>{s.absent}</span>
                                        <span className="text-[10px] text-text-muted block">{t("reports.statusAbsent")}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center rounded-lg">
                                    <div className="flex-1 text-center px-1 border-l-[4px] border-white/50 first:border-l-0">
                                        <span className={`font-bold text-[13px] ${s.attendance_rate <= 75 ? 'text-warning' : 'text-text-primary'}`}>
                                            {s.attendance_rate}%
                                            {s.attendance_rate <= 75 && <span className="inline-flex items-center ml-0.5"><FiAlertTriangle className="text-[11px] relative -top-px" /></span>}
                                        </span>
                                        <span className="text-[10px] text-text-muted block">{t("reports.headerAttendance")}</span>
                                    </div>
                                    <div className="flex-1 text-center px-1 border-l-[4px] border-white/50">
                                        <span className={`font-bold text-[13px] ${s.discipline_rate <= 75 ? 'text-warning' : 'text-text-primary'}`}>
                                            {s.discipline_rate}%
                                            {s.discipline_rate <= 75 && <span className="inline-flex items-center ml-0.5"><FiAlertTriangle className="text-[11px] relative -top-px" /></span>}
                                        </span>
                                        <span className="text-[10px] text-text-muted block">{t("reports.headerDiscipline")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
