import { router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import {
    Table,
    TableFooter,
    Pagination,
    FAB,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import { FiPlus, FiEye, FiTrash2 } from "react-icons/fi";
import { useScrollFabTrigger } from "@/hooks/useScrollFabTrigger";
import type { SchoolClass, Teacher, PaginatedData, SearchConfig } from "./types";
import ClassDrawerForm from "./ClassDrawerForm";

interface ClassesTabProps {
    schoolClasses?: PaginatedData<SchoolClass>;
    allTeachers?: Teacher[];
    searchConfig?: SearchConfig;
    filters?: Record<string, string | undefined>;
    createOpen?: boolean;
    onCloseCreate?: () => void;
    onRequestDelete: (entity: string, ids: number | number[], label: string) => void;
}

export default function ClassesTab({
    schoolClasses,
    allTeachers = [],
    searchConfig,
    filters = {},
    createOpen = false,
    onCloseCreate,
    onRequestDelete,
}: ClassesTabProps) {
    const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "detail" | null>(null);
    const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);

    const { triggerRef, showFab } = useScrollFabTrigger();

    const isClientMode = searchConfig?.mode === "client";
    const allClasses = useMemo(() => searchConfig?.allData || [], [searchConfig?.allData]);

    const displayClasses = useMemo(() => {
        if (isClientMode) {
            const q = (filters?.search ?? "").toLowerCase();
            return allClasses.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.teacher?.name?.toLowerCase().includes(q) ||
                    c.level?.toLowerCase().includes(q)
            );
        }
        return schoolClasses?.data || [];
    }, [isClientMode, allClasses, filters?.search, schoolClasses?.data]);



    const columns: Column<SchoolClass>[] = [
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
                        {c.name}
                    </div>
                    <div className="text-[12px] text-text-muted mt-0.5">
                        Tingkat: {c.level || "—"}
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
            header: "Aksi",
            className: "text-center w-24",
            render: (c) => (
                <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedClass(c);
                            setDrawerMode("detail");
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary-light border border-border transition-colors cursor-pointer"
                        title="Lihat / Edit Detail Rombel"
                        aria-label="Lihat / Edit Detail Rombel"
                    >
                        <FiEye className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onRequestDelete("classes", c.id, c.name)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-danger hover:bg-danger-bg border border-danger/20 transition-colors cursor-pointer"
                        title="Hapus Rombel"
                        aria-label="Hapus Rombel"
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
                data={displayClasses}
                keyExtractor={(c) => c.id}
                containerClassName="flex-1 min-h-0 overflow-auto bg-surface"
                dense
            />

            {/* Standardized Reusable Symmetrical Table Footer */}
            <TableFooter
                info="Manajemen rombongan belajar dan penugasan wali kelas aktif."
                pagination={
                    !isClientMode && schoolClasses && schoolClasses.total > 0 ? (
                        <Pagination
                            currentPage={schoolClasses.current_page}
                            totalPages={schoolClasses.last_page}
                            totalItems={schoolClasses.total}
                            perPage={schoolClasses.per_page}
                            onPageChange={(p) =>
                                router.get(
                                    "/master-data",
                                    {
                                        tab: "class",
                                        page: p,
                                        search: filters?.search || undefined,
                                    },
                                    { preserveState: true }
                                )
                            }
                            className="!w-auto !gap-3"
                        />
                    ) : (
                        <div className="text-[12px] text-text-muted font-medium shrink-0">
                            Total: <strong className="text-text-primary font-bold">{displayClasses.length}</strong> kelas
                        </div>
                    )
                }
            />

            {/* Form Drawer */}
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

            {/* Mobile / Scroll FAB for Fast Add */}
            <FAB
                show={showFab}
                onClick={() => {
                    setSelectedClass(null);
                    setDrawerMode("create");
                }}
                label="Tambah Kelas"
                icon={<FiPlus size={20} />}
                dusk="fab-create-class"
            />
        </div>
    );
}
