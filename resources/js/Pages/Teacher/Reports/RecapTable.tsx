import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiAlertTriangle, FiBarChart2, FiFileText, FiGrid, FiInfo } from "react-icons/fi";
import type { ChartDataPoint } from "@/Components/features/AttendanceChart";
import AttendanceChart from "@/Components/features/AttendanceChart";
import { Button, MobileNativePagination, Table, TableFooter, TableSection } from "@/Components";
import { useLanguage } from "@/Contexts/LanguageContext";
import { useClientPagination } from "@/hooks/useClientPagination";

import type { DailyBreakdown, MonthlyBreakdown, StudentRecap, Summary } from "@/types/Report";
import type { Column } from "@/Components/ui/Table";

interface BaseRecapTableProps {
    students: StudentRecap[];
    summary?: Summary;
    /** @deprecated Export actions belong to the page toolbar; kept for compatibility with existing callers. */
    onExportPdf?: () => void;
    /** @deprecated Export actions belong to the page toolbar; kept for compatibility with existing callers. */
    onExportExcel?: () => void;
}

export interface MonthlyRecapTableProps extends BaseRecapTableProps {
    mode: "monthly";
    month: number;
    year: number;
    chartData?: DailyBreakdown[];
}

export interface SemesterRecapTableProps extends BaseRecapTableProps {
    mode: "semester";
    semester: string;
    year: number;
    chartData?: MonthlyBreakdown[];
}

export type RecapTableProps = MonthlyRecapTableProps | SemesterRecapTableProps;

const MONTH_KEYS = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
] as const;

export default function RecapTable(props: RecapTableProps) {
    const { students, summary, onExportPdf, onExportExcel } = props;
    const { t } = useLanguage();

    const {
        setCurrentPage,
        totalPages,
        safePage,
        paginatedData: paginatedStudents,
        pageSize,
    } = useClientPagination(students, 1, 10);

    const isZero = (v: string | number) => Number(v) === 0;

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

    const chartPoints: ChartDataPoint[] = useMemo(() => {
        if (props.mode === "monthly") {
            return (props.chartData ?? []).map((d) => ({
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
        }
        return (props.chartData ?? []).map((d) => ({
            label: d.month_label,
            present: d.on_time,
            late: d.late,
            permission: d.permission,
            sick: d.sick,
            pending: d.pending,
            absent: d.absent,
        }));
    }, [props, summary?.total_students]);

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

    const ratiosZero = summary ? summary.attendance_rate === 0 && summary.discipline_rate === 0 : false;

    const title = useMemo(() => {
        if (props.mode === "monthly") {
            const monthKey = MONTH_KEYS[props.month - 1] ?? MONTH_KEYS[0];
            return t("reports.dataRecapMonthly", {
                month: t(`month.${monthKey}`),
                year: props.year,
            });
        }

        const semesterLabel =
            props.semester === "1"
                ? `${t("reports.odd")} ${props.year}/${props.year + 1}`
                : `${t("reports.even")} ${props.year - 1}/${props.year}`;
        return t("reports.dataRecapSemester", { label: semesterLabel });
    }, [props, t]);

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

    const recapColumns: Column<StudentRecap>[] = [
        {
            key: "no",
            header: HEADERS[0].label,
            cellClassName: "text-text-secondary",
            render: (_student, index = 0) => (
                <span className="text-text-secondary">{(safePage - 1) * pageSize + index + 1}</span>
            ),
        },
        {
            key: "name",
            header: HEADERS[1].label,
            headerClassName: "min-w-[180px] max-xl:sticky max-xl:left-0 max-xl:z-20 max-xl:bg-muted",
            cellClassName: "font-bold text-text-primary min-w-[180px] max-xl:sticky max-xl:left-0 max-xl:z-10 max-xl:bg-surface",
            render: (student) => student.name,
        },
        {
            key: "nis",
            header: HEADERS[2].label,
            render: (student) => student.nis,
        },
        {
            key: "on_time",
            header: HEADERS[3].label,
            className: "text-center",
            render: (student) => (
                <span className={student.on_time > 0 ? "font-semibold text-success" : "font-semibold text-text-muted"}>
                    {student.on_time}
                </span>
            ),
        },
        {
            key: "late",
            header: HEADERS[4].label,
            className: "text-center",
            render: (student) => (
                <span className={student.late > 0 ? "font-semibold text-warning" : "font-semibold text-text-muted"}>
                    {student.late}
                </span>
            ),
        },
        {
            key: "permission",
            header: HEADERS[5].label,
            className: "text-center",
            render: (student) => (
                <span className={student.permission > 0 ? "font-semibold text-primary" : "font-semibold text-text-muted"}>
                    {student.permission}
                </span>
            ),
        },
        {
            key: "sick",
            header: HEADERS[6].label,
            className: "text-center",
            render: (student) => (
                <span className={student.sick > 0 ? "font-semibold text-medical" : "font-semibold text-text-muted"}>
                    {student.sick}
                </span>
            ),
        },
        {
            key: "pending",
            header: HEADERS[7].label,
            className: "text-center",
            render: (student) => (
                <span className={student.pending > 0 ? "font-semibold text-info" : "font-semibold text-text-muted"}>
                    {student.pending}
                </span>
            ),
        },
        {
            key: "absent",
            header: HEADERS[8].label,
            className: "text-center",
            render: (student) => (
                <span className={student.absent > 0 ? "font-semibold text-danger" : "font-semibold text-text-muted"}>
                    {student.absent}
                </span>
            ),
        },
        {
            key: "attendance_rate",
            header: HEADERS[9].label,
            className: "text-center font-bold",
            render: (student) => {
                const isEmpty = student.attendance_rate === 0 && student.discipline_rate === 0;
                return (
                    <span className={isEmpty ? "text-text-muted" : student.attendance_rate <= 75 ? "text-warning" : "text-text-primary"}>
                        {student.attendance_rate}%
                        {student.attendance_rate <= 75 && !isEmpty && (
                            <FiAlertTriangle className="inline align-middle ml-0.5 text-[11px] relative -top-px" />
                        )}
                    </span>
                );
            },
        },
        {
            key: "discipline_rate",
            header: HEADERS[10].label,
            className: "text-center font-bold",
            render: (student) => {
                const isEmpty = student.discipline_rate === 0 && student.attendance_rate === 0;
                return (
                    <span className={isEmpty ? "text-text-muted" : student.discipline_rate <= 75 ? "text-warning" : "text-text-primary"}>
                        {student.discipline_rate}%
                        {student.discipline_rate <= 75 && !isEmpty && (
                            <FiAlertTriangle className="inline align-middle ml-0.5 text-[11px] relative -top-px" />
                        )}
                    </span>
                );
            },
        },
    ];

    return (
        <div className="flex flex-1 min-h-0 flex-col gap-6">
            {/* Tablet & Desktop Chart + Stats */}
            {summary && (
                <div className="hidden sm:block bg-surface border border-border rounded-xl p-4">
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
                                <p className={`font-bold text-[32px] ${ratiosZero ? "text-text-muted" : card.color}`}>
                                    {card.value}
                                </p>
                                <p className="text-[11px] text-text-muted uppercase tracking-wide mt-1">
                                    {card.label}
                                    {card.info && <FiInfo className="text-text-muted ml-1 inline text-[13px]" />}
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
                                className={`relative group rounded-xl p-3 text-center ${isZero(card.value) ? "bg-background" : (statCardBg[card.color] ?? "bg-background")}`}
                            >
                                <p
                                    className={`font-bold text-[22px] ${isZero(card.value) ? "text-text-muted" : card.color}`}
                                >
                                    {card.value}
                                </p>
                                <p className="text-[10px] text-text-muted uppercase tracking-wide mt-1">{card.label}</p>
                            </div>
                        ))}
                    </div>
                    {chartPoints.length > 0 && (
                        <AttendanceChart
                            data={chartPoints}
                            type="stacked"
                            height={300}
                            showHolidayBar={props.mode === "monthly"}
                        />
                    )}
                </div>
            )}

            {/* Mobile Ringkasan */}
            {summary && (
                <div className="sm:hidden bg-surface border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <FiBarChart2 className="text-primary" />
                        <span className="text-[14px] font-semibold text-text-primary">{t("reports.summary")}</span>
                    </div>

                    {/* Two ratios side by side */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-background border border-border rounded-xl p-3">
                            <p className="text-[11px] text-text-muted uppercase tracking-wide">
                                {t("reports.ratioAttendance")}
                            </p>
                            <p
                                className={`text-[22px] font-bold mt-1 ${ratiosZero ? "text-text-muted" : "text-text-primary"}`}
                            >
                                {summary.attendance_rate}%
                            </p>
                        </div>
                        <div className="bg-background border border-border rounded-xl p-3">
                            <p className="text-[11px] text-text-muted uppercase tracking-wide">
                                {t("reports.ratioDiscipline")}
                            </p>
                            <p
                                className={`text-[22px] font-bold mt-1 ${ratiosZero ? "text-text-muted" : "text-text-primary"}`}
                            >
                                {summary.discipline_rate ?? 0}%
                            </p>
                        </div>
                    </div>

                    {/* Progress bar 6 segments */}
                    {(() => {
                        const total =
                            summary.on_time +
                            summary.late +
                            summary.permission +
                            summary.sick +
                            summary.pending +
                            summary.absent;
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
                            <div
                                className="absolute right-4 top-0 bottom-2 w-4 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"
                                style={{ marginBottom: -4 }}
                            />
                        )}
                        {hasOverflow.left && (
                            <div
                                className="absolute left-4 top-0 bottom-2 w-4 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"
                                style={{ marginBottom: -4 }}
                            />
                        )}
                        <div
                            ref={scrollRef}
                            onScroll={checkOverflow}
                            className="flex gap-2 overflow-x-auto no-scrollbar pb-1"
                        >
                            {statCards.map((card) => (
                                <div
                                    key={card.label}
                                    className={`shrink-0 rounded-xl p-3 pl-4 min-w-[110px] ${isZero(card.value) ? "bg-background" : (statCardBg[card.color] ?? "bg-background")}`}
                                >
                                    <p
                                        className={`font-bold text-[18px] ${isZero(card.value) ? "text-text-muted" : card.color}`}
                                    >
                                        {card.value}
                                    </p>
                                    <p className="text-[9px] text-text-muted uppercase tracking-wide mt-0.5">
                                        {card.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Table (Tablet & Desktop) */}
            <TableSection desktopOnly className="w-full font-inter">
                <div className="flex items-center justify-between gap-3 shrink-0">
                    <h3 className="text-[14px] font-semibold text-text-primary truncate">{title}</h3>
                    {(onExportPdf || onExportExcel) && (
                        <div className="flex items-center gap-2 shrink-0">
                            {onExportPdf && (
                                <Button
                                    variant="danger"
                                    size="sm"
                                    icon={<FiFileText className="text-[12px]" />}
                                    onClick={onExportPdf}
                                >
                                    PDF
                                </Button>
                            )}
                            {onExportExcel && (
                                <Button
                                    variant="success"
                                    size="sm"
                                    icon={<FiGrid className="text-[12px]" />}
                                    onClick={onExportExcel}
                                >
                                    Excel
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                <Table
                    columns={recapColumns}
                    data={paginatedStudents}
                    keyExtractor={(student) => student.id}
                    emptyMessage={t("reports.emptyMonthly")}
                    minWidthClassName="min-w-[720px]"
                    fill
                />
                <TableFooter
                    info={t("reports.footerNote")}
                    currentPage={safePage}
                    totalPages={totalPages}
                    totalItems={students.length}
                    perPage={pageSize}
                    onPageChange={setCurrentPage}
                />
            </TableSection>

            {/* Mobile Student Cards */}
            <div className="sm:hidden flex flex-col gap-2.5">
                {students.length === 0 ? (
                    <div className="py-12 text-center text-text-muted text-[13px]">{t("reports.emptyMonthly")}</div>
                ) : (
                    paginatedStudents.map((s) => (
                        <div
                            key={s.id}
                            className="bg-surface border border-border rounded-xl p-3"
                            style={{
                                borderLeftColor:
                                    s.absent > 0
                                        ? "var(--color-danger)"
                                        : s.pending > 0
                                          ? "var(--color-info)"
                                          : s.sick > 0
                                            ? "var(--color-medical)"
                                            : s.permission > 0
                                              ? "var(--color-primary)"
                                              : s.late > 0
                                                ? "var(--color-warning)"
                                                : s.on_time > 0
                                                  ? "var(--color-success)"
                                                  : "var(--color-text-muted)",
                                borderLeftWidth: "3px",
                            }}
                        >
                            <div className="min-w-0 mb-1 flex items-center gap-2">
                                <p className="text-[14px] font-bold text-text-primary truncate flex-1 min-w-0">
                                    {s.name}
                                </p>
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
                                        <span
                                            className={`font-bold text-[13px] ${s.on_time > 0 ? "text-success" : "text-text-muted"}`}
                                        >
                                            {s.on_time}
                                        </span>
                                        <span className="text-[10px] text-text-muted block">
                                            {t("reports.headerOnTime")}
                                        </span>
                                    </div>
                                    <div className="flex-1 text-center px-1 border-l-[4px] border-white/50">
                                        <span
                                            className={`font-bold text-[13px] ${s.late > 0 ? "text-warning" : "text-text-muted"}`}
                                        >
                                            {s.late}
                                        </span>
                                        <span className="text-[10px] text-text-muted block">
                                            {t("reports.statusLate")}
                                        </span>
                                    </div>
                                    <div className="flex-1 text-center px-1 border-l-[4px] border-white/50">
                                        <span
                                            className="font-semibold text-[13px]"
                                            style={{
                                                color:
                                                    s.permission > 0
                                                        ? "var(--color-primary)"
                                                        : "var(--color-text-muted)",
                                            }}
                                        >
                                            {s.permission}
                                        </span>
                                        <span className="text-[10px] text-text-muted block">
                                            {t("reports.permission")}
                                        </span>
                                    </div>
                                    <div className="flex-1 text-center px-1 border-l-[4px] border-white/50">
                                        <span
                                            className="font-semibold text-[13px]"
                                            style={{
                                                color: s.sick > 0 ? "var(--color-medical)" : "var(--color-text-muted)",
                                            }}
                                        >
                                            {s.sick}
                                        </span>
                                        <span className="text-[10px] text-text-muted block">
                                            {t("reports.statusSick")}
                                        </span>
                                    </div>
                                    <div className="flex-1 text-center px-1 border-l-[4px] border-white/50">
                                        <span
                                            className="font-semibold text-[13px]"
                                            style={{
                                                color: s.absent > 0 ? "var(--color-danger)" : "var(--color-text-muted)",
                                            }}
                                        >
                                            {s.absent}
                                        </span>
                                        <span className="text-[10px] text-text-muted block">
                                            {t("reports.statusAbsent")}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center rounded-lg">
                                    <div className="flex-1 text-center px-1 border-l-[4px] border-white/50 first:border-l-0">
                                        <span
                                            className={`font-bold text-[13px] ${s.attendance_rate === 0 && s.discipline_rate === 0 ? "text-text-muted" : s.attendance_rate <= 75 ? "text-warning" : "text-text-primary"}`}
                                        >
                                            {s.attendance_rate}%
                                            {s.attendance_rate <= 75 &&
                                                !(s.attendance_rate === 0 && s.discipline_rate === 0) && (
                                                    <span className="inline-flex items-center ml-0.5">
                                                        <FiAlertTriangle className="text-[11px] relative -top-px" />
                                                    </span>
                                                )}
                                        </span>
                                        <span className="text-[10px] text-text-muted block">
                                            {t("reports.headerAttendance")}
                                        </span>
                                    </div>
                                    <div className="flex-1 text-center px-1 border-l-[4px] border-white/50">
                                        <span
                                            className={`font-bold text-[13px] ${s.discipline_rate === 0 && s.attendance_rate === 0 ? "text-text-muted" : s.discipline_rate <= 75 ? "text-warning" : "text-text-primary"}`}
                                        >
                                            {s.discipline_rate}%
                                            {s.discipline_rate <= 75 &&
                                                !(s.discipline_rate === 0 && s.attendance_rate === 0) && (
                                                    <span className="inline-flex items-center ml-0.5">
                                                        <FiAlertTriangle className="text-[11px] relative -top-px" />
                                                    </span>
                                                )}
                                        </span>
                                        <span className="text-[10px] text-text-muted block">
                                            {t("reports.headerDiscipline")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {students.length > pageSize && (
                    <div className="pt-2 font-inter">
                        <MobileNativePagination
                            currentPage={safePage}
                            totalPages={totalPages}
                            totalItems={students.length}
                            perPage={pageSize}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
