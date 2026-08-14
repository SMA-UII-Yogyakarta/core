import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { PageHeader, Card, ExportButtonGroup } from "@/Components";

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

    const navigate = (period: Period, overrides: Record<string, string | number | null | undefined> = {}) => {
        router.get("/export", { ...buildQuery(period), ...overrides }, { preserveScroll: true, replace: true });
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
        "h-[40px] w-full px-[19px] pr-[31px] rounded-lg text-[13.8px] font-inter text-text-primary bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30 border-transparent focus:border-transparent";

    return (
        <AppShell title="Laporan Rekap">
            <div className="space-y-6">
                {/* Page Header */}
                <PageHeader
                    title="Laporan & Ekspor Global"
                    description="Rekapitulasi kehadiran siswa berdasarkan periode dan kategori kelas."
                />

                {/* Filter Bar — Flat & Seamless */}
                <div className="flex flex-col lg:flex-row lg:items-center flex-wrap gap-4">
                    {/* Period Segmented Control */}
                    <div className="flex w-full lg:w-auto p-1 bg-muted rounded-[10px] h-[40px] items-center">
                        {PERIODS.map((p) => {
                            const isActive = selectedPeriod === p.key;
                            return (
                                <button
                                    key={p.key}
                                    type="button"
                                    onClick={() => navigate(p.key)}
                                    className={`flex-1 lg:flex-none h-[32px] px-3 lg:px-6 rounded-md text-[13px] font-semibold font-inter transition-all cursor-pointer ${
                                        isActive
                                            ? "bg-surface text-primary shadow-sm font-bold border border-border/10"
                                            : "bg-transparent text-text-muted hover:text-text-primary"
                                    }`}
                                >
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Side: Class Filter + Export Buttons */}
                    <div className="flex flex-col lg:flex-row w-full lg:w-auto gap-4 lg:gap-3 lg:ml-auto">
                        {/* Class Filter */}
                        <select
                            value={selectedClassId ?? ""}
                            onChange={(e) => navigate(selectedPeriod, { class_id: e.target.value || null })}
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
                        <ExportButtonGroup
                            onExportExcel={() => {
                                window.location.href = excelHref;
                            }}
                            onExportPdf={() => {
                                window.location.href = pdfHref;
                            }}
                        />
                    </div>
                </div>

                {/* Preview Table */}
                <Card className="rounded-2xl shadow-dropdown border border-border">
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
                                    <th className="hidden md:table-cell px-[15px] py-[12px] text-center text-[12px] font-semibold text-text-muted w-[80px]">
                                        Izin
                                    </th>
                                    <th className="hidden md:table-cell px-[15px] py-[12px] text-center text-[12px] font-semibold text-text-muted w-[80px]">
                                        Sakit
                                    </th>
                                    <th className="hidden md:table-cell px-[15px] py-[12px] text-center text-[12px] font-semibold text-text-muted w-[80px]">
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
                                            <td className="px-[15px] py-[11px] text-[14px] font-bold text-text-primary">
                                                {row.name}
                                            </td>
                                            <td className="px-[15px] py-[11px] text-[14px] text-text-primary">
                                                {row.class}
                                            </td>
                                            <td className="px-[15px] py-[11px] text-center text-[14px] text-text-primary font-medium">
                                                {row.masuk}
                                            </td>
                                            <td
                                                className={`hidden md:table-cell px-[15px] py-[11px] text-center text-[14px] font-medium ${
                                                    row.izin > 0 ? "text-primary" : "text-text-primary"
                                                }`}
                                            >
                                                {row.izin}
                                            </td>
                                            <td
                                                className={`hidden md:table-cell px-[15px] py-[11px] text-center text-[14px] font-medium ${
                                                    row.sakit > 0 ? "text-warning" : "text-text-primary"
                                                }`}
                                            >
                                                {row.sakit}
                                            </td>
                                            <td
                                                className={`hidden md:table-cell px-[15px] py-[11px] text-center text-[14px] font-medium ${
                                                    row.alpha > 0 ? "text-danger" : "text-text-primary"
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
                    <Card.Footer className="bg-white flex items-center gap-2 text-[#94A3B8] text-[12px] font-inter">
                        <i className="fas fa-info-circle"></i>
                        Tampilan kolom akan menyesuaikan secara otomatis berdasarkan filter periode yang dipilih.
                    </Card.Footer>
                </Card>
            </div>
        </AppShell>
    );
}
