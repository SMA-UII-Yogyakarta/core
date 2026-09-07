import { router } from "@inertiajs/react";
import { useState } from "react";
import {
    Table,
    TableFooter,
    MobileNativePagination,
    Avatar,
    StatusBadge,
    Checkbox,
    Card,
    Button,
    MobileFilterSelectBar,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import {
    FiPlus,
    FiTrash2,
    FiEye,
    FiEdit2,
    FiBookOpen,
    FiCopy,
    FiCheck,
    FiUserCheck,
    FiUsers,
} from "react-icons/fi";
import { copyToClipboard } from "@/utils/helpers";
import type { Student, ClassOption, PaginatedData } from "./types";
import StudentDrawerForm from "./StudentDrawerForm";

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
    selectedIds: propsSelectedIds,
    onSelectedIdsChange,
    onRequestDelete,
}: StudentsTabProps) {
    const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "detail" | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
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

    const isAllSelected =
        studentList.length > 0 && selectedIds.length === studentList.length;

    const columns: Column<Student>[] = [
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
                        <span className="font-medium text-text-primary text-[13px]">
                            {s.class.name}
                        </span>
                    ) : (
                        <span className="text-[12px] text-text-muted italic">
                            Belum Ada Kelas
                        </span>
                    )}
                    {s.enrollment_year && (
                        <span className="text-[11px] text-text-muted ml-1.5 font-normal">
                            ({s.enrollment_year})
                        </span>
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
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedStudent(s);
                            setDrawerMode("detail");
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-text-muted hover:text-primary hover:bg-primary-light border border-border transition-colors cursor-pointer text-[12px] font-semibold"
                        title="Lihat / Edit Detail Siswa"
                        aria-label="Lihat / Edit Detail Siswa"
                    >
                        <FiEye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onRequestDelete?.("students", s.id, s.name)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-danger hover:bg-danger-bg border border-danger/20 transition-colors cursor-pointer text-[12px] font-semibold"
                        title="Hapus Siswa"
                        aria-label="Hapus Siswa"
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
                tab: "students",
                page: p,
                search: filters?.search || undefined,
                class_id: filters?.class_id || undefined,
                status: filters?.status || undefined,
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
                    data={studentList}
                    keyExtractor={(s) => s.id}
                    containerClassName="flex-1 min-h-0 overflow-auto bg-surface"
                    dense
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
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* MOBILE-NATIVE CARD STACK VIEW (< sm) */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="sm:hidden flex flex-col gap-3">
                {studentList.length === 0 ? (
                    <Card className="p-8 text-center text-text-inactive font-inter flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-primary flex items-center justify-center mb-3">
                            <FiUsers className="w-7 h-7" />
                        </div>
                        <h3 className="text-[14px] font-bold text-text-primary mb-1">
                            Belum Ada Data Siswa
                        </h3>
                        <p className="text-[12px] text-text-secondary max-w-xs mb-4">
                            Mulai tambahkan siswa baru atau gunakan tombol import CSV untuk mengunggah direktori peserta didik.
                        </p>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                                if (typeof window !== "undefined" && window.innerWidth < 640) {
                                    router.visit("/master-data/create?tab=students");
                                } else {
                                    setSelectedStudent(null);
                                    setDrawerMode("create");
                                }
                            }}
                            icon={<FiPlus className="text-[14px]" />}
                        >
                            Tambah Siswa Baru
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-2">
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
                            className="mb-1"
                        />

                        {/* Card List Stack */}
                        {studentList.map((s) => {
                            const isSelected = selectedIds.includes(s.id);
                            return (
                                <div
                                    key={s.id}
                                    onClick={() => {
                                        if (typeof window !== "undefined" && window.innerWidth < 640) {
                                            router.visit(`/master-data/students/${s.id}/detail`);
                                        } else {
                                            setSelectedStudent(s);
                                            setDrawerMode("detail");
                                        }
                                    }}
                                    className={`p-3 bg-surface border rounded-2xl shadow-xs space-y-2.5 transition-all cursor-pointer active:scale-[0.99] select-none ${
                                        isSelected
                                            ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                                            : "border-border hover:border-text-muted/30"
                                    }`}
                                >
                                    {/* Top Row: Checkbox, Avatar, Name & Status */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2 min-w-0 flex-1">
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectOne(s.id, !isSelected);
                                                }}
                                                className="pt-0.5 cursor-pointer p-1 -m-1 rounded hover:bg-muted/50 transition-colors flex items-center justify-center shrink-0"
                                                title="Pilih Siswa"
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    readOnly
                                                    className="pointer-events-none"
                                                />
                                            </div>
                                            <Avatar name={s.name} size="sm" className="shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-[13px] font-bold text-text-primary truncate leading-snug">
                                                    {s.name}
                                                </h4>
                                                <div className="flex items-center gap-1.5 text-[10.5px] text-text-muted mt-0.5">
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
                                            </div>
                                        </div>

                                        <div className="shrink-0 pt-0.5 flex items-center gap-1.5">
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
                                        </div>
                                    </div>

                                    {/* Middle Row: Guardian Info */}
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
                                                        router.visit(`/master-data/students/${s.id}/edit`);
                                                    } else {
                                                        setSelectedStudent(s);
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
                                                onClick={() => onRequestDelete?.("students", s.id, s.name)}
                                                className="h-8 w-8 rounded-xl text-danger bg-danger/10 hover:bg-danger/20 border border-danger/20 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
                                                aria-label="Hapus Siswa"
                                                title="Hapus Siswa"
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
                    onCloseCreate?.();
                }}
                onRequestDelete={onRequestDelete}
            />
        </div>
    );
}
