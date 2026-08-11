import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";

interface ExportRow {
    no: number;
    name: string;
    class: string;
    masuk: number;
    izin: number;
    sakit: number;
    alpha: number;
}

interface SchoolClass {
    id: number;
    name: string;
}

type Period = "harian" | "bulanan" | "semester";

interface ExportPageProps {
    classes: SchoolClass[];
    preview: ExportRow[];
    selectedPeriod: Period;
    selectedDate: string;
    selectedMonth: number;
    selectedYear: number;
    selectedSemester: number;
    selectedClassId: number | null;
}

const PERIODS: { key: Period; label: string }[] = [
    { key: "harian", label: "Harian" },
    { key: "bulanan", label: "Bulanan" },
    { key: "semester", label: "Semester" },
];

const MONTHS = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
];

const toQuery = (obj: Record<string, string | number | null | undefined>) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined && v !== null && v !== "") {
            params.set(k, String(v));
        }
    }
    return params.toString();
};

export default function ExportPage({
    classes,
    preview,
    selectedPeriod,
    selectedDate,
    selectedMonth,
    selectedYear,
    selectedSemester,
    selectedClassId,
}: ExportPageProps) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => currentYear - i);

    const buildQuery = (period: Period) => {
        const q: Record<string, string | number | null | undefined> = {
            period,
            class_id: selectedClassId ?? null,
        };
        if (period === "harian") {
            q.date = selectedDate;
        } else if (period === "bulanan") {
            q.month = selectedMonth;
            q.year = selectedYear;
        } else {
            q.semester = selectedSemester;
            q.year = selectedYear;
        }
        return q;
    };

    const navigate = (
        period: Period,
        overrides: Record<string, string | number | null | undefined> = {},
    ) => {
        router.get(
            "/export",
            { ...buildQuery(period), ...overrides },
            { preserveScroll: true, replace: true },
        );
    };

    const qCommon = { class_id: selectedClassId ? String(selectedClassId) : null };
    const harianQuery = toQuery({ date: selectedDate, ...qCommon });
    const bulananQuery = toQuery({ month: String(selectedMonth), year: String(selectedYear), ...qCommon });
    const semesterQuery = toQuery({ semester: String(selectedSemester), year: String(selectedYear), ...qCommon });

    const excelHref =
        selectedPeriod === "harian"
            ? `/export/daily-recap?${harianQuery}`
            : selectedPeriod === "bulanan"
                ? `/export/monthly-recap?${bulananQuery}`
                : `/export/semester-recap?${semesterQuery}`;

    const pdfHref =
        selectedPeriod === "harian"
            ? `/export/daily-recap-pdf?${harianQuery}`
            : selectedPeriod === "bulanan"
                ? `/export/monthly-recap-pdf?${bulananQuery}`
                : `/export/semester-recap-pdf?${semesterQuery}`;

    const selectClassName =
        "h-[40px] w-full px-[19px] pr-[31px] border border-border rounded-lg text-[13.8px] font-inter text-black bg-[#EFEFEF] focus:outline-none focus:ring-2 focus:ring-primary/30";

    return (
        <AppShell title="Laporan Rekap">
            <div className="space-y-6">
                {/* Header */}
                <div className="pb-[25px]">
                    <h1 className="font-brand text-[28px] leading-[34px] font-bold text-text-primary">
                        Laporan &amp; Ekspor Global
                    </h1>
                    <p className="mt-1 text-[14px] leading-[17px] text-text-muted font-inter">
                        Rekapitulasi kehadiran siswa berdasarkan periode dan kategori kelas.
                    </p>
                </div>

                {/* Filter Bar */}
                <section className="bg-surface border border-border rounded-2xl shadow-dropdown p-[15px_20px]">
                    <div className="flex flex-col lg:flex-row lg:items-center flex-wrap gap-4">
                        {/* Period Segmented Control */}
                        <div className="flex gap-[5px] lg:gap-[15px]">
                            {PERIODS.map((p) => {
                                const isActive = selectedPeriod === p.key;
                                return (
                                    <button
                                        key={p.key}
                                        type="button"
                                        onClick={() => navigate(p.key)}
                                        className={`h-[40px] px-6 rounded-lg text-[13.3px] font-semibold font-inter transition-colors cursor-pointer ${
                                            isActive
                                                ? "bg-primary text-white border border-primary"
                                                : "bg-surface text-text-muted border border-border hover:text-text-primary"
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Period-Specific Params */}
                        {selectedPeriod === "harian" && (
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => navigate("harian", { date: e.target.value })}
                                className="h-[40px] px-[19px] border border-border rounded-lg text-[13.8px] font-inter text-text-primary bg-[#EFEFEF] focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        )}

                        {selectedPeriod === "bulanan" && (
                            <div className="flex flex-wrap gap-3">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => navigate("bulanan", { month: Number(e.target.value) })}
                                    className={selectClassName}
                                >
                                    {MONTHS.map((m, i) => (
                                        <option key={m} value={i + 1}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => navigate("bulanan", { year: Number(e.target.value) })}
                                    className={selectClassName}
                                >
                                    {years.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectedPeriod === "semester" && (
                            <div className="flex flex-wrap gap-3">
                                <select
                                    value={selectedSemester}
                                    onChange={(e) => navigate("semester", { semester: Number(e.target.value) })}
                                    className={selectClassName}
                                >
                                    <option value={1}>Semester Ganjil</option>
                                    <option value={2}>Semester Genap</option>
                                </select>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => navigate("semester", { year: Number(e.target.value) })}
                                    className={selectClassName}
                                >
                                    {years.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Class Filter */}
                        <select
                            value={selectedClassId ?? ""}
                            onChange={(e) =>
                                navigate(selectedPeriod, { class_id: e.target.value || null })
                            }
                            className={`${selectClassName} w-full lg:w-[200px]`}
                        >
                            <option value="">Semua Kelas</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        {/* PDF + Excel */}
                        <div className="flex gap-3 lg:ml-auto">
                            <a
                                href={pdfHref}
                                className="inline-flex items-center gap-2 h-[40px] px-6 rounded-lg bg-danger text-white text-[13.3px] font-semibold font-inter hover:bg-danger/90 transition-colors"
                            >
                                <i className="fas fa-file-pdf text-[13px]" />
                                PDF
                            </a>
                            <a
                                href={excelHref}
                                className="inline-flex items-center gap-2 h-[40px] px-6 rounded-lg bg-success text-white text-[13.3px] font-semibold font-inter hover:bg-success/90 transition-colors"
                            >
                                <i className="fas fa-file-excel text-[13px]" />
                                Excel
                            </a>
                        </div>
                    </div>
                </section>

                {/* Preview Table */}
                <section className="bg-surface border border-border rounded-2xl shadow-dropdown overflow-hidden">
                    <div className="max-h-[350px] overflow-auto">
                        <table className="w-full font-inter">
                            <thead className="sticky top-0">
                                <tr className="bg-muted">
                                    <th className="px-[15px] py-[12px] text-center text-[12px] font-semibold text-text-muted w-[50px]">
                                        No
                                    </th>
                                    <th className="px-[15px] py-[12px] text-left text-[12px] font-semibold text-text-muted">
                                        Nama Lengkap
                                    </th>
                                    <th className="px-[15px] py-[12px] text-left text-[12px] font-semibold text-text-muted w-[130px]">
                                        Kelas
                                    </th>
                                    <th className="px-[15px] py-[12px] text-center text-[12px] font-semibold text-text-muted w-[90px]">
                                        Masuk
                                    </th>
                                    <th className="px-[15px] py-[12px] text-center text-[12px] font-semibold text-text-muted w-[80px]">
                                        Izin
                                    </th>
                                    <th className="px-[15px] py-[12px] text-center text-[12px] font-semibold text-text-muted w-[80px]">
                                        Sakit
                                    </th>
                                    <th className="px-[15px] py-[12px] text-center text-[12px] font-semibold text-text-muted w-[80px]">
                                        Alpha
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-12 text-center text-text-inactive text-[14px]"
                                        >
                                            Tidak ada data.
                                        </td>
                                    </tr>
                                ) : (
                                    preview.map((row) => (
                                        <tr
                                            key={row.no}
                                            className="border-t border-border hover:bg-muted/50 transition-colors"
                                        >
                                            <td className="px-[15px] py-[11px] text-center text-[14px] text-text-primary">
                                                {row.no}
                                            </td>
                                            <td className="px-[15px] py-[11px] text-[14px] text-text-primary">
                                                {row.name}
                                            </td>
                                            <td className="px-[15px] py-[11px] text-[14px] text-text-primary">
                                                {row.class}
                                            </td>
                                            <td className="px-[15px] py-[11px] text-center text-[14px] text-text-primary font-medium">
                                                {row.masuk}
                                            </td>
                                            <td
                                                className={`px-[15px] py-[11px] text-center text-[14px] font-medium ${
                                                    row.izin > 0
                                                        ? "text-primary"
                                                        : "text-text-primary"
                                                }`}
                                            >
                                                {row.izin}
                                            </td>
                                            <td
                                                className={`px-[15px] py-[11px] text-center text-[14px] font-medium ${
                                                    row.sakit > 0
                                                        ? "text-warning"
                                                        : "text-text-primary"
                                                }`}
                                            >
                                                {row.sakit}
                                            </td>
                                            <td
                                                className={`px-[15px] py-[11px] text-center text-[14px] font-medium ${
                                                    row.alpha > 0
                                                        ? "text-danger"
                                                        : "text-text-primary"
                                                }`}
                                            >
                                                {row.alpha}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AppShell>
    );
}
