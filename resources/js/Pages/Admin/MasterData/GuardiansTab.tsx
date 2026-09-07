import { router } from "@inertiajs/react";
import { useState } from "react";
import {
    Table,
    TableFooter,
    MobileNativePagination,
    Avatar,
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
    FiPhone,
    FiMapPin,
    FiUsers,
    FiShield,
} from "react-icons/fi";
import type { Guardian, PaginatedData } from "./types";
import GuardianDrawerForm from "./GuardianDrawerForm";

interface GuardiansTabProps {
    guardians?: PaginatedData<Guardian>;
    filters?: Record<string, string | undefined>;
    onSearchChange?: (val: string) => void;
    onFilterChange?: (key: string, val: string) => void;
    createOpen?: boolean;
    onCloseCreate?: () => void;
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
    selectedIds: propsSelectedIds,
    onSelectedIdsChange,
    onRequestDelete,
}: GuardiansTabProps) {
    const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "detail" | null>(null);
    const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);
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
                    <Checkbox
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                    />
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
            header: <div className="text-center w-full">Aksi</div>,
            className: "text-center w-36 whitespace-nowrap",
            render: (g) => (
                <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedGuardian(g);
                            setDrawerMode("detail");
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-text-muted hover:text-primary hover:bg-primary-light border border-border transition-colors cursor-pointer text-[12px] font-semibold"
                        title="Lihat / Edit Detail Wali"
                        aria-label="Lihat / Edit Detail Wali"
                    >
                        <FiEye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onRequestDelete("guardians", g.id, g.name)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-danger hover:bg-danger-bg border border-danger/20 transition-colors cursor-pointer text-[12px] font-semibold"
                        title="Hapus Wali"
                        aria-label="Hapus Wali"
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
                tab: "guardians",
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
                    data={guardianList}
                    keyExtractor={(g) => g.id}
                    containerClassName="flex-1 min-h-0 overflow-auto bg-surface"
                    dense
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
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* MOBILE-NATIVE CARD STACK VIEW (< sm) */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="sm:hidden flex flex-col gap-3">
                {guardianList.length === 0 ? (
                    <Card className="p-8 text-center text-text-inactive font-inter flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mb-3">
                            <FiShield className="w-7 h-7" />
                        </div>
                        <h3 className="text-[14px] font-bold text-text-primary mb-1">
                            Belum Ada Data Wali Murid
                        </h3>
                        <p className="text-[12px] text-text-secondary max-w-xs mb-4">
                            Mulai tambahkan wali murid atau gunakan fitur import CSV untuk menghubungkan akun orang tua.
                        </p>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                                if (typeof window !== "undefined" && window.innerWidth < 640) {
                                    router.visit("/master-data/create?tab=guardians");
                                } else {
                                    setSelectedGuardian(null);
                                    setDrawerMode("create");
                                }
                            }}
                            icon={<FiPlus className="text-[14px]" />}
                        >
                            Tambah Wali Baru
                        </Button>
                    </Card>
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
                                <div
                                    key={g.id}
                                    onClick={() => {
                                        if (typeof window !== "undefined" && window.innerWidth < 640) {
                                            router.visit(`/master-data/guardians/${g.id}/detail`);
                                        } else {
                                            setSelectedGuardian(g);
                                            setDrawerMode("detail");
                                        }
                                    }}
                                    className={`p-3 bg-surface border rounded-2xl shadow-xs space-y-2 transition-all cursor-pointer active:scale-[0.99] select-none ${
                                        isSelected
                                            ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                                            : "border-border hover:border-text-muted/30"
                                    }`}
                                >
                                    {/* Top Row: Checkbox, Avatar, Name & Contact */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2 min-w-0 flex-1">
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectOne(g.id, !isSelected);
                                                }}
                                                className="pt-0.5 cursor-pointer p-1 -m-1 rounded hover:bg-muted/50 transition-colors flex items-center justify-center shrink-0"
                                                title="Pilih Wali"
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    readOnly
                                                    className="pointer-events-none"
                                                />
                                            </div>
                                            <Avatar name={g.name} size="sm" className="shrink-0 mt-0.5" />
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-[13px] font-bold text-text-primary truncate leading-snug">
                                                    {g.name}
                                                </h4>
                                                <div className="flex items-center gap-2 text-[10.5px] text-text-muted mt-0.5">
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
                                            </div>
                                        </div>

                                        <div className="shrink-0 flex items-center gap-1 pt-0.5">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                                                {linked.length} Siswa
                                            </span>
                                        </div>
                                    </div>

                                    {/* Middle Row: Linked Students */}
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

                                    {/* Address line if any */}
                                    {g.address && (
                                        <div className="flex items-start gap-1 text-[10.5px] text-text-secondary pt-0.5 truncate">
                                            <FiMapPin className="text-[10px] shrink-0 mt-0.5 text-text-muted" />
                                            <span className="truncate">{g.address}</span>
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
                                                        router.visit(`/master-data/guardians/${g.id}/edit`);
                                                    } else {
                                                        setSelectedGuardian(g);
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
                                                onClick={() => onRequestDelete("guardians", g.id, g.name)}
                                                className="h-8 w-8 rounded-xl text-danger bg-danger/10 hover:bg-danger/20 border border-danger/20 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
                                                aria-label="Hapus Wali"
                                                title="Hapus Wali"
                                            >
                                                <FiTrash2 className="text-[13px]" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
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
                    onCloseCreate?.();
                }}
                onRequestDelete={onRequestDelete}
            />
        </div>
    );
}
