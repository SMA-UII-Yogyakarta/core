import { router, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
    PageHeader,
    ImportModal,
    ConfirmDialog,
    Button,
    SearchBar,
    NativeSelect,
    TabSwitcher,
    Drawer,
    SelectInput,
} from "@/Components";
import AppShell from "@/Layouts/AppShell";
import {
    FiAlertCircle,
    FiUpload,
    FiPlus,
    FiTrash2,
    FiFilter,
    FiRotateCcw,
} from "react-icons/fi";
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
    { key: "students", label: "Siswa" },
    { key: "teachers", label: "Tenaga Pendidik" },
    { key: "class", label: "Kelas & Rombel" },
    { key: "guardians", label: "Wali Murid" },
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
}: MasterDataProps) {
    const [currentTab, setCurrentTab] = useState(
        activeTabMap[activeTab ?? ""] ?? "students"
    );
    const [prevActiveTab, setPrevActiveTab] = useState(activeTab);

    if (activeTab !== prevActiveTab) {
        setPrevActiveTab(activeTab);
        const matchedTab = activeTabMap[activeTab ?? ""];
        if (matchedTab && matchedTab !== currentTab) {
            setCurrentTab(matchedTab);
        }
    }

    // Modal & Drawer Trigger States
    const [createTab, setCreateTab] = useState<
        "students" | "teachers" | "class" | "guardians" | null
    >(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importEntity, setImportEntity] = useState<
        "students" | "teachers" | "classes" | "guardians"
    >("students");

    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

    const [deleteConfirm, setDeleteConfirm] = useState<{
        open: boolean;
        entity: string | null;
        ids: number | number[] | null;
        label: string;
    }>({ open: false, entity: null, ids: null, label: "" });

    const [search, setSearch] = useState(filters?.search ?? "");
    const [selectedClassId, setSelectedClassId] = useState(filters?.class_id ?? "");
    const [selectedStatus, setSelectedStatus] = useState(filters?.status ?? "");

    const { errors } = usePage().props as { errors: Record<string, string> };

    const handleTabChange = (key: string) => {
        setCurrentTab(key);
        setSelectedStudentIds([]);
        setSearch("");
        setSelectedClassId("");
        setSelectedStatus("");
        router.get(`/master-data?tab=${key}`, {}, { preserveState: true });
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        router.get(
            "/master-data",
            {
                tab: currentTab,
                search: val || undefined,
                class_id: selectedClassId || undefined,
                status: selectedStatus || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterChange = (key: string, val: string) => {
        if (key === "class_id") setSelectedClassId(val);
        if (key === "status") setSelectedStatus(val);

        router.get(
            "/master-data",
            {
                tab: currentTab,
                search: search || undefined,
                class_id: key === "class_id" ? val || undefined : selectedClassId || undefined,
                status: key === "status" ? val || undefined : selectedStatus || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        setSearch("");
        setSelectedClassId("");
        setSelectedStatus("");
        setFilterDrawerOpen(false);
        router.get(`/master-data?tab=${currentTab}`, {}, { preserveState: true });
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
                        setSelectedStudentIds([]);
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

    const hasActiveFilters = Boolean(selectedClassId || selectedStatus || search);
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

    // Mobile Header Actions: [ Filter ] and [ Import ] directly to the left of the Profile button
    const mobileHeaderActions = (
        <div className="flex sm:hidden items-center gap-1.5 select-none font-inter">
            {/* Filter Bottom Drawer Trigger Button */}
            <button
                type="button"
                onClick={() => setFilterDrawerOpen(true)}
                className={`h-8 px-2.5 rounded-xl border text-[11.5px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer relative ${
                    hasActiveFilters
                        ? "bg-white text-primary border-white shadow-xs"
                        : "bg-white/15 border-white/20 text-white hover:bg-white/25"
                }`}
                aria-label="Filter Data"
            >
                <FiFilter className="text-[12px]" />
                <span>Filter</span>
                {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-accent border border-primary absolute -top-0.5 -right-0.5" />
                )}
            </button>

            {/* Import CSV Button */}
            <button
                type="button"
                onClick={() => {
                    setImportEntity(currentImportEntity);
                    setImportModalOpen(true);
                }}
                className="h-8 px-2.5 rounded-xl bg-white/15 border border-white/20 text-white hover:bg-white/25 text-[11.5px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                aria-label="Import CSV"
            >
                <FiUpload className="text-[12px]" />
                <span>Import</span>
            </button>
        </div>
    );

    return (
        <AppShell
            title="Master Data Sekolah"
            headerActions={mobileHeaderActions}
            showNotificationBell={false}
        >
            {/* Desktop Page Header */}
            <PageHeader
                title="Master Data Sekolah"
                description="Kelola direktori siswa, tenaga pendidik, rombongan belajar, dan data orang tua/wali murid SMA UII Yogyakarta."
                className="hidden sm:flex shrink-0 mb-4"
            >
                <div className="flex items-center gap-2">
                    {currentTab === "students" && (
                        <>
                            {selectedStudentIds.length > 0 && (
                                <Button
                                    variant="danger"
                                    onClick={() =>
                                        requestDelete(
                                            "students",
                                            selectedStudentIds,
                                            `${selectedStudentIds.length} Siswa Terpilih`
                                        )
                                    }
                                    className="h-9 px-3.5 font-bold text-[12.5px] shadow-xs rounded-xl"
                                    icon={<FiTrash2 size={14} />}
                                >
                                    Hapus ({selectedStudentIds.length})
                                </Button>
                            )}
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setImportEntity("students");
                                    setImportModalOpen(true);
                                }}
                                className="h-9 px-3.5 font-bold text-[12.5px] shadow-xs rounded-xl"
                                icon={<FiUpload size={14} />}
                            >
                                Import CSV
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => setCreateTab("students")}
                                className="h-9 px-3.5 font-bold text-[12.5px] shadow-xs rounded-xl"
                                icon={<FiPlus size={14} />}
                            >
                                Tambah Siswa
                            </Button>
                        </>
                    )}

                    {currentTab === "teachers" && (
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setImportEntity("teachers");
                                    setImportModalOpen(true);
                                }}
                                className="h-9 px-3.5 font-bold text-[12.5px] shadow-xs rounded-xl"
                                icon={<FiUpload size={14} />}
                            >
                                Import CSV
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => setCreateTab("teachers")}
                                className="h-9 px-3.5 font-bold text-[12.5px] shadow-xs rounded-xl"
                                icon={<FiPlus size={14} />}
                            >
                                Tambah Guru
                            </Button>
                        </>
                    )}

                    {currentTab === "class" && (
                        <Button
                            variant="primary"
                            onClick={() => setCreateTab("class")}
                            className="h-9 px-3.5 font-bold text-[12.5px] shadow-xs rounded-xl"
                            icon={<FiPlus size={14} />}
                        >
                            Tambah Kelas
                        </Button>
                    )}

                    {currentTab === "guardians" && (
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setImportEntity("guardians");
                                    setImportModalOpen(true);
                                }}
                                className="h-9 px-3.5 font-bold text-[12.5px] shadow-xs rounded-xl"
                                icon={<FiUpload size={14} />}
                            >
                                Import CSV
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => setCreateTab("guardians")}
                                className="h-9 px-3.5 font-bold text-[12.5px] shadow-xs rounded-xl"
                                icon={<FiPlus size={14} />}
                            >
                                Tambah Wali
                            </Button>
                        </>
                    )}
                </div>
            </PageHeader>

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

            {/* Toolbar Row: Left = Segmented Tabs, Right = Search & Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 shrink-0 font-inter">
                {/* Segmented Tabs */}
                <TabSwitcher
                    tabs={tabs}
                    activeKey={currentTab}
                    onChange={handleTabChange}
                    variant="segmented"
                />

                {/* Search & Desktop Filter Dropdowns */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 self-stretch lg:self-auto">
                    {currentTab === "students" && (
                        <>
                            <div className="w-full sm:w-48 xl:w-56">
                                <SearchBar
                                    value={search}
                                    onChange={(val) => handleSearch(val)}
                                    onSearch={() => handleSearch(search)}
                                    placeholder="Cari NIS, nama..."
                                />
                            </div>
                            <div className="hidden sm:block w-32 xl:w-36">
                                <NativeSelect
                                    value={selectedClassId}
                                    onChange={(e) => handleFilterChange("class_id", e.target.value)}
                                    className="h-10 bg-surface border-border font-medium text-[13px]"
                                >
                                    <option value="">Semua Kelas</option>
                                    {classOptions.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>
                            <div className="hidden sm:block w-28 xl:w-32">
                                <NativeSelect
                                    value={selectedStatus}
                                    onChange={(e) => handleFilterChange("status", e.target.value)}
                                    className="h-10 bg-surface border-border font-medium text-[13px]"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="Active">Aktif</option>
                                    <option value="Inactive">Non-Aktif</option>
                                </NativeSelect>
                            </div>
                        </>
                    )}

                    {currentTab === "teachers" && (
                        <div className="w-full sm:w-64">
                            <SearchBar
                                value={search}
                                onChange={(val) => handleSearch(val)}
                                onSearch={() => handleSearch(search)}
                                placeholder="Cari kode atau nama guru..."
                            />
                        </div>
                    )}

                    {currentTab === "class" && (
                        <div className="w-full sm:w-64">
                            <SearchBar
                                value={search}
                                onChange={(val) => handleSearch(val)}
                                onSearch={() => handleSearch(search)}
                                placeholder="Cari nama kelas atau wali..."
                            />
                        </div>
                    )}

                    {currentTab === "guardians" && (
                        <div className="w-full sm:w-64">
                            <SearchBar
                                value={search}
                                onChange={(val) => handleSearch(val)}
                                onSearch={() => handleSearch(search)}
                                placeholder="Cari nama wali murid..."
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Active Filter Chips Banner on Mobile if filter active */}
            {hasActiveFilters && (
                <div className="sm:hidden flex items-center justify-between p-2.5 mb-3 bg-primary/10 border border-primary/20 rounded-xl text-[12px] font-inter">
                    <div className="flex items-center gap-1.5 truncate">
                        <FiFilter className="text-primary shrink-0" />
                        <span className="text-text-primary font-medium truncate">
                            Filter aktif:{" "}
                            <strong>
                                {[
                                    selectedClassId &&
                                        classOptions.find((c) => String(c.id) === String(selectedClassId))?.name,
                                    selectedStatus && (selectedStatus === "Active" ? "Aktif" : "Non-Aktif"),
                                    search && `"${search}"`,
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

            {/* Tab Content Full Height Viewport */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
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
                        createOpen={createTab === "students"}
                        onCloseCreate={() => setCreateTab(null)}
                        onSelectedIdsChange={setSelectedStudentIds}
                        onRequestDelete={requestDelete}
                    />
                )}

                {currentTab === "teachers" && (
                    <TeachersTab
                        teachers={teachers}
                        filters={{
                            ...filters,
                            search,
                        }}
                        createOpen={createTab === "teachers"}
                        onCloseCreate={() => setCreateTab(null)}
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
                        }}
                        createOpen={createTab === "class"}
                        onCloseCreate={() => setCreateTab(null)}
                        onRequestDelete={requestDelete}
                    />
                )}

                {currentTab === "guardians" && (
                    <GuardiansTab
                        guardians={guardians}
                        filters={{
                            ...filters,
                            search,
                        }}
                        createOpen={createTab === "guardians"}
                        onCloseCreate={() => setCreateTab(null)}
                        onRequestDelete={requestDelete}
                    />
                )}
            </div>

            {/* MOBILE FLOATING ACTION BALLOON (FAB) FOR ADD MASTER DATA */}
            <div className="sm:hidden fixed bottom-20 right-4 z-40">
                <button
                    type="button"
                    onClick={() => setCreateTab(currentTab as "students" | "teachers" | "class" | "guardians")}
                    className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-full shadow-2xl hover:bg-primary-hover active:scale-95 transition-all font-inter font-bold text-[13px] cursor-pointer border border-white/20"
                    aria-label={getAddLabel()}
                >
                    <FiPlus className="text-[16px] stroke-[2.5]" />
                    <span>{getAddLabel()}</span>
                </button>
            </div>

            {/* MOBILE FILTER BOTTOM DRAWER */}
            <Drawer
                open={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                title="Filter Data Master"
                description="Sesuaikan parameter filter data sekolah."
                width="sm"
                onSubmit={() => setFilterDrawerOpen(false)}
                submitLabel="Terapkan Filter"
                cancelLabel="Reset Filter"
                onCancel={handleResetFilters}
            >
                <div className="space-y-4 font-inter">
                    {currentTab === "students" && (
                        <>
                            <div>
                                <label className="block text-[13px] font-medium text-text-primary mb-1">
                                    Kelas / Rombongan Belajar
                                </label>
                                <SelectInput
                                    value={selectedClassId}
                                    onChange={(val) => setSelectedClassId(String(val))}
                                    options={[
                                        { value: "", label: "Semua Kelas" },
                                        ...classOptions.map((c) => ({
                                            value: String(c.id),
                                            label: c.name,
                                        })),
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-[13px] font-medium text-text-primary mb-1">
                                    Status Kesiswaan
                                </label>
                                <SelectInput
                                    value={selectedStatus}
                                    onChange={(val) => setSelectedStatus(String(val))}
                                    options={[
                                        { value: "", label: "Semua Status" },
                                        { value: "Active", label: "Aktif" },
                                        { value: "Inactive", label: "Non-Aktif" },
                                    ]}
                                />
                            </div>
                        </>
                    )}

                    {currentTab !== "students" && (
                        <div className="py-6 text-center text-text-muted text-[13px]">
                            Semua parameter filter untuk tab ini telah terpasang otomatis.
                        </div>
                    )}
                </div>
            </Drawer>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                open={deleteConfirm.open}
                title="Konfirmasi Hapus Data"
                message={`Apakah Anda yakin ingin menghapus data ${deleteConfirm.label}? Tindakan ini permanen dan tidak dapat dibatalkan.`}
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
        </AppShell>
    );
}
