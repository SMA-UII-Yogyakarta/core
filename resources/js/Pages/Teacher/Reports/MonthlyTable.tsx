import { useLanguage } from "@/Contexts/LanguageContext";
import AttendanceChart from "@/Components/features/AttendanceChart";
import type { ChartDataPoint } from "@/Components/features/AttendanceChart";

interface StudentRecap {
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
    total_students?: number;
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

const MONTH_NAMES_ID = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function MonthlyTable({ students, summary, chartData, month, year, onExportPdf, onExportExcel }: MonthlyTableProps) {
    const { t } = useLanguage();

    const chartPoints: ChartDataPoint[] = (chartData ?? []).map((d) => ({
        label: d.label,
        date: d.date,
        present: d.tepat_waktu,
        late: d.terlambat,
        permission: d.izin,
        sick: d.sakit,
        tertunda: d.tertunda,
        absent: d.alpa,
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
              { label: t("reports.headerOnTime"), value: summary.tepat_waktu, color: "text-success" },
              { label: t("reports.statusLate"), value: summary.terlambat, color: "text-warning" },
              { label: t("reports.permission"), value: summary.izin, color: "text-primary" },
              { label: t("reports.statusPending"), value: summary.tertunda, color: "text-info" },
              { label: t("reports.statusSick"), value: summary.sakit, color: "text-purple-600" },
              { label: t("reports.statusAbsent"), value: summary.alpa, color: "text-danger" },
          ]
        : [];

    const mainStatCards: StatCardEntry[] = summary
        ? [
              {
                  label: t("reports.headerAttendance"),
                  value: `${summary.attendance_rate}%`,
                  color: "text-text-primary",
                  info: `Rumus: (Tepat + Terlambat) ÷ (Tepat + Terlambat + Izin + Sakit + Alpa) → (${summary.tepat_waktu} + ${summary.terlambat}) ÷ (${summary.tepat_waktu} + ${summary.terlambat} + ${summary.izin} + ${summary.sakit} + ${summary.alpa}) = ${summary.attendance_rate}%. Izin Tertunda (${summary.tertunda}) tidak dihitung karena belum divalidasi.`,
              },
              {
                  label: t("reports.headerDiscipline"),
                  value: `${summary.discipline_rate ?? 0}%`,
                  color: "text-text-primary",
                  info: `Rumus (tingkat kelas): Tepat Waktu seluruh siswa ÷ (Hari Efektif × Jumlah Siswa) × 100 → ${summary.tepat_waktu} ÷ (${summary.school_days} × ${summary.total_students ?? 0}) = ${summary.discipline_rate ?? 0}%.`,
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
                    <h3 className="text-[14px] font-semibold text-text-primary mb-4">
                        Grafik Kehadiran Harian ({MONTH_NAMES_ID[month - 1]} {year})
                    </h3>
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
                    <div className="grid grid-cols-7 gap-3 mb-4">
                        {statCards.map((card) => (
                            <div
                                key={card.label}
                                className="relative group bg-background border border-border rounded-xl p-3 text-center"
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
                <div className="lg:hidden bg-surface border border-border rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-chart-column text-primary" />
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
                        const total = summary.tepat_waktu + summary.terlambat + summary.izin + summary.sakit + summary.tertunda + summary.alpa;
                        if (total === 0) return null;
                        const segments = [
                            { value: summary.tepat_waktu, color: "#10B981" },
                            { value: summary.terlambat, color: "#F59E0B" },
                            { value: summary.izin, color: "#2E3391" },
                            { value: summary.sakit, color: "#A855F7" },
                            { value: summary.tertunda, color: "#0EA5E9" },
                            { value: summary.alpa, color: "#EF4444" },
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
                    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
                        {statCards.map((card) => (
                            <div
                                key={card.label}
                                className="shrink-0 bg-background border border-border rounded-xl p-3 pl-4 min-w-[110px]"
                                style={{ borderLeftColor: card.color === "text-success" ? "#10B981" : card.color === "text-warning" ? "#F59E0B" : card.color === "text-primary" ? "#2E3391" : card.color === "text-info" ? "#0EA5E9" : card.color === "text-purple-600" ? "#A855F7" : "#EF4444", borderLeftWidth: "3px" }}
                            >
                                <p className={`font-bold text-[18px] ${card.color}`}>{card.value}</p>
                                <p className="text-[9px] text-text-muted uppercase tracking-wide mt-0.5">{card.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Table (Desktop only) */}
            <div className="hidden lg:block bg-surface border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-4">
                    <h3 className="text-[14px] font-semibold text-text-primary">
                        Data Rekapitulasi Siswa ({MONTH_NAMES_ID[month - 1]} {year})
                    </h3>
                    <div className="flex items-center gap-3 shrink-0">
                        <button type="button" onClick={onExportPdf} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold text-white bg-danger hover:bg-danger/90 transition-colors">
                            <i className="fas fa-file-pdf text-[12px]" /> PDF
                        </button>
                        <button type="button" onClick={onExportExcel} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold text-white bg-success hover:bg-success/90 transition-colors">
                            <i className="fas fa-file-excel text-[12px]" /> Excel
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
                                            {s.tepat_waktu}
                                        </td>
                                        <td className="px-4 py-3 text-[13px] text-center text-warning font-semibold">
                                            {s.masuk - s.tepat_waktu}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-[13px] text-center font-semibold"
                                            style={{ color: s.izin > 0 ? "#2E3391" : "#64748B" }}
                                        >
                                            {s.izin}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-[13px] text-center font-semibold"
                                            style={{ color: s.sakit > 0 ? "#A855F7" : "#64748B" }}
                                        >
                                            {s.sakit}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-[13px] text-center font-semibold"
                                            style={{ color: s.tertunda > 0 ? "#0EA5E9" : "#64748B" }}
                                        >
                                            {s.tertunda}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-[13px] text-center font-semibold"
                                            style={{ color: s.alpha > 0 ? "#EF4444" : "#64748B" }}
                                        >
                                            {s.alpha}
                                        </td>
                                        <td className="px-4 py-3 text-[13px] text-center font-bold text-text-primary">
                                            {s.attendance_rate}%
                                        </td>
                                        <td className="px-4 py-3 text-[13px] text-center font-bold text-text-primary">
                                            {s.discipline_rate}%
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
                            className="bg-white border border-border rounded-xl p-3"
                            style={{
                                borderLeftColor: s.alpha > 0 ? "#EF4444" : s.tertunda > 0 ? "#0EA5E9" : s.sakit > 0 ? "#A855F7" : s.izin > 0 ? "#2E3391" : "#10B981",
                                borderLeftWidth: "3px",
                            }}
                        >
                            <div className="min-w-0 mb-1">
                                <p className="text-[14px] font-bold text-text-primary truncate">{s.name}</p>
                                <p className="text-[12px] text-text-muted mt-0.5">NIS: {s.nis}</p>
                            </div>
                            <div className="bg-background rounded-lg p-2 mt-2">
                                <p className="text-[13px]">
                                    <span className="font-bold text-success">{s.tepat_waktu}</span> {t("reports.headerOnTime")}{" | "}
                                    <span className="font-bold text-warning">{s.terlambat}</span> {t("reports.statusLate")}{" | "}
                                    <span className="font-semibold" style={{ color: s.izin > 0 ? "#2E3391" : "#64748B" }}>{s.izin}</span> Izin{" | "}
                                    <span className="font-semibold" style={{ color: s.sakit > 0 ? "#A855F7" : "#64748B" }}>{s.sakit}</span> Sakit{" | "}
                                    <span className="font-semibold" style={{ color: s.alpha > 0 ? "#EF4444" : "#64748B" }}>{s.alpha}</span> Alpa
                                </p>
                                <p className="text-[13px] mt-0.5">
                                    <span className="font-semibold" style={{ color: s.tertunda > 0 ? "#0EA5E9" : "#64748B" }}>{s.tertunda}</span> {t("reports.statusPending")}
                                </p>
                                <p className="text-[13px] mt-0.5">
                                    <span className="font-bold text-text-primary">{s.attendance_rate}%</span> {t("reports.headerAttendance")}{" | "}
                                    <span className="font-bold text-text-primary">{s.discipline_rate}%</span> {t("reports.headerDiscipline")}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
