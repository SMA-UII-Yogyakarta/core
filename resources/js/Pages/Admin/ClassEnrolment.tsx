import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import { Button, Table, PageHeader, Pagination, SearchBar, Checkbox, Modal, NativeSelect, ConfirmDialog, EmptyState, Card } from "@/Components";
import AppShell from "@/Layouts/AppShell";
import type { Column } from "@/Components/ui/Table";

interface SchoolClass {
    id: number;
    name: string;
    teacher: { id: number; name: string } | null;
}

interface Student {
    id: number;
    nis: string;
    nisn: string;
    name: string;
    user: { email?: string } | null;
}

interface UnassignedStudent {
    id: number;
    nis: string;
    nisn: string;
    name: string;
}

interface PageProps {
    classes: SchoolClass[];
    selectedClassId: number | null;
    selectedClass: SchoolClass | null;
    students: Student[];
    unassignedStudents: UnassignedStudent[];
}

export default function EnrolmentKelas({
    classes,
    selectedClassId,
    selectedClass,
    students,
    unassignedStudents,
}: PageProps) {
    const [classId, setClassId] = useState(selectedClassId?.toString() ?? "");
    const [showAddModal, setShowAddModal] = useState(false);
    const [removeConfirmId, setRemoveConfirmId] = useState<number | null>(null);

    // Confirm Dialog States
    const [bulkRemoveConfirm, setBulkRemoveConfirm] = useState(false);

    // Multi-selection states
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [selectedModalStudentIds, setSelectedModalStudentIds] = useState<number[]>([]);

    // Enrolled Students Pagination & Search
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const filteredStudents = useMemo(() => {
        if (!search.trim()) return students;
        const q = search.toLowerCase();
        return students.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.nis.toLowerCase().includes(q) ||
                s.nisn.toLowerCase().includes(q),
        );
    }, [students, search]);

    const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const paginatedStudents = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return filteredStudents.slice(start, start + pageSize);
    }, [filteredStudents, safePage, pageSize]);

    // Modal Unassigned Students Pagination & Search
    const [modalSearch, setModalSearch] = useState("");
    const [modalCurrentPage, setModalCurrentPage] = useState(1);
    const modalPageSize = 10;

    const filteredUnassigned = useMemo(() => {
        if (!modalSearch.trim()) return unassignedStudents;
        const q = modalSearch.toLowerCase();
        return unassignedStudents.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.nis.toLowerCase().includes(q) ||
                s.nisn.toLowerCase().includes(q),
        );
    }, [unassignedStudents, modalSearch]);

    const modalTotalPages = Math.ceil(filteredUnassigned.length / modalPageSize) || 1;
    const modalSafePage = Math.min(Math.max(1, modalCurrentPage), modalTotalPages);
    const paginatedUnassigned = useMemo(() => {
        const start = (modalSafePage - 1) * modalPageSize;
        return filteredUnassigned.slice(start, start + modalPageSize);
    }, [filteredUnassigned, modalSafePage, modalPageSize]);

    const handleRemove = (studentId: number) => {
        setRemoveConfirmId(studentId);
    };

    const confirmRemove = () => {
        if (removeConfirmId === null) return;
        router.delete(`/class-enrolment/remove/${removeConfirmId}`, {
            preserveState: true,
            onSuccess: () => {
                setRemoveConfirmId(null);
                setSelectedStudentIds((prev) => prev.filter((id) => id !== removeConfirmId));
            },
        });
    };

    const handleBulkRemove = () => {
        if (selectedStudentIds.length === 0) return;
        setBulkRemoveConfirm(true);
    };

    const confirmBulkRemove = () => {
        router.post(
            "/class-enrolment/bulk-remove",
            { student_ids: selectedStudentIds },
            {
                preserveState: true,
                onSuccess: () => {
                    setSelectedStudentIds([]);
                    setBulkRemoveConfirm(false);
                },
            },
        );
    };

    const handleAssign = (studentId: number) => {
        router.post(
            "/class-enrolment/assign",
            {
                student_id: studentId,
                class_id: classId,
            },
            {
                preserveState: true,
                onSuccess: () => {
                    setSelectedModalStudentIds((prev) => prev.filter((id) => id !== studentId));
                    if (filteredUnassigned.length <= 1) setShowAddModal(false);
                },
            },
        );
    };

    const handleBulkAssign = () => {
        if (selectedModalStudentIds.length === 0 || !classId) return;
        router.post(
            "/class-enrolment/bulk-assign",
            {
                class_id: classId,
                student_ids: selectedModalStudentIds,
            },
            {
                preserveState: true,
                onSuccess: () => {
                    setSelectedModalStudentIds([]);
                    setShowAddModal(false);
                },
            },
        );
    };

    // Table Selection Math
    const allSelected =
        paginatedStudents.length > 0 &&
        paginatedStudents.every((s) => selectedStudentIds.includes(s.id));
    const someSelected =
        paginatedStudents.some((s) => selectedStudentIds.includes(s.id)) && !allSelected;

    const modalAllSelected =
        paginatedUnassigned.length > 0 &&
        paginatedUnassigned.every((s) => selectedModalStudentIds.includes(s.id));
    const modalSomeSelected =
        paginatedUnassigned.some((s) => selectedModalStudentIds.includes(s.id)) &&
        !modalAllSelected;

    const columns: Column<Student>[] = [
        {
            key: "select",
            header: (
                <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={(e) => {
                        const pageIds = paginatedStudents.map((s) => s.id);
                        if (e.target.checked) {
                            setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...pageIds])));
                        } else {
                            const pageSet = new Set(pageIds);
                            setSelectedStudentIds((prev) => prev.filter((id) => !pageSet.has(id)));
                        }
                    }}
                />
            ),
            render: (s) => (
                <Checkbox
                    checked={selectedStudentIds.includes(s.id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedStudentIds((prev) => [...prev, s.id]);
                        } else {
                            setSelectedStudentIds((prev) => prev.filter((id) => id !== s.id));
                        }
                    }}
                />
            ),
            className: "w-10 text-center",
        },
        {
            key: "nisn",
            header: "NISN",
            className: "w-36 font-semibold text-text-primary font-inter",
            render: (s) => s.nisn || "-",
        },
        {
            key: "nis",
            header: "NIS",
            className: "w-32 text-text-muted font-inter",
            render: (s) => s.nis || "-",
        },
        {
            key: "name",
            header: "Nama Lengkap Siswa",
            className: "min-w-[220px] font-medium text-text-primary font-inter",
            render: (s) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-[12px] flex items-center justify-center shrink-0 font-inter">
                        {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-semibold text-text-primary truncate" title={s.name}>
                        {s.name}
                    </span>
                </div>
            ),
        },
        {
            key: "email",
            header: "Email Akun Siswa",
            className: "min-w-[180px] text-text-muted font-inter text-[13px]",
            render: (s) => s.user?.email ?? "-",
        },
        {
            key: "actions",
            header: <div className="text-center w-full">Aksi</div>,
            className: "w-20 text-center",
            render: (s) => (
                <button
                    onClick={() => handleRemove(s.id)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md text-danger hover:text-danger/90 hover:bg-danger-bg active:bg-danger-light border border-transparent hover:border-danger-light transition-colors cursor-pointer"
                    type="button"
                    title="Keluarkan dari kelas"
                    aria-label="Keluarkan siswa"
                >
                    <i className="fas fa-times text-[15px]" />
                </button>
            ),
        },
    ];

    const modalColumns: Column<UnassignedStudent>[] = [
        {
            key: "select",
            header: (
                <Checkbox
                    checked={modalAllSelected}
                    indeterminate={modalSomeSelected}
                    onChange={(e) => {
                        const pageIds = paginatedUnassigned.map((s) => s.id);
                        if (e.target.checked) {
                            setSelectedModalStudentIds((prev) =>
                                Array.from(new Set([...prev, ...pageIds])),
                            );
                        } else {
                            const pageSet = new Set(pageIds);
                            setSelectedModalStudentIds((prev) =>
                                prev.filter((id) => !pageSet.has(id)),
                            );
                        }
                    }}
                />
            ),
            render: (s) => (
                <Checkbox
                    checked={selectedModalStudentIds.includes(s.id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedModalStudentIds((prev) => [...prev, s.id]);
                        } else {
                            setSelectedModalStudentIds((prev) =>
                                prev.filter((id) => id !== s.id),
                            );
                        }
                    }}
                />
            ),
            className: "w-10 text-center",
        },
        {
            key: "nis",
            header: "NIS",
            className: "w-1 whitespace-nowrap",
            render: (s) => s.nis,
        },
        {
            key: "name",
            header: "Nama",
            className: "min-w-0 max-w-[200px] truncate",
            render: (s) => <span title={s.name}>{s.name}</span>,
        },
        {
            key: "actions",
            header: <div className="text-center w-full">Aksi</div>,
            className: "w-20 text-center whitespace-nowrap",
            render: (s) => (
                <Button size="sm" onClick={() => handleAssign(s.id)}>
                    Tambah
                </Button>
            ),
        },
    ];

    return (
        <AppShell title="Manajemen & Enrolment Kelas">
            {/* Page Header */}
            <PageHeader
                title="Manajemen & Enrolment Kelas"
                description="Petakan rombongan belajar dan tetapkan Wali Kelas untuk tahun ajaran aktif."
            />

            {/* Top Control Panel (Konfigurasi Kelas Horizontal Simetris) */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-card mb-6 font-inter">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    {/* Col 1: Select Class Dropdown (5 Cols) */}
                    <div className="md:col-span-5 flex flex-col justify-between">
                        <label className="text-[13px] font-bold text-text-primary flex items-center gap-2 mb-2">
                            <i className="fas fa-chalkboard-teacher text-primary text-[14px]" />
                            <span>Pilih Kelas / Rombongan Belajar</span>
                        </label>
                        <NativeSelect
                            value={classId}
                            onChange={(e) => {
                                const nextId = e.target.value;
                                setClassId(nextId);
                                setSelectedStudentIds([]);
                                router.get(
                                    "/class-enrolment",
                                    { class_id: nextId || undefined },
                                    { preserveState: true },
                                );
                            }}
                        >
                            <option value="">-- Pilih Kelas --</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id.toString()}>
                                    {c.name}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>

                    {/* Col 2: Wali Kelas Badge Info (4 Cols) */}
                    <div className="md:col-span-4 flex flex-col justify-between">
                        <span className="text-[13px] font-bold text-text-primary flex items-center gap-2 mb-2">
                            <i className="fas fa-user-tie text-primary text-[14px]" />
                            <span>Wali Kelas Terdaftar</span>
                        </span>
                        <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg border border-border bg-muted/20 h-[42px]">
                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] shrink-0">
                                <i className="fas fa-user-tie" />
                            </div>
                            <div className="min-w-0 flex-1 flex items-center justify-between">
                                <p className="font-bold text-text-primary text-[13px] truncate">
                                    {selectedClass?.teacher?.name ?? "Belum ada wali kelas"}
                                </p>
                                {selectedClass?.teacher && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success-bg text-success border border-success/20 shrink-0 ml-2">
                                        Aktif
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Col 3: Total Siswa Terdaftar (3 Cols) */}
                    <div className="md:col-span-3 flex flex-col justify-between md:border-l md:border-border md:pl-6 pt-3 md:pt-0 border-t md:border-t-0">
                        <span className="text-[13px] font-bold text-text-primary flex items-center gap-2 mb-2">
                            <i className="fas fa-users text-primary text-[14px]" />
                            <span>Total Siswa Terdaftar</span>
                        </span>
                        <div className="flex items-center justify-between px-3.5 rounded-lg border border-border bg-muted/20 h-[42px]">
                            <span className="text-[13px] font-semibold text-text-secondary font-inter">Kapasitas Active</span>
                            <span className="text-[14px] font-extrabold text-primary font-inter">
                                {selectedClass ? `${students.length} Siswa` : "-"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Roster Layout (Full Width Below Control Panel) */}
            <div className="w-full flex flex-col gap-4">
                {selectedClass ? (
                    <>
                        {/* Card Header & Toolbar */}
                        <Card className="p-5">
                            <div className="flex flex-col gap-3.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-[16px] font-bold text-primary font-inter">
                                            Daftar Siswa Terdaftar — {selectedClass.name}
                                        </h2>
                                        <p className="text-[12px] text-text-muted mt-0.5 font-inter">
                                            Rombongan belajar terdaftar untuk tahun ajaran aktif.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* Bulk Remove Button */}
                                        {selectedStudentIds.length > 0 && (
                                            <Button
                                                variant="danger"
                                                size="md"
                                                onClick={handleBulkRemove}
                                                icon={<i className="fas fa-user-minus text-[12px]" />}
                                                className="shrink-0"
                                            >
                                                Keluarkan ({selectedStudentIds.length})
                                            </Button>
                                        )}

                                        <Button
                                            variant="primary"
                                            size="md"
                                            onClick={() => {
                                                setModalSearch("");
                                                setModalCurrentPage(1);
                                                setSelectedModalStudentIds([]);
                                                setShowAddModal(true);
                                            }}
                                            disabled={unassignedStudents.length === 0}
                                            icon={<i className="fas fa-user-plus text-[12px]" />}
                                            className="shrink-0"
                                        >
                                            Tambah Siswa
                                        </Button>
                                    </div>
                                </div>
                                <div className="w-full pt-1 border-t border-border/60">
                                    <SearchBar
                                        value={search}
                                        onChange={(val) => {
                                            setSearch(val);
                                            setCurrentPage(1);
                                        }}
                                        onSearch={() => setCurrentPage(1)}
                                        placeholder="Cari NISN, NIS, atau Nama siswa di kelas ini..."
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Standalone Table */}
                        <div className="flex flex-col gap-3">
                            <Table
                                columns={columns}
                                data={paginatedStudents}
                                keyExtractor={(s) => s.id}
                                emptyMessage={
                                    search
                                        ? "Tidak ditemukan siswa yang cocok dengan pencarian."
                                        : "Belum ada siswa di kelas ini."
                                }
                            />
                            {filteredStudents.length > pageSize && (
                                <div className="pt-2 border-t border-border">
                                    <Pagination
                                        currentPage={safePage}
                                        totalPages={totalPages}
                                        totalItems={filteredStudents.length}
                                        perPage={pageSize}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="bg-surface border border-border rounded-xl p-12 text-center shadow-card flex flex-col items-center justify-center min-h-[360px]">
                        <EmptyState
                            variant="no-data"
                            title="Belum Ada Kelas yang Dipilih"
                            description="Silakan pilih kelas pada panel kontrol di atas untuk mengelola rombongan belajar dan daftar siswa terdaftar."
                        />
                    </div>
                )}
            </div>

            {/* Add Student Modal */}
            <Modal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={`Tambah Siswa ke ${selectedClass?.name}`}
                width="lg"
            >
                <div className="flex flex-col">
                    <p className="text-[12px] text-text-muted mb-4">
                        {unassignedStudents.length} siswa belum memiliki kelas
                    </p>

                    {unassignedStudents.length > 0 && (
                        <div className="pb-4 flex items-center justify-between gap-3">
                            <div className="flex-1">
                                <SearchBar
                                    value={modalSearch}
                                    onChange={(val) => {
                                        setModalSearch(val);
                                        setModalCurrentPage(1);
                                    }}
                                    onSearch={() => setModalCurrentPage(1)}
                                    placeholder="Cari NIS / Nama siswa..."
                                />
                            </div>
                            {selectedModalStudentIds.length > 0 && (
                                <Button
                                    variant="primary"
                                    size="md"
                                    onClick={handleBulkAssign}
                                    icon={<i className="fas fa-check-double text-[12px]" />}
                                >
                                    Tambahkan ({selectedModalStudentIds.length})
                                </Button>
                            )}
                        </div>
                    )}

                    <div className="overflow-x-auto min-h-[300px]">
                        <Table
                            columns={modalColumns}
                            data={paginatedUnassigned}
                            keyExtractor={(s) => s.id}
                            emptyMessage={
                                modalSearch
                                    ? "Tidak ada siswa yang cocok dengan pencarian."
                                    : "Tidak ada siswa yang belum terdaftar di kelas."
                            }
                        />
                    </div>

                    {filteredUnassigned.length > modalPageSize && (
                        <div className="pt-4 mt-2 border-t border-border">
                            <Pagination
                                currentPage={modalSafePage}
                                totalPages={modalTotalPages}
                                totalItems={filteredUnassigned.length}
                                perPage={modalPageSize}
                                onPageChange={setModalCurrentPage}
                                compact
                            />
                        </div>
                    )}
                </div>
            </Modal>

            {/* Remove Single Confirmation Modal */}
            <ConfirmDialog
                open={removeConfirmId !== null}
                onClose={() => setRemoveConfirmId(null)}
                onConfirm={confirmRemove}
                title="Hapus Siswa dari Kelas?"
                message="Siswa akan dipindahkan ke daftar siswa tanpa kelas. Tindakan ini dapat dibatalkan nanti."
                confirmLabel="Hapus"
                variant="danger"
            />

            <ConfirmDialog
                open={bulkRemoveConfirm}
                onClose={() => setBulkRemoveConfirm(false)}
                onConfirm={confirmBulkRemove}
                title="Keluarkan Siswa"
                message={`Keluarkan ${selectedStudentIds.length} siswa terpilih dari kelas ini?`}
                confirmLabel="Keluarkan"
                variant="danger"
            />
        </AppShell>
    );
}
