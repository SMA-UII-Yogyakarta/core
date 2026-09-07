import { router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
    PageHeader,
    ImportModal,
    ConfirmDialog,
    Button,
    NativeSelect,
    SelectInput,
    TabSwitcher,
    Modal,
    MobileSelectionBar,
    BottomSheet,
    FilterPopover,
} from "@/Components";
import AppShell from "@/Layouts/AppShell";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiAlertCircle,
    FiUpload,
    FiPlus,
    FiTrash2,
    FiFilter,
    FiUsers,
    FiUserCheck,
    FiBookOpen,
    FiShield,
    FiChevronRight,
    FiLayers,
    FiZap,
} from "react-icons/fi";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { MasterDataProps } from "./MasterData/types";
import StudentsTab from "./MasterData/StudentsTab";
import TeachersTab from "./MasterData/TeachersTab";
import ClassesTab from "./MasterData/ClassesTab";
import GuardiansTab from "./MasterData/GuardiansTab";

const activeTabMap: Record<string, string> = {
    siswa: "students",
    students: "students",
    guru: "teachers",
    teachers: "teachers",
    classes: "class",
    class: "class",
    guardians: "guardians",
};

const tabs = [
    { key: "students", label: "Siswa", icon: <FiUsers className="text-[14px]" /> },
    { key: "teachers", label: "Tenaga Pendidik", icon: <FiUserCheck className="text-[14px]" /> },
    { key: "class", label: "Kelas & Rombel", icon: <FiBookOpen className="text-[14px]" /> },
    { key: "guardians", label: "Wali Murid", icon: <FiShield className="text-[14px]" /> },
];

const tabIconButtons = [
    { key: "students", title: "Data Siswa", icon: FiUsers },
    { key: "teachers", title: "Tenaga Pendidik", icon: FiUserCheck },
    { key: "class", title: "Kelas & Rombel", icon: FiBookOpen },
    { key: "guardians", title: "Wali Murid", icon: FiShield },
];

export default function MasterData({
    students,
    teachers,
    allTeachers = [],
    schoolClasses,
    classOptions = [],
    allGuardians = [],
    guardians,
    searchConfig,
    activeTab,
    filters = {},
    initialCreateTab = null,
}: MasterDataProps) {
    const isDesktop = useMediaQuery("(min-width: 640px)");

    // Resolve initial mobile subpage from URL query parameters
    const getInitialMobileSubPage = (): "students" | "teachers" | "class" | "guardians" | null => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get("tab");
            if (tab && activeTabMap[tab]) {
                return activeTabMap[tab] as "students" | "teachers" | "class" | "guardians";
            }
        }
        return null;
    };

    const [mobileSubPage, setMobileSubPage] = useState<
        "students" | "teachers" | "class" | "guardians" | null
    >(getInitialMobileSubPage);

    const [currentTab, setCurrentTab] = useState<string>(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get("tab");
            if (tab && activeTabMap[tab]) return activeTabMap[tab];
        }
        if (activeTab && activeTabMap[activeTab]) return activeTabMap[activeTab];
        return "students";
    });

    // Listen to browser physical back/forward navigation (popstate)
    useEffect(() => {
        const handlePopState = () => {
            if (typeof window !== "undefined") {
                const params = new URLSearchParams(window.location.search);
                const tab = params.get("tab");
                if (tab && activeTabMap[tab]) {
                    const mapped = activeTabMap[tab] as "students" | "teachers" | "class" | "guardians";
                    setMobileSubPage(mapped);
                    setCurrentTab(mapped);
                } else {
                    setMobileSubPage(null);
                }
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    // Modal & Drawer Trigger States
    const [createTab, setCreateTab] = useState<
        "students" | "teachers" | "class" | "guardians" | null
    >(initialCreateTab ?? null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importEntity, setImportEntity] = useState<
        "students" | "teachers" | "classes" | "guardians"
    >("students");

    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);

    const [deleteConfirm, setDeleteConfirm] = useState<{
        open: boolean;
        entity: string | null;
        ids: number | number[] | null;
        label: string;
    }>({ open: false, entity: null, ids: null, label: "" });

    const [search, setSearch] = useState(filters?.search ?? "");
    const [selectedClassId, setSelectedClassId] = useState(filters?.class_id ?? "");
    const [selectedStatus, setSelectedStatus] = useState(filters?.status ?? "");
    const [selectedTeacherType, setSelectedTeacherType] = useState(filters?.teacher_type ?? "");
    const [selectedLevel, setSelectedLevel] = useState(filters?.level ?? "");
    const [selectedHasStudent, setSelectedHasStudent] = useState(filters?.has_student ?? "");

    const { errors } = usePage().props as unknown as { errors: Record<string, string> };

    const handleDesktopTabChange = (key: string) => {
        setCurrentTab(key);
        setSelectedIds([]);
        setSearch("");
        setSelectedClassId("");
        setSelectedStatus("");
        setSelectedTeacherType("");
        setSelectedLevel("");
        setSelectedHasStudent("");
        router.visit(`/master-data?tab=${key}`, { preserveState: false, preserveScroll: true });
    };

    const handleOpenMobileSubPage = (key: "students" | "teachers" | "class" | "guardians") => {
        setMobileSubPage(key);
        setCurrentTab(key);
        setSelectedIds([]);
        setSearch("");
        setSelectedClassId("");
        setSelectedStatus("");
        setSelectedTeacherType("");
        setSelectedLevel("");
        setSelectedHasStudent("");

        if (typeof window !== "undefined") {
            window.history.pushState({ tab: key }, "", `/master-data?tab=${key}`);
        }

        router.get(
            "/master-data",
            { tab: key },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleMobileBackToHub = () => {
        setMobileSubPage(null);
        setSelectedIds([]);
        setSearch("");
        setSelectedClassId("");
        setSelectedStatus("");
        setSelectedTeacherType("");
        setSelectedLevel("");
        setSelectedHasStudent("");

        if (typeof window !== "undefined") {
            window.history.pushState({ tab: null }, "", "/master-data");
        }
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        router.get(
            "/master-data",
            {
                tab: currentTab,
                search: val || undefined,
                class_id: currentTab === "students" ? selectedClassId || undefined : undefined,
                status: currentTab === "students" ? selectedStatus || undefined : undefined,
                teacher_type: currentTab === "teachers" ? selectedTeacherType || undefined : undefined,
                level: currentTab === "class" ? selectedLevel || undefined : undefined,
                has_student: currentTab === "guardians" ? selectedHasStudent || undefined : undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterChange = (key: string, val: string) => {
        if (key === "class_id") setSelectedClassId(val);
        if (key === "status") setSelectedStatus(val);
        if (key === "teacher_type") setSelectedTeacherType(val);
        if (key === "level") setSelectedLevel(val);
        if (key === "has_student") setSelectedHasStudent(val);

        router.get(
            "/master-data",
            {
                tab: currentTab,
                search: search || undefined,
                class_id: key === "class_id" ? val || undefined : selectedClassId || undefined,
                status: key === "status" ? val || undefined : selectedStatus || undefined,
                teacher_type: key === "teacher_type" ? val || undefined : selectedTeacherType || undefined,
                level: key === "level" ? val || undefined : selectedLevel || undefined,
                has_student: key === "has_student" ? val || undefined : selectedHasStudent || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        setSearch("");
        setSelectedClassId("");
        setSelectedStatus("");
        setSelectedTeacherType("");
        setSelectedLevel("");
        setSelectedHasStudent("");
        router.get(
            "/master-data",
            { tab: currentTab },
            { preserveState: true, replace: true }
        );
    };

    const requestDelete = (
        entity: string,
        ids: number | number[],
        label: string
    ) => {
        setDeleteConfirm({
            open: true,
            entity,
            ids,
            label,
        });
    };

    const handleConfirmDelete = () => {
        if (!deleteConfirm.entity || deleteConfirm.ids === null) return;

        if (Array.isArray(deleteConfirm.ids)) {
            router.post(
                `/master-data/${deleteConfirm.entity}`,
                { ids: deleteConfirm.ids },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setDeleteConfirm({ open: false, entity: null, ids: null, label: "" });
                        setSelectedIds([]);
                    },
                }
            );
        } else {
            router.delete(`/master-data/${deleteConfirm.entity}/${deleteConfirm.ids}`, {
                preserveScroll: true,
                onSuccess: () =>
                    setDeleteConfirm({ open: false, entity: null, ids: null, label: "" }),
            });
        }
    };

    const hasActiveFilters = Boolean(
        search ||
        (currentTab === "students" && (selectedClassId || selectedStatus)) ||
        (currentTab === "teachers" && selectedTeacherType) ||
        (currentTab === "class" && selectedLevel) ||
        (currentTab === "guardians" && selectedHasStudent)
    );
    const currentImportEntity =
        currentTab === "class"
            ? "classes"
            : (currentTab as "students" | "teachers" | "guardians");

    const getAddLabel = () => {
        switch (currentTab) {
            case "students":
                return "Tambah Siswa";
            case "teachers":
                return "Tambah Guru";
            case "class":
                return "Tambah Kelas";
            case "guardians":
                return "Tambah Wali";
            default:
                return "Tambah Data";
        }
    };

    const getMobileHeaderTitle = () => {
        if (!mobileSubPage) return "Master Data";
        switch (mobileSubPage) {
            case "students":
                return "Data Siswa";
            case "teachers":
                return "Tenaga Pendidik";
            case "class":
                return "Kelas & Rombel";
            case "guardians":
                return "Wali Murid";
            default:
                return "Master Data";
        }
    };

    const getEntityLabel = () => {
        switch (currentTab) {
            case "students":
                return "Siswa";
            case "teachers":
                return "Guru";
            case "class":
                return "Kelas";
            case "guardians":
                return "Wali Murid";
            default:
                return "Data";
        }
    };



    const mobileHeaderActions = (
        <>
            {mobileSubPage && (
                <div className="flex sm:hidden items-center gap-1.5 select-none font-inter">
                    <button
                        type="button"
                        onClick={() => setIsMobileFilterOpen(true)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                            hasActiveFilters
                                ? "bg-accent text-primary font-bold shadow-sm"
                                : "bg-white/15 border border-white/20 text-white hover:bg-white/25 active:bg-white/30"
                        }`}
                        aria-label="Filter Data"
                        title="Filter Data"
                    >
                        <FiFilter className="text-[14px]" />
                    </button>

                    {currentTab !== "class" && (
                        <button
                            type="button"
                            onClick={() => {
                                if (typeof window !== "undefined" && window.innerWidth < 640) {
                                    router.visit(`/master-data/import-page?tab=${currentTab}`);
                                } else {
                                    setImportEntity(currentImportEntity);
                                    setImportModalOpen(true);
                                }
                            }}
                            className="w-8 h-8 rounded-full bg-white/15 border border-white/20 text-white hover:bg-white/25 active:bg-white/30 active:scale-90 text-[15px] transition-all flex items-center justify-center cursor-pointer"
                            aria-label="Import CSV"
                            title={`Import Data ${getMobileHeaderTitle()}`}
                        >
                            <FiUpload className="text-[15px]" />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => router.visit(`/master-data/create?tab=${currentTab}`)}
                        className="w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center hover:brightness-95 active:scale-95 transition-all cursor-pointer shadow-xs"
                        title={getAddLabel()}
                        aria-label={getAddLabel()}
                    >
                        <FiPlus className="text-[15px]" />
                    </button>
                </div>
            )}
        </>
    );

    // Hub Directory Cards Configuration
    const directoryCards = [
        {
            key: "students" as const,
            title: "Data Siswa",
            subtitle: "Direktori peserta didik, NISN, status, dan penempatan kelas.",
            count: students?.total ?? 0,
            unit: "Siswa",
            icon: <FiUsers className="w-6 h-6 text-blue-600" />,
            iconBg: "bg-blue-500/10 border-blue-500/20",
            badgeColor: "bg-blue-500/10 text-blue-700 border-blue-500/20",
        },
        {
            key: "teachers" as const,
            title: "Tenaga Pendidik",
            subtitle: "Direktori guru, kode NIP, wali kelas binaan, dan guru piket.",
            count: teachers?.total ?? 0,
            unit: "Guru & Staf",
            icon: <FiUserCheck className="w-6 h-6 text-emerald-600" />,
            iconBg: "bg-emerald-500/10 border-emerald-500/20",
            badgeColor: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
        },
        {
            key: "class" as const,
            title: "Kelas & Rombel",
            subtitle: "Direktori rombongan belajar, tingkat kelas, tahun ajaran, dan kapasitas.",
            count: schoolClasses?.total ?? 0,
            unit: "Rombel",
            icon: <FiBookOpen className="w-6 h-6 text-purple-600" />,
            iconBg: "bg-purple-500/10 border-purple-500/20",
            badgeColor: "bg-purple-500/10 text-purple-700 border-purple-500/20",
        },
        {
            key: "guardians" as const,
            title: "Wali Murid",
            subtitle: "Data orang tua/wali murid untuk pemantauan presensi dan izin.",
            count: guardians?.total ?? 0,
            unit: "Wali Terdaftar",
            icon: <FiShield className="w-6 h-6 text-amber-600" />,
            iconBg: "bg-amber-500/10 border-amber-500/20",
            badgeColor: "bg-amber-500/10 text-amber-700 border-amber-500/20",
        },
    ];

    const handleCloseCreate = () => {
        setCreateTab(null);
        if (
            typeof window !== "undefined" &&
            (window.location.pathname.includes("/create") || window.location.pathname.includes("/edit"))
        ) {
            router.visit(`/master-data?tab=${currentTab}`);
        }
    };

    const getSearchPlaceholder = () => {
        switch (currentTab) {
            case "students":
                return "Cari NIS, nama...";
            case "teachers":
                return "Cari NIP, kode, nama...";
            case "class":
                return "Cari nama kelas atau wali...";
            case "guardians":
                return "Cari NIK, nama wali...";
            default:
                return "Cari data...";
        }
    };

    return (
        <AppShell
            title={getMobileHeaderTitle()}
            hasTopCard={true}
            onBack={mobileSubPage && !isDesktop ? handleMobileBackToHub : undefined}
            headerActions={mobileHeaderActions}
            showNotificationBell={mobileSubPage === null || isDesktop}
            searchValue={search}
            onSearchChange={(val) => handleSearch(val)}
            searchPlaceholder={getSearchPlaceholder()}
        >
            {/* ───────────────────────────────────────────────────────────── */}
            {/* DESKTOP & TABLET LAYOUT (>= sm) */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="hidden sm:flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* Desktop PageHeader (hidden on mobile & tablet) */}
                <PageHeader
                    title="Master Data Sekolah & Institusi"
                    description="Kelola data siswa, guru, kelas, serta mata pelajaran institusi secara terpusat."
                    className="hidden lg:flex shrink-0 mb-4"
                >
                    {selectedIds.length > 0 && (
                        <button
                            type="button"
                            onClick={() =>
                                requestDelete(
                                    currentImportEntity,
                                    selectedIds,
                                    `${selectedIds.length} ${getEntityLabel()} Terpilih`
                                )
                            }
                            className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-danger text-white text-[13px] font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-xs"
                        >
                            <FiTrash2 className="text-[13px]" />
                            Hapus ({selectedIds.length})
                        </button>
                    )}
                    {currentTab !== "class" && (
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={<FiUpload className="text-[13px]" />}
                            onClick={() => {
                                setImportEntity(currentImportEntity);
                                setImportModalOpen(true);
                            }}
                            className="h-9 px-3.5 text-[13px] font-bold shadow-xs"
                        >
                            Import CSV
                        </Button>
                    )}
                    <Button
                        variant="primary"
                        size="sm"
                        icon={<FiPlus className="text-[13px]" />}
                        onClick={() => {
                            if (!isDesktop) {
                                router.visit(`/master-data/create?tab=${currentTab}`);
                            } else {
                                setCreateTab(
                                    currentTab as "students" | "teachers" | "guardians" | "class"
                                );
                            }
                        }}
                        className="h-9 px-3.5 text-[13px] font-bold shadow-xs"
                    >
                        {`Tambah ${
                            currentTab === "teachers"
                                ? "Guru"
                                : currentTab === "students"
                                ? "Siswa"
                                : currentTab === "class"
                                ? "Kelas"
                                : "Wali"
                        }`}
                    </Button>
                </PageHeader>

                {/* Body Area: Horizontal Toolbar + Main Table Panel */}
                <div className="flex flex-col gap-3.5 sm:gap-4 flex-1 min-h-0 overflow-hidden">
                    {/* Main Table Panel */}
                    <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                        {/* Toolbar Row: Horizontal Tab Buttons on left, Yellow FilterPopover & Actions on right */}
                        <div className="flex items-center justify-between gap-2.5 sm:gap-3 mb-4 shrink-0 font-inter w-full min-w-0">
                            {/* Left (Tablet only sm & md): Horizontal Icon Rail matching vertical icon style */}
                            <div className="hidden sm:flex lg:hidden items-center gap-1.5 bg-surface/95 backdrop-blur-md border border-border p-1 rounded-2xl shadow-xs shrink-0">
                                {tabIconButtons.map((card) => {
                                    const isActive = currentTab === card.key;
                                    const IconComponent = card.icon;
                                    return (
                                        <button
                                            key={card.key}
                                            type="button"
                                            onClick={() => handleDesktopTabChange(card.key)}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer relative ${
                                                isActive
                                                    ? "bg-primary text-white shadow-md border border-primary/30"
                                                    : "text-text-secondary hover:bg-primary/10 hover:text-primary active:scale-95"
                                            }`}
                                            title={card.title}
                                        >
                                            <IconComponent className="text-[18px]" />
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Left (Desktop >= lg): Full Segmented TabSwitcher */}
                            <div className="hidden lg:block flex-1 min-w-0 overflow-x-auto no-scrollbar scrollbar-none">
                                <TabSwitcher
                                    tabs={tabs}
                                    activeKey={currentTab}
                                    onChange={handleDesktopTabChange}
                                    variant="segmented"
                                    className="shrink min-w-0"
                                />
                            </div>

                            {/* Filter Group: Yellow FilterPopover (variant=accent) */}
                            <div className="flex items-center gap-2.5 shrink-0 ml-auto font-inter">
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
                                            Filter{selectedClassId || selectedStatus || selectedTeacherType || selectedLevel || selectedHasStudent ? " (Aktif)" : ""}
                                        </Button>
                                    }
                                >
                                    <div className="flex flex-col gap-3 font-inter min-w-[220px]">
                                        <div className="flex items-center justify-between border-b border-border pb-2">
                                            <h4 className="text-[13.5px] font-bold text-text-primary">Filter Data</h4>
                                            {Boolean(selectedClassId || selectedStatus || selectedTeacherType || selectedLevel || selectedHasStudent) && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleResetFilters();
                                                        setIsDesktopFilterOpen(false);
                                                    }}
                                                    className="text-[11.5px] font-semibold text-danger hover:underline cursor-pointer"
                                                >
                                                    Reset Filter
                                                </button>
                                            )}
                                        </div>

                                        {currentTab === "students" && (
                                            <>
                                                <div>
                                                    <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                                        Rombongan Belajar / Kelas
                                                    </label>
                                                    <NativeSelect
                                                        value={selectedClassId}
                                                        onChange={(e) => handleFilterChange("class_id", e.target.value)}
                                                        className="h-9 text-[12.5px] rounded-xl w-full"
                                                    >
                                                        <option value="">Semua Kelas</option>
                                                        {classOptions.map((c) => (
                                                            <option key={c.id} value={c.id}>
                                                                {c.name}
                                                            </option>
                                                        ))}
                                                    </NativeSelect>
                                                </div>
                                                <div>
                                                    <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                                        Status Keaktifan
                                                    </label>
                                                    <NativeSelect
                                                        value={selectedStatus}
                                                        onChange={(e) => handleFilterChange("status", e.target.value)}
                                                        className="h-9 text-[12.5px] rounded-xl w-full"
                                                    >
                                                        <option value="">Semua Status</option>
                                                        <option value="Active">Aktif</option>
                                                        <option value="Inactive">Non-Aktif</option>
                                                    </NativeSelect>
                                                </div>
                                            </>
                                        )}

                                        {currentTab === "teachers" && (
                                            <>
                                                <div>
                                                    <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                                        Penugasan Guru
                                                    </label>
                                                    <NativeSelect
                                                        value={selectedTeacherType}
                                                        onChange={(e) => handleFilterChange("teacher_type", e.target.value)}
                                                        className="h-9 text-[12.5px] rounded-xl w-full"
                                                    >
                                                        <option value="">Semua Penugasan</option>
                                                        <option value="duty">Guru Piket</option>
                                                        <option value="homeroom">Wali Kelas</option>
                                                    </NativeSelect>
                                                </div>
                                                <div>
                                                    <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                                        Status Keaktifan
                                                    </label>
                                                    <NativeSelect
                                                        value={selectedStatus}
                                                        onChange={(e) => handleFilterChange("status", e.target.value)}
                                                        className="h-9 text-[12.5px] rounded-xl w-full"
                                                    >
                                                        <option value="">Semua Status</option>
                                                        <option value="Active">Aktif</option>
                                                        <option value="Inactive">Non-Aktif</option>
                                                    </NativeSelect>
                                                </div>
                                            </>
                                        )}

                                        {currentTab === "class" && (
                                            <div>
                                                <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                                    Tingkat Kelas
                                                </label>
                                                <NativeSelect
                                                    value={selectedLevel}
                                                    onChange={(e) => handleFilterChange("level", e.target.value)}
                                                    className="h-9 text-[12.5px] rounded-xl w-full"
                                                >
                                                    <option value="">Semua Tingkat</option>
                                                    <option value="X">Kelas X</option>
                                                    <option value="XI">Kelas XI</option>
                                                    <option value="XII">Kelas XII</option>
                                                </NativeSelect>
                                            </div>
                                        )}

                                        {currentTab === "guardians" && (
                                            <div>
                                                <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                                    Status Relasi Siswa
                                                </label>
                                                <NativeSelect
                                                    value={selectedHasStudent}
                                                    onChange={(e) => handleFilterChange("has_student", e.target.value)}
                                                    className="h-9 text-[12.5px] rounded-xl w-full"
                                                >
                                                    <option value="">Semua Wali</option>
                                                    <option value="linked">Terhubung Siswa</option>
                                                    <option value="unlinked">Belum Terhubung</option>
                                                </NativeSelect>
                                            </div>
                                        )}
                                    </div>
                                </FilterPopover>
                            </div>

                            {/* Far Right Action Controls for Tablet View (< 1024px) */}
                            {/* Option A: Small Tablet (< 768px / md:hidden) -> Standalone Hapus button beside Aksi Data */}
                            <div className="flex md:hidden items-center gap-2 shrink-0">
                                {selectedIds.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            requestDelete(
                                                currentImportEntity,
                                                selectedIds,
                                                `${selectedIds.length} ${getEntityLabel()} Terpilih`
                                            )
                                        }
                                        className="flex items-center gap-1.5 h-10 px-3 rounded-xl bg-danger text-white text-[12.5px] font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                                    >
                                        <FiTrash2 className="text-[14px]" />
                                        Hapus ({selectedIds.length})
                                    </button>
                                )}

                                {currentTab !== "class" ? (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        icon={<FiZap className="text-[14px]" />}
                                        onClick={() => setActionModalOpen(true)}
                                        className="h-10 px-3.5 text-[12.5px] font-bold shadow-xs whitespace-nowrap shrink-0"
                                    >
                                        Aksi Data
                                    </Button>
                                ) : (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        icon={<FiPlus className="text-[13px]" />}
                                        onClick={() => {
                                            if (!isDesktop) {
                                                router.visit(`/master-data/create?tab=${currentTab}`);
                                            } else {
                                                setCreateTab(
                                                    currentTab as "students" | "teachers" | "guardians" | "class"
                                                );
                                            }
                                        }}
                                        className="h-10 px-3.5 text-[12.5px] font-bold shadow-xs whitespace-nowrap shrink-0"
                                    >
                                        {getAddLabel()}
                                    </Button>
                                )}
                            </div>

                            {/* Option B: Medium/Large Tablet (768px - 1023px / md:flex lg:hidden) -> Explicit Dual Action Buttons in line with filters */}
                            <div className="hidden md:flex lg:hidden items-center gap-2 shrink-0">
                                {selectedIds.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            requestDelete(
                                                currentImportEntity,
                                                selectedIds,
                                                `${selectedIds.length} ${getEntityLabel()} Terpilih`
                                            )
                                        }
                                        className="flex items-center gap-1.5 h-10 px-3 rounded-xl bg-danger text-white text-[12.5px] font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-xs whitespace-nowrap"
                                    >
                                        <FiTrash2 className="text-[14px]" />
                                        Hapus ({selectedIds.length})
                                    </button>
                                )}

                                {currentTab !== "class" && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        icon={<FiUpload className="text-[13px]" />}
                                        onClick={() => {
                                            if (typeof window !== "undefined" && window.innerWidth < 640) {
                                                router.visit(`/master-data/import-page?tab=${currentTab}`);
                                            } else {
                                                setImportEntity(currentImportEntity);
                                                setImportModalOpen(true);
                                            }
                                        }}
                                        className="h-10 px-3 text-[12.5px] font-bold shadow-xs whitespace-nowrap"
                                    >
                                        Import CSV
                                    </Button>
                                )}

                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={<FiPlus className="text-[13px]" />}
                                    onClick={() => {
                                        if (!isDesktop) {
                                            router.visit(`/master-data/create?tab=${currentTab}`);
                                        } else {
                                            setCreateTab(
                                                currentTab as "students" | "teachers" | "guardians" | "class"
                                            );
                                        }
                                    }}
                                    className="h-10 px-3 text-[12.5px] font-bold shadow-xs whitespace-nowrap"
                                >
                                    {getAddLabel()}
                                </Button>
                            </div>
                        </div>
                    {currentTab === "students" && (
                        <StudentsTab
                            students={students}
                            classOptions={classOptions}
                            allGuardians={allGuardians}
                            filters={{
                                ...filters,
                                search,
                                class_id: selectedClassId,
                                status: selectedStatus,
                            }}
                            onFilterChange={handleFilterChange}
                            createOpen={createTab === "students"}
                            onCloseCreate={handleCloseCreate}
                            selectedIds={selectedIds}
                            onSelectedIdsChange={setSelectedIds}
                            onRequestDelete={requestDelete}
                        />
                    )}

                    {currentTab === "teachers" && (
                        <TeachersTab
                            teachers={teachers}
                            filters={{
                                ...filters,
                                search,
                                teacher_type: selectedTeacherType,
                            }}
                            onFilterChange={handleFilterChange}
                            createOpen={createTab === "teachers"}
                            onCloseCreate={handleCloseCreate}
                            selectedIds={selectedIds}
                            onSelectedIdsChange={setSelectedIds}
                            onRequestDelete={requestDelete}
                        />
                    )}

                    {currentTab === "class" && (
                        <ClassesTab
                            schoolClasses={schoolClasses}
                            allTeachers={allTeachers}
                            searchConfig={searchConfig}
                            filters={{
                                ...filters,
                                search,
                                level: selectedLevel,
                            }}
                            onFilterChange={handleFilterChange}
                            createOpen={createTab === "class"}
                            onCloseCreate={handleCloseCreate}
                            selectedIds={selectedIds}
                            onSelectedIdsChange={setSelectedIds}
                            onRequestDelete={requestDelete}
                        />
                    )}

                    {currentTab === "guardians" && (
                        <GuardiansTab
                            guardians={guardians}
                            filters={{
                                ...filters,
                                search,
                                has_student: selectedHasStudent,
                            }}
                            onFilterChange={handleFilterChange}
                            createOpen={createTab === "guardians"}
                            onCloseCreate={handleCloseCreate}
                            selectedIds={selectedIds}
                            onSelectedIdsChange={setSelectedIds}
                            onRequestDelete={requestDelete}
                        />
                    )}
                </div>
            </div>
        </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* MOBILE-NATIVE APP ARCHITECTURE (< sm) */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="sm:hidden flex-1 flex flex-col font-inter">
                <AnimatePresence mode="wait">
                    {!mobileSubPage ? (
                        /* MOBILE SCREEN 1: DEDICATED MASTER DATA DIRECTORY HUB */
                        <motion.div
                            key="master-data-hub"
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="flex-1 space-y-3.5"
                        >
                            {/* Hub Header Card */}
                            <div className="p-4 bg-surface border border-border rounded-2xl shadow-xs space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-primary font-bold text-[14px]">
                                        <FiLayers className="text-[16px]" />
                                        <span>Direktori Master Data</span>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-primary/10 text-primary border border-primary/20">
                                        4 Modul
                                    </span>
                                </div>
                                <p className="text-[12px] text-text-secondary leading-relaxed pt-0.5">
                                    Pusat pengelolaan basis data seluruh civitas akademika SMA UII Yogyakarta. Pilih modul di bawah ini untuk mengelola data.
                                </p>
                            </div>

                            {/* Navigation Touch Cards */}
                            <div className="flex flex-col gap-2.5">
                                {directoryCards.map((card) => (
                                    <div
                                        key={card.key}
                                        onClick={() => handleOpenMobileSubPage(card.key)}
                                        className="p-4 bg-surface border border-border rounded-2xl shadow-xs flex items-center justify-between gap-3 active:scale-[0.98] active:bg-muted/40 transition-all cursor-pointer select-none hover:border-primary/30"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                            <div
                                                className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${card.iconBg}`}
                                            >
                                                {card.icon}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h2 className="text-[14.5px] font-bold text-text-primary leading-tight">
                                                        {card.title}
                                                    </h2>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10.5px] font-extrabold border shrink-0 ${card.badgeColor}`}
                                                    >
                                                        {card.count} {card.unit}
                                                    </span>
                                                </div>
                                                <p className="text-[12px] text-text-muted mt-1 leading-snug line-clamp-1">
                                                    {card.subtitle}
                                                </p>
                                            </div>
                                        </div>
                                        <FiChevronRight className="text-text-muted text-[20px] shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        /* MOBILE SCREEN 2: DEDICATED SUBPAGE VIEW */
                        <motion.div
                            key={`subpage-${mobileSubPage}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="flex-1 flex flex-col"
                        >
                            {/* Active Filters Pill Banner on Mobile */}
                            {hasActiveFilters && (
                                <div className="flex items-center justify-between p-2 mb-2.5 bg-primary/10 border border-primary/20 rounded-xl text-[11.5px] shrink-0 font-inter">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <FiFilter className="text-primary shrink-0" />
                                        <span className="text-text-primary font-medium truncate">
                                            Filter:{" "}
                                            <strong>
                                                {[
                                                    search && `"${search}"`,
                                                    currentTab === "students" && selectedClassId &&
                                                        classOptions.find(
                                                            (c) => String(c.id) === String(selectedClassId)
                                                        )?.name,
                                                    currentTab === "students" && selectedStatus &&
                                                        (selectedStatus === "Active" ? "Aktif" : "Non-Aktif"),
                                                    currentTab === "teachers" && selectedTeacherType &&
                                                        (selectedTeacherType === "duty" ? "Guru Piket" : "Wali Kelas"),
                                                    currentTab === "class" && selectedLevel &&
                                                        `Tingkat ${selectedLevel}`,
                                                    currentTab === "guardians" && selectedHasStudent &&
                                                        (selectedHasStudent === "linked" ? "Terhubung Siswa" : "Belum Terhubung"),
                                                ]
                                                    .filter(Boolean)
                                                    .join(", ")}
                                            </strong>
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="text-danger font-bold text-[11px] shrink-0 hover:underline cursor-pointer ml-2"
                                    >
                                        Reset
                                    </button>
                                </div>
                            )}

                            {/* Dedicated Subpage Content Area */}
                            <div className="flex-1 flex flex-col pb-4">
                                {mobileSubPage === "students" && (
                                    <StudentsTab
                                        students={students}
                                        classOptions={classOptions}
                                        allGuardians={allGuardians}
                                        filters={{
                                            ...filters,
                                            search,
                                            class_id: selectedClassId,
                                            status: selectedStatus,
                                        }}
                                        onSearchChange={(val) => handleSearch(val)}
                                        onFilterChange={handleFilterChange}
                                        createOpen={createTab === "students"}
                                        onCloseCreate={() => setCreateTab(null)}
                                        selectedIds={selectedIds}
                                        onSelectedIdsChange={setSelectedIds}
                                        onRequestDelete={requestDelete}
                                    />
                                )}

                                {mobileSubPage === "teachers" && (
                                    <TeachersTab
                                        teachers={teachers}
                                        filters={{
                                            ...filters,
                                            search,
                                            teacher_type: selectedTeacherType,
                                        }}
                                        onSearchChange={(val) => handleSearch(val)}
                                        onFilterChange={handleFilterChange}
                                        createOpen={createTab === "teachers"}
                                        onCloseCreate={() => setCreateTab(null)}
                                        selectedIds={selectedIds}
                                        onSelectedIdsChange={setSelectedIds}
                                        onRequestDelete={requestDelete}
                                    />
                                )}

                                {mobileSubPage === "class" && (
                                    <ClassesTab
                                        schoolClasses={schoolClasses}
                                        allTeachers={allTeachers}
                                        searchConfig={searchConfig}
                                        filters={{
                                            ...filters,
                                            search,
                                            level: selectedLevel,
                                        }}
                                        onSearchChange={(val) => handleSearch(val)}
                                        onFilterChange={handleFilterChange}
                                        createOpen={createTab === "class"}
                                        onCloseCreate={() => setCreateTab(null)}
                                        selectedIds={selectedIds}
                                        onSelectedIdsChange={setSelectedIds}
                                        onRequestDelete={requestDelete}
                                    />
                                )}

                                {mobileSubPage === "guardians" && (
                                    <GuardiansTab
                                        guardians={guardians}
                                        filters={{
                                            ...filters,
                                            search,
                                            has_student: selectedHasStudent,
                                        }}
                                        onSearchChange={(val) => handleSearch(val)}
                                        onFilterChange={handleFilterChange}
                                        createOpen={createTab === "guardians"}
                                        onCloseCreate={() => setCreateTab(null)}
                                        selectedIds={selectedIds}
                                        onSelectedIdsChange={setSelectedIds}
                                        onRequestDelete={requestDelete}
                                    />
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Bulk Selection Bar on Mobile Subpage */}
                {mobileSubPage && (
                    <MobileSelectionBar
                        count={selectedIds.length}
                        countLabel={`${getEntityLabel()} Terpilih`}
                        onCancel={() => setSelectedIds([])}
                        bottomOffsetClass="bottom-[5.25rem]"
                        actions={[
                            {
                                label: "Hapus",
                                onClick: () =>
                                    requestDelete(
                                        currentImportEntity,
                                        selectedIds,
                                        `${selectedIds.length} ${getEntityLabel()} Terpilih`
                                    ),
                                variant: "danger",
                                icon: <FiTrash2 className="text-[12px]" />,
                            },
                        ]}
                    />
                )}
            </div>

            {/* Global Error Banner */}
            {errors && Object.keys(errors).length > 0 && (
                <div className="p-4 rounded-xl bg-danger-bg border border-danger/20 text-danger flex items-start gap-3 text-[14px] mb-4 shrink-0">
                    <FiAlertCircle size={18} className="mt-0.5 shrink-0" />
                    <div>
                        <div className="font-semibold">Terjadi Kesalahan Validasi:</div>
                        <ul className="list-disc list-inside mt-1 space-y-0.5 text-[13px]">
                            {Object.entries(errors).map(([field, msg]) => (
                                <li key={field}>{msg}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}



            <ConfirmDialog
                open={deleteConfirm.open}
                title="Konfirmasi Hapus Data"
                message={
                    <span>
                        Apakah Anda yakin ingin menghapus data{" "}
                        <strong className="text-text-primary font-extrabold">{deleteConfirm.label}</strong>?
                        Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                    </span>
                }
                confirmLabel="Hapus Sekarang"
                cancelLabel="Batal"
                variant="danger"
                onConfirm={handleConfirmDelete}
                onClose={() =>
                    setDeleteConfirm({ open: false, entity: null, ids: null, label: "" })
                }
            />

            {/* Import CSV Modal */}
            <ImportModal
                open={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                entity={importEntity}
            />

            {/* Action Trigger Modal for Tablet View */}
            <Modal
                open={actionModalOpen}
                onClose={() => setActionModalOpen(false)}
                title={`Aksi Master Data — ${getMobileHeaderTitle()}`}
            >
                <div className="space-y-3 font-inter py-1">
                    <p className="text-[12.5px] text-text-secondary">
                        Pilih tindakan cepat untuk modul {getMobileHeaderTitle()}.
                    </p>

                    <div className="grid grid-cols-1 gap-2.5 pt-1">
                        {/* Option 1: Tambah Data */}
                        <button
                            type="button"
                            onClick={() => {
                                setActionModalOpen(false);
                                if (isDesktop) {
                                    setCreateTab(currentTab as "students" | "teachers" | "class" | "guardians");
                                } else {
                                    router.visit(`/master-data/create?tab=${currentTab}`);
                                }
                            }}
                            className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-surface hover:border-primary/40 hover:bg-primary/5 active:scale-[0.99] transition-all text-left group cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                <FiPlus className="text-[18px]" />
                            </div>
                            <div>
                                <div className="text-[13.5px] font-bold text-text-primary group-hover:text-primary transition-colors">
                                    {getAddLabel()}
                                </div>
                                <div className="text-[11.5px] text-text-muted">
                                    Tambah entitas {getMobileHeaderTitle()} baru ke sistem database.
                                </div>
                            </div>
                        </button>

                        {/* Option 2: Import CSV */}
                        {currentTab !== "class" && (
                            <button
                                type="button"
                                onClick={() => {
                                    setActionModalOpen(false);
                                    if (typeof window !== "undefined" && window.innerWidth < 640) {
                                        router.visit(`/master-data/import-page?tab=${currentTab}`);
                                    } else {
                                        setImportEntity(currentImportEntity);
                                        setImportModalOpen(true);
                                    }
                                }}
                                className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-surface hover:border-accent/60 hover:bg-accent/10 active:scale-[0.99] transition-all text-left group cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-lg bg-accent/20 text-primary flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-primary transition-colors">
                                    <FiUpload className="text-[18px]" />
                                </div>
                                <div>
                                    <div className="text-[13.5px] font-bold text-text-primary group-hover:text-primary transition-colors">
                                        Import CSV {getMobileHeaderTitle()}
                                    </div>
                                    <div className="text-[11.5px] text-text-muted">
                                        Unggah berkas spreadsheet/CSV untuk memasukkan data secara massal.
                                    </div>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Mobile Filter Bottom Sheet */}
            <BottomSheet
                open={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                title={`Filter ${getMobileHeaderTitle()}`}
                subtitle="Sesuaikan kriteria pencarian dan penyaringan data"
            >
                <div className="flex flex-col gap-4 font-inter pb-2">
                    {mobileSubPage === "students" && (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold text-text-secondary">
                                    Pilih Kelas
                                </label>
                                <SelectInput
                                    value={selectedClassId}
                                    onChange={(val) => handleFilterChange("class_id", val as string)}
                                    options={[
                                        { value: "", label: "Semua Kelas" },
                                        ...classOptions.map((c) => ({
                                            value: String(c.id),
                                            label: c.name,
                                        })),
                                    ]}
                                    className="h-10 text-[13px]"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold text-text-secondary">
                                    Status Siswa
                                </label>
                                <SelectInput
                                    value={selectedStatus}
                                    onChange={(val) => handleFilterChange("status", val as string)}
                                    options={[
                                        { value: "", label: "Semua Status" },
                                        { value: "Active", label: "Aktif" },
                                        { value: "Inactive", label: "Non-Aktif" },
                                    ]}
                                    className="h-10 text-[13px]"
                                />
                            </div>
                        </>
                    )}

                    {mobileSubPage === "teachers" && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-bold text-text-secondary">
                                Tipe Penugasan
                            </label>
                            <SelectInput
                                value={selectedTeacherType}
                                onChange={(val) => handleFilterChange("teacher_type", val as string)}
                                options={[
                                    { value: "", label: "Semua Penugasan" },
                                    { value: "duty", label: "Guru Piket" },
                                    { value: "homeroom", label: "Wali Kelas" },
                                ]}
                                className="h-10 text-[13px]"
                            />
                        </div>
                    )}

                    {mobileSubPage === "class" && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-bold text-text-secondary">
                                Tingkat Kelas
                            </label>
                            <SelectInput
                                value={selectedLevel}
                                onChange={(val) => handleFilterChange("level", val as string)}
                                options={[
                                    { value: "", label: "Semua Tingkat" },
                                    { value: "X", label: "Kelas X" },
                                    { value: "XI", label: "Kelas XI" },
                                    { value: "XII", label: "Kelas XII" },
                                ]}
                                className="h-10 text-[13px]"
                            />
                        </div>
                    )}

                    {mobileSubPage === "guardians" && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-bold text-text-secondary">
                                Status Wali Murid
                            </label>
                            <SelectInput
                                value={selectedHasStudent}
                                onChange={(val) => handleFilterChange("has_student", val as string)}
                                options={[
                                    { value: "", label: "Semua Wali" },
                                    { value: "linked", label: "Terhubung Siswa" },
                                    { value: "unlinked", label: "Belum Terhubung" },
                                ]}
                                className="h-10 text-[13px]"
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                        {hasActiveFilters && (
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    handleResetFilters();
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
