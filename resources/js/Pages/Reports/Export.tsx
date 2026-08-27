import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { PageHeader, Card, ExportButtonGroup, Pagination, SearchBar, StickyContainer, NativeSelect, Table } from "@/Components";
import type { Column } from "@/Components/ui/Table";
import { FiInfo } from "react-icons/fi";

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
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const filteredPreview = useMemo(() => {
        if (!search.trim()) return preview;
        const s = search.toLowerCase();
        return preview.filter(
            (r) => r.name.toLowerCase().includes(s) || r.class.toLowerCase().includes(s),
        );
    }, [preview, search]);

    const totalPages = Math.ceil(filteredPreview.length / pageSize) || 1;
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const paginatedPreview = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return filteredPreview.slice(start, start + pageSize);
    }, [filteredPreview, safePage, pageSize]);

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
        router.get(
            "/export",
            { ...buildQuery(period), ...overrides },
            { preserveScroll: true, replace: true, preserveState: true },
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

    const exportColumns: Column<ExportRow>[] = [
        {
            key: "no",
            header: "No",
            className: "w-10 text-center whitespace-nowrap",
            render: (row) => <span className="text-[13px] sm:text-[14px] text-text-primary">{row.no}</span>,
        },
        {
            key: "name",
            header: "Nama Lengkap",
            className: "whitespace-nowrap",
            render: (row) => (
                <span className="text-[13px] sm:text-[14px] font-bold text-text-primary block truncate" title={row.name}>
                    {row.name}
                </span>
            ),
        },
        {
            key: "class",
            header: "Kelas",
            className: "whitespace-nowrap",
            render: (row) => <span className="text-[13px] sm:text-[14px] text-text-primary">{row.class}</span>,
        },
        {
            key: "masuk",
            header: "Masuk",
            className: "text-center whitespace-nowrap",
            render: (row) => <span className="text-[13px] sm:text-[14px] text-text-primary font-medium">{row.masuk}</span>,
        },
        {
            key: "izin",
            header: "Izin",
            className: "text-center whitespace-nowrap",
            render: (row) => (
                <span className={`text-[13px] sm:text-[14px] font-medium ${row.izin > 0 ? "text-primary font-bold" : "text-text-primary"}`}>
                    {row.izin}
                </span>
            ),
        },
        {
            key: "sakit",
            header: "Sakit",
            className: "text-center whitespace-nowrap",
            render: (row) => (
                <span className={`text-[13px] sm:text-[14px] font-medium ${row.sakit > 0 ? "text-warning font-bold" : "text-text-primary"}`}>
                    {row.sakit}
                </span>
            ),
        },
        {
            key: "alpha",
            header: "Alpha",
            className: "text-center whitespace-nowrap",
            render: (row) => (
                <span className={`text-[13px] sm:text-[14px] font-medium ${row.alpha > 0 ? "text-danger font-bold" : "text-text-primary"}`}>
                    {row.alpha}
                </span>
            ),
        },
    ];

    return (
        <AppShell title="Laporan Rekap">
            <div className="space-y-4 pb-20 lg:pb-8">
                {/* Page Header */}
                <PageHeader
                    title="Laporan & Ekspor Global"
                    description="Rekapitulasi kehadiran siswa berdasarkan periode dan kategori kelas."
                />

                {/* Sticky Filter Bar & Period Tabs */}
                <StickyContainer>
                    {/* Top Row: Period Tabs + Unduh Laporan Button */}
                    <div className="flex items-center justify-between gap-2 mb-1 lg:mb-2">
                        {/* Period Segmented Control */}
                        <div className="flex p-1 bg-muted rounded-xl h-11 items-center flex-1 max-w-[280px] sm:max-w-sm">
                            {PERIODS.map((p) => {
                                const isActive = selectedPeriod === p.key;
                                return (
                                    <button
                                        key={p.key}
                                        type="button"
                                        onClick={() => navigate(p.key)}
                                        className={`flex-1 h-9 px-2 sm:px-5 rounded-lg text-[12px] sm:text-[14px] font-semibold font-inter transition-all cursor-pointer whitespace-nowrap ${
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

                        {/* Export Button Inline Next to Tabs */}
                        <ExportButtonGroup
                            className="shrink-0"
                            size="md"
                            onExportExcel={() => {
                                window.location.href = excelHref;
                            }}
                            onExportPdf={() => {
                                window.location.href = pdfHref;
                            }}
                        />
                    </div>

                    {/* Toolbar: Search Input + Class Filter (Side-by-side on mobile & desktop) */}
                    <div className="flex items-center justify-between gap-2.5 pb-1 mb-1">
                        {/* Search Input */}
                        <div className="flex-1 min-w-0">
                            <SearchBar
                                value={search}
                                onChange={(val) => {
                                    setSearch(val);
                                    setCurrentPage(1);
                                }}
                                onSearch={() => setCurrentPage(1)}
                                placeholder="Cari nama atau kelas..."
                            />
                        </div>

                        {/* Class Filter */}
                        <div className="w-[135px] sm:w-[180px] shrink-0">
                            <NativeSelect
                                value={selectedClassId ?? ""}
                                onChange={(e) => navigate(selectedPeriod, { class_id: e.target.value || null })}
                                className="w-full"
                            >
                                <option value="">Semua Kelas</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>
                    </div>
                </StickyContainer>

                {/* Preview Table */}
                <Card className="rounded-2xl shadow-dropdown border border-border overflow-hidden">
                    <Table
                        columns={exportColumns}
                        data={paginatedPreview}
                        keyExtractor={(row) => row.no}
                        emptyMessage={search ? "Tidak ditemukan siswa yang cocok dengan pencarian." : "Tidak ada data."}
                    />

                    {/* Pagination Bar */}
                    {filteredPreview.length > pageSize && (
                        <div className="p-4 border-t border-border bg-surface">
                            <Pagination
                                currentPage={safePage}
                                totalPages={totalPages}
                                totalItems={filteredPreview.length}
                                perPage={pageSize}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}

                    <Card.Footer className="bg-surface flex items-center justify-between gap-2 text-text-muted text-[12px] font-inter">
                        <div className="flex items-center gap-2">
                            <FiInfo />
                            <span>Tampilan kolom menyesuaikan otomatis berdasarkan filter periode.</span>
                        </div>
                        <span>Menampilkan {paginatedPreview.length} dari {filteredPreview.length} siswa</span>
                    </Card.Footer>
                </Card>
            </div>
        </AppShell>
    );
}
