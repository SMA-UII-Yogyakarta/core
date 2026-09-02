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
import type { Guardian, PaginatedData } from "./types";
import GuardianDrawerForm from "./GuardianDrawerForm";

interface GuardiansTabProps {
    guardians?: PaginatedData<Guardian>;
    filters?: Record<string, string | undefined>;
    createOpen?: boolean;
    onCloseCreate?: () => void;
    onRequestDelete: (entity: string, ids: number | number[], label: string) => void;
}

export default function GuardiansTab({
    guardians,
    filters = {},
    createOpen = false,
    onCloseCreate,
    onRequestDelete,
}: GuardiansTabProps) {
    const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "detail" | null>(null);
    const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);

    const { triggerRef, showFab } = useScrollFabTrigger();
    const guardianList = guardians?.data || [];

    const columns: Column<Guardian>[] = [
        {
            key: "guardian",
            header: "Nama Orang Tua / Wali",
            render: (g) => (
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => {
                        setSelectedGuardian(g);
                        setDrawerMode("detail");
                    }}
                >
                    <Avatar name={g.name} size="sm" />
                    <div>
                        <div className="font-semibold text-text-primary text-[14px] hover:text-primary transition-colors">
                            {g.name}
                        </div>
                        <div className="text-[12px] text-text-muted mt-0.5">
                            {g.phone ? `WA: ${g.phone}` : "No. Telp Belum Diisi"}
                            {g.user?.email && ` • ${g.user.email}`}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: "address",
            header: "Alamat Domisili",
            render: (g) => (
                <span className="text-[13px] text-text-secondary">
                    {g.address || "—"}
                </span>
            ),
        },
        {
            key: "students",
            header: "Siswa Terhubung",
            render: (g) => {
                const linked = g.students || [];
                if (linked.length === 0) {
                    return (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-text-muted border border-border">
                            Belum Ada Siswa
                        </span>
                    );
                }
                return (
                    <div className="flex flex-wrap gap-1.5">
                        {linked.map((s) => (
                            <span
                                key={s.id}
                                className="px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-muted text-text-primary border border-border"
                            >
                                {s.name} ({s.class?.name || "No Class"})
                            </span>
                        ))}
                    </div>
                );
            },
        },
        {
            key: "actions",
            header: "Aksi",
            className: "text-center w-24",
            render: (g) => (
                <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedGuardian(g);
                            setDrawerMode("detail");
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary-light border border-border transition-colors cursor-pointer"
                        title="Lihat / Edit Detail Wali"
                        aria-label="Lihat / Edit Detail Wali"
                    >
                        <FiEye className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onRequestDelete("guardians", g.id, g.name)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-danger hover:bg-danger-bg border border-danger/20 transition-colors cursor-pointer"
                        title="Hapus Wali"
                        aria-label="Hapus Wali"
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
                data={guardianList}
                keyExtractor={(g) => g.id}
                containerClassName="flex-1 min-h-0 overflow-auto bg-surface"
                dense
            />

            {/* Standardized Reusable Symmetrical Table Footer */}
            <TableFooter
                info="Direktori kontak dan relasi orang tua/wali murid terdaftar."
                pagination={
                    guardians && guardians.total > 0 ? (
                        <Pagination
                            currentPage={guardians.current_page}
                            totalPages={guardians.last_page}
                            totalItems={guardians.total}
                            perPage={guardians.per_page}
                            onPageChange={(p) =>
                                router.get(
                                    "/master-data",
                                    {
                                        tab: "guardians",
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
            <GuardianDrawerForm
                open={createOpen || drawerMode !== null}
                mode={createOpen ? "create" : drawerMode}
                guardian={createOpen ? null : selectedGuardian}
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
                    setSelectedGuardian(null);
                    setDrawerMode("create");
                }}
                label="Tambah Wali"
                icon={<FiPlus size={20} />}
                dusk="fab-create-guardian"
            />
        </div>
    );
}
