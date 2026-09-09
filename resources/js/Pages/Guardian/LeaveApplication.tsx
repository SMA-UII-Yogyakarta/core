import { router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
    FiCalendar,
    FiFileText,
    FiFilter,
    FiPaperclip,
    FiPlus,
    FiUser,
} from "react-icons/fi";
import {
    BottomSheet,
    Button,
    EmptyState,
    FilterPopover,
    MobileNativePagination,
    NativeSelect,
    PageHeader,
    PhotoPeekButton,
    StatusBadge,
    Table,
    TableFooter,
    TabSwitcher,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import AppShell from "@/Layouts/AppShell";
import type { PaginatedData } from "@/types";
import { formatIndonesianDate } from "@/utils/helpers";
import LeaveForm, { type StudentOption } from "./Forms/LeaveForm";
import LeaveDrawerForm from "./LeaveDrawerForm";

interface LeaveRequestRecord {
    id: number;
    category: string;
    start_date: string;
    end_date: string;
    description?: string | null;
    document_url?: string | null;
    approval_status: string;
    student: { id: number; name: string };
}

interface PageProps {
    guardian: { id: number; name: string };
    students: StudentOption[];
    leaveRequests: PaginatedData<LeaveRequestRecord>;
    filters?: {
        status?: string;
        category?: string;
        student_id?: string;
    };
}

const CATEGORY_OPTIONS = [
    { value: "Sick", label: "Sakit" },
    { value: "Event", label: "Kegiatan Keluarga" },
    { value: "Competition", label: "Lomba / Kejuaraan" },
    { value: "Other", label: "Lainnya" },
];

const STATUS_TABS = [
    { key: "", label: "Semua Status" },
    { key: "Pending", label: "Menunggu" },
    { key: "Approved", label: "Disetujui" },
    { key: "Rejected", label: "Ditolak" },
];

const formatDatePeriod = (startDate: string, endDate?: string | null) => {
    const startStr = formatIndonesianDate(startDate, { day: "2-digit", month: "short", year: "numeric" });
    if (!endDate || endDate === startDate) return startStr;
    const endStr = formatIndonesianDate(endDate, { day: "2-digit", month: "short", year: "numeric" });
    return `${startStr} s/d ${endStr}`;
};

export default function LeaveApplication({ students, leaveRequests, filters = {} }: PageProps) {
    const isDesktop = useMediaQuery("(min-width: 640px)");

    // Single source of truth for form open state
    const [isFormOpen, setIsFormOpen] = useState<boolean>(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            return params.get("action") === "create" || params.get("create") === "true";
        }
        return false;
    });

    // Filter states
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState(filters.status ?? "");
    const [categoryFilter, setCategoryFilter] = useState(filters.category ?? "");
    const [studentIdFilter, setStudentIdFilter] = useState(filters.student_id ?? "");

    const handleOpenForm = () => {
        setIsFormOpen(true);
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("create", "true");
            window.history.replaceState({}, "", url.pathname + url.search);
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.delete("action");
            url.searchParams.delete("create");
            window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
        }
    };

    const handleFormSuccess = () => {
        handleCloseForm();
        router.reload({ only: ["leaveRequests"] });
    };

    const handleFilterChange = (key: string, value: string) => {
        const nextStatus = key === "status" ? value : statusFilter;
        const nextCategory = key === "category" ? value : categoryFilter;
        const nextStudentId = key === "student_id" ? value : studentIdFilter;

        if (key === "status") setStatusFilter(value);
        if (key === "category") setCategoryFilter(value);
        if (key === "student_id") setStudentIdFilter(value);

        router.get(
            "/guardian/leave-application",
            {
                status: nextStatus || undefined,
                category: nextCategory || undefined,
                student_id: nextStudentId || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleResetFilters = () => {
        setStatusFilter("");
        setCategoryFilter("");
        setStudentIdFilter("");
        router.get("/guardian/leave-application", {}, { preserveState: true, preserveScroll: true });
    };

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Header actions on Mobile (< sm) in AppShell top bar: Filter + Plus Icon Buttons
    const mobileHeaderActions = (
        <div className="flex items-center gap-2 sm:hidden font-inter">
            <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                    categoryFilter || studentIdFilter
                        ? "bg-accent text-primary font-bold shadow-sm"
                        : "bg-white/15 border border-white/20 text-white hover:bg-white/25 active:bg-white/30"
                }`}
                title="Filter Pengajuan Izin"
                aria-label="Filter Pengajuan Izin"
            >
                <FiFilter className="text-[14px]" />
            </button>
            <button
                type="button"
                onClick={handleOpenForm}
                className="w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center hover:brightness-95 active:scale-95 transition-all cursor-pointer shadow-xs"
                title="Ajukan Izin Baru"
                aria-label="Ajukan Izin Baru"
            >
                <FiPlus className="text-[15px]" />
            </button>
        </div>
    );

    // Columns for submitted leave requests table (Tablet & Desktop)
    const leaveColumns: Column<LeaveRequestRecord>[] = [
        {
            key: "student",
            header: "Nama Anak",
            render: (row: LeaveRequestRecord) => (
                <div className="flex items-center gap-2 font-medium text-text-primary">
                    <FiUser className="w-4 h-4 text-primary shrink-0" />
                    <span>{row.student?.name ?? "-"}</span>
                </div>
            ),
        },
        {
            key: "category",
            header: "Kategori Izin",
            render: (row: LeaveRequestRecord) => {
                const opt = CATEGORY_OPTIONS.find((c) => c.value === row.category);
                return <span className="font-medium text-text-primary">{opt?.label ?? row.category}</span>;
            },
        },
        {
            key: "period",
            header: "Periode Tanggal",
            render: (row: LeaveRequestRecord) => (
                <div className="flex items-center gap-2 font-medium text-text-muted text-[13px]">
                    <FiCalendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{formatDatePeriod(row.start_date, row.end_date)}</span>
                </div>
            ),
        },
        {
            key: "description",
            header: "Keterangan / Alasan",
            render: (row: LeaveRequestRecord) => (
                <span className="text-[13px] text-text-secondary truncate max-w-[220px] block">
                    {row.description || "-"}
                </span>
            ),
        },
        {
            key: "document_url",
            header: "Bukti Surat",
            render: (row: LeaveRequestRecord) => {
                if (!row.document_url) {
                    return <span className="text-text-muted text-[12px]">-</span>;
                }
                const isImage = /\.(jpg|jpeg|png|webp)$/i.test(row.document_url);
                if (isImage) {
                    return <PhotoPeekButton photoUrl={row.document_url} title={`Surat Izin - ${row.student?.name}`} />;
                }
                return (
                    <a
                        href={row.document_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[12px] text-primary hover:underline font-medium"
                    >
                        <FiPaperclip className="w-3.5 h-3.5" />
                        <span>Lihat PDF</span>
                    </a>
                );
            },
        },
        {
            key: "approval_status",
            header: "Status Persetujuan",
            render: (row: LeaveRequestRecord) => <StatusBadge variant={row.approval_status} />,
        },
    ];

    // 📱 MOBILE VIEW: DEDICATED FORM PAGE (< 640px when creating)
    if (!isDesktop && isFormOpen) {
        return (
            <AppShell
                title="Formulir Permohonan Izin"
                onBack={handleCloseForm}
                showNotificationBell={false}
                showNotificationBellOnMobile={false}
                showBottomNav={false}
            >
                <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full font-inter max-w-xl mx-auto space-y-4 pb-28 pt-2"
                >
                    <div className="px-1 mb-2">
                        <p className="text-[13px] text-text-secondary leading-relaxed font-inter">
                            Isi detail permohonan izin ketidakhadiran anak Anda secara lengkap ke Wali Kelas.
                        </p>
                    </div>

                    <LeaveForm
                        formId="mobile-leave-application-form"
                        students={students}
                        onSuccess={handleFormSuccess}
                        showSubmitButton={false}
                    />
                </motion.div>

                {/* Sticky Full-Width Mobile Submit Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-md border-t border-border/80 z-30 sm:hidden">
                    <div className="max-w-xl mx-auto">
                        <Button
                            type="submit"
                            form="mobile-leave-application-form"
                            variant="primary"
                            size="lg"
                            className="w-full justify-center font-bold text-[14.5px] shadow-xs py-3"
                        >
                            Kirim Permohonan Izin
                        </Button>
                    </div>
                </div>
            </AppShell>
        );
    }

    const hasActiveFilters = Boolean(categoryFilter || studentIdFilter || statusFilter);

    // MAIN VIEW: LIST OF SUBMITTED LEAVE REQUESTS
    return (
        <AppShell
            title="Pengajuan Izin"
            hasTopCard={true}
            showNotificationBell={false}
            showNotificationBellOnMobile={false}
            headerActions={mobileHeaderActions}
        >
            <div className="flex flex-col gap-4 sm:gap-5 font-inter pb-12">
                {/* Desktop PageHeader (hidden on mobile & tablet < lg) */}
                <PageHeader
                    title="Pengajuan Izin Ketidakhadiran"
                    description="Kelola dan pantau permohonan izin ketidakhadiran anak Anda secara online ke Wali Kelas."
                    className="hidden lg:flex shrink-0 mb-4"
                >
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleOpenForm}
                        icon={<FiPlus className="w-4 h-4" />}
                        className="font-bold shadow-xs"
                    >
                        Ajukan Izin Baru
                    </Button>
                </PageHeader>

                {/* Responsive Filter & Action Toolbar Row (Mobile, Tablet, Desktop) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 font-inter min-w-0">
                    {/* Left: Status Filter Tabs */}
                    <div className="min-w-0 flex-1 overflow-x-auto no-scrollbar">
                        <TabSwitcher
                            tabs={STATUS_TABS}
                            activeKey={statusFilter}
                            onChange={(key) => handleFilterChange("status", key)}
                            variant="segmented"
                            fullWidth="mobile-only"
                        />
                    </div>

                    {/* Right Toolbar (Tablet & Desktop sm+ only): Total Badge, Yellow Accent FilterPopover & Primary Action Button */}
                    <div className="hidden sm:flex items-center gap-2 shrink-0 font-inter">
                        <span className="flex items-center text-[12px] font-medium text-text-muted font-mono bg-surface border border-border px-2.5 h-10 rounded-xl shrink-0 shadow-2xs">
                            Total: {leaveRequests.total ?? leaveRequests.data.length}
                        </span>
                        <FilterPopover
                            open={isFilterOpen}
                            onClose={() => setIsFilterOpen(false)}
                            align="right"
                            trigger={
                                <Button
                                    variant="accent"
                                    size="md"
                                    onClick={() => setIsFilterOpen((prev) => !prev)}
                                    icon={<FiFilter className="text-[13px]" />}
                                    className="h-10 px-3.5 text-[13px] font-bold rounded-xl shrink-0 whitespace-nowrap"
                                >
                                    Filter
                                    {categoryFilter || studentIdFilter ? " (Aktif)" : ""}
                                </Button>
                            }
                        >
                            <div className="flex flex-col gap-3 font-inter min-w-[220px]">
                                <div className="flex items-center justify-between border-b border-border pb-2">
                                    <h4 className="text-[13.5px] font-bold text-text-primary">Filter Data</h4>
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleResetFilters();
                                                setIsFilterOpen(false);
                                            }}
                                            className="text-[11.5px] font-semibold text-danger hover:underline cursor-pointer"
                                        >
                                            Reset Filter
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                        Kategori Izin
                                    </label>
                                    <NativeSelect
                                        value={categoryFilter}
                                        onChange={(e) => handleFilterChange("category", e.target.value)}
                                        className="h-9 text-[12.5px] rounded-xl w-full"
                                    >
                                        <option value="">Semua Kategori</option>
                                        <option value="Sick">Sakit</option>
                                        <option value="Event">Kegiatan Keluarga</option>
                                        <option value="Competition">Lomba / Kejuaraan</option>
                                        <option value="Other">Lainnya</option>
                                    </NativeSelect>
                                </div>

                                {students.length > 1 && (
                                    <div>
                                        <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                            Pilih Anak
                                        </label>
                                        <NativeSelect
                                            value={studentIdFilter}
                                            onChange={(e) => handleFilterChange("student_id", e.target.value)}
                                            className="h-9 text-[12.5px] rounded-xl w-full"
                                        >
                                            <option value="">Semua Anak</option>
                                            {students.map((s) => (
                                                <option key={s.id} value={s.id.toString()}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                    </div>
                                )}
                            </div>
                        </FilterPopover>

                        {/* Tablet Primary Action Button (sm <= screen < lg) placed in main toolbar next to Filter */}
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleOpenForm}
                            icon={<FiPlus className="text-[13px]" />}
                            className="h-10 px-3.5 text-[13px] font-bold rounded-xl shrink-0 whitespace-nowrap hidden sm:inline-flex lg:hidden"
                        >
                            Ajukan Izin
                        </Button>
                    </div>
                </div>

                {/* Mobile Filter BottomSheet */}
                <BottomSheet
                    open={isMobileFilterOpen}
                    onClose={() => setIsMobileFilterOpen(false)}
                    title="Filter Data Pengajuan"
                >
                    <div className="p-4 space-y-4 font-inter">
                        <div>
                            <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                Kategori Izin
                            </label>
                            <NativeSelect
                                value={categoryFilter}
                                onChange={(e) => {
                                    handleFilterChange("category", e.target.value);
                                    setIsMobileFilterOpen(false);
                                }}
                            >
                                <option value="">Semua Kategori</option>
                                <option value="Sick">Sakit</option>
                                <option value="Event">Kegiatan Keluarga</option>
                                <option value="Competition">Lomba / Kejuaraan</option>
                                <option value="Other">Lainnya</option>
                            </NativeSelect>
                        </div>
                        {students.length > 1 && (
                            <div>
                                <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                    Pilih Anak
                                </label>
                                <NativeSelect
                                    value={studentIdFilter}
                                    onChange={(e) => {
                                        handleFilterChange("student_id", e.target.value);
                                        setIsMobileFilterOpen(false);
                                    }}
                                >
                                    <option value="">Semua Anak</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id.toString()}>
                                            {s.name}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>
                        )}
                        {(categoryFilter || studentIdFilter) && (
                            <div className="pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        handleResetFilters();
                                        setIsMobileFilterOpen(false);
                                    }}
                                    className="w-full justify-center text-danger hover:bg-danger/10 border-danger/30 font-bold"
                                >
                                    Reset Filter
                                </Button>
                            </div>
                        )}
                    </div>
                </BottomSheet>

                {/* Table / List Container */}
                <section className="flex flex-col gap-3.5">
                    {leaveRequests.data.length === 0 ? (
                        <EmptyState
                            title="Belum Ada Pengajuan Izin"
                            description={
                                hasActiveFilters
                                    ? "Tidak ada data pengajuan izin yang sesuai dengan filter yang Anda pilih."
                                    : "Klik tombol 'Ajukan Izin Baru' di atas untuk membuat permohonan izin ketidakhadiran anak Anda."
                            }
                        />
                    ) : (
                        <>
                            {/* Mobile Card Stack (< sm) */}
                            <div className="sm:hidden space-y-3.5">
                                {leaveRequests.data.map((item) => {
                                    const opt = CATEGORY_OPTIONS.find((c) => c.value === item.category);
                                    const isImage = item.document_url && /\.(jpg|jpeg|png|webp)$/i.test(item.document_url);
                                    return (
                                        <div
                                            key={item.id}
                                            className="bg-surface border border-border/90 rounded-2xl p-4 shadow-card space-y-3"
                                        >
                                            <div className="flex items-start justify-between gap-2.5">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-[14.5px] font-bold text-text-primary truncate">
                                                        {item.student?.name}
                                                    </h4>
                                                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold bg-primary/10 text-primary">
                                                        {opt?.label ?? item.category}
                                                    </span>
                                                </div>
                                                <StatusBadge variant={item.approval_status} />
                                            </div>

                                            {item.description && (
                                                <p className="text-[12.5px] text-text-secondary leading-relaxed line-clamp-3 bg-muted/30 p-2.5 rounded-xl border border-border/40 font-inter">
                                                    {item.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between text-[11.5px] text-text-muted pt-2.5 border-t border-border/80">
                                                <div className="flex items-center gap-1.5 text-text-secondary font-medium">
                                                    <FiCalendar className="w-3.5 h-3.5 text-primary shrink-0" />
                                                    <span>{formatDatePeriod(item.start_date, item.end_date)}</span>
                                                </div>
                                                {item.document_url && (
                                                    <div>
                                                        {isImage ? (
                                                            <PhotoPeekButton
                                                                photoUrl={item.document_url}
                                                                title={`Surat Izin - ${item.student?.name}`}
                                                            />
                                                        ) : (
                                                            <a
                                                                href={item.document_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 text-[11.5px] text-primary hover:underline font-bold"
                                                            >
                                                                <FiPaperclip className="w-3 h-3" />
                                                                <span>PDF</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {leaveRequests.last_page > 1 && (
                                    <div className="pt-2 font-inter">
                                        <MobileNativePagination
                                            currentPage={leaveRequests.current_page}
                                            totalPages={leaveRequests.last_page}
                                            totalItems={leaveRequests.total}
                                            perPage={leaveRequests.per_page ?? 10}
                                            onPageChange={(page) =>
                                                router.get(
                                                    "/guardian/leave-application",
                                                    {
                                                        page,
                                                        status: statusFilter || undefined,
                                                        category: categoryFilter || undefined,
                                                        student_id: studentIdFilter || undefined,
                                                    },
                                                    { preserveState: true },
                                                )
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Tablet & Desktop Table View (>= sm) */}
                            <div className="hidden sm:block space-y-3">
                                <Table
                                    columns={leaveColumns}
                                    data={leaveRequests.data}
                                    keyExtractor={(item: LeaveRequestRecord) => item.id}
                                />
                                <TableFooter
                                    currentPage={leaveRequests.current_page}
                                    totalPages={leaveRequests.last_page}
                                    totalItems={leaveRequests.total}
                                    perPage={leaveRequests.per_page ?? 10}
                                    itemLabel="pengajuan izin"
                                    onPageChange={(page) =>
                                        router.get(
                                            "/guardian/leave-application",
                                            {
                                                page,
                                                status: statusFilter || undefined,
                                                category: categoryFilter || undefined,
                                                student_id: studentIdFilter || undefined,
                                            },
                                            { preserveState: true },
                                        )
                                    }
                                />
                            </div>
                        </>
                    )}
                </section>

                {/* Tablet & Desktop Side Drawer Form Overlay */}
                <LeaveDrawerForm
                    open={isDesktop && isFormOpen}
                    onClose={handleCloseForm}
                    students={students}
                    onSuccess={handleFormSuccess}
                />
            </div>
        </AppShell>
    );
}
