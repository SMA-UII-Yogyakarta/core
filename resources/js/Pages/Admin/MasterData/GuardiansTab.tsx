import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { FiEye, FiMapPin, FiPhone, FiShield, FiTrash2, FiUsers } from "react-icons/fi";
import {
    Avatar,
    ActionButton,
    Checkbox,
    MasterDataCard,
    MasterDataEmptyState,
    MobileFilterSelectBar,
    MobileNativePagination,
    Table,
    TableFooter,
    TableSection,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import GuardianDrawerForm from "./GuardianDrawerForm";
import type { Guardian, PaginatedData } from "./types";

interface GuardiansTabProps {
    guardians?: PaginatedData<Guardian>;
    filters?: Record<string, string | undefined>;
    onSearchChange?: (val: string) => void;
    onFilterChange?: (key: string, val: string) => void;
    createOpen?: boolean;
    onCloseCreate?: () => void;
    editItem?: Guardian | null;
    editMode?: "edit" | "detail" | null;
    onCloseDrawer?: () => void;
    selectedIds?: number[];
    onSelectedIdsChange?: (ids: number[]) => void;
    onRequestDelete: (entity: string, ids: number | number[], label: string) => void;
}

export default function GuardiansTab({
    guardians,
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
}: GuardiansTabProps) {
    const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "detail" | null>(editMode ?? null);
    const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(editItem ?? null);

    useEffect(() => {
        if (editItem && editMode) {
            setSelectedGuardian(editItem);
            setDrawerMode(editMode);
        }
    }, [editItem, editMode]);
    const [internalSelectedIds, setInternalSelectedIds] = useState<number[]>([]);

    const guardianList = guardians?.data || [];
    const selectedIds = propsSelectedIds !== undefined ? propsSelectedIds : internalSelectedIds;

    const handleSelectAll = (checked: boolean) => {
        const next = checked ? guardianList.map((g) => g.id) : [];
        setInternalSelectedIds(next);
        onSelectedIdsChange?.(next);
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        const next = checked ? [...selectedIds, id] : selectedIds.filter((item) => item !== id);
        setInternalSelectedIds(next);
        onSelectedIdsChange?.(next);
    };

    const isAllSelected = guardianList.length > 0 && selectedIds.length === guardianList.length;

    const columns: Column<Guardian>[] = [
        {
            key: "selection",
            header: (
                <div className="flex items-center justify-center">
                    <Checkbox checked={isAllSelected} onChange={(e) => handleSelectAll(e.target.checked)} />
                </div>
            ),
            render: (g) => (
                <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={selectedIds.includes(g.id)}
                        onChange={(e) => handleSelectOne(g.id, e.target.checked)}
                    />
                </div>
            ),
            className: "w-12 text-center",
        },
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
            render: (g) => <span className="text-[13px] text-text-secondary">{g.address || "—"}</span>,
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
            header: <div className="text-center w-full">Aksi</div>,
            className: "text-center w-36 whitespace-nowrap",
            render: (g) => (
                <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <ActionButton
                        variant="detail"
                        label="Detail"
                        icon={<FiEye className="w-3.5 h-3.5" />}
                        onClick={() => {
                            setSelectedGuardian(g);
                            setDrawerMode("detail");
                        }}
                        title="Lihat / Edit Detail Wali"
                        aria-label="Lihat / Edit Detail Wali"
                    />
                    <ActionButton
                        variant="delete"
                        label="Hapus"
                        icon={<FiTrash2 className="w-3.5 h-3.5" />}
                        onClick={() => onRequestDelete("guardians", g.id, g.name)}
                        title="Hapus Wali"
                        aria-label="Hapus Wali"
                    />
                </div>
            ),
        },
    ];

    const handlePagination = (p: number) => {
        router.get(
            "/master-data",
            {
                tab: "guardians",
                page: p,
                search: filters?.search || undefined,
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
                    data={guardianList}
                    keyExtractor={(g) => g.id}
                    dense
                    fill
                />

                <TableFooter
                    currentPage={guardians?.current_page}
                    totalPages={guardians?.last_page}
                    totalItems={guardians?.total}
                    perPage={guardians?.per_page}
                    onPageChange={handlePagination}
                    itemLabel="wali murid"
                    emptyInfo="Menampilkan data wali murid terdaftar di SMA UII Yogyakarta."
                />
            </TableSection>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* MOBILE-NATIVE CARD STACK VIEW (< sm) */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="sm:hidden flex flex-col gap-3">
                {guardianList.length === 0 ? (
                    <MasterDataEmptyState
                        icon={<FiShield className="w-7 h-7" />}
                        iconContainerClassName="bg-amber-500/10 border-amber-500/20 text-amber-600"
                        title="Belum Ada Data Wali Murid"
                        description="Mulai tambahkan wali murid atau gunakan fitur import CSV untuk menghubungkan akun orang tua."
                        actionLabel="Tambah Wali Baru"
                        onAction={() => {
                            if (typeof window !== "undefined" && window.innerWidth < 640) {
                                router.visit("/master-data/create?tab=guardians");
                            } else {
                                setSelectedGuardian(null);
                                setDrawerMode("create");
                            }
                        }}
                    />
                ) : (
                    <>
                        {/* Mobile Filter & Select All Bar */}
                        <MobileFilterSelectBar
                            selectedCount={selectedIds.length}
                            totalCount={guardianList.length}
                            allSelected={isAllSelected}
                            indeterminate={selectedIds.length > 0 && !isAllSelected}
                            onToggleSelectAll={handleSelectAll}
                            searchValue={filters?.search ?? ""}
                            onSearchChange={(val) => onSearchChange?.(val)}
                            searchPlaceholder="Cari NIK, nama wali..."
                        />

                        {guardianList.map((g) => {
                            const isSelected = selectedIds.includes(g.id);
                            const linked = g.students || [];

                            return (
                                <MasterDataCard
                                    key={g.id}
                                    isSelected={isSelected}
                                    onSelect={(checked) => handleSelectOne(g.id, checked)}
                                    onOpenDetail={() => {
                                        if (typeof window !== "undefined" && window.innerWidth < 640) {
                                            router.visit(`/master-data/guardians/${g.id}/detail`);
                                        } else {
                                            setSelectedGuardian(g);
                                            setDrawerMode("detail");
                                        }
                                    }}
                                    onEdit={() => {
                                        if (typeof window !== "undefined" && window.innerWidth < 640) {
                                            router.visit(`/master-data/guardians/${g.id}/edit`);
                                        } else {
                                            setSelectedGuardian(g);
                                            setDrawerMode("edit");
                                        }
                                    }}
                                    onDelete={() => onRequestDelete("guardians", g.id, g.name)}
                                    selectLabel="Pilih Wali"
                                    deleteAriaLabel="Hapus Wali"
                                    avatarName={g.name}
                                    title={g.name}
                                    subtitle={
                                        <div className="flex items-center gap-2 text-[10.5px] text-text-muted">
                                            {g.phone ? (
                                                <a
                                                    href={`tel:${g.phone}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="inline-flex items-center gap-1 font-mono text-primary font-medium hover:underline"
                                                >
                                                    <FiPhone className="text-[10px]" />
                                                    <span>{g.phone}</span>
                                                </a>
                                            ) : (
                                                <span className="italic">No. Telp Belum Diisi</span>
                                            )}
                                        </div>
                                    }
                                    rightBadge={
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                                            {linked.length} Siswa
                                        </span>
                                    }
                                >
                                    <div className="space-y-1 pt-0.5">
                                        <div className="flex items-center gap-1 text-[10.5px] text-text-muted">
                                            <FiUsers className="text-[10px] text-primary" />
                                            <span>Siswa Binaan:</span>
                                        </div>
                                        {linked.length > 0 ? (
                                            <div className="flex flex-wrap items-center gap-1">
                                                {linked.map((s) => (
                                                    <span
                                                        key={s.id}
                                                        className="px-2 py-0.5 rounded-lg text-[10.5px] font-medium bg-muted text-text-primary border border-border/80"
                                                    >
                                                        {s.name} ({s.class?.name || "No Class"})
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-[10.5px] text-text-muted italic">
                                                Belum terhubung dengan siswa manapun.
                                            </span>
                                        )}
                                    </div>

                                    {g.address && (
                                        <div className="flex items-start gap-1 text-[10.5px] text-text-secondary pt-0.5 truncate">
                                            <FiMapPin className="text-[10px] shrink-0 mt-0.5 text-text-muted" />
                                            <span className="truncate">{g.address}</span>
                                        </div>
                                    )}
                                </MasterDataCard>
                            );
                        })}
                    </>
                )}

                {/* Mobile Native Pagination */}
                {guardians && guardians.last_page > 1 && (
                    <MobileNativePagination
                        currentPage={guardians.current_page}
                        totalPages={guardians.last_page}
                        totalItems={guardians.total}
                        perPage={guardians.per_page}
                        onPageChange={handlePagination}
                        itemLabel="wali murid"
                        className="shrink-0 mt-auto"
                    />
                )}
            </div>

            {/* Form Drawer (Standardized Mobile Bottom Sheet + Desktop Side Drawer) */}
            <GuardianDrawerForm
                open={createOpen || drawerMode !== null}
                mode={createOpen ? "create" : drawerMode}
                guardian={createOpen ? null : selectedGuardian}
                onClose={() => {
                    setDrawerMode(null);
                    setSelectedGuardian(null);
                    onCloseCreate?.();
                    onCloseDrawer?.();
                }}
                onRequestDelete={onRequestDelete}
            />
        </div>
    );
}
