import { useState } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Button,
    Table,
    Pagination,
    FilterBar,
    Modal,
    ActionButton,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import { FaPlus } from "react-icons/fa";

interface Teacher {
    id: number;
    name: string;
}

interface SchoolClass {
    id: number;
    name: string;
    level: string;
    teacher: Teacher | null;
    students_count: number;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface PageProps {
    schoolClasses: PaginatedData<SchoolClass>;
    teachers: Teacher[];
    filters: Record<string, string | undefined>;
}

const levelLabels: Record<string, string> = {
    X: "Kelas X",
    XI: "Kelas XI",
    XII: "Kelas XII",
};

export default function MasterKelas({
    schoolClasses,
    teachers,
    filters,
}: PageProps) {
    const [search, setSearch] = useState(filters.search ?? "");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [name, setName] = useState("");
    const [level, setLevel] = useState("X");
    const [teacherId, setTeacherId] = useState("");
    const [loading, setLoading] = useState(false);

    // Delete confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            "/admin/master-kelas",
            { search: search || undefined },
            { preserveState: true },
        );
    };

    const openCreateModal = () => {
        setEditId(null);
        setName("");
        setLevel("X");
        setTeacherId("");
        setShowModal(true);
    };

    const openEditModal = (cls: SchoolClass) => {
        setEditId(cls.id);
        setName(cls.name);
        setLevel(cls.level);
        setTeacherId(cls.teacher?.id.toString() ?? "");
        setShowModal(true);
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);

        const payload = {
            name,
            level,
            teacher_id: teacherId || undefined,
        };

        if (editId) {
            router.put(`/admin/master-kelas/${editId}`, payload, {
                preserveState: true,
                onSuccess: () => {
                    setShowModal(false);
                    setLoading(false);
                },
                onError: () => setLoading(false),
            });
        } else {
            router.post("/admin/master-kelas", payload, {
                preserveState: true,
                onSuccess: () => {
                    setShowModal(false);
                    setLoading(false);
                },
                onError: () => setLoading(false),
            });
        }
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        if (deleteId === null) return;
        router.delete(`/admin/master-kelas/${deleteId}`, {
            preserveState: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                setDeleteId(null);
            },
        });
    };

    const columns: Column<SchoolClass>[] = [
        {
            key: "name",
            header: "Nama Kelas",
            render: (cls) => (
                <span className="font-semibold text-text-primary">
                    {cls.name}
                </span>
            ),
        },
        {
            key: "level",
            header: "Tingkat",
            render: (cls) => (
                <span className="inline-block px-2.5 py-1 bg-primary-light text-primary rounded-md text-[12px] font-semibold">
                    {levelLabels[cls.level] ?? cls.level}
                </span>
            ),
        },
        {
            key: "teacher",
            header: "Wali Kelas",
            render: (cls) =>
                cls.teacher ? (
                    <span className="text-text-primary text-[14px]">
                        {cls.teacher.name}
                    </span>
                ) : (
                    <span className="text-text-inactive text-[14px] italic">
                        Belum ada wali kelas
                    </span>
                ),
        },
        {
            key: "students_count",
            header: "Jumlah Siswa",
            render: (cls) => (
                <span className="text-text-primary font-semibold text-[14px]">
                    {cls.students_count} siswa
                </span>
            ),
        },
        {
            key: "actions",
            header: "Aksi",
            render: (cls) => (
                <div className="flex gap-2">
                    <ActionButton
                        variant="edit"
                        icon="fa-edit"
                        label="Edit"
                        onClick={() => openEditModal(cls)}
                    />
                    <ActionButton
                        variant="delete"
                        icon="fa-trash"
                        label="Hapus"
                        onClick={() => confirmDelete(cls.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <AdminLayout title="Master Kelas" activeMenu="Data Master">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-[18px] font-bold text-text-primary font-inter">
                    Manajemen Master Kelas
                </h1>
                <Button onClick={openCreateModal} size="md">
                    <FaPlus className="mr-1.5 text-[13px]" />
                    Tambah Kelas Baru
                </Button>
            </div>

            <FilterBar className="mb-6">
                <FilterBar.Search
                    value={search}
                    onChange={setSearch}
                    onSubmit={handleSearch}
                    placeholder="Cari kelas..."
                />
            </FilterBar>

            <section className="bg-surface border border-border rounded-lg p-4 lg:p-6">
                <Table
                    columns={columns}
                    data={schoolClasses.data}
                    keyExtractor={(cls) => cls.id}
                    emptyMessage="Belum ada data kelas."
                />
                <Pagination
                    currentPage={schoolClasses.current_page}
                    totalPages={schoolClasses.last_page}
                    totalItems={schoolClasses.total}
                    perPage={schoolClasses.per_page}
                    onPageChange={(page) =>
                        router.get(
                            "/admin/master-kelas",
                            { page, search: search || undefined },
                            { preserveState: true },
                        )
                    }
                />
            </section>

            {/* Create/Edit Modal */}
            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                title={editId ? "Edit Kelas" : "Tambah Kelas Baru"}
                onSubmit={handleSubmit}
                submitLabel={editId ? "Simpan Perubahan" : "Tambah Kelas"}
                loading={loading}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[13px] text-text-muted font-inter mb-1">
                            Nama Kelas <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-border rounded-lg px-3 py-2 text-[14px] font-inter text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
                            placeholder="Contoh: X-A, XI-IPA-1, XII-IPS-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] text-text-muted font-inter mb-1">
                            Tingkat <span className="text-danger">*</span>
                        </label>
                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="w-full border border-border rounded-lg px-3 py-2 text-[14px] font-inter text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
                            required
                        >
                            <option value="X">Kelas X</option>
                            <option value="XI">Kelas XI</option>
                            <option value="XII">Kelas XII</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[13px] text-text-muted font-inter mb-1">
                            Wali Kelas
                        </label>
                        <select
                            value={teacherId}
                            onChange={(e) => setTeacherId(e.target.value)}
                            className="w-full border border-border rounded-lg px-3 py-2 text-[14px] font-inter text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        >
                            <option value="">-- Pilih Guru --</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Konfirmasi Hapus"
                onSubmit={handleDelete}
                submitLabel="Ya, Hapus"
                loading={loading}
            >
                <p className="text-[14px] text-text-secondary font-inter">
                    Apakah Anda yakin ingin menghapus kelas ini? Tindakan ini
                    tidak dapat dibatalkan dan semua data terkait akan dihapus.
                </p>
            </Modal>
        </AdminLayout>
    );
}
