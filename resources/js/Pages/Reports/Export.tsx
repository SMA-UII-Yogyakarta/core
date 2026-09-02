import { useState, useMemo, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/Layouts/AppShell";
import {
    PageHeader,
    Pagination,
    NativeSelect,
    Table,
    TableFooter,
    Input,
    Button,
    Modal,
    TabSwitcher,
} from "@/Components";
import {
    FiFileText,
    FiDownload,
    FiChevronDown,
} from "react-icons/fi";

interface ExportRow {
    no: number;
    name: string;
    class: string;
    present: number;
    permission: number;
    sick: number;
    absent: number;
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
    const [imgLoadError, setImgLoadError] = useState(false);
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setExportDropdownOpen(false);
            }
        };
        if (exportDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [exportDropdownOpen]);

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
        const currentQ = buildQuery(period);
        const merged = { ...currentQ, ...overrides };
        setCurrentPage(1);
        router.get("/export", merged, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const harianQuery = toQuery({
        period: "harian",
        date: selectedDate,
        class_id: selectedClassId ?? null,
    });

    const bulananQuery = toQuery({
        period: "bulanan",
        month: selectedMonth,
        year: selectedYear,
        class_id: selectedClassId ?? null,
    });

    const semesterQuery = toQuery({
        period: "semester",
        semester: selectedSemester,
        year: selectedYear,
        class_id: selectedClassId ?? null,
    });

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
        <AppShell title="Laporan & Ekspor Global" showSearch={false} showBottomNav={false}>
            <PageHeader
                title="Laporan & Ekspor Global"
                description="Rekapitulasi kehadiran siswa berdasarkan periode dan kategori kelas."
                className="shrink-0 mb-4"
            >
                {/* Modern Elegant Export Dropdown Button */}
                <div className="relative shrink-0" ref={dropdownRef}>
                    <Button
                        variant="primary"
                        onClick={() => setExportDropdownOpen((prev) => !prev)}
                        className="h-10 px-4 font-bold text-[13px] shadow-xs rounded-xl shrink-0 flex items-center gap-2"
                        icon={<FiDownload className="text-[14px]" />}
                    >
                        <span>Ekspor Laporan</span>
                        <FiChevronDown
                            className={`text-[14px] transition-transform duration-200 ${
                                exportDropdownOpen ? "rotate-180" : ""
                            }`}
                        />
                    </Button>

                    {/* Animated Dropdown Menu */}
                    <AnimatePresence>
                        {exportDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute right-0 mt-2 w-64 bg-surface rounded-xl border border-border shadow-dropdown p-1.5 z-50 flex flex-col gap-1 font-inter"
                            >
                                <a
                                    href={pdfHref}
                                    onClick={() => setExportDropdownOpen(false)}
                                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/70 transition-colors group cursor-pointer text-left"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-danger-bg text-danger flex items-center justify-center text-[15px] shrink-0 border border-danger/10 group-hover:scale-105 transition-transform">
                                        <i className="fas fa-file-pdf" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13px] font-bold text-text-primary group-hover:text-danger transition-colors">
                                            Dokumen PDF
                                        </p>
                                        <p className="text-[11px] text-text-muted truncate">
                                            Format cetak resmi (.pdf)
                                        </p>
                                    </div>
                                </a>

                                <a
                                    href={excelHref}
                                    onClick={() => setExportDropdownOpen(false)}
                                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/70 transition-colors group cursor-pointer text-left"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-success-bg text-success flex items-center justify-center text-[15px] shrink-0 border border-success/10 group-hover:scale-105 transition-transform">
                                        <i className="fas fa-file-excel" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13px] font-bold text-text-primary group-hover:text-success transition-colors">
                                            Spreadsheet Excel
                                        </p>
                                        <p className="text-[11px] text-text-muted truncate">
                                            Format olah data (.xlsx)
                                        </p>
                                    </div>
                                </a>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </PageHeader>

            {/* Responsive Toolbar: Left = Period Tabs, Right = Dynamic Filter Dropdowns */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0 font-inter">
                {/* Left: Period Segmented Control (Pill Tabs) */}
                <TabSwitcher
                    tabs={PERIODS.map((p) => ({ key: p.key, label: p.label }))}
                    activeKey={selectedPeriod}
                    onChange={(key) => navigate(key as "harian" | "bulanan" | "semester")}
                    variant="segmented"
                />

                {/* Right: Dynamic Filters (Semua Kelas, Bulan/Tahun) */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
                    {selectedPeriod === "harian" && (
                        <div className="w-full sm:w-44">
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => navigate("harian", { date: e.target.value })}
                                inputClassName="h-10 font-bold text-text-primary text-[13px] bg-surface border-border"
                            />
                        </div>
                    )}

                    {selectedPeriod === "bulanan" && (
                        <>
                            <div className="w-36">
                                <NativeSelect
                                    value={selectedClassId ?? ""}
                                    onChange={(e) => navigate("bulanan", { class_id: e.target.value || null })}
                                    className="h-10 bg-surface border-border font-medium text-[13px]"
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
                                    className="h-10 bg-surface border-border font-medium text-[13px]"
                                >
                                    {months.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>
                        </>
                    )}

                    {selectedPeriod === "semester" && (
                        <>
                            <div className="w-36">
                                <NativeSelect
                                    value={selectedClassId ?? ""}
                                    onChange={(e) => navigate("semester", { class_id: e.target.value || null })}
                                    className="h-10 bg-surface border-border font-medium text-[13px]"
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
                                    className="h-10 bg-surface border-border font-medium text-[13px]"
                                >
                                    <option value="1">Semester 1 (Ganjil)</option>
                                    <option value="2">Semester 2 (Genap)</option>
                                </NativeSelect>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Standalone Table Component with Pure Design Tokens */}
            <div className="w-full flex-1 min-h-0 flex flex-col justify-between gap-3 font-inter">
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
                                    if (st === "HADIR") {
                                        return <span className="font-bold text-text-primary">{r.waktu_keterangan}</span>;
                                    }
                                    if (st === "SAKIT" || st === "IZIN") {
                                        return (
                                            <span className="text-text-secondary italic">
                                                {r.waktu_keterangan || "Tidak ada catatan"}
                                            </span>
                                        );
                                    }
                                    return <span className="text-text-muted italic">Tidak ada presensi</span>;
                                },
                            },
                            {
                                key: "bukti",
                                header: "Foto / Lampiran",
                                className: "w-36 text-center",
                                render: (r: ExportRow) => {
                                    if (r.photo_url) {
                                        const isSelfie = r.photo_type === "selfie";
                                        return (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setPreviewPhoto({
                                                        url: r.photo_url!,
                                                        title: isSelfie ? `Foto Selfie - ${r.name}` : `Bukti Surat - ${r.name}`,
                                                    })
                                                }
                                                className="text-[12px] font-bold text-primary hover:bg-primary-light h-8 px-3 rounded-lg inline-flex items-center gap-1.5"
                                                icon={<i className={isSelfie ? "fas fa-camera text-[11px]" : "fas fa-paperclip text-[11px]"} />}
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
                        containerClassName="flex-1 min-h-0 overflow-auto bg-surface"
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
                                key: "present",
                                header: "Masuk",
                                className: "w-24 text-center font-bold text-text-primary text-[14px]",
                                render: (r: ExportRow) => r.present,
                            },
                            {
                                key: "permission",
                                header: "Izin",
                                className: "w-24 text-center text-[14px]",
                                render: (r: ExportRow) => (
                                    <span className={r.permission > 0 ? "font-extrabold text-primary" : "text-text-muted font-normal"}>
                                        {r.permission}
                                    </span>
                                ),
                            },
                            {
                                key: "sick",
                                header: "Sakit",
                                className: "w-24 text-center text-[14px]",
                                render: (r: ExportRow) => (
                                    <span className={r.sick > 0 ? "font-extrabold text-warning" : "text-text-muted font-normal"}>
                                        {r.sick}
                                    </span>
                                ),
                            },
                            {
                                key: "absent",
                                header: "Alpha",
                                className: "w-24 text-center text-[14px]",
                                render: (r: ExportRow) => (
                                    <span className={r.absent > 0 ? "font-extrabold text-danger" : "text-text-muted font-normal"}>
                                        {r.absent}
                                    </span>
                                ),
                            },
                        ]}
                        data={paginatedPreview}
                        keyExtractor={(r: ExportRow) => r.no}
                        containerClassName="flex-1 min-h-0 overflow-auto bg-surface"
                    />
                )}
            </div>

            {/* Standardized Reusable Symmetrical Table Footer */}
            <TableFooter
                info={`Tampilan kolom menyesuaikan secara otomatis berdasarkan filter periode yang dipilih (Saat ini: ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}).`}
                pagination={
                    preview.length > pageSize ? (
                        <Pagination
                            currentPage={safePage}
                            totalPages={totalPages}
                            totalItems={preview.length}
                            perPage={pageSize}
                            onPageChange={setCurrentPage}
                            className="!w-auto !gap-3"
                        />
                    ) : undefined
                }
            />

            {/* Photo Preview Modal */}
            <Modal
                open={Boolean(previewPhoto)}
                onClose={() => {
                    setPreviewPhoto(null);
                    setImgLoadError(false);
                }}
                title={previewPhoto?.title || "Lampiran Presensi"}
            >
                {previewPhoto && (
                    <div className="flex flex-col items-center">
                        {imgLoadError ? (
                            <div className="w-full py-12 px-6 flex flex-col items-center justify-center text-center bg-muted/50 rounded-xl border border-dashed border-border">
                                <FiFileText className="w-12 h-12 text-text-muted mb-3" />
                                <p className="font-semibold text-text-primary text-[14px]">
                                    Berkas Belum Tersedia di Storage
                                </p>
                                <p className="text-[12px] text-text-muted mt-1 max-w-sm">
                                    File foto atau dokumen lampiran belum diunggah atau tidak ditemukan di penyimpanan objek.
                                </p>
                            </div>
                        ) : (
                            <img
                                src={previewPhoto.url}
                                alt={previewPhoto.title}
                                onError={() => setImgLoadError(true)}
                                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-md border border-border"
                            />
                        )}
                        <div className="mt-4 flex justify-end w-full">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setPreviewPhoto(null);
                                    setImgLoadError(false);
                                }}
                            >
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </AppShell>
    );
}
