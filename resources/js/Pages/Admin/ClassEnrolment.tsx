import { useState, useMemo, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import { useClientPagination } from "@/hooks/useClientPagination";
import {
    Button,
    Table,
    TableFooter,
    PageHeader,
    Pagination,
    MobileNativePagination,
    SearchBar,
    Checkbox,
    Drawer,
    NativeSelect,
    ConfirmDialog,
    EmptyState,
    Card,
    MobileFilterSelectBar,
    BottomSheet,
    FilterPopover,
} from "@/Components";
import {
    FiUserPlus,
    FiX,
    FiUser,
    FiUserMinus,
    FiUsers,
    FiMonitor,
    FiPlus,
    FiChevronDown,
    FiChevronUp,
    FiFilter,
} from "react-icons/fi";
import AppShell from "@/Layouts/AppShell";
import MobileSelectionBar from "@/Components/common/MobileSelectionBar";
import type { Column } from "@/Components/ui/Table";

type SortOption = "name_asc" | "name_desc" | "nisn_asc" | "nis_asc";
type EmailFilterOption = "all" | "with_email" | "without_email";

interface SchoolClass {
    id: number;
    name: string;
    teacher: { id: number; name: string; avatar?: string; user?: { avatar?: string } } | null;
}

interface Student {
    id: number;
    nis: string;
    nisn: string;
    name: string;
    user: { email?: string } | null;
}

interface UnassignedStudent {
    id: number;
    nis: string;
    nisn: string;
    name: string;
}

interface PageProps {
    classes: SchoolClass[];
    selectedClassId: number | null;
    selectedClass: SchoolClass | null;
    students: Student[];
    unassignedStudents: UnassignedStudent[];
}

export default function EnrolmentKelas({
    classes,
    selectedClassId,
    selectedClass,
    students,
    unassignedStudents,
}: PageProps) {
    const { url } = usePage();

    const [classId, setClassId] = useState(selectedClassId?.toString() ?? "");
    const [showAddModal, setShowAddModal] = useState(false);
    const [isMobileAddView, setIsMobileAddView] = useState(false);
    const [removeConfirmId, setRemoveConfirmId] = useState<number | null>(null);

    // Handle physical/browser popstate navigation (Back / Forward) for mobile Add Student subview
    useEffect(() => {
        const handlePopState = () => {
            if (typeof window !== "undefined") {
                const params = new URLSearchParams(window.location.search);
                const isAdd = params.get("action") === "add";
                if (window.innerWidth < 640) {
                    setIsMobileAddView(isAdd);
                }
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    // Filter & Sort States
    const [sortBy, setSortBy] = useState<SortOption>("name_asc");
    const [emailFilter, setEmailFilter] = useState<EmailFilterOption>("all");
    const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const hasActiveFilters = sortBy !== "name_asc" || emailFilter !== "all";

    const handleResetFilters = () => {
        setSortBy("name_asc");
        setEmailFilter("all");
    };

    const [isCardExpanded, setIsCardExpanded] = useState<boolean>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("class_enrolment_card_expanded");
            if (saved !== null) {
                return saved === "true";
            }
        }
        return true;
    });

    const [prevUrl, setPrevUrl] = useState(url);
    if (url !== prevUrl) {
        setPrevUrl(url);
        const query = url.includes("?") ? url.split("?")[1] : "";
        const params = new URLSearchParams(query);
        const action = params.get("action");
        if (action === "add") {
            if (typeof window !== "undefined" && window.innerWidth < 640) {
                setIsMobileAddView(true);
            } else {
                setShowAddModal(true);
            }
        } else {
            setIsMobileAddView(false);
        }
    }

    const toggleCardExpanded = () => {
        setIsCardExpanded((prev) => {
            const next = !prev;
            if (typeof window !== "undefined") {
                localStorage.setItem("class_enrolment_card_expanded", String(next));
            }
            return next;
        });
    };

    // Confirm Dialog States
    const [bulkRemoveConfirm, setBulkRemoveConfirm] = useState(false);

    // Multi-selection states
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [selectedModalStudentIds, setSelectedModalStudentIds] = useState<number[]>([]);

    // Enrolled Students Pagination & Search
    const [search, setSearch] = useState("");

    const filteredStudents = useMemo(() => {
        let result = [...students];

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (s) =>
                    s.name.toLowerCase().includes(q) ||
                    s.nis.toLowerCase().includes(q) ||
                    s.nisn.toLowerCase().includes(q),
            );
        }

        if (emailFilter === "with_email") {
            result = result.filter((s) => Boolean(s.user?.email));
        } else if (emailFilter === "without_email") {
            result = result.filter((s) => !s.user?.email);
        }

        result.sort((a, b) => {
            if (sortBy === "name_asc") return a.name.localeCompare(b.name);
            if (sortBy === "name_desc") return b.name.localeCompare(a.name);
            if (sortBy === "nisn_asc") return (a.nisn || "").localeCompare(b.nisn || "");
            if (sortBy === "nis_asc") return (a.nis || "").localeCompare(b.nis || "");
            return 0;
        });

        return result;
    }, [students, search, emailFilter, sortBy]);

    const {
        safePage,
        totalPages,
        paginatedData: paginatedStudents,
        setCurrentPage,
        pageSize,
    } = useClientPagination(filteredStudents, 1, 10);

    // Modal Unassigned Students Pagination & Search
    const [modalSearch, setModalSearch] = useState("");

    const filteredUnassigned = useMemo(() => {
        if (!modalSearch.trim()) return unassignedStudents;
        const q = modalSearch.toLowerCase();
        return unassignedStudents.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.nis.toLowerCase().includes(q) ||
                s.nisn.toLowerCase().includes(q),
        );
    }, [unassignedStudents, modalSearch]);

    const {
        safePage: modalSafePage,
        totalPages: modalTotalPages,
        paginatedData: paginatedUnassigned,
        setCurrentPage: setModalCurrentPage,
        pageSize: modalPageSize,
    } = useClientPagination(filteredUnassigned, 1, 10);

    const handleOpenAddStudent = () => {
        setModalSearch("");
        setModalCurrentPage(1);
        setSelectedModalStudentIds([]);
        if (typeof window !== "undefined" && window.innerWidth < 640) {
            setIsMobileAddView(true);
            if (typeof window !== "undefined") {
                const params = new URLSearchParams(window.location.search);
                params.set("action", "add");
                window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
            }
        } else {
            setShowAddModal(true);
        }
    };

    const handleCloseAddStudent = () => {
        setShowAddModal(false);
        setIsMobileAddView(false);
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            params.delete("action");
            const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
            window.history.pushState({}, "", newUrl);
        }
    };

    const handleRemove = (studentId: number) => {
        setRemoveConfirmId(studentId);
    };

    const confirmRemove = () => {
        if (removeConfirmId === null) return;
        router.delete(`/class-enrolment/remove/${removeConfirmId}`, {
            preserveState: true,
            onSuccess: () => {
                setRemoveConfirmId(null);
                setSelectedStudentIds((prev) => prev.filter((id) => id !== removeConfirmId));
            },
        });
    };

    const handleBulkRemove = () => {
        if (selectedStudentIds.length === 0) return;
        setBulkRemoveConfirm(true);
    };

    const confirmBulkRemove = () => {
        router.post(
            "/class-enrolment/bulk-remove",
            { student_ids: selectedStudentIds },
            {
                preserveState: true,
                onSuccess: () => {
                    setSelectedStudentIds([]);
                    setBulkRemoveConfirm(false);
                },
            },
        );
    };

    const handleAssign = (studentId: number) => {
        router.post(
            "/class-enrolment/assign",
            {
                student_id: studentId,
                class_id: classId,
            },
            {
                preserveState: true,
                onSuccess: () => {
                    setSelectedModalStudentIds((prev) => prev.filter((id) => id !== studentId));
                    if (filteredUnassigned.length <= 1) handleCloseAddStudent();
                },
            },
        );
    };

    const handleBulkAssign = () => {
        if (selectedModalStudentIds.length === 0 || !classId) return;
        router.post(
            "/class-enrolment/bulk-assign",
            {
                class_id: classId,
                student_ids: selectedModalStudentIds,
            },
            {
                preserveState: true,
                onSuccess: () => {
                    setSelectedModalStudentIds([]);
                    handleCloseAddStudent();
                },
            },
        );
    };

    // Table Selection Math
    const allSelected =
        paginatedStudents.length > 0 &&
        paginatedStudents.every((s) => selectedStudentIds.includes(s.id));
    const someSelected =
        paginatedStudents.some((s) => selectedStudentIds.includes(s.id)) && !allSelected;

    const selectedInPageCount = useMemo(
        () => paginatedStudents.filter((s) => selectedStudentIds.includes(s.id)).length,
        [paginatedStudents, selectedStudentIds],
    );

    const handleToggleSelectAll = (checked: boolean) => {
        const pageIds = paginatedStudents.map((s) => s.id);
        if (checked) {
            setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...pageIds])));
        } else {
            const pageSet = new Set(pageIds);
            setSelectedStudentIds((prev) => prev.filter((id) => !pageSet.has(id)));
        }
    };

    const modalAllSelected =
        paginatedUnassigned.length > 0 &&
        paginatedUnassigned.every((s) => selectedModalStudentIds.includes(s.id));
    const modalSomeSelected =
        paginatedUnassigned.some((s) => selectedModalStudentIds.includes(s.id)) &&
        !modalAllSelected;

    const modalSelectedInPageCount = useMemo(
        () => paginatedUnassigned.filter((s) => selectedModalStudentIds.includes(s.id)).length,
        [paginatedUnassigned, selectedModalStudentIds],
    );

    const handleToggleModalSelectAll = (checked: boolean) => {
        const pageIds = paginatedUnassigned.map((s) => s.id);
        if (checked) {
            setSelectedModalStudentIds((prev) => Array.from(new Set([...prev, ...pageIds])));
        } else {
            const pageSet = new Set(pageIds);
            setSelectedModalStudentIds((prev) => prev.filter((id) => !pageSet.has(id)));
        }
    };

    const columns: Column<Student>[] = [
        {
            key: "select",
            header: (
                <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={(e) => handleToggleSelectAll(e.target.checked)}
                />
            ),
            render: (s) => (
                <Checkbox
                    checked={selectedStudentIds.includes(s.id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedStudentIds((prev) => [...prev, s.id]);
                        } else {
                            setSelectedStudentIds((prev) => prev.filter((id) => id !== s.id));
                        }
                    }}
                />
            ),
            className: "w-10 text-center",
        },
        {
            key: "nisn",
            header: "NISN",
            className: "w-36 font-semibold text-text-primary font-inter",
            render: (s) => s.nisn || "-",
        },
        {
            key: "nis",
            header: "NIS",
            className: "w-32 text-text-muted font-inter",
            render: (s) => s.nis || "-",
        },
        {
            key: "name",
            header: "Nama Lengkap Siswa",
            className: "min-w-[220px] font-medium text-text-primary font-inter",
            render: (s) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-[12px] flex items-center justify-center shrink-0 font-inter">
                        {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-semibold text-text-primary truncate" title={s.name}>
                        {s.name}
                    </span>
                </div>
            ),
        },
        {
            key: "email",
            header: "Email Akun Siswa",
            className: "min-w-[180px] text-text-muted font-inter text-[13px]",
            render: (s) => (
                <span className="truncate max-w-[220px] block" title={s.user?.email ?? "-"}>
                    {s.user?.email ?? "-"}
                </span>
            ),
        },
        {
            key: "actions",
            header: <div className="text-center w-full">Aksi</div>,
            className: "w-20 text-center",
            render: (s) => (
                <button
                    onClick={() => handleRemove(s.id)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md text-danger hover:text-danger/90 hover:bg-danger-bg active:bg-danger-light border border-transparent hover:border-danger-light transition-colors cursor-pointer"
                    type="button"
                    title="Keluarkan dari kelas"
                    aria-label="Keluarkan siswa"
                >
                    <FiX className="text-[16px]" />
                </button>
            ),
        },
    ];

    const modalColumns: Column<UnassignedStudent>[] = [
        {
            key: "select",
            header: (
                <Checkbox
                    checked={modalAllSelected}
                    indeterminate={modalSomeSelected}
                    onChange={(e) => handleToggleModalSelectAll(e.target.checked)}
                />
            ),
            render: (s) => (
                <Checkbox
                    checked={selectedModalStudentIds.includes(s.id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedModalStudentIds((prev) => [...prev, s.id]);
                        } else {
                            setSelectedModalStudentIds((prev) =>
                                prev.filter((id) => id !== s.id),
                            );
                        }
                    }}
                />
            ),
            className: "w-10 text-center",
        },
        {
            key: "nis",
            header: "NIS",
            className: "w-1 whitespace-nowrap",
            render: (s) => <span className="text-[13px] text-text-muted">{s.nis}</span>,
        },
        {
            key: "name",
            header: "Nama",
            className: "min-w-0 max-w-[200px]",
            render: (s) => (
                <span className="text-[13px] font-medium text-text-primary truncate block" title={s.name}>
                    {s.name}
                </span>
            ),
        },
        {
            key: "actions",
            header: <div className="text-center w-full">Aksi</div>,
            className: "w-20 text-center whitespace-nowrap",
            render: (s) => (
                <Button size="sm" onClick={() => handleAssign(s.id)}>
                    Tambah
                </Button>
            ),
        },
    ];

    const mobileHeaderActions = selectedClass && !isMobileAddView ? (
        <div className="flex items-center gap-2 sm:hidden font-inter">
            <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                    hasActiveFilters
                        ? "bg-primary text-white"
                        : "bg-muted/60 text-text-primary hover:bg-muted"
                }`}
                title="Filter & Urutkan"
                aria-label="Filter & Urutkan"
            >
                <FiFilter className="text-[14px]" />
            </button>
            <button
                type="button"
                onClick={handleOpenAddStudent}
                disabled={unassignedStudents.length === 0}
                className="w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center hover:brightness-95 active:scale-95 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                title="Tambah Siswa"
                aria-label="Tambah Siswa"
            >
                <FiPlus className="text-[15px]" />
            </button>
        </div>
    ) : undefined;

    const pageTitle = isMobileAddView
        ? `Tambah Siswa (${selectedClass?.name ?? "Kelas"})`
        : "Manajemen & Enrolment Kelas";

    return (
        <AppShell
            title={pageTitle}
            hasTopCard={true}
            onBack={isMobileAddView ? handleCloseAddStudent : undefined}
            headerActions={mobileHeaderActions}
            searchValue={isMobileAddView || !selectedClass ? undefined : search}
            onSearchChange={isMobileAddView || !selectedClass ? undefined : setSearch}
            searchPlaceholder="Cari siswa..."
            showNotificationBellOnMobile={false}
            showBottomNav={!isMobileAddView}
        >
            {/* 📱 DEDICATED MOBILE ADD STUDENT SUB-PAGE (< sm) */}
            {isMobileAddView ? (
                <div className="sm:hidden flex flex-col gap-3 font-inter pb-24">
                    {/* Filter & Search Bar (Standalone Pattern matching Gambar 1) */}
                    <MobileFilterSelectBar
                        selectedCount={modalSelectedInPageCount}
                        totalCount={paginatedUnassigned.length}
                        allSelected={modalAllSelected}
                        indeterminate={modalSomeSelected}
                        onToggleSelectAll={handleToggleModalSelectAll}
                        searchValue={modalSearch}
                        onSearchChange={(val) => {
                            setModalSearch(val);
                            setModalCurrentPage(1);
                        }}
                        searchPlaceholder="Cari NIS, NISN, atau Nama..."
                    />

                    {/* Unassigned Students Feed Cards */}
                    {paginatedUnassigned.length === 0 ? (
                        <Card className="p-8 rounded-2xl shadow-card">
                            <EmptyState
                                variant="no-data"
                                title={modalSearch ? "Tidak Ditemukan Siswa" : "Semua Siswa Terdaftar"}
                                description={
                                    modalSearch
                                        ? `Tidak ada siswa tanpa kelas yang cocok dengan "${modalSearch}".`
                                        : "Seluruh peserta didik sudah memiliki rombongan belajar di sistem."
                                }
                            />
                        </Card>
                    ) : (
                        paginatedUnassigned.map((s) => (
                            <div
                                key={s.id}
                                className="bg-surface border border-border rounded-2xl p-4 shadow-card flex items-center justify-between gap-3"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <Checkbox
                                        checked={selectedModalStudentIds.includes(s.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedModalStudentIds((prev) => [...prev, s.id]);
                                            } else {
                                                setSelectedModalStudentIds((prev) =>
                                                    prev.filter((id) => id !== s.id),
                                                );
                                            }
                                        }}
                                    />
                                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-[13px] flex items-center justify-center shrink-0">
                                        {s.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[14px] font-bold text-text-primary truncate">
                                            {s.name}
                                        </h4>
                                        <p className="text-[11px] text-text-muted">
                                            NIS: {s.nis || "-"} • NISN: {s.nisn || "-"}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => handleAssign(s.id)}
                                    className="shrink-0 h-8 text-[12px] px-3 font-bold rounded-xl"
                                >
                                    Tambah
                                </Button>
                            </div>
                        ))
                    )}

                    {filteredUnassigned.length > modalPageSize && (
                        <div className="pt-2 shrink-0">
                            <MobileNativePagination
                                currentPage={modalSafePage}
                                totalPages={modalTotalPages}
                                totalItems={filteredUnassigned.length}
                                perPage={modalPageSize}
                                onPageChange={setModalCurrentPage}
                            />
                        </div>
                    )}

                    {/* Floating Mobile Action Bar */}
                    <MobileSelectionBar
                        count={selectedModalStudentIds.length}
                        countLabel="Siswa Terpilih"
                        onCancel={() => setSelectedModalStudentIds([])}
                        bottomOffsetClass="bottom-[5.25rem]"
                        actions={[
                            {
                                label: "Tambahkan Ke Kelas",
                                onClick: handleBulkAssign,
                                variant: "primary",
                                icon: <FiUserPlus className="text-[12px]" />,
                            },
                        ]}
                    />
                </div>
            ) : (
                /* 💻 MAIN CLASS ROSTER VIEW */
                <>
                    {/* Page Header with Actions & Search on Right Side (Desktop only lg+) */}
                    <PageHeader
                        title="Manajemen & Enrolment Kelas"
                        description="Petakan rombongan belajar dan tetapkan Wali Kelas untuk tahun ajaran aktif."
                        className="hidden lg:flex shrink-0 mb-4"
                    >
                        {selectedClass && (
                            <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                <div className="w-full sm:w-52 lg:w-60">
                                    <SearchBar
                                        value={search}
                                        onChange={(val) => {
                                            setSearch(val);
                                            setCurrentPage(1);
                                        }}
                                        onSearch={() => setCurrentPage(1)}
                                        placeholder="Cari NISN, NIS, atau Nama..."
                                    />
                                </div>
                            </div>
                        )}
                    </PageHeader>

                    {/* Top Control Panel (Konfigurasi Kelas) */}
                    <div className="bg-surface border border-border rounded-2xl p-3.5 sm:p-4 shadow-card mb-4 font-inter shrink-0 transition-all duration-200">
                        {/* Card Header Row */}
                        <div className="flex items-center justify-between gap-3 min-w-0">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-xl bg-accent/20 text-primary flex items-center justify-center shrink-0">
                                    <FiMonitor className="text-[15px]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <h3 className="text-[14px] sm:text-[15px] font-bold text-text-primary truncate shrink min-w-0">
                                            {selectedClass ? `Kelas ${selectedClass.name}` : "Konfigurasi Kelas & Rombel"}
                                        </h3>
                                        {selectedClass && !isCardExpanded && (
                                            <div className="hidden sm:flex items-center gap-2 text-[12px] text-text-muted min-w-0 shrink overflow-hidden">
                                                <span className="shrink-0">•</span>
                                                <span className="truncate whitespace-nowrap min-w-0">Wali: {selectedClass.teacher?.name ?? "Belum ada"}</span>
                                                <span className="shrink-0">•</span>
                                                <span className="font-bold text-primary whitespace-nowrap shrink-0">{students.length} Siswa</span>
                                            </div>
                                        )}
                                    </div>
                                    {!isCardExpanded && (
                                        <p className="text-[11px] text-text-muted truncate sm:hidden">
                                            Wali: {selectedClass?.teacher?.name ?? "Belum ada"} • {selectedClass ? `${students.length} Siswa` : "-"}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Card Header Right: Desktop Action Buttons + Collapse/Expand Toggle */}
                            <div className="flex items-center gap-2 shrink-0 justify-end">
                                {selectedClass && (
                                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                                        {selectedStudentIds.length > 0 && (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={handleBulkRemove}
                                                icon={<FiUserMinus className="text-[12px]" />}
                                                className="h-8 sm:h-9 px-2.5 sm:px-3 text-[11.5px] sm:text-[12.5px] rounded-xl shrink-0 font-bold whitespace-nowrap"
                                            >
                                                Keluarkan ({selectedStudentIds.length})
                                            </Button>
                                        )}

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
                                                    className="h-8 sm:h-9 px-3 text-[11.5px] sm:text-[12.5px] font-bold rounded-xl shrink-0 whitespace-nowrap"
                                                >
                                                    Filter{hasActiveFilters ? " (Aktif)" : ""}
                                                </Button>
                                            }
                                        >
                                            <div className="flex flex-col gap-4 font-inter">
                                                <div className="flex items-center justify-between border-b border-border pb-2.5">
                                                    <h4 className="text-[14px] font-bold text-text-primary">
                                                        Filter & Urutkan
                                                    </h4>
                                                    {hasActiveFilters && (
                                                        <button
                                                            type="button"
                                                            onClick={handleResetFilters}
                                                            className="text-[12px] font-semibold text-danger hover:underline cursor-pointer"
                                                        >
                                                            Reset Filter
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[12px] font-bold text-text-secondary">
                                                        Urutkan Berdasarkan
                                                    </label>
                                                    <NativeSelect
                                                        value={sortBy}
                                                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                                                        className="h-9 text-[12.5px] rounded-xl"
                                                    >
                                                        <option value="name_asc">Nama (A - Z)</option>
                                                        <option value="name_desc">Nama (Z - A)</option>
                                                        <option value="nisn_asc">NISN (Ascending)</option>
                                                        <option value="nis_asc">NIS (Ascending)</option>
                                                    </NativeSelect>
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[12px] font-bold text-text-secondary">
                                                        Status Email Akun
                                                    </label>
                                                    <NativeSelect
                                                        value={emailFilter}
                                                        onChange={(e) => setEmailFilter(e.target.value as EmailFilterOption)}
                                                        className="h-9 text-[12.5px] rounded-xl"
                                                    >
                                                        <option value="all">Semua Siswa</option>
                                                        <option value="with_email">Punya Email Akun</option>
                                                        <option value="without_email">Belum Ada Email</option>
                                                    </NativeSelect>
                                                </div>
                                            </div>
                                        </FilterPopover>

                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={handleOpenAddStudent}
                                            disabled={unassignedStudents.length === 0}
                                            icon={<FiUserPlus className="text-[12px]" />}
                                            className="h-8 sm:h-9 px-3 sm:px-3.5 text-[11.5px] sm:text-[12.5px] font-bold rounded-xl shadow-xs shrink-0 whitespace-nowrap"
                                        >
                                            Tambah Siswa
                                        </Button>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={toggleCardExpanded}
                                    className="w-8 h-8 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 active:scale-95 text-text-muted hover:text-text-primary flex items-center justify-center transition-all cursor-pointer shrink-0"
                                    title={isCardExpanded ? "Minimize Card (Sembunyikan)" : "Maximize Card (Tampilkan)"}
                                    aria-label={isCardExpanded ? "Minimize panel kontrol" : "Maximize panel kontrol"}
                                >
                                    {isCardExpanded ? (
                                        <FiChevronUp className="text-[16px]" />
                                    ) : (
                                        <FiChevronDown className="text-[16px]" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Collapsible Body Details */}
                        {isCardExpanded && (
                            <div className="pt-3 border-t border-border/60 mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 font-inter">
                                <div className="min-w-0 flex flex-col justify-between">
                                    <label className="text-[12px] font-bold text-text-primary flex items-center gap-1.5 mb-1.5 whitespace-nowrap">
                                        <FiMonitor className="text-primary text-[13px] shrink-0" />
                                        <span>Pilih Kelas / Rombel</span>
                                    </label>
                                    <NativeSelect
                                        value={classId}
                                        className="h-9 text-[12.5px] rounded-xl"
                                        onChange={(e) => {
                                            const nextId = e.target.value;
                                            setClassId(nextId);
                                            setSelectedStudentIds([]);
                                            router.get(
                                                "/class-enrolment",
                                                { class_id: nextId || undefined },
                                                { preserveState: true },
                                            );
                                        }}
                                    >
                                        <option value="">-- Pilih Kelas --</option>
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id.toString()}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </div>

                                <div className="min-w-0 flex flex-col justify-between">
                                    <span className="text-[12px] font-bold text-text-primary flex items-center gap-1.5 mb-1.5 whitespace-nowrap">
                                        <FiUser className="text-primary text-[13px] shrink-0" />
                                        <span>Wali Kelas Terdaftar</span>
                                    </span>
                                    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-border bg-muted/20 h-9">
                                        {(selectedClass?.teacher?.user?.avatar || selectedClass?.teacher?.avatar) ? (
                                            <img
                                                src={selectedClass.teacher.user?.avatar || selectedClass.teacher.avatar}
                                                alt={selectedClass.teacher.name}
                                                className="w-5 h-5 rounded-full object-cover border border-border shrink-0"
                                            />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-[9px] shrink-0 uppercase tracking-tighter">
                                                {selectedClass?.teacher?.name
                                                    ? selectedClass.teacher.name
                                                        .replace(/^(Drs\.|Dr\.|H\.|Hj\.|Ir\.)\s+/i, "")
                                                        .trim()
                                                        .split(/\s+/)
                                                        .slice(0, 2)
                                                        .map((p) => p[0])
                                                        .join("")
                                                        .toUpperCase()
                                                    : "?"}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1 flex items-center justify-between gap-1.5">
                                            <p className="font-bold text-text-primary text-[12.5px] truncate" title={selectedClass?.teacher?.name ?? "Belum ada wali kelas"}>
                                                {selectedClass?.teacher?.name ?? "Belum ada"}
                                            </p>
                                            {selectedClass?.teacher && (
                                                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-success-bg text-success border border-success/20 shrink-0">
                                                    Aktif
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="min-w-0 flex flex-col justify-between">
                                    <span className="text-[12px] font-bold text-text-primary flex items-center gap-1.5 mb-1.5 whitespace-nowrap">
                                        <FiUsers className="text-primary text-[13px] shrink-0" />
                                        <span>Total Siswa Terdaftar</span>
                                    </span>
                                    <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border border-border bg-muted/20 h-9">
                                        <span className="text-[12px] font-semibold text-text-secondary font-inter whitespace-nowrap">Kapasitas Active</span>
                                        <span className="text-[13px] font-extrabold text-primary font-inter whitespace-nowrap">
                                            {selectedClass ? `${students.length} Siswa` : "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Roster Layout */}
                    <div className="w-full flex-1 flex flex-col gap-3 font-inter sm:min-h-0">
                        {selectedClass ? (
                            <div className="flex-1 flex flex-col justify-between gap-3 sm:min-h-0">
                                {/* Mobile View (< sm): Native Cards Feed */}
                                <div className="sm:hidden flex flex-col gap-3">
                                    <MobileFilterSelectBar
                                        selectedCount={selectedInPageCount}
                                        totalCount={paginatedStudents.length}
                                        allSelected={allSelected}
                                        indeterminate={someSelected}
                                        onToggleSelectAll={handleToggleSelectAll}
                                        searchValue={search}
                                        onSearchChange={(val) => {
                                            setSearch(val);
                                            setCurrentPage(1);
                                        }}
                                        searchPlaceholder="Cari NISN, NIS, atau Nama..."
                                    />

                                    {paginatedStudents.length === 0 ? (
                                        <Card className="p-8 rounded-2xl shadow-card">
                                            <EmptyState
                                                variant="no-data"
                                                title={search ? "Tidak Ditemukan Siswa" : "Belum Ada Siswa"}
                                                description={
                                                    search
                                                        ? `Tidak ditemukan siswa yang cocok dengan pencarian "${search}".`
                                                        : "Belum ada siswa yang terdaftar di kelas ini."
                                                }
                                                actionLabel={!search && unassignedStudents.length > 0 ? "Tambah Siswa" : undefined}
                                                actionOnClick={
                                                    !search && unassignedStudents.length > 0
                                                        ? handleOpenAddStudent
                                                        : undefined
                                                }
                                            />
                                        </Card>
                                    ) : (
                                        paginatedStudents.map((s) => (
                                            <div
                                                key={s.id}
                                                className="bg-surface border border-border rounded-2xl p-4 shadow-card flex flex-col gap-3"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <Checkbox
                                                            checked={selectedStudentIds.includes(s.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedStudentIds((prev) => [...prev, s.id]);
                                                                } else {
                                                                    setSelectedStudentIds((prev) => prev.filter((id) => id !== s.id));
                                                                }
                                                            }}
                                                        />
                                                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-[13px] flex items-center justify-center shrink-0">
                                                            {s.name.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="text-[14px] font-bold text-text-primary truncate">
                                                                {s.name}
                                                            </h4>
                                                            <p className="text-[11px] text-text-muted">
                                                                NISN: {s.nisn || "-"} • NIS: {s.nis || "-"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemove(s.id)}
                                                        className="w-8 h-8 rounded-full text-danger hover:bg-danger-bg active:scale-95 flex items-center justify-center shrink-0 transition-all cursor-pointer"
                                                        title="Keluarkan dari kelas"
                                                        aria-label="Keluarkan siswa"
                                                    >
                                                        <FiX className="text-[16px]" />
                                                    </button>
                                                </div>
                                                {s.user?.email && (
                                                    <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                                                        <span>Email: {s.user.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}

                                    {filteredStudents.length > pageSize && (
                                        <div className="pt-2 shrink-0 font-inter">
                                            <MobileNativePagination
                                                currentPage={safePage}
                                                totalPages={totalPages}
                                                totalItems={filteredStudents.length}
                                                perPage={pageSize}
                                                onPageChange={setCurrentPage}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Tablet & Desktop View (>= sm): Standard Table */}
                                <div className="hidden sm:flex flex-1 min-h-0 flex-col justify-between gap-3">
                                    <Table
                                        columns={columns}
                                        data={paginatedStudents}
                                        keyExtractor={(s) => s.id}
                                        containerClassName="flex-1 min-h-0 overflow-auto bg-surface"
                                        emptyMessage={
                                            search
                                                ? "Tidak ditemukan siswa yang cocok dengan pencarian."
                                                : "Belum ada siswa di kelas ini."
                                        }
                                    />
                                    <TableFooter
                                        itemLabel="siswa terdaftar"
                                        currentPage={safePage}
                                        totalPages={totalPages}
                                        totalItems={filteredStudents.length}
                                        perPage={pageSize}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            </div>
                        ) : (
                            <Card className="flex-1 min-h-0 flex flex-col items-center justify-center bg-surface border border-border rounded-xl p-8 sm:p-12 text-center shadow-card">
                                <EmptyState
                                    variant="no-data"
                                    title="Belum Ada Kelas yang Dipilih"
                                    description="Silakan pilih kelas pada panel kontrol di atas untuk mengelola rombongan belajar dan daftar siswa terdaftar."
                                />
                            </Card>
                        )}
                    </div>

                    {/* Floating Bulk Action Bar on Mobile (< sm) */}
                    <MobileSelectionBar
                        count={selectedStudentIds.length}
                        countLabel="Siswa Terpilih"
                        onCancel={() => setSelectedStudentIds([])}
                        actions={[
                            {
                                label: "Keluarkan",
                                onClick: handleBulkRemove,
                                variant: "danger",
                                icon: <FiUserMinus className="text-[12px]" />,
                            },
                        ]}
                    />

                    {/* 📐 SIDE DRAWER FOR TABLET & DESKTOP (>= sm) */}
                    <Drawer
                        open={showAddModal}
                        onClose={handleCloseAddStudent}
                        title={`Tambah Siswa ke Kelas ${selectedClass?.name ?? ""}`}
                        description="Pilih siswa yang belum terdaftar di rombongan belajar mana pun untuk dimasukkan ke kelas ini."
                        headerActions={
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0 select-none">
                                <FiUsers className="w-3.5 h-3.5" />
                                <span>{unassignedStudents.length} Belum Punya Kelas</span>
                            </span>
                        }
                        width="xl"
                        showFooter={true}
                        leftFooter={
                            filteredUnassigned.length > modalPageSize ? (
                                <Pagination
                                    currentPage={modalSafePage}
                                    totalPages={modalTotalPages}
                                    totalItems={filteredUnassigned.length}
                                    perPage={modalPageSize}
                                    onPageChange={setModalCurrentPage}
                                    compact
                                    align="start"
                                />
                            ) : null
                        }
                        submitLabel={`Tambahkan (${selectedModalStudentIds.length} Siswa)`}
                        submitVariant="primary"
                        cancelLabel="Tutup"
                        disabled={selectedModalStudentIds.length === 0}
                        onSubmit={handleBulkAssign}
                        asForm={false}
                        onCancel={handleCloseAddStudent}
                    >
                        <div className="flex flex-col gap-4">
                            {unassignedStudents.length > 0 && (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1">
                                        <SearchBar
                                            value={modalSearch}
                                            onChange={(val) => {
                                                setModalSearch(val);
                                                setModalCurrentPage(1);
                                            }}
                                            onSearch={() => setModalCurrentPage(1)}
                                            placeholder="Cari NIS / Nama siswa..."
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="overflow-x-auto min-h-[320px]">
                                <Table
                                    columns={modalColumns}
                                    data={paginatedUnassigned}
                                    keyExtractor={(s) => s.id}
                                    emptyMessage={
                                        modalSearch
                                            ? "Tidak ada siswa yang cocok dengan pencarian."
                                            : "Semua siswa telah terdaftar di kelas."
                                    }
                                />
                            </div>
                        </div>
                    </Drawer>
                </>
            )}

            {/* Remove Single Confirmation Modal */}
            <ConfirmDialog
                open={removeConfirmId !== null}
                onClose={() => setRemoveConfirmId(null)}
                onConfirm={confirmRemove}
                title="Hapus Siswa dari Kelas?"
                message="Siswa akan dipindahkan ke daftar siswa tanpa kelas. Tindakan ini dapat dibatalkan nanti."
                confirmLabel="Hapus"
                variant="danger"
            />

            <ConfirmDialog
                open={bulkRemoveConfirm}
                onClose={() => setBulkRemoveConfirm(false)}
                onConfirm={confirmBulkRemove}
                title="Keluarkan Siswa"
                message={`Keluarkan ${selectedStudentIds.length} siswa terpilih dari kelas ini?`}
                confirmLabel="Keluarkan"
                variant="danger"
            />

            {/* 📱 MOBILE FILTER BOTTOM SHEET */}
            <BottomSheet
                open={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                title="Filter & Urutkan Siswa"
                subtitle="Sesuaikan kriteria pencarian dan urutan siswa"
            >
                <div className="flex flex-col gap-4 font-inter pb-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-text-secondary">
                            Urutkan Berdasarkan
                        </label>
                        <NativeSelect
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="h-10 text-[13px] rounded-xl"
                        >
                            <option value="name_asc">Nama (A - Z)</option>
                            <option value="name_desc">Nama (Z - A)</option>
                            <option value="nisn_asc">NISN (Ascending)</option>
                            <option value="nis_asc">NIS (Ascending)</option>
                        </NativeSelect>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-text-secondary">
                            Status Email Akun
                        </label>
                        <NativeSelect
                            value={emailFilter}
                            onChange={(e) => setEmailFilter(e.target.value as EmailFilterOption)}
                            className="h-10 text-[13px] rounded-xl"
                        >
                            <option value="all">Semua Siswa</option>
                            <option value="with_email">Memiliki Email Akun</option>
                            <option value="without_email">Belum Memiliki Email Akun</option>
                        </NativeSelect>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        {hasActiveFilters && (
                            <Button
                                variant="secondary"
                                onClick={handleResetFilters}
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

