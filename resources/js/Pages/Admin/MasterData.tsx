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
} from "@/Components";
import AppShell from "@/Layouts/AppShell";
import { FiAlertCircle, FiUpload, FiPlus, FiTrash2 } from "react-icons/fi";
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
    const [createTab, setCreateTab] = useState<"students" | "teachers" | "class" | "guardians" | null>(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importEntity, setImportEntity] = useState<
        "students" | "teachers" | "classes" | "guardians"
    >("students");

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

    return (
        <AppShell title="Master Data Sekolah">
            {/* Header with Consistent Top-Right Actions */}
            <PageHeader
                title="Master Data Sekolah"
                description="Kelola direktori siswa, tenaga pendidik, rombongan belajar, dan data orang tua/wali murid SMA UII Yogyakarta."
                className="shrink-0 mb-4"
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
                                    className="h-10 px-4 font-bold text-[13px] shadow-xs rounded-xl"
                                    icon={<FiTrash2 size={15} />}
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
                                className="h-10 px-4 font-bold text-[13px] shadow-xs rounded-xl"
                                icon={<FiUpload size={15} />}
                            >
                                Import CSV
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => setCreateTab("students")}
                                className="h-10 px-4 font-bold text-[13px] shadow-xs rounded-xl"
                                icon={<FiPlus size={15} />}
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
                                className="h-10 px-4 font-bold text-[13px] shadow-xs rounded-xl"
                                icon={<FiUpload size={15} />}
                            >
                                Import CSV
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => setCreateTab("teachers")}
                                className="h-10 px-4 font-bold text-[13px] shadow-xs rounded-xl"
                                icon={<FiPlus size={15} />}
                            >
                                Tambah Guru
                            </Button>
                        </>
                    )}

                    {currentTab === "class" && (
                        <Button
                            variant="primary"
                            onClick={() => setCreateTab("class")}
                            className="h-10 px-4 font-bold text-[13px] shadow-xs rounded-xl"
                            icon={<FiPlus size={15} />}
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
                                className="h-10 px-4 font-bold text-[13px] shadow-xs rounded-xl"
                                icon={<FiUpload size={15} />}
                            >
                                Import CSV
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => setCreateTab("guardians")}
                                className="h-10 px-4 font-bold text-[13px] shadow-xs rounded-xl"
                                icon={<FiPlus size={15} />}
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

            {/* Toolbar Row: Left = Pill Tabs, Right = Search & Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 shrink-0 font-inter">
                {/* Left: Pill Segmented Tabs */}
                <TabSwitcher
                    tabs={tabs}
                    activeKey={currentTab}
                    onChange={handleTabChange}
                    variant="segmented"
                />

                {/* Right: Dynamic Filter Controls for Current Tab */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 self-start lg:self-auto">
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
                            <div className="w-32 xl:w-36">
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
                            <div className="w-28 xl:w-32">
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
