import { useState, useMemo, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/Layouts/AppShell";
import {
    PageHeader,
    MobileNativePagination,
    NativeSelect,
    Table,
    TableFooter,
    Input,
    Button,
    Modal,
    TabSwitcher,
    BottomSheet,
    FilterPopover,
} from "@/Components";
import Drawer from "@/Components/common/Drawer";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useClientPagination } from "@/hooks/useClientPagination";
import { INDONESIAN_MONTHS } from "@/utils/helpers";
import {
    FiFileText,
    FiGrid,
    FiDownload,
    FiChevronDown,
    FiClock,
    FiCamera,
    FiPaperclip,
    FiFilter,
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
    const {
        safePage,
        totalPages,
        paginatedData: paginatedPreview,
        setCurrentPage,
        pageSize,
    } = useClientPagination(preview, 1, 10);
    const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);
    const [imgLoadError, setImgLoadError] = useState(false);
    const [exportDrawerOpen, setExportDrawerOpen] = useState(false);
    const desktopDropdownRef = useRef<HTMLDivElement>(null);
    const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
    const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);
    const isSmOrLarger = useMediaQuery("(min-width: 640px)");
    const [prevIsSmOrLarger, setPrevIsSmOrLarger] = useState(isSmOrLarger);

    // Seamlessly transition open export menu between mobile Bottom Drawer and tablet/desktop Dropdown upon viewport stretch/shrink
    if (prevIsSmOrLarger !== isSmOrLarger) {
        setPrevIsSmOrLarger(isSmOrLarger);
        if (isSmOrLarger) {
            if (exportDrawerOpen) {
                setExportDrawerOpen(false);
                setDesktopDropdownOpen(true);
            }
        } else {
            if (desktopDropdownOpen) {
                setDesktopDropdownOpen(false);
                setExportDrawerOpen(true);
            }
        }
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(e.target as Node)) {
                setDesktopDropdownOpen(false);
            }
        };
        if (desktopDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [desktopDropdownOpen]);

    const months = useMemo(
        () => INDONESIAN_MONTHS.map((label, idx) => ({ value: idx + 1, label })),
        []
    );

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

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const hasActiveFilters = Boolean(selectedClassId);

    // ── Header Actions (Mobile buttons trigger Filter & Export Bottom Drawers) ──
    const headerActions = (
        <div className="flex items-center gap-2 sm:hidden font-inter">
            <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                    hasActiveFilters
                        ? "bg-primary text-white"
                        : "bg-muted/60 text-text-primary hover:bg-muted"
                }`}
                title="Filter Laporan"
                aria-label="Filter Laporan"
            >
                <FiFilter className="text-[14px]" />
            </button>
            <button
                type="button"
                onClick={() => setExportDrawerOpen(true)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-primary transition-all hover:brightness-95 active:scale-95 cursor-pointer shadow-xs"
                aria-label="Ekspor Laporan"
                title="Ekspor Laporan"
                data-testid="btn-export-mobile"
            >
                <FiDownload className="text-[15px]" />
            </button>
        </div>
    );

    const getStatusBadge = (status?: string) => {
        const st = status ?? "ALPHA";
        if (st === "HADIR") {
            return (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
                    HADIR
                </span>
            );
        }
        if (st === "TERLAMBAT") {
            return (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
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
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200">
                    SAKIT
                </span>
            );
        }
        if (st === "IZIN") {
            return (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-purple-50 text-purple-700 border border-purple-200">
                    IZIN
                </span>
            );
        }
        return (
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-red-50 text-red-700 border border-red-200">
                ALPHA
            </span>
        );
    };

    return (
        <AppShell
            title="Laporan & Ekspor Global"
            hasTopTabs={true}
            showSearch={false}
            showNotificationBellOnMobile={false}
            headerActions={headerActions}
        >
            {/* Desktop PageHeader (hidden on mobile & tablet, only visible on lg+) */}
            <PageHeader
                title="Laporan & Ekspor Global"
                description="Rekapitulasi kehadiran siswa berdasarkan periode dan kategori kelas."
                className="hidden lg:flex shrink-0 mb-4"
            />

            {/* ── TABLET & DESKTOP TOOLBAR (>= sm) ─────────────────────────── */}
            <div className="hidden sm:flex flex-row items-center justify-between gap-3 mb-4 shrink-0 font-inter">
                {/* Left: Period Segmented Control (Pill Tabs) */}
                <div className="min-w-0 overflow-x-auto no-scrollbar">
                    <TabSwitcher
                        tabs={PERIODS}
                        activeKey={selectedPeriod}
                        onChange={(key) => navigate(key as Period)}
                        variant="segmented"
                    />
                </div>

                {/* Right: Yellow Filter Popover & Export Action Button */}
                <div className="flex items-center gap-2.5 shrink-0 ml-auto">
                    <FilterPopover
                        open={isDesktopFilterOpen}
                        onClose={() => setIsDesktopFilterOpen(false)}
                        align="right"
                        trigger={
                            <Button
                                variant="accent"
                                size="sm"
                                onClick={() => setIsDesktopFilterOpen((prev) => !prev)}
                                icon={<FiFilter className="text-[13px]" />}
                                className="h-10 px-4 text-[13px] font-bold rounded-xl shrink-0 whitespace-nowrap"
                            >
                                Filter{selectedClassId ? " (Aktif)" : ""}
                            </Button>
                        }
                    >
                        <div className="flex flex-col gap-3 font-inter min-w-[230px]">
                            <div className="flex items-center justify-between border-b border-border pb-2">
                                <h4 className="text-[13.5px] font-bold text-text-primary">Filter Laporan</h4>
                                {Boolean(selectedClassId) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigate(selectedPeriod, { class_id: null });
                                            setIsDesktopFilterOpen(false);
                                        }}
                                        className="text-[11.5px] font-semibold text-danger hover:underline cursor-pointer"
                                    >
                                        Reset Filter
                                    </button>
                                )}
                            </div>

                            {/* Filter Kelas */}
                            <div>
                                <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                    Rombongan Belajar / Kelas
                                </label>
                                <NativeSelect
                                    value={selectedClassId ?? ""}
                                    onChange={(e) => navigate(selectedPeriod, { class_id: e.target.value || null })}
                                    className="h-9 text-[12.5px] rounded-xl w-full"
                                >
                                    <option value="">Semua Kelas</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name.split(" (")[0]}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>

                            {/* Filter spesifik berdasarkan periode */}
                            {selectedPeriod === "harian" && (
                                <div>
                                    <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                        Tanggal Presensi
                                    </label>
                                    <Input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => navigate("harian", { date: e.target.value })}
                                        inputClassName="h-9 font-medium text-text-primary text-[12.5px] rounded-xl"
                                    />
                                </div>
                            )}

                            {selectedPeriod === "bulanan" && (
                                <div>
                                    <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                        Bulan Laporan
                                    </label>
                                    <NativeSelect
                                        value={String(selectedMonth)}
                                        onChange={(e) => navigate("bulanan", { month: Number(e.target.value) })}
                                        className="h-9 text-[12.5px] rounded-xl w-full"
                                    >
                                        {months.map((m) => (
                                            <option key={m.value} value={m.value}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </div>
                            )}

                            {selectedPeriod === "semester" && (
                                <div>
                                    <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                        Semester
                                    </label>
                                    <NativeSelect
                                        value={String(selectedSemester)}
                                        onChange={(e) => navigate("semester", { semester: Number(e.target.value) })}
                                        className="h-9 text-[12.5px] rounded-xl w-full"
                                    >
                                        <option value="1">Semester 1 (Ganjil)</option>
                                        <option value="2">Semester 2 (Genap)</option>
                                    </NativeSelect>
                                </div>
                            )}
                        </div>
                    </FilterPopover>

                    {/* Desktop & Tablet Export Dropdown Button (Aligned in toolbar row next to filters) */}
                    <div className="hidden sm:block relative shrink-0" ref={desktopDropdownRef}>
                        <Button
                            variant="primary"
                            onClick={() => setDesktopDropdownOpen((prev) => !prev)}
                            className="h-10 px-4 font-bold text-[13px] shadow-xs rounded-xl shrink-0 flex items-center gap-2"
                            icon={<FiDownload className="text-[14px]" />}
                        >
                            <span>Ekspor Laporan</span>
                            <FiChevronDown
                                className={`text-[14px] transition-transform duration-200 ${
                                    desktopDropdownOpen ? "rotate-180" : ""
                                }`}
                            />
                        </Button>

                        <AnimatePresence>
                            {desktopDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute right-0 mt-2 w-64 bg-surface rounded-xl border border-border shadow-dropdown p-1.5 z-50 flex flex-col gap-1 font-inter"
                                >
                                    <a
                                        href={pdfHref}
                                        onClick={() => setDesktopDropdownOpen(false)}
                                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/70 transition-colors group cursor-pointer text-left"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-danger-bg text-danger flex items-center justify-center text-[15px] shrink-0 border border-danger/10 group-hover:scale-105 transition-transform">
                                            <FiFileText className="text-[16px]" />
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
                                        onClick={() => setDesktopDropdownOpen(false)}
                                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/70 transition-colors group cursor-pointer text-left"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-success-bg text-success flex items-center justify-center text-[15px] shrink-0 border border-success/10 group-hover:scale-105 transition-transform">
                                            <FiGrid className="text-[16px]" />
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
                </div>
            </div>

            {/* ── MOBILE NATIVE CARD STACK (< sm) (Figma Mockup Style) ─────────── */}
            <div className="sm:hidden flex flex-col font-inter">
                {/* Mobile Page Tab Switcher */}
                <div className="mb-3">
                    <TabSwitcher
                        tabs={PERIODS}
                        activeKey={selectedPeriod}
                        onChange={(key) => navigate(key as Period)}
                        variant="segmented"
                        fullWidth
                    />
                </div>

                {paginatedPreview.length === 0 ? (
                    <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center bg-surface rounded-2xl border border-dashed border-border my-auto">
                        <FiFileText className="w-12 h-12 text-text-muted mb-3 opacity-60" />
                        <p className="font-bold text-text-primary text-[15px]">Tidak ada data presensi</p>
                        <p className="text-[12px] text-text-muted mt-1 max-w-xs">
                            Tidak ditemukan riwayat kehadiran untuk filter periode dan kelas yang dipilih.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {paginatedPreview.map((r) => (
                            <div
                                key={r.no}
                                className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex flex-col gap-2.5 transition-all"
                            >
                                {/* Row 1: Student Name & Class (Left) + Status Badge (Right) */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-[14px] font-bold text-text-primary truncate">{r.name}</h3>
                                        <p className="text-[12px] text-text-muted mt-0.5">{r.class || "Kelas -"}</p>
                                    </div>
                                    <div className="shrink-0">
                                        {selectedPeriod === "harian" ? (
                                            getStatusBadge(r.status)
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                                                No. {r.no}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Row 2: Details / Photo Action or Monthly Stats */}
                                {selectedPeriod === "harian" ? (
                                    <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[12.5px]">
                                        <div className="flex items-center gap-1.5 text-text-secondary min-w-0 flex-1 mr-2">
                                            {r.status === "TERLAMBAT" ? (
                                                <span className="flex items-center gap-1.5 font-bold text-amber-600">
                                                    <FiClock className="text-[13px] shrink-0" />
                                                    <span className="truncate">{r.waktu_keterangan || "Terlambat"}</span>
                                                </span>
                                            ) : r.status === "HADIR" ? (
                                                <span className="flex items-center gap-1.5 font-semibold text-text-primary">
                                                    <FiClock className="text-[13px] text-emerald-600 shrink-0" />
                                                    <span className="truncate">{r.waktu_keterangan || "Tepat Waktu"}</span>
                                                </span>
                                            ) : r.status === "SAKIT" || r.status === "IZIN" ? (
                                                <span className="text-text-secondary truncate italic">
                                                    {r.waktu_keterangan || "Surat keterangan izin"}
                                                </span>
                                            ) : (
                                                <span className="text-text-muted italic truncate">Tidak ada presensi</span>
                                            )}
                                        </div>

                                        {r.photo_url && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPreviewPhoto({
                                                        url: r.photo_url!,
                                                        title:
                                                            r.photo_type === "selfie"
                                                                ? `Foto Selfie - ${r.name}`
                                                                : `Bukti Surat - ${r.name}`,
                                                    })
                                                }
                                                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-primary/25 bg-primary/5 text-primary text-[11px] font-bold hover:bg-primary/10 active:scale-95 transition-all cursor-pointer"
                                            >
                                                {r.photo_type === "selfie" ? (
                                                    <>
                                                        <FiCamera className="text-[11px]" />
                                                        <span>Foto</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiPaperclip className="text-[11px]" />
                                                        <span>Surat</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-border/60 text-center font-inter">
                                        <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                                            <div className="text-[10px] font-semibold text-emerald-700">Masuk</div>
                                            <div className="text-[13px] font-bold text-emerald-800">{r.present}</div>
                                        </div>
                                        <div className="p-1.5 rounded-lg bg-purple-50 border border-purple-200">
                                            <div className="text-[10px] font-semibold text-purple-700">Izin</div>
                                            <div className="text-[13px] font-bold text-purple-800">{r.permission}</div>
                                        </div>
                                        <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200">
                                            <div className="text-[10px] font-semibold text-blue-700">Sakit</div>
                                            <div className="text-[13px] font-bold text-blue-800">{r.sick}</div>
                                        </div>
                                        <div className="p-1.5 rounded-lg bg-red-50 border border-red-200">
                                            <div className="text-[10px] font-semibold text-red-700">Alpha</div>
                                            <div className="text-[13px] font-bold text-red-800">{r.absent}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Mobile Pagination */}
                {preview.length > pageSize && (
                    <div className="pt-2 font-inter">
                        <MobileNativePagination
                            currentPage={safePage}
                            totalPages={totalPages}
                            totalItems={preview.length}
                            perPage={pageSize}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {/* ── TABLET & DESKTOP TABLE VIEW (>= sm) ───────────────────────── */}
            <div className="hidden sm:flex w-full flex-1 min-h-0 flex-col justify-between gap-3 font-inter">
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
                                render: (r: ExportRow) => getStatusBadge(r.status),
                            },
                            {
                                key: "waktu",
                                header: "Waktu / Keterangan",
                                className: "text-[13px]",
                                render: (r: ExportRow) => {
                                    const st = r.status ?? "ALPHA";
                                    if (st === "TERLAMBAT") {
                                        return <span className="font-bold text-amber-600">{r.waktu_keterangan}</span>;
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
                                                icon={isSelfie ? <FiCamera className="text-[12px]" /> : <FiPaperclip className="text-[12px]" />}
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

                {/* Standardized Table Footer */}
                <TableFooter
                    info={`Tampilan kolom menyesuaikan secara otomatis berdasarkan filter periode yang dipilih (Saat ini: ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}).`}
                    currentPage={safePage}
                    totalPages={totalPages}
                    totalItems={preview.length}
                    perPage={pageSize}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Mobile Bottom Drawer for Export Options (Only rendered on mobile < sm) */}
            {!isSmOrLarger && (
                <Drawer
                    open={exportDrawerOpen}
                    onClose={() => setExportDrawerOpen(false)}
                    title="Ekspor Rekap Kehadiran"
                    description="Pilih format berkas dokumen laporan presensi yang ingin diunduh."
                    showFooter={false}
                >
                    <div className="flex flex-col gap-3 p-1 font-inter">
                        <a
                            href={pdfHref}
                            onClick={() => setExportDrawerOpen(false)}
                            className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-surface hover:bg-muted/40 active:scale-[0.99] transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-danger-bg text-danger flex items-center justify-center text-[20px] shrink-0 border border-danger/10 group-hover:scale-105 transition-transform">
                                <FiFileText className="text-[22px]" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[14.5px] font-bold text-text-primary group-hover:text-danger transition-colors">
                                        Dokumen PDF (.pdf)
                                    </h4>
                                    <span className="text-[11px] font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-full border border-danger/20">
                                        Cetak Resmi
                                    </span>
                                </div>
                                <p className="text-[12px] text-text-muted mt-0.5">
                                    Format layout siap cetak, kop sekolah, & tanda tangan
                                </p>
                            </div>
                        </a>

                        <a
                            href={excelHref}
                            onClick={() => setExportDrawerOpen(false)}
                            className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-surface hover:bg-muted/40 active:scale-[0.99] transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-success-bg text-success flex items-center justify-center text-[20px] shrink-0 border border-success/10 group-hover:scale-105 transition-transform">
                                <FiGrid className="text-[22px]" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[14.5px] font-bold text-text-primary group-hover:text-success transition-colors">
                                        Spreadsheet Excel (.xlsx)
                                    </h4>
                                    <span className="text-[11px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                                        Olah Data
                                    </span>
                                </div>
                                <p className="text-[12px] text-text-muted mt-0.5">
                                    Tabel data mentah untuk kalkulasi dan arsip digital
                                </p>
                            </div>
                        </a>
                    </div>
                </Drawer>
            )}

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
                                <FiFileText className="w-12 h-12 text-text-muted mb-3 opacity-60" />
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

            {/* 📱 MOBILE FILTER BOTTOM SHEET */}
            <BottomSheet
                open={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                title="Filter Laporan & Ekspor"
                subtitle="Atur tanggal dan kelas rekapitulasi"
            >
                <div className="flex flex-col gap-4 font-inter pb-2">

                    {selectedPeriod === "harian" && (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold text-text-secondary">
                                    Tanggal Absensi
                                </label>
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => navigate("harian", { date: e.target.value })}
                                    inputClassName="h-10 text-[13px]"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold text-text-secondary">
                                    Pilih Kelas
                                </label>
                                <NativeSelect
                                    value={selectedClassId ?? ""}
                                    onChange={(e) => navigate("harian", { class_id: e.target.value || null })}
                                    className="h-10 text-[13px] rounded-xl"
                                >
                                    <option value="">Semua Kelas</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name.split(" (")[0]}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>
                        </>
                    )}

                    {selectedPeriod === "bulanan" && (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold text-text-secondary">
                                    Pilih Bulan
                                </label>
                                <NativeSelect
                                    value={String(selectedMonth)}
                                    onChange={(e) => navigate("bulanan", { month: Number(e.target.value) })}
                                    className="h-10 text-[13px] rounded-xl"
                                >
                                    {months.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold text-text-secondary">
                                    Pilih Kelas
                                </label>
                                <NativeSelect
                                    value={selectedClassId ?? ""}
                                    onChange={(e) => navigate("bulanan", { class_id: e.target.value || null })}
                                    className="h-10 text-[13px] rounded-xl"
                                >
                                    <option value="">Semua Kelas</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name.split(" (")[0]}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>
                        </>
                    )}

                    {selectedPeriod === "semester" && (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold text-text-secondary">
                                    Semester
                                </label>
                                <NativeSelect
                                    value={String(selectedSemester)}
                                    onChange={(e) => navigate("semester", { semester: Number(e.target.value) })}
                                    className="h-10 text-[13px] rounded-xl"
                                >
                                    <option value="1">Semester 1 (Ganjil)</option>
                                    <option value="2">Semester 2 (Genap)</option>
                                </NativeSelect>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold text-text-secondary">
                                    Pilih Kelas
                                </label>
                                <NativeSelect
                                    value={selectedClassId ?? ""}
                                    onChange={(e) => navigate("semester", { class_id: e.target.value || null })}
                                    className="h-10 text-[13px] rounded-xl"
                                >
                                    <option value="">Semua Kelas</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name.split(" (")[0]}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>
                        </>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                        {hasActiveFilters && (
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    navigate(selectedPeriod, { class_id: null });
                                    setIsMobileFilterOpen(false);
                                }}
                                className="flex-1 h-10 text-[13px] font-bold rounded-xl"
                            >
                                Reset Filter
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            onClick={() => setIsMobileFilterOpen(false)}
                            className="flex-1 h-10 text-[13px] font-bold rounded-xl"
                        >
                            Terapkan
                        </Button>
                    </div>
                </div>
            </BottomSheet>
        </AppShell>
    );
}
