import { router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
    Table,
    TableFooter,
    MobileNativePagination,
    Avatar,
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
    FiUserCheck,
    FiBookOpen,
    FiMail,
} from "react-icons/fi";
import type { Teacher, PaginatedData } from "./types";
import TeacherDrawerForm from "./TeacherDrawerForm";

interface TeachersTabProps {
    teachers?: PaginatedData<Teacher>;
    filters?: Record<string, string | undefined>;
    onSearchChange?: (val: string) => void;
    onFilterChange?: (key: string, val: string) => void;
    createOpen?: boolean;
    onCloseCreate?: () => void;
    editItem?: Teacher | null;
    editMode?: "edit" | "detail" | null;
    onCloseDrawer?: () => void;
    selectedIds?: number[];
    onSelectedIdsChange?: (ids: number[]) => void;
    onRequestDelete: (entity: string, ids: number | number[], label: string) => void;
}

export default function TeachersTab({
    teachers,
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
}: TeachersTabProps) {
    const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "detail" | null>(
        editMode ?? null
    );
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(
        editItem ?? null
    );

    useEffect(() => {
        if (editItem && editMode) {
            setSelectedTeacher(editItem);
            setDrawerMode(editMode);
        }
    }, [editItem, editMode]);
    const [internalSelectedIds, setInternalSelectedIds] = useState<number[]>([]);

    const teacherList = teachers?.data || [];
    const selectedIds = propsSelectedIds !== undefined ? propsSelectedIds : internalSelectedIds;

    const handleSelectAll = (checked: boolean) => {
        const next = checked ? teacherList.map((t) => t.id) : [];
        setInternalSelectedIds(next);
        onSelectedIdsChange?.(next);
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        const next = checked ? [...selectedIds, id] : selectedIds.filter((item) => item !== id);
        setInternalSelectedIds(next);
        onSelectedIdsChange?.(next);
    };

    const isAllSelected = teacherList.length > 0 && selectedIds.length === teacherList.length;

    const formatTeacherType = (t: Teacher) => {
        const types = Array.isArray(t.teacher_type) ? t.teacher_type : [String(t.teacher_type || "duty")];
        const hasDuty = types.includes("duty") || types.includes("piket");
        const hasHome = types.includes("homeroom") || types.includes("wali");

        if (hasDuty && hasHome) {
            return (
                <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-light text-primary border border-primary/20">
                        Guru Piket
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accent-light text-text-primary border border-accent/30">
                        Wali Kelas
                    </span>
                </div>
            );
        }
        if (hasHome) {
            return (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accent-light text-text-primary border border-accent/30">
                    Wali Kelas
                </span>
            );
        }
        return (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-light text-primary border border-primary/20">
                Guru Piket
            </span>
        );
    };

    const columns: Column<Teacher>[] = [
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
            render: (t) => (
                <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={selectedIds.includes(t.id)}
                        onChange={(e) => handleSelectOne(t.id, e.target.checked)}
                    />
                </div>
            ),
            className: "w-12 text-center",
        },
        {
            key: "teacher",
            header: "Nama Pendidik",
            render: (t) => (
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => {
                        setSelectedTeacher(t);
                        setDrawerMode("detail");
                    }}
                >
                    <Avatar name={t.name} size="sm" />
                    <div>
                        <div className="font-semibold text-text-primary text-[14px] hover:text-primary transition-colors">
                            {t.name}
                        </div>
                        <div className="text-[12px] text-text-muted mt-0.5">
                            Kode: {t.teacher_code}
                            {t.user?.email && ` • ${t.user.email}`}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: "type",
            header: "Tipe Penugasan",
            render: (t) => formatTeacherType(t),
        },
        {
            key: "classes",
            header: "Kelas Binaan (Wali)",
            render: (t) => (
                <div>
                    {t.school_classes && t.school_classes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {t.school_classes.map((c) => (
                                <span
                                    key={c.id}
                                    className="px-2 py-0.5 rounded-lg text-[12px] font-medium bg-muted text-text-primary border border-border"
                                >
                                    {c.name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-[12px] text-text-muted italic">—</span>
                    )}
                </div>
            ),
        },
        {
            key: "actions",
            header: <div className="text-center w-full">Aksi</div>,
            className: "text-center w-36 whitespace-nowrap",
            render: (t) => (
                <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedTeacher(t);
                            setDrawerMode("detail");
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-text-muted hover:text-primary hover:bg-primary-light border border-border transition-colors cursor-pointer text-[12px] font-semibold"
                        title="Lihat / Edit Detail Guru"
                        aria-label="Lihat / Edit Detail Guru"
                    >
                        <FiEye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onRequestDelete("teachers", t.id, t.name)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-danger hover:bg-danger-bg border border-danger/20 transition-colors cursor-pointer text-[12px] font-semibold"
                        title="Hapus Guru"
                        aria-label="Hapus Guru"
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
                tab: "teachers",
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
                    data={teacherList}
                    keyExtractor={(t) => t.id}
                    containerClassName="flex-1 min-h-0 overflow-auto bg-surface"
                    dense
                />

                <TableFooter
                    currentPage={teachers?.current_page}
                    totalPages={teachers?.last_page}
                    totalItems={teachers?.total}
                    perPage={teachers?.per_page}
                    onPageChange={handlePagination}
                    itemLabel="guru terdaftar"
                    emptyInfo="Menampilkan data tenaga pendidik SMA UII Yogyakarta."
                />
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* MOBILE-NATIVE CARD STACK VIEW (< sm) */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="sm:hidden flex flex-col gap-3">
                {teacherList.length === 0 ? (
                    <MasterDataEmptyState
                        icon={<FiUserCheck className="w-7 h-7" />}
                        iconContainerClassName="bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                        title="Belum Ada Data Guru"
                        description="Mulai daftarkan tenaga pendidik baru atau gunakan import CSV untuk memasukkan daftar guru sekolah."
                        actionLabel="Tambah Guru Baru"
                        onAction={() => {
                            if (typeof window !== "undefined" && window.innerWidth < 640) {
                                router.visit("/master-data/create?tab=teachers");
                            } else {
                                setSelectedTeacher(null);
                                setDrawerMode("create");
                            }
                        }}
                    />
                ) : (
                    <>
                        {/* Mobile Filter & Select All Bar */}
                        <MobileFilterSelectBar
                            selectedCount={selectedIds.length}
                            totalCount={teacherList.length}
                            allSelected={isAllSelected}
                            indeterminate={selectedIds.length > 0 && !isAllSelected}
                            onToggleSelectAll={handleSelectAll}
                            searchValue={filters?.search ?? ""}
                            onSearchChange={(val) => onSearchChange?.(val)}
                            searchPlaceholder="Cari NIP, kode, nama guru..."
                        />

                        {teacherList.map((t) => {
                            const isSelected = selectedIds.includes(t.id);
                            const types = Array.isArray(t.teacher_type)
                                ? t.teacher_type
                                : [String(t.teacher_type || "duty")];
                            const hasDuty = types.includes("duty") || types.includes("piket");
                            const hasHome = types.includes("homeroom") || types.includes("wali");

                            return (
                                <MasterDataCard
                                    key={t.id}
                                    isSelected={isSelected}
                                    onSelect={(checked) => handleSelectOne(t.id, checked)}
                                    onOpenDetail={() => {
                                        if (typeof window !== "undefined" && window.innerWidth < 640) {
                                            router.visit(`/master-data/teachers/${t.id}/detail`);
                                        } else {
                                            setSelectedTeacher(t);
                                            setDrawerMode("detail");
                                        }
                                    }}
                                    onEdit={() => {
                                        if (typeof window !== "undefined" && window.innerWidth < 640) {
                                            router.visit(`/master-data/teachers/${t.id}/edit`);
                                        } else {
                                            setSelectedTeacher(t);
                                            setDrawerMode("edit");
                                        }
                                    }}
                                    onDelete={() => onRequestDelete("teachers", t.id, t.name)}
                                    selectLabel="Pilih Guru"
                                    deleteAriaLabel="Hapus Guru"
                                    avatarName={t.name}
                                    title={t.name}
                                    subtitle={
                                        <div className="flex items-center gap-1.5 text-[10.5px] text-text-muted">
                                            <span className="font-mono font-medium">
                                                Kode: {t.teacher_code}
                                            </span>
                                            {t.user?.email && (
                                                <>
                                                    <span>•</span>
                                                    <span className="truncate max-w-[130px] inline-flex items-center gap-0.5">
                                                        <FiMail className="text-[10px]" />
                                                        {t.user.email}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    }
                                    rightBadge={
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-muted font-bold text-text-secondary border border-border">
                                            ID #{t.id}
                                        </span>
                                    }
                                >
                                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                        {hasDuty && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                                                Guru Piket
                                            </span>
                                        )}
                                        {hasHome && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                                                Wali Kelas
                                            </span>
                                        )}

                                        {t.school_classes && t.school_classes.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-1 ml-auto">
                                                {t.school_classes.map((c) => (
                                                    <span
                                                        key={c.id}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-muted text-text-primary border border-border/80"
                                                    >
                                                        <FiBookOpen className="text-[10px] text-primary" />
                                                        {c.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </MasterDataCard>
                            );
                        })}
                    </>
                )}

                {/* Mobile Native Pagination */}
                {teachers && teachers.last_page > 1 && (
                    <MobileNativePagination
                        currentPage={teachers.current_page}
                        totalPages={teachers.last_page}
                        totalItems={teachers.total}
                        perPage={teachers.per_page}
                        onPageChange={handlePagination}
                        itemLabel="guru"
                        className="shrink-0 mt-auto"
                    />
                )}
            </div>

            {/* Form Drawer (Standardized Mobile Bottom Sheet + Desktop Side Drawer) */}
            <TeacherDrawerForm
                open={createOpen || drawerMode !== null}
                mode={createOpen ? "create" : drawerMode}
                teacher={createOpen ? null : selectedTeacher}
                onClose={() => {
                    setDrawerMode(null);
                    setSelectedTeacher(null);
                    onCloseCreate?.();
                    onCloseDrawer?.();
                }}
                onRequestDelete={onRequestDelete}
            />
        </div>
    );
}
