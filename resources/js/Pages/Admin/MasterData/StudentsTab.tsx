import { router } from "@inertiajs/react";
import { useState } from "react";
import {
    Table,
    TableFooter,
    Pagination,
    Avatar,
    StatusBadge,
    Checkbox,
    FAB,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import { FiPlus, FiTrash2, FiEye } from "react-icons/fi";
import { useScrollFabTrigger } from "@/hooks/useScrollFabTrigger";
import type { Student, ClassOption, PaginatedData } from "./types";
import StudentDrawerForm from "./StudentDrawerForm";

interface StudentsTabProps {
    students?: PaginatedData<Student>;
    classOptions?: ClassOption[];
    allGuardians?: { id: number; name: string }[];
    filters?: Record<string, string | undefined>;
    createOpen?: boolean;
    onCloseCreate?: () => void;
    onSelectedIdsChange?: (ids: number[]) => void;
    onRequestDelete: (entity: string, ids: number | number[], label: string) => void;
}

export default function StudentsTab({
    students,
    classOptions = [],
    allGuardians = [],
    filters = {},
    createOpen = false,
    onCloseCreate,
    onSelectedIdsChange,
    onRequestDelete,
}: StudentsTabProps) {
    const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "detail" | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const { triggerRef, showFab } = useScrollFabTrigger();

    const studentList = students?.data || [];



    const handleCopyInfo = (key: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1500);
    };

    const handleSelectAll = (checked: boolean) => {
        const next = checked ? studentList.map((s) => s.id) : [];
        setSelectedIds(next);
        onSelectedIdsChange?.(next);
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        const next = checked ? [...selectedIds, id] : selectedIds.filter((item) => item !== id);
        setSelectedIds(next);
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
                                className="cursor-pointer hover:text-primary transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyInfo(`nis-${s.id}`, s.nis);
                                }}
                                title="Klik untuk salin NIS"
                            >
                                NIS: {s.nis}
                            </span>
                            {copiedKey === `nis-${s.id}` && (
                                <span className="text-success font-medium">Tersalin!</span>
                            )}
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
            header: "Aksi",
            className: "text-center w-24",
            render: (s) => (
                <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedStudent(s);
                            setDrawerMode("detail");
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary-light border border-border transition-colors cursor-pointer"
                        title="Lihat / Edit Detail Siswa"
                        aria-label="Lihat / Edit Detail Siswa"
                    >
                        <FiEye className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onRequestDelete("students", s.id, s.name)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-danger hover:bg-danger-bg border border-danger/20 transition-colors cursor-pointer"
                        title="Hapus Siswa"
                        aria-label="Hapus Siswa"
                    >
                        <FiTrash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="relative flex-1 min-h-0 flex flex-col justify-between gap-3 overflow-hidden">
            <div ref={triggerRef} className="absolute top-0 left-0 w-px h-px pointer-events-none -z-10" />

            {/* Table */}
            <Table
                columns={columns}
                data={studentList}
                keyExtractor={(s) => s.id}
                containerClassName="flex-1 min-h-0 overflow-auto bg-surface"
                dense
            />

            {/* Standardized Reusable Symmetrical Table Footer */}
            <TableFooter
                info="Menampilkan direktori data siswa aktif dan non-aktif SMA UII Yogyakarta."
                pagination={
                    students && students.total > 0 ? (
                        <Pagination
                            currentPage={students.current_page}
                            totalPages={students.last_page}
                            totalItems={students.total}
                            perPage={students.per_page}
                            onPageChange={(p) =>
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
                                )
                            }
                            className="!w-auto !gap-3"
                        />
                    ) : undefined
                }
            />

            {/* Form Drawer */}
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

            {/* Mobile Scroll FAB for Fast Add */}
            <FAB
                show={showFab}
                onClick={() => {
                    setSelectedStudent(null);
                    setDrawerMode("create");
                }}
                label="Tambah Siswa"
                icon={<FiPlus size={20} />}
                dusk="fab-create-student"
            />
        </div>
    );
}
