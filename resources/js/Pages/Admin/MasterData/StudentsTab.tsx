import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { FiBookOpen, FiCheck, FiCopy, FiEye, FiTrash2, FiUserCheck, FiUsers } from "react-icons/fi";
import {
    ActionButton,
    Avatar,
    Checkbox,
    MasterDataCard,
    MasterDataEmptyState,
    MobileFilterSelectBar,
    MobileNativePagination,
    StatusBadge,
    Table,
    TableFooter,
    TableSection,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import { copyToClipboard } from "@/utils/helpers";
import StudentDrawerForm from "./StudentDrawerForm";
import type { ClassOption, PaginatedData, Student } from "./types";

interface StudentsTabProps {
    students?: PaginatedData<Student>;
    classOptions?: ClassOption[];
    allGuardians?: { id: number; name: string }[];
    filters?: {
        search?: string;
        class_id?: string;
        status?: string;
    };
    onSearchChange?: (val: string) => void;
    onFilterChange?: (key: string, val: string) => void;
    createOpen?: boolean;
    onCloseCreate?: () => void;
    editItem?: Student | null;
    editMode?: "edit" | "detail" | null;
    onCloseDrawer?: () => void;
    selectedIds?: number[];
    onSelectedIdsChange?: (ids: number[]) => void;
    onRequestDelete?: (entity: string, ids: number | number[], label: string) => void;
}

export default function StudentsTab({
    students,
    classOptions = [],
    allGuardians = [],
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
}: StudentsTabProps) {
    const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "detail" | null>(editMode ?? null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(editItem ?? null);

    useEffect(() => {
        if (editItem && editMode) {
            setSelectedStudent(editItem);
            setDrawerMode(editMode);
        }
    }, [editItem, editMode]);
    const [internalSelectedIds, setInternalSelectedIds] = useState<number[]>([]);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const studentList = students?.data || [];
    const selectedIds = propsSelectedIds !== undefined ? propsSelectedIds : internalSelectedIds;

    const handleCopyInfo = (key: string, text: string) => {
        if (!text) return;
        copyToClipboard(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1500);
    };

    const handleSelectAll = (checked: boolean) => {
        const next = checked ? studentList.map((s) => s.id) : [];
        setInternalSelectedIds(next);
        onSelectedIdsChange?.(next);
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        const next = checked ? [...selectedIds, id] : selectedIds.filter((item) => item !== id);
        setInternalSelectedIds(next);
        onSelectedIdsChange?.(next);
    };

    const isAllSelected = studentList.length > 0 && selectedIds.length === studentList.length;

    const columns: Column<Student>[] = [
        {
            key: "selection",
            header: (
                <div className="flex items-center justify-center">
                    <Checkbox checked={isAllSelected} onChange={(e) => handleSelectAll(e.target.checked)} />
                </div>
            ),
            render: (s) => (
                <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={selectedIds.includes(s.id)}
                        onChange={(e) => handleSelectOne(s.id, e.target.checked)}
                    />
                </div>
            ),
            className: "w-12 text-center",
        },
        {
            key: "student",
            header: "Nama Siswa & NIS",
            render: (s) => (
                <div
                    className="flex items-center gap-2.5 cursor-pointer"
                    onClick={() => {
                        setSelectedStudent(s);
                        setDrawerMode("detail");
                    }}
                >
                    <Avatar name={s.name} size="sm" />
                    <div className="min-w-0">
                        <div className="font-semibold text-text-primary text-[13px] hover:text-primary transition-colors truncate">
                            {s.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-text-muted leading-tight">
                            <span
                                className="cursor-pointer hover:text-primary transition-colors inline-flex items-center gap-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyInfo(`nis-${s.id}`, s.nis);
                                }}
                                title="Klik untuk salin NIS"
                            >
                                NIS: {s.nis}
                                {copiedKey === `nis-${s.id}` ? (
                                    <FiCheck className="text-success text-[10px]" />
                                ) : (
                                    <FiCopy className="text-text-muted/60 text-[10px]" />
                                )}
                            </span>
                            {s.nisn && (
                                <>
                                    <span>•</span>
                                    <span>NISN: {s.nisn}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: "class",
            header: "Rombel / Kelas",
            render: (s) => (
                <div>
                    {s.class ? (
                        <span className="font-medium text-text-primary text-[13px]">{s.class.name}</span>
                    ) : (
                        <span className="text-[12px] text-text-muted italic">Belum Ada Kelas</span>
                    )}
                    {s.enrollment_year && (
                        <span className="text-[11px] text-text-muted ml-1.5 font-normal">({s.enrollment_year})</span>
                    )}
                </div>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (s) => (
                <StatusBadge
                    variant={s.status.toLowerCase() === "active" ? "present" : "absent"}
                    label={s.status.toLowerCase() === "active" ? "Aktif" : "Non-Aktif"}
                />
            ),
        },
        {
            key: "actions",
            header: <div className="text-center w-full">Aksi</div>,
            className: "text-center w-36 whitespace-nowrap",
            render: (s) => (
                <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <ActionButton
                        variant="detail"
                        label="Detail"
                        icon={<FiEye className="w-3.5 h-3.5" />}
                        onClick={() => {
                            setSelectedStudent(s);
                            setDrawerMode("detail");
                        }}
                        title="Lihat / Edit Detail Siswa"
                        aria-label="Lihat / Edit Detail Siswa"
                    />
                    <ActionButton
                        variant="delete"
                        label="Hapus"
                        icon={<FiTrash2 className="w-3.5 h-3.5" />}
                        onClick={() => onRequestDelete?.("students", s.id, s.name)}
                        title="Hapus Siswa"
                        aria-label="Hapus Siswa"
                    />
                </div>
            ),
        },
    ];

    const handlePagination = (p: number) => {
        router.get(
            "/master-data",
            {
                tab: "students",
                page: p,
                search: filters?.search || undefined,
                class_id: filters?.class_id || undefined,
                status: filters?.status || undefined,
            },
            { preserveState: true },
        );
    };

    return (
        <div className="relative flex-1 min-h-0 flex flex-col justify-between overflow-hidden font-inter">
            {/* ───────────────────────────────────────────────────────────── */}
            {/* DESKTOP TABLE VIEW (>= sm) */}
            {/* ───────────────────────────────────────────────────────────── */}
            <TableSection desktopOnly>
                <Table
                    columns={columns}
                    data={studentList}
                    keyExtractor={(s) => s.id}
                    dense
                    fill
                />

                <TableFooter
                    currentPage={students?.current_page}
                    totalPages={students?.last_page}
                    totalItems={students?.total}
                    perPage={students?.per_page}
                    onPageChange={handlePagination}
                    itemLabel="siswa"
                    emptyInfo="Menampilkan direktori data siswa SMA UII Yogyakarta."
                />
            </TableSection>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* MOBILE-NATIVE CARD STACK VIEW (< sm) */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="sm:hidden flex flex-col gap-3">
                {studentList.length === 0 ? (
                    <MasterDataEmptyState
                        icon={<FiUsers className="w-7 h-7" />}
                        iconContainerClassName="bg-blue-500/10 border-blue-500/20 text-primary"
                        title="Belum Ada Data Siswa"
                        description="Mulai tambahkan siswa baru atau gunakan tombol import CSV untuk mengunggah direktori peserta didik."
                        actionLabel="Tambah Siswa Baru"
                        onAction={() => {
                            if (typeof window !== "undefined" && window.innerWidth < 640) {
                                router.visit("/master-data/create?tab=students");
                            } else {
                                setSelectedStudent(null);
                                setDrawerMode("create");
                            }
                        }}
                    />
                ) : (
                    <>
                        {/* Mobile Filter & Select All Bar */}
                        <MobileFilterSelectBar
                            selectedCount={selectedIds.length}
                            totalCount={studentList.length}
                            allSelected={isAllSelected}
                            indeterminate={selectedIds.length > 0 && !isAllSelected}
                            onToggleSelectAll={handleSelectAll}
                            searchValue={filters?.search ?? ""}
                            onSearchChange={(val) => onSearchChange?.(val)}
                            searchPlaceholder="Cari NIS, nama siswa..."
                        />

                        {/* Card List Stack */}
                        {studentList.map((s) => {
                            const isSelected = selectedIds.includes(s.id);
                            return (
                                <MasterDataCard
                                    key={s.id}
                                    isSelected={isSelected}
                                    onSelect={(checked) => handleSelectOne(s.id, checked)}
                                    onOpenDetail={() => {
                                        if (typeof window !== "undefined" && window.innerWidth < 640) {
                                            router.visit(`/master-data/students/${s.id}/detail`);
                                        } else {
                                            setSelectedStudent(s);
                                            setDrawerMode("detail");
                                        }
                                    }}
                                    onEdit={() => {
                                        if (typeof window !== "undefined" && window.innerWidth < 640) {
                                            router.visit(`/master-data/students/${s.id}/edit`);
                                        } else {
                                            setSelectedStudent(s);
                                            setDrawerMode("edit");
                                        }
                                    }}
                                    onDelete={() => onRequestDelete?.("students", s.id, s.name)}
                                    selectLabel="Pilih Siswa"
                                    deleteAriaLabel="Hapus Siswa"
                                    avatarName={s.name}
                                    title={s.name}
                                    subtitle={
                                        <div className="flex items-center gap-1.5 text-[10.5px] text-text-muted">
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCopyInfo(`nis-mob-${s.id}`, s.nis);
                                                }}
                                                className="cursor-pointer hover:text-primary font-mono inline-flex items-center gap-1"
                                            >
                                                NIS: {s.nis}
                                                {copiedKey === `nis-mob-${s.id}` ? (
                                                    <FiCheck className="text-success text-[10px]" />
                                                ) : (
                                                    <FiCopy className="text-text-muted/60 text-[9px]" />
                                                )}
                                            </span>
                                            {s.nisn && (
                                                <>
                                                    <span>•</span>
                                                    <span className="font-mono">NISN: {s.nisn}</span>
                                                </>
                                            )}
                                        </div>
                                    }
                                    rightBadge={
                                        <>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-semibold bg-muted text-text-primary border border-border/80">
                                                <FiBookOpen className="text-[10px] text-primary" />
                                                <span>{s.class?.name || "Belum Ada Kelas"}</span>
                                                {s.enrollment_year && (
                                                    <span className="text-text-muted font-normal">
                                                        ({s.enrollment_year})
                                                    </span>
                                                )}
                                            </span>
                                            <StatusBadge
                                                variant={s.status.toLowerCase() === "active" ? "present" : "absent"}
                                                label={s.status.toLowerCase() === "active" ? "Aktif" : "Non-Aktif"}
                                            />
                                        </>
                                    }
                                >
                                    {s.guardian_id && allGuardians.some((g) => g.id === s.guardian_id) && (
                                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-medium bg-amber-500/10 text-amber-700 border border-amber-500/20 truncate max-w-[200px]">
                                                <FiUserCheck className="text-[10px] shrink-0" />
                                                <span className="truncate">
                                                    Wali: {allGuardians.find((g) => g.id === s.guardian_id)?.name}
                                                </span>
                                            </span>
                                        </div>
                                    )}
                                </MasterDataCard>
                            );
                        })}
                    </>
                )}

                {/* Mobile Native Pagination */}
                {students && students.last_page > 1 && (
                    <MobileNativePagination
                        currentPage={students.current_page}
                        totalPages={students.last_page}
                        totalItems={students.total}
                        perPage={students.per_page}
                        onPageChange={handlePagination}
                        itemLabel="siswa"
                        className="shrink-0 mt-auto"
                    />
                )}
            </div>

            {/* Form Drawer (Standardized Mobile Bottom Sheet + Desktop Side Drawer) */}
            <StudentDrawerForm
                open={createOpen || drawerMode !== null}
                mode={createOpen ? "create" : drawerMode}
                student={createOpen ? null : selectedStudent}
                classOptions={classOptions}
                allGuardians={allGuardians}
                onClose={() => {
                    setDrawerMode(null);
                    setSelectedStudent(null);
                    onCloseCreate?.();
                    onCloseDrawer?.();
                }}
                onRequestDelete={onRequestDelete}
            />
        </div>
    );
}
