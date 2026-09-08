import { router } from "@inertiajs/react";
import { useState, useMemo, useEffect } from "react";
import {
    Table,
    TableFooter,
    MobileNativePagination,
    Card,
    Button,
    Checkbox,
    MobileFilterSelectBar,
    MasterDataCard,
    MasterDataEmptyState,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import {
    FiPlus,
    FiEye,
    FiEdit2,
    FiTrash2,
    FiBookOpen,
    FiUserCheck,
    FiCalendar,
} from "react-icons/fi";
import type { SchoolClass, Teacher, PaginatedData, SearchConfig } from "./types";
import ClassDrawerForm from "./ClassDrawerForm";

interface ClassesTabProps {
    schoolClasses?: PaginatedData<SchoolClass>;
    allTeachers?: Teacher[];
    searchConfig?: SearchConfig;
    filters?: Record<string, string | undefined>;
    onSearchChange?: (val: string) => void;
    onFilterChange?: (key: string, val: string) => void;
    createOpen?: boolean;
    onCloseCreate?: () => void;
    editItem?: SchoolClass | null;
    editMode?: "edit" | "detail" | null;
    onCloseDrawer?: () => void;
    selectedIds?: number[];
    onSelectedIdsChange?: (ids: number[]) => void;
    onRequestDelete: (entity: string, ids: number | number[], label: string) => void;
}

export default function ClassesTab({
    schoolClasses,
    allTeachers = [],
    searchConfig,
    filters = {},
    onSearchChange,
    createOpen = false,
    onCloseCreate,
    editItem = null,
    editMode = null,
    onCloseDrawer,
    selectedIds: propsSelectedIds,
    onSelectedIdsChange,
    onRequestDelete,
}: ClassesTabProps) {
    const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "detail" | null>(
        editMode ?? null
    );
    const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(
        editItem ?? null
    );

    useEffect(() => {
        if (editItem && editMode) {
            setSelectedClass(editItem);
            setDrawerMode(editMode);
        }
    }, [editItem, editMode]);
    const [internalSelectedIds, setInternalSelectedIds] = useState<number[]>([]);

    const isClientMode = searchConfig?.mode === "client";
    const allClasses = useMemo(() => searchConfig?.allData || [], [searchConfig?.allData]);

    const displayClasses = useMemo(() => {
        if (isClientMode) {
            const q = (filters?.search ?? "").trim().toLowerCase();
            const level = filters?.level ?? "";
            return allClasses.filter((c) => {
                const matchesLevel = !level || c.level === level;
                if (!matchesLevel) return false;
                if (!q) return true;
                return (
                    c.name?.toLowerCase().includes(q) ||
                    c.full_name?.toLowerCase().includes(q) ||
                    c.teacher?.name?.toLowerCase().includes(q) ||
                    c.level?.toLowerCase().includes(q)
                );
            });
        }
        return schoolClasses?.data || [];
    }, [isClientMode, allClasses, filters?.search, filters?.level, schoolClasses?.data]);

    const selectedIds = propsSelectedIds !== undefined ? propsSelectedIds : internalSelectedIds;

    const handleSelectAll = (checked: boolean) => {
        const next = checked ? displayClasses.map((c) => c.id) : [];
        setInternalSelectedIds(next);
        onSelectedIdsChange?.(next);
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        const next = checked ? [...selectedIds, id] : selectedIds.filter((item) => item !== id);
        setInternalSelectedIds(next);
        onSelectedIdsChange?.(next);
    };

    const isAllSelected = displayClasses.length > 0 && selectedIds.length === displayClasses.length;

    const columns: Column<SchoolClass>[] = [
        {
            key: "selection",
            header: (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                </div>
            ),
            render: (c) => (
                <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={selectedIds.includes(c.id)}
                        onChange={(e) => handleSelectOne(c.id, e.target.checked)}
                    />
                </div>
            ),
            className: "w-12 text-center",
        },
        {
            key: "name",
            header: "Nama Kelas / Rombel",
            render: (c) => (
                <div
                    className="cursor-pointer"
                    onClick={() => {
                        setSelectedClass(c);
                        setDrawerMode("detail");
                    }}
                >
                    <div className="font-semibold text-text-primary text-[14px] hover:text-primary transition-colors">
                        {c.full_name || (c.name.startsWith(c.level) ? c.name : `${c.level}-${c.name}`)}
                    </div>
                    <div className="text-[12px] text-text-muted mt-0.5 flex items-center gap-1.5">
                        <span>Tingkat: {c.level || "—"}</span>
                        <span>•</span>
                        <span className="font-medium text-text-secondary">TA {c.academic_year || "—"}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "teacher",
            header: "Wali Kelas",
            render: (c) => (
                <div>
                    {c.teacher ? (
                        <span className="font-medium text-text-primary text-[13px]">
                            {c.teacher.name}
                        </span>
                    ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-warning-light text-text-primary border border-warning/30">
                            Belum Ada Wali
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: "capacity",
            header: "Kapasitas & Jumlah Siswa",
            render: (c) => {
                const count = c.students_count ?? 0;
                const cap = c.capacity || 36;
                const isFull = count >= cap;
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-text-primary">
                            {count} / {cap} Siswa
                        </span>
                        {isFull && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-danger text-white">
                                Penuh
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            key: "actions",
            header: <div className="text-center w-full">Aksi</div>,
            className: "text-center w-36 whitespace-nowrap",
            render: (c) => (
                <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedClass(c);
                            setDrawerMode("detail");
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-text-muted hover:text-primary hover:bg-primary-light border border-border transition-colors cursor-pointer text-[12px] font-semibold"
                        title="Lihat / Edit Detail Kelas"
                        aria-label="Lihat / Edit Detail Kelas"
                    >
                        <FiEye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onRequestDelete("classes", c.id, c.name)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-danger hover:bg-danger-bg border border-danger/20 transition-colors cursor-pointer text-[12px] font-semibold"
                        title="Hapus Kelas"
                        aria-label="Hapus Kelas"
                    >
                        <FiTrash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                    </button>
                </div>
            ),
        },
    ];

    const handlePagination = (p: number) => {
        router.get(
            "/master-data",
            {
                tab: "class",
                page: p,
                search: filters?.search || undefined,
            },
            { preserveState: true }
        );
    };

    return (
        <div className="relative flex-1 min-h-0 flex flex-col justify-between overflow-hidden font-inter">
            {/* ───────────────────────────────────────────────────────────── */}
            {/* DESKTOP TABLE VIEW (>= sm) */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="hidden sm:flex flex-col flex-1 min-h-0 overflow-hidden justify-between gap-3">
                <Table
                    columns={columns}
                    data={displayClasses}
                    keyExtractor={(c) => c.id}
                    containerClassName="flex-1 min-h-0 overflow-auto bg-surface"
                    dense
                />

                <TableFooter
                    info={
                        displayClasses && displayClasses.length > 0 ? (
                            <span>
                                Menampilkan total <strong className="text-text-primary">{displayClasses.length}</strong> rombongan belajar terdaftar.
                            </span>
                        ) : "Menampilkan rombongan belajar (rombel) SMA UII Yogyakarta."
                    }
                    currentPage={!isClientMode ? schoolClasses?.current_page : undefined}
                    totalPages={!isClientMode ? schoolClasses?.last_page : undefined}
                    totalItems={schoolClasses?.total}
                    perPage={schoolClasses?.per_page}
                    onPageChange={handlePagination}
                />
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* MOBILE-NATIVE CARD STACK VIEW (< sm) */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="sm:hidden flex flex-col gap-3">
                {displayClasses.length === 0 ? (
                    <MasterDataEmptyState
                        icon={<FiBookOpen className="w-7 h-7" />}
                        iconContainerClassName="bg-purple-500/10 border-purple-500/20 text-purple-600"
                        title="Belum Ada Data Kelas"
                        description="Mulai tambahkan rombongan belajar baru untuk tahun ajaran aktif."
                        actionLabel="Tambah Kelas Baru"
                        onAction={() => {
                            if (typeof window !== "undefined" && window.innerWidth < 640) {
                                router.visit("/master-data/create?tab=class");
                            } else {
                                setSelectedClass(null);
                                setDrawerMode("create");
                            }
                        }}
                    />
                ) : (
                    <>
                        {/* Mobile Filter & Select All Bar */}
                        <MobileFilterSelectBar
                            selectedCount={selectedIds.length}
                            totalCount={displayClasses.length}
                            allSelected={isAllSelected}
                            indeterminate={selectedIds.length > 0 && !isAllSelected}
                            onToggleSelectAll={handleSelectAll}
                            searchValue={filters?.search ?? ""}
                            onSearchChange={(val) => onSearchChange?.(val)}
                            searchPlaceholder="Cari nama kelas atau wali..."
                        />

                        {displayClasses.map((c) => {
                            const isSelected = selectedIds.includes(c.id);
                            const count = c.students_count ?? 0;
                            const cap = c.capacity || 36;
                            const isFull = count >= cap;
                            const percent = Math.min(100, Math.round((count / cap) * 100));

                            return (
                                <MasterDataCard
                                    key={c.id}
                                    isSelected={isSelected}
                                    onSelect={(checked) => handleSelectOne(c.id, checked)}
                                    onOpenDetail={() => {
                                        if (typeof window !== "undefined" && window.innerWidth < 640) {
                                            router.visit(`/master-data/classes/${c.id}/detail`);
                                        } else {
                                            setSelectedClass(c);
                                            setDrawerMode("detail");
                                        }
                                    }}
                                    onEdit={() => {
                                        if (typeof window !== "undefined" && window.innerWidth < 640) {
                                            router.visit(`/master-data/classes/${c.id}/edit`);
                                        } else {
                                            setSelectedClass(c);
                                            setDrawerMode("edit");
                                        }
                                    }}
                                    onDelete={() => onRequestDelete("classes", c.id, c.name)}
                                    selectLabel="Pilih Kelas"
                                    deleteAriaLabel="Hapus Kelas"
                                    title={
                                        <div className="flex items-center gap-2">
                                            <span className="truncate">
                                                {c.full_name || (c.name.startsWith(c.level) ? c.name : `${c.level}-${c.name}`)}
                                            </span>
                                            {c.level && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-700 border border-purple-500/20 shrink-0">
                                                    {c.level}
                                                </span>
                                            )}
                                        </div>
                                    }
                                    subtitle={
                                        <div className="flex items-center gap-1.5 text-[10.5px] text-text-muted">
                                            <FiCalendar className="text-[10px]" />
                                            <span>Tahun Ajaran: {c.academic_year || "—"}</span>
                                        </div>
                                    }
                                    rightBadge={
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                            isFull
                                                ? "bg-danger text-white border-danger"
                                                : "bg-muted text-text-secondary border-border"
                                        }`}>
                                            {count}/{cap} Siswa
                                        </span>
                                    }
                                >
                                    <div className="space-y-1 pt-0.5">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-text-muted flex items-center gap-1">
                                                <FiUserCheck className="text-primary text-[11px]" />
                                                Wali:
                                            </span>
                                            {c.teacher ? (
                                                <span className="font-semibold text-text-primary truncate max-w-[200px]">
                                                    {c.teacher.name}
                                                </span>
                                            ) : (
                                                <span className="text-amber-600 font-medium italic text-[10.5px]">
                                                    Belum Ditugaskan
                                                </span>
                                            )}
                                        </div>

                                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    isFull ? "bg-danger" : percent > 80 ? "bg-amber-500" : "bg-primary"
                                                }`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                </MasterDataCard>
                            );
                        })}
                    </>
                )}

                {/* Mobile Native Pagination */}
                {!isClientMode && schoolClasses && schoolClasses.last_page > 1 && (
                    <MobileNativePagination
                        currentPage={schoolClasses.current_page}
                        totalPages={schoolClasses.last_page}
                        totalItems={schoolClasses.total}
                        perPage={schoolClasses.per_page}
                        onPageChange={handlePagination}
                        itemLabel="kelas"
                        className="shrink-0 mt-auto"
                    />
                )}
            </div>

            {/* Form Drawer (Standardized Mobile Bottom Sheet + Desktop Side Drawer) */}
            <ClassDrawerForm
                open={createOpen || drawerMode !== null}
                mode={createOpen ? "create" : drawerMode}
                schoolClass={createOpen ? null : selectedClass}
                allTeachers={allTeachers}
                onClose={() => {
                    setDrawerMode(null);
                    setSelectedClass(null);
                    onCloseCreate?.();
                    onCloseDrawer?.();
                }}
                onRequestDelete={onRequestDelete}
            />
        </div>
    );
}
