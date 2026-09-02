import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import { Button, Table, PageHeader, Pagination, SearchBar, Checkbox, Modal, NativeSelect, ConfirmDialog, EmptyState, Card } from "@/Components";
import { FiUserPlus, FiCheckSquare, FiX, FiUser, FiUserMinus, FiUsers, FiMonitor } from "react-icons/fi";
import AppShell from "@/Layouts/AppShell";
import type { Column } from "@/Components/ui/Table";

interface SchoolClass {
    id: number;
    name: string;
    teacher: { id: number; name: string; avatar?: string; user?: { avatar?: string } } | null;
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
            render: (s) => (
                <span className="truncate max-w-[220px] block" title={s.user?.email ?? "-"}>
                    {s.user?.email ?? "-"}
                </span>
            ),
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
                    <FiX className="text-[16px]" />
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
            render: (s) => <span className="text-[13px] text-text-muted">{s.nis}</span>,
        },
        {
            key: "name",
            header: "Nama",
            className: "min-w-0 max-w-[200px]",
            render: (s) => (
                <span className="text-[13px] font-medium text-text-primary truncate block" title={s.name}>
                    {s.name}
                </span>
            ),
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
            {/* Page Header with Actions & Search on Right Side */}
            <PageHeader
                title="Manajemen & Enrolment Kelas"
                description="Petakan rombongan belajar dan tetapkan Wali Kelas untuk tahun ajaran aktif."
                className="shrink-0 mb-4"
            >
                {selectedClass && (
                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        <div className="w-full sm:w-52 lg:w-60">
                            <SearchBar
                                value={search}
                                onChange={(val) => {
                                    setSearch(val);
                                    setCurrentPage(1);
                                }}
                                onSearch={() => setCurrentPage(1)}
                                placeholder="Cari NISN, NIS, atau Nama..."
                            />
                        </div>

                        {selectedStudentIds.length > 0 && (
                            <Button
                                variant="danger"
                                size="md"
                                onClick={handleBulkRemove}
                                icon={<FiUserMinus className="text-[12px]" />}
                                className="shrink-0 whitespace-nowrap h-10"
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
                            icon={<FiUserPlus className="text-[12px]" />}
                            className="shrink-0 whitespace-nowrap h-10 font-bold"
                        >
                            Tambah Siswa
                        </Button>
                    </div>
                )}
            </PageHeader>

            {/* Top Control Panel (Konfigurasi Kelas Horizontal Dinamis Tanpa Wrapping) */}
            <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 shadow-card mb-4 font-inter shrink-0">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
                    {/* Section 1: Select Class Dropdown (Dinamis: ruang secukupnya tanpa truncate & tanpa wrapping) */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <label className="text-[13px] font-bold text-text-primary flex items-center gap-2 mb-2 whitespace-nowrap">
                            <FiMonitor className="text-primary text-[14px] shrink-0" />
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

                    {/* Section 2: Wali Kelas Badge Info (Dinamis: ruang pas untuk avatar, nama & status) */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <span className="text-[13px] font-bold text-text-primary flex items-center gap-2 mb-2 whitespace-nowrap">
                            <FiUser className="text-primary text-[14px] shrink-0" />
                            <span>Wali Kelas Terdaftar</span>
                        </span>
                        <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl border border-border bg-muted/20 h-10">
                            {(selectedClass?.teacher?.user?.avatar || selectedClass?.teacher?.avatar) ? (
                                <img
                                    src={selectedClass.teacher.user?.avatar || selectedClass.teacher.avatar}
                                    alt={selectedClass.teacher.name}
                                    className="w-6 h-6 rounded-full object-cover border border-border shrink-0"
                                />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-[10px] shrink-0 uppercase tracking-tighter">
                                    {selectedClass?.teacher?.name
                                        ? selectedClass.teacher.name
                                            .replace(/^(Drs\.|Dr\.|H\.|Hj\.|Ir\.)\s+/i, "")
                                            .trim()
                                            .split(/\s+/)
                                            .slice(0, 2)
                                            .map((p) => p[0])
                                            .join("")
                                            .toUpperCase()
                                        : "?"}
                                </div>
                            )}
                            <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                                <p className="font-bold text-text-primary text-[13px] truncate" title={selectedClass?.teacher?.name ?? "Belum ada wali kelas"}>
                                    {selectedClass?.teacher?.name ?? "Belum ada wali kelas"}
                                </p>
                                {selectedClass?.teacher && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success-bg text-success border border-success/20 shrink-0">
                                        Aktif
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Total Siswa Terdaftar (Secukupnya & Bersebelahan Secara Ergonomis) */}
                    <div className="w-full lg:w-auto lg:min-w-[240px] flex flex-col justify-between lg:border-l lg:border-border lg:pl-6 pt-3 lg:pt-0 border-t lg:border-t-0">
                        <span className="text-[13px] font-bold text-text-primary flex items-center gap-2 mb-2 whitespace-nowrap">
                            <FiUsers className="text-primary text-[14px] shrink-0" />
                            <span>Total Siswa Terdaftar</span>
                        </span>
                        <div className="flex items-center justify-between gap-4 px-3.5 rounded-xl border border-border bg-muted/20 h-10">
                            <span className="text-[13px] font-semibold text-text-secondary font-inter whitespace-nowrap">Kapasitas Active</span>
                            <span className="text-[14px] font-extrabold text-primary font-inter whitespace-nowrap">
                                {selectedClass ? `${students.length} Siswa` : "-"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Roster Layout (Full Height Responsive Area) */}
            <div className="w-full flex-1 min-h-0 flex flex-col gap-3">
                {selectedClass ? (
                    <div className="flex-1 min-h-0 flex flex-col justify-between gap-3">
                        <Table
                            columns={columns}
                            data={paginatedStudents}
                            keyExtractor={(s) => s.id}
                            containerClassName="flex-1 min-h-0 overflow-auto bg-surface"
                            emptyMessage={
                                search
                                    ? "Tidak ditemukan siswa yang cocok dengan pencarian."
                                    : "Belum ada siswa di kelas ini."
                            }
                        />
                        {filteredStudents.length > pageSize && (
                            <div className="pt-2 shrink-0 mt-auto font-inter">
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
                ) : (
                    <Card className="flex-1 min-h-0 flex flex-col items-center justify-center bg-surface border border-border rounded-xl p-8 sm:p-12 text-center shadow-card">
                        <EmptyState
                            variant="no-data"
                            title="Belum Ada Kelas yang Dipilih"
                            description="Silakan pilih kelas pada panel kontrol di atas untuk mengelola rombongan belajar dan daftar siswa terdaftar."
                        />
                    </Card>
                )}
            </div>

            {/* Add Student Modal */}
            <Modal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={`Tambah Siswa ke ${selectedClass?.name}`}
                headerRight={
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold bg-primary-light text-primary border border-primary/20 shrink-0 select-none">
                        <FiUsers className="w-3.5 h-3.5" />
                        <span>{unassignedStudents.length} Belum Punya Kelas</span>
                    </span>
                }
                width="lg"
            >
                <div className="flex flex-col">
                    {unassignedStudents.length > 0 && (
                        <div className="mb-3.5 flex items-center justify-between gap-3">
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
                                    icon={<FiCheckSquare className="text-[12px]" />}
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
                        <div className="pt-2 mt-2">
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

