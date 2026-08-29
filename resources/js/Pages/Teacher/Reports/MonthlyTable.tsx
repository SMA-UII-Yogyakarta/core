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
}

const MONTH_NAMES_ID = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function MonthlyTable({ students, summary, chartData, month, year }: MonthlyTableProps) {
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

    const HEADERS = [
        { label: t("reports.headerNo"), align: "left" as const },
        { label: t("reports.headerName"), align: "left" as const, sticky: true },
        { label: t("reports.headerNis"), align: "left" as const },
        { label: t("reports.present"), align: "center" as const },
        { label: t("reports.permission"), align: "center" as const },
        { label: t("reports.statusPending"), align: "center" as const },
        { label: t("reports.statusSick"), align: "center" as const },
        { label: t("reports.statusAbsent"), align: "center" as const },
        { label: t("reports.headerAttendance"), align: "center" as const },
        { label: t("reports.headerDiscipline"), align: "center" as const },
    ];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            {summary && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {mainStatCards.map((card) => (
                            <div
                                key={card.label}
                                className={`relative group bg-surface border border-border rounded-xl p-4 text-center`}
                            >
                                <p className={`font-bold text-[32px] ${card.color}`}>{card.value}</p>
                                <p className="text-[11px] text-text-muted uppercase tracking-wide mt-1">
                                    {card.label}
                                    {card.info && (
                                        <i
                                            className="fa-solid fa-circle-info text-text-muted ml-1"
                                            aria-label="Detail rumus kehadiran"
                                        />
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
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                        {statCards.map((card) => (
                            <div
                                key={card.label}
                                className="relative group bg-surface border border-border rounded-xl p-4 text-center"
                            >
                                <p className={`font-bold text-[24px] ${card.color}`}>{card.value}</p>
                                <p className="text-[11px] text-text-muted uppercase tracking-wide mt-1">
                                    {card.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Chart */}
            {chartPoints.length > 0 && (
                <div className="bg-surface border border-border rounded-xl p-4">
                    <h3 className="text-[14px] font-semibold text-text-primary mb-4">
                        Grafik Kehadiran Harian ({MONTH_NAMES_ID[month - 1]} {year})
                    </h3>
                    <AttendanceChart data={chartPoints} type="stacked" height={300} showHolidayBar />
                </div>
            )}

            {/* Table */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <h3 className="text-[14px] font-semibold text-text-primary">
                        Data Rekapitulasi Siswa ({MONTH_NAMES_ID[month - 1]} {year})
                    </h3>
                </div>

                {/* Desktop */}
                <div className="hidden lg:block overflow-x-auto">
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
                                    <td colSpan={10} className="text-center text-text-muted text-[13px] py-10">
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
                                            {s.masuk}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-[13px] text-center font-semibold"
                                            style={{ color: s.izin > 0 ? "#2E3391" : "#64748B" }}
                                        >
                                            {s.izin}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-[13px] text-center font-semibold"
                                            style={{ color: s.tertunda > 0 ? "#0EA5E9" : "#64748B" }}
                                        >
                                            {s.tertunda}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-[13px] text-center font-semibold"
                                            style={{ color: s.sakit > 0 ? "#A855F7" : "#64748B" }}
                                        >
                                            {s.sakit}
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
                                        <td className="px-4 py-3 text-[13px] text-center font-semibold text-primary">
                                            {s.discipline_rate}%
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile */}
                <div className="lg:hidden">
                    {students.length === 0 ? (
                        <div className="py-12 text-center text-text-muted text-[13px]">
                            {t("reports.emptyMonthly")}
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {students.map((s, i) => (
                                <div key={s.id} className="px-4 py-3">
                                    <div className="flex items-center gap-3 min-w-0 mb-2">
                                        <span className="text-[13px] text-text-muted shrink-0">{i + 1}</span>
                                        <div className="min-w-0">
                                            <p className="text-[14px] font-bold text-text-primary truncate">{s.name}</p>
                                            <p className="text-[12px] text-text-muted mt-0.5">NIS: {s.nis}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 ml-8 items-center">
                                        {[
                                            { label: t("reports.present"), value: s.masuk, color: "#10B981" },
                                            { label: t("reports.permission"), value: s.izin, color: s.izin > 0 ? "#2E3391" : "#64748B" },
                                            { label: t("reports.statusPending"), value: s.tertunda, color: s.tertunda > 0 ? "#0EA5E9" : "#64748B" },
                                            { label: t("reports.statusSick"), value: s.sakit, color: s.sakit > 0 ? "#A855F7" : "#64748B" },
                                            { label: t("reports.statusAbsent"), value: s.alpha, color: s.alpha > 0 ? "#EF4444" : "#64748B" },
                                        ].map(({ label, value, color }) => (
                                            <div key={label} className="text-center">
                                                <p className="text-[16px] font-bold" style={{ color }}>
                                                    {value}
                                                </p>
                                                <p className="text-[10px] text-text-muted uppercase">{label}</p>
                                            </div>
                                        ))}
                                        <div className="text-center ml-auto">
                                            <p className="text-[16px] font-bold text-text-primary">{s.attendance_rate}%</p>
                                            <p className="text-[10px] text-text-muted uppercase">{t("reports.headerAttendance")}</p>
                                        </div>
                                        <div className="text-center ml-4">
                                            <p className="text-[16px] font-bold text-primary">{s.discipline_rate}%</p>
                                            <p className="text-[10px] text-text-muted uppercase">{t("reports.headerDiscipline")}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
