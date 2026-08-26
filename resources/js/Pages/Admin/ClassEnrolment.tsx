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
    const [saveNotice, setSaveNotice] = useState<string | null>(null);

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
            className: "w-10",
        },
        {
            key: "nisn",
            header: "NISN",
            className: "w-1 whitespace-nowrap",
            render: (s) => <span className="font-semibold text-text-primary">{s.nisn}</span>,
        },
        {
            key: "name",
            header: "Nama Lengkap",
            className: "w-full min-w-0",
            render: (s) => <span className="text-text-primary block truncate font-medium" title={s.name}>{s.name}</span>,
        },
        {
            key: "actions",
            header: <div className="text-center w-full">Aksi</div>,
            className: "w-16 text-center",
            render: (s) => (
                <button
                    onClick={() => handleRemove(s.id)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md text-danger hover:text-danger/90 hover:bg-danger-bg active:bg-danger-light border border-transparent hover:border-danger-light transition-colors cursor-pointer"
                    type="button"
                    aria-label="Hapus siswa"
                >
                    <i className="fas fa-times text-[16px]" />
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

            {saveNotice && (
                <div className="mb-4 rounded-lg bg-success-bg border border-success/30 text-success px-4 py-2.5 text-[13px] font-medium">
                    <i className="fas fa-check-circle mr-2" />
                    {saveNotice}
                </div>
            )}

            {/* Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                {/* Column 1: Konfigurasi Kelas (Left) */}
                <div className="lg:col-span-2">
                    <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-6 shadow-card min-h-[440px]">
                        <h2 className="text-[16px] font-bold text-primary font-inter border-b border-border pb-3">
                            Konfigurasi Kelas
                        </h2>

                        {/* Pilih Kelas Dropdown */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-text-secondary font-inter">
                                Pilih Kelas
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
                                {classes.map(c => (
                                    <option key={c.id} value={c.id.toString()}>{c.name}</option>
                                ))}
                            </NativeSelect>
                        </div>

                        {/* Wali Kelas Display */}
                        <div className="flex flex-col gap-1.5 mt-2">
                            <label className="text-[13px] font-semibold text-text-secondary font-inter">
                                Wali Kelas Terdaftar
                            </label>
                            <div className="flex items-center gap-3 p-3.5 rounded-lg border border-border bg-background">
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[14px] shrink-0">
                                    <i className="fas fa-user-tie" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-text-primary text-[14px] truncate">
                                        {selectedClass?.teacher?.name ?? "Belum ada wali kelas"}
                                    </p>
                                    <p className="text-[12px] text-text-muted">
                                        {selectedClass?.teacher ? "Aktif Semester Ini" : "Pilih kelas untuk melihat"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <p className="text-[11px] text-text-muted font-inter mt-auto leading-relaxed border-t border-border/60 pt-4">
                            <i className="fas fa-info-circle mr-1 text-text-inactive" />
                            Pastikan data guru sudah terdaftar di Data Master sebelum ditetapkan.
                        </p>
                    </div>
                </div>

                {/* Column 2: Roster Siswa (Right) */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    {selectedClass ? (
                        <>
                            {/* Card Header & Toolbar */}
                            <Card className="p-5">
                                <div className="flex flex-col gap-3.5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-[16px] font-bold text-primary font-inter">
                                                Daftar Siswa — {selectedClass.name}
                                            </h2>
                                            <span className="text-[12px] text-text-muted">
                                                Menampilkan {paginatedStudents.length} dari {filteredStudents.length} siswa
                                            </span>
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
                                            placeholder="Cari NIS / Nama siswa di kelas ini..."
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
                                    emptyMessage={search ? "Tidak ditemukan siswa yang cocok dengan pencarian." : "Belum ada siswa di kelas ini."}
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
                            
                            {/* Card Footer */}
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                                <span className="text-[13px] font-semibold text-text-secondary font-inter">
                                    Total: {students.length} Siswa
                                </span>
                                <button
                                    onClick={() => {
                                        setSaveNotice(
                                            "Perubahan enrolment sudah tersimpan otomatis saat tambah/hapus siswa.",
                                        );
                                        window.setTimeout(() => setSaveNotice(null), 3500);
                                    }}
                                    className="flex items-center gap-1.5 bg-success hover:bg-success/90 text-white rounded-lg px-4 py-2 text-[13px] font-bold transition-colors cursor-pointer"
                                    type="button"
                                    title="Perubahan siswa sudah tersimpan otomatis saat tambah/hapus"
                                >
                                    <i className="fas fa-check text-[12px]" />
                                    <span>Simpan Pembaruan</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="bg-surface border border-border rounded-xl p-12 text-center shadow-card flex flex-col items-center justify-center min-h-[440px]">
                            <EmptyState
                                variant="no-data"
                                title="Belum Ada Kelas yang Dipilih"
                                description="Silakan pilih kelas di kolom sebelah kiri untuk menampilkan daftar siswa terdaftar."
                            />
                        </div>
                    )}
                </div>
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
                            emptyMessage={modalSearch
                                ? "Tidak ada siswa yang cocok dengan pencarian."
                                : "Tidak ada siswa yang belum terdaftar di kelas."}
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
