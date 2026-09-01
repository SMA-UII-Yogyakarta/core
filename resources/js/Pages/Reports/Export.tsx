import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { PageHeader, Pagination, NativeSelect, Input, Button, Table } from "@/Components";
import Modal from "@/Components/common/Modal";

interface ExportRow {
    no: number;
    name: string;
    class: string;
    masuk: number;
    izin: number;
    sakit: number;
    alpha: number;
    status?: string;
    waktu_keterangan?: string;
    photo_url?: string | null;
    photo_type?: "selfie" | "bukti" | null;
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
    const [currentPage, setCurrentPage] = useState(1);
    const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);
    const pageSize = 10;

    const months = [
        { value: 1, label: "Januari" },
        { value: 2, label: "Februari" },
        { value: 3, label: "Maret" },
        { value: 4, label: "April" },
        { value: 5, label: "Mei" },
        { value: 6, label: "Juni" },
        { value: 7, label: "Juli" },
        { value: 8, label: "Agustus" },
        { value: 9, label: "September" },
        { value: 10, label: "Oktober" },
        { value: 11, label: "November" },
        { value: 12, label: "Desember" },
    ];

    const totalPages = Math.ceil(preview.length / pageSize) || 1;
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const paginatedPreview = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return preview.slice(start, start + pageSize);
    }, [preview, safePage, pageSize]);

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

    return (
        <AppShell title="Laporan & Ekspor Global">
            <PageHeader
                title="Laporan & Ekspor Global"
                description="Rekapitulasi kehadiran siswa berdasarkan periode dan kategori kelas."
            />

            {/* Top Control Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 font-inter">
                {/* Left: Period Segmented Control (Pill Tabs) */}
                <div className="flex border border-border bg-surface rounded-xl p-1 shadow-xs max-w-md">
                    {PERIODS.map((p) => {
                        const isActive = selectedPeriod === p.key;
                        return (
                            <button
                                key={p.key}
                                type="button"
                                onClick={() => navigate(p.key)}
                                className={`flex-1 py-2 px-5 text-[13px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                                    isActive
                                        ? "bg-primary text-white shadow-xs"
                                        : "text-text-muted hover:text-text-primary hover:bg-muted"
                                }`}
                            >
                                {p.label}
                            </button>
                        );
                    })}
                </div>

                {/* Right: Dynamic Date/Filter Input + PDF & Excel Action Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Dynamic Period Input */}
                    {selectedPeriod === "harian" && (
                        <div className="w-44">
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => navigate("harian", { date: e.target.value })}
                                inputClassName="h-[40px] font-bold text-text-primary text-[13px] bg-surface border-border"
                            />
                        </div>
                    )}

                    {selectedPeriod === "bulanan" && (
                        <div className="flex items-center gap-2">
                            <div className="w-40">
                                <NativeSelect
                                    value={selectedClassId ?? ""}
                                    onChange={(e) => navigate("bulanan", { class_id: e.target.value || null })}
                                    className="h-[40px] bg-surface border-border"
                                >
                                    <option value="">Semua Kelas</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name.split(" (")[0]}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>
                            <div className="w-32">
                                <NativeSelect
                                    value={String(selectedMonth)}
                                    onChange={(e) => navigate("bulanan", { month: Number(e.target.value) })}
                                    className="h-[40px] bg-surface border-border"
                                >
                                    {months.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>
                        </div>
                    )}

                    {selectedPeriod === "semester" && (
                        <div className="flex items-center gap-2">
                            <div className="w-40">
                                <NativeSelect
                                    value={selectedClassId ?? ""}
                                    onChange={(e) => navigate("semester", { class_id: e.target.value || null })}
                                    className="h-[40px] bg-surface border-border"
                                >
                                    <option value="">Semua Kelas</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name.split(" (")[0]}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>
                            <div className="w-36">
                                <NativeSelect
                                    value={String(selectedSemester)}
                                    onChange={(e) => navigate("semester", { semester: Number(e.target.value) })}
                                    className="h-[40px] bg-surface border-border"
                                >
                                    <option value="1">Semester 1 (Ganjil)</option>
                                    <option value="2">Semester 2 (Genap)</option>
                                </NativeSelect>
                            </div>
                        </div>
                    )}

                    {/* Export Action Buttons using Semantic Variant Design Tokens */}
                    <Button
                        variant="danger"
                        onClick={() => {
                            window.location.href = pdfHref;
                        }}
                        className="h-[40px] px-4 font-bold text-[13px] shadow-xs rounded-xl"
                        icon={<i className="fas fa-file-pdf text-[13px]" />}
                    >
                        PDF
                    </Button>
                    <Button
                        variant="success"
                        onClick={() => {
                            window.location.href = excelHref;
                        }}
                        className="h-[40px] px-4 font-bold text-[13px] shadow-xs rounded-xl"
                        icon={<i className="fas fa-file-excel text-[13px]" />}
                    >
                        Excel
                    </Button>
                </div>
            </div>

            {/* Standalone Table Component with Pure Design Tokens */}
            <div className="w-full font-inter">
                {selectedPeriod === "harian" ? (
                    <Table<ExportRow>
                        columns={[
                            {
                                key: "no",
                                header: "No",
                                className: "w-12 text-center",
                                render: (r: ExportRow) => <span className="font-bold text-text-secondary text-[13px]">{r.no}</span>,
                            },
                            {
                                key: "name",
                                header: "Nama Lengkap",
                                className: "font-bold text-text-primary text-[14px] min-w-[180px]",
                                render: (r: ExportRow) => (
                                    <span className="font-bold text-text-primary text-[14px] whitespace-nowrap truncate block max-w-[240px] sm:max-w-[320px]" title={r.name}>
                                        {r.name}
                                    </span>
                                ),
                            },
                            {
                                key: "class",
                                header: "Kelas",
                                className: "font-semibold text-text-primary text-[13px] min-w-[90px]",
                                render: (r: ExportRow) => (
                                    <span className="font-semibold text-text-primary text-[13px] whitespace-nowrap truncate block max-w-[140px]" title={r.class}>
                                        {r.class}
                                    </span>
                                ),
                            },
                            {
                                key: "status",
                                header: "Status",
                                className: "w-40 text-center",
                                render: (r: ExportRow) => {
                                    const st = r.status ?? "ALPHA";
                                    if (st === "HADIR") {
                                        return (
                                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-success-bg text-success border border-success-light">
                                                HADIR
                                            </span>
                                        );
                                    }
                                    if (st === "TERLAMBAT") {
                                        return (
                                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-warning-bg text-warning border border-warning-light">
                                                TERLAMBAT
                                            </span>
                                        );
                                    }
                                    if (st === "BELUM VERIFIKASI") {
                                        return (
                                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-muted text-text-muted border border-dashed border-border">
                                                BELUM VERIFIKASI
                                            </span>
                                        );
                                    }
                                    if (st === "SAKIT") {
                                        return (
                                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-medical-bg text-medical border border-medical-light">
                                                SAKIT
                                            </span>
                                        );
                                    }
                                    if (st === "IZIN") {
                                        return (
                                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-permit-bg text-permit border border-permit-light">
                                                IZIN
                                            </span>
                                        );
                                    }
                                    return (
                                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-danger-bg text-danger border border-danger-light">
                                            ALPHA
                                        </span>
                                    );
                                },
                            },
                            {
                                key: "waktu",
                                header: "Waktu / Keterangan",
                                className: "text-[13px]",
                                render: (r: ExportRow) => {
                                    const st = r.status ?? "ALPHA";
                                    if (st === "TERLAMBAT") {
                                        return <span className="font-bold text-warning">{r.waktu_keterangan}</span>;
                                    }
                                    if (st === "BELUM VERIFIKASI") {
                                        return <span className="text-text-muted font-normal italic">{r.waktu_keterangan}</span>;
                                    }
                                    if (st === "HADIR") {
                                        return <span className="text-text-primary font-medium">{r.waktu_keterangan}</span>;
                                    }
                                    return <span className="text-text-muted font-normal">{r.waktu_keterangan}</span>;
                                },
                            },
                            {
                                key: "photo",
                                header: "Lihat Foto",
                                className: "w-36 text-center",
                                render: (r: ExportRow) => {
                                    if (r.photo_url) {
                                        const isSelfie = r.photo_type !== "bukti";
                                        return (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setPreviewPhoto({
                                                        url: r.photo_url ? `/storage-s3/${r.photo_url}` : "",
                                                        title: `${isSelfie ? "Foto Selfie" : "Foto Bukti"} - ${r.name}`,
                                                    })
                                                }
                                                className="mx-auto text-[12px]"
                                                icon={<i className={isSelfie ? "fas fa-camera text-[11px]" : "fas fa-file-alt text-[11px]"} />}
                                            >
                                                {isSelfie ? "Foto Selfie" : "Foto Bukti"}
                                            </Button>
                                        );
                                    }
                                    return <span className="text-text-muted text-[13px]">-</span>;
                                },
                            },
                        ]}
                        data={paginatedPreview}
                        keyExtractor={(r: ExportRow) => r.no}
                    />
                ) : (
                    <Table<ExportRow>
                        columns={[
                            {
                                key: "no",
                                header: "No",
                                className: "w-12 text-center",
                                render: (r: ExportRow) => <span className="font-bold text-text-secondary text-[13px]">{r.no}</span>,
                            },
                            {
                                key: "name",
                                header: "Nama Lengkap",
                                className: "font-bold text-text-primary text-[14px] min-w-[180px]",
                                render: (r: ExportRow) => (
                                    <span className="font-bold text-text-primary text-[14px] whitespace-nowrap truncate block max-w-[240px] sm:max-w-[320px]" title={r.name}>
                                        {r.name}
                                    </span>
                                ),
                            },
                            {
                                key: "class",
                                header: "Kelas",
                                className: "font-semibold text-text-primary text-[13px] min-w-[90px]",
                                render: (r: ExportRow) => (
                                    <span className="font-semibold text-text-primary text-[13px] whitespace-nowrap truncate block max-w-[140px]" title={r.class}>
                                        {r.class}
                                    </span>
                                ),
                            },
                            {
                                key: "masuk",
                                header: "Masuk",
                                className: "w-24 text-center font-bold text-text-primary text-[14px]",
                                render: (r: ExportRow) => r.masuk,
                            },
                            {
                                key: "izin",
                                header: "Izin",
                                className: "w-24 text-center text-[14px]",
                                render: (r: ExportRow) => (
                                    <span className={r.izin > 0 ? "font-extrabold text-primary" : "text-text-muted font-normal"}>
                                        {r.izin}
                                    </span>
                                ),
                            },
                            {
                                key: "sakit",
                                header: "Sakit",
                                className: "w-24 text-center text-[14px]",
                                render: (r: ExportRow) => (
                                    <span className={r.sakit > 0 ? "font-extrabold text-warning" : "text-text-muted font-normal"}>
                                        {r.sakit}
                                    </span>
                                ),
                            },
                            {
                                key: "alpha",
                                header: "Alpha",
                                className: "w-24 text-center text-[14px]",
                                render: (r: ExportRow) => (
                                    <span className={r.alpha > 0 ? "font-extrabold text-danger" : "text-text-muted font-normal"}>
                                        {r.alpha}
                                    </span>
                                ),
                            },
                        ]}
                        data={paginatedPreview}
                        keyExtractor={(r: ExportRow) => r.no}
                    />
                )}
            </div>

            {/* Symmetrical Footer Info & Full-Width Pagination Bar with Design Tokens */}
            <div className="mt-4 pt-3 border-t border-border flex flex-col gap-3 font-inter">
                <div className="flex items-center gap-2 text-[12px] text-text-muted font-medium">
                    <i className="fas fa-info-circle text-primary text-[14px] shrink-0" />
                    <span>Tampilan kolom menyesuaikan secara otomatis berdasarkan filter periode yang dipilih (Saat ini: {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}).</span>
                </div>
                {preview.length > pageSize && (
                    <Pagination
                        currentPage={safePage}
                        totalPages={totalPages}
                        totalItems={preview.length}
                        perPage={pageSize}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            {/* Photo Preview Modal */}
            <Modal
                open={Boolean(previewPhoto)}
                onClose={() => setPreviewPhoto(null)}
                title={previewPhoto?.title ?? "Pratinjau Foto"}
                width="md"
            >
                {previewPhoto?.url ? (
                    <div className="flex flex-col items-center justify-center p-2">
                        <img
                            src={previewPhoto.url}
                            alt="Foto Presensi"
                            className="max-h-[450px] w-auto rounded-xl object-contain border border-border shadow-md"
                        />
                    </div>
                ) : (
                    <div className="p-8 text-center text-text-muted">Foto tidak tersedia.</div>
                )}
            </Modal>
        </AppShell>
    );
}