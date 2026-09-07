import { router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import {
    Table,
    TableFooter,
    MobileNativePagination,
    Card,
    Button,
    Checkbox,
    MobileFilterSelectBar,
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
    selectedIds: propsSelectedIds,
    onSelectedIdsChange,
    onRequestDelete,
}: ClassesTabProps) {
    const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "detail" | null>(null);
    const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
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
                    <Card className="p-8 text-center text-text-inactive font-inter flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 flex items-center justify-center mb-3">
                            <FiBookOpen className="w-7 h-7" />
                        </div>
                        <h3 className="text-[14px] font-bold text-text-primary mb-1">
                            Belum Ada Data Kelas
                        </h3>
                        <p className="text-[12px] text-text-secondary max-w-xs mb-4">
                            Mulai tambahkan rombongan belajar baru untuk tahun ajaran aktif.
                        </p>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                                if (typeof window !== "undefined" && window.innerWidth < 640) {
                                    router.visit("/master-data/create?tab=class");
                                } else {
                                    setSelectedClass(null);
                                    setDrawerMode("create");
                                }
                            }}
                            icon={<FiPlus className="text-[14px]" />}
                        >
                            Tambah Kelas Baru
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-2">
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
                            className="mb-1"
                        />

                        {displayClasses.map((c) => {
                            const isSelected = selectedIds.includes(c.id);
                            const count = c.students_count ?? 0;
                            const cap = c.capacity || 36;
                            const isFull = count >= cap;
                            const percent = Math.min(100, Math.round((count / cap) * 100));

                            return (
                                <div
                                    key={c.id}
                                    onClick={() => {
                                        if (typeof window !== "undefined" && window.innerWidth < 640) {
                                            router.visit(`/master-data/classes/${c.id}/detail`);
                                        } else {
                                            setSelectedClass(c);
                                            setDrawerMode("detail");
                                        }
                                    }}
                                    className={`p-3 bg-surface border rounded-2xl shadow-xs space-y-2 transition-all cursor-pointer active:scale-[0.99] select-none ${
                                        isSelected
                                            ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                                            : "border-border hover:border-text-muted/30"
                                    }`}
                                >
                                    {/* Top Row: Checkbox, Class Name & Level Badge */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2 min-w-0 flex-1">
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectOne(c.id, !isSelected);
                                                }}
                                                className="pt-0.5 cursor-pointer p-1 -m-1 rounded hover:bg-muted/50 transition-colors flex items-center justify-center shrink-0"
                                                title="Pilih Kelas"
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    readOnly
                                                    className="pointer-events-none"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-[13.5px] font-bold text-text-primary truncate">
                                                        {c.full_name || (c.name.startsWith(c.level) ? c.name : `${c.level}-${c.name}`)}
                                                    </h4>
                                                    {c.level && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-700 border border-purple-500/20">
                                                            {c.level}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10.5px] text-text-muted mt-0.5">
                                                    <FiCalendar className="text-[10px]" />
                                                    <span>Tahun Ajaran: {c.academic_year || "—"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0 flex items-center gap-1 pt-0.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                isFull
                                                    ? "bg-danger text-white border-danger"
                                                    : "bg-muted text-text-secondary border-border"
                                            }`}>
                                                {count}/{cap} Siswa
                                            </span>
                                        </div>
                                    </div>

                                    {/* Middle Row: Wali Kelas & Capacity Progress Bar */}
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

                                        {/* Capacity visual progress bar */}
                                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    isFull ? "bg-danger" : percent > 80 ? "bg-amber-500" : "bg-primary"
                                                }`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Bottom Action Row */}
                                    <div className="flex items-center justify-between pt-1 border-t border-border/60">
                                        <span className="text-[10px] text-text-muted">
                                            Ketuk kartu untuk detail & edit
                                        </span>
                                        <div
                                            className="flex items-center gap-1 shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (typeof window !== "undefined" && window.innerWidth < 640) {
                                                        router.visit(`/master-data/classes/${c.id}/edit`);
                                                    } else {
                                                        setSelectedClass(c);
                                                        setDrawerMode("edit");
                                                    }
                                                }}
                                                className="h-8 px-3 rounded-xl text-[12px] font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                                                aria-label="Edit Data"
                                            >
                                                <FiEdit2 className="text-[12.5px]" />
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onRequestDelete("classes", c.id, c.name)}
                                                className="h-8 w-8 rounded-xl text-danger bg-danger/10 hover:bg-danger/20 border border-danger/20 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
                                                aria-label="Hapus Kelas"
                                                title="Hapus Kelas"
                                            >
                                                <FiTrash2 className="text-[13px]" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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
                    onCloseCreate?.();
                }}
                onRequestDelete={onRequestDelete}
            />
        </div>
    );
}
