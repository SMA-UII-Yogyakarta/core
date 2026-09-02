import { router } from "@inertiajs/react";
import { useState } from "react";
import {
    Table,
    TableFooter,
    Pagination,
    Avatar,
    FAB,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import { FiPlus, FiEye, FiTrash2 } from "react-icons/fi";
import { useScrollFabTrigger } from "@/hooks/useScrollFabTrigger";
import type { Teacher, PaginatedData } from "./types";
import TeacherDrawerForm from "./TeacherDrawerForm";

interface TeachersTabProps {
    teachers?: PaginatedData<Teacher>;
    filters?: Record<string, string | undefined>;
    createOpen?: boolean;
    onCloseCreate?: () => void;
    onRequestDelete: (entity: string, ids: number | number[], label: string) => void;
}

export default function TeachersTab({
    teachers,
    filters = {},
    createOpen = false,
    onCloseCreate,
    onRequestDelete,
}: TeachersTabProps) {
    const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "detail" | null>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const { triggerRef, showFab } = useScrollFabTrigger();
    const teacherList = teachers?.data || [];

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
            header: "Aksi",
            className: "text-center w-24",
            render: (t) => (
                <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedTeacher(t);
                            setDrawerMode("detail");
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary-light border border-border transition-colors cursor-pointer"
                        title="Lihat / Edit Detail Guru"
                        aria-label="Lihat / Edit Detail Guru"
                    >
                        <FiEye className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onRequestDelete("teachers", t.id, t.name)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-danger hover:bg-danger-bg border border-danger/20 transition-colors cursor-pointer"
                        title="Hapus Guru"
                        aria-label="Hapus Guru"
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
                data={teacherList}
                keyExtractor={(t) => t.id}
                containerClassName="flex-1 min-h-0 overflow-auto bg-surface"
                dense
            />

            {/* Standardized Reusable Symmetrical Table Footer */}
            <TableFooter
                info="Direktori data guru pengajar, guru piket, dan wali kelas."
                pagination={
                    teachers && teachers.total > 0 ? (
                        <Pagination
                            currentPage={teachers.current_page}
                            totalPages={teachers.last_page}
                            totalItems={teachers.total}
                            perPage={teachers.per_page}
                            onPageChange={(p) =>
                                router.get(
                                    "/master-data",
                                    {
                                        tab: "teachers",
                                        page: p,
                                        search: filters?.search || undefined,
                                    },
                                    { preserveState: true }
                                )
                            }
                            className="!w-auto !gap-3"
                        />
                    ) : undefined
                }
            />

            {/* Form Drawer */}
            <TeacherDrawerForm
                open={createOpen || drawerMode !== null}
                mode={createOpen ? "create" : drawerMode}
                teacher={createOpen ? null : selectedTeacher}
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
                    setSelectedTeacher(null);
                    setDrawerMode("create");
                }}
                label="Tambah Guru"
                icon={<FiPlus size={20} />}
                dusk="fab-create-teacher"
            />
        </div>
    );
}
