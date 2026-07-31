import { useState } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Button,
    Card,
    PageHeader,
    SearchBar,
    SelectInput,
    Table,
    Pagination,
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
    capacity: number;
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
    const [capacity, setCapacity] = useState("36");
    const [loading, setLoading] = useState(false);

    // Delete confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleSearch = (value: string) => {
        router.get(
            "/admin/classes",
            { search: value || undefined },
            { preserveState: true },
        );
    };

    const openCreateModal = () => {
        setEditId(null);
        setName("");
        setLevel("X");
        setTeacherId("");
        setCapacity("36");
        setShowModal(true);
    };

    const openEditModal = (cls: SchoolClass) => {
        setEditId(cls.id);
        setName(cls.name);
        setLevel(cls.level);
        setTeacherId(cls.teacher?.id.toString() ?? "");
        setCapacity(cls.capacity.toString());
        setShowModal(true);
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);

        const payload = {
            name,
            level,
            teacher_id: teacherId || undefined,
            capacity: capacity ? Number(capacity) : undefined,
        };

        if (editId) {
            router.patch(`/admin/master-data/classes/${editId}`, payload, {
                preserveState: true,
                onSuccess: () => {
                    setShowModal(false);
                    setLoading(false);
                },
                onError: () => setLoading(false),
            });
        } else {
            router.post("/admin/master-data/classes", payload, {
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
        router.delete(`/admin/master-data/classes/${deleteId}`, {
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
            key: "capacity",
            header: "Kapasitas",
            render: (cls) => (
                <span className="text-text-secondary text-[14px]">
                    {cls.students_count}/{cls.capacity} siswa
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

    const teacherOptions = teachers.map((t) => ({
        value: t.id,
        label: t.name,
    }));

    return (
        <AdminLayout title="Master Kelas" activeMenu="Data Master">
            <PageHeader title="Manajemen Master Kelas">
                <Button onClick={openCreateModal} size="md">
                    <FaPlus className="mr-1.5 text-[13px]" />
                    Tambah Kelas Baru
                </Button>
            </PageHeader>

            <div className="mb-6">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    onSearch={handleSearch}
                    placeholder="Cari kelas..."
                />
            </div>

            <Card className="p-4 lg:p-6">
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
                            "/admin/classes",
                            { page, search: search || undefined },
                            { preserveState: true },
                        )
                    }
                />
            </Card>

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
                        <SelectInput
                            label="Wali Kelas"
                            options={teacherOptions}
                            value={teacherId}
                            onChange={(v) => setTeacherId(String(v ?? ""))}
                            placeholder="-- Pilih Guru --"
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] text-text-muted font-inter mb-1">
                            Kapasitas Siswa
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={capacity}
                            onChange={(e) =>
                                setCapacity(e.target.value.replace(/[^0-9]/g, ""))
                            }
                            className="w-full border border-border rounded-lg px-3 py-2 text-[14px] font-inter text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
                            placeholder="Contoh: 36"
                        />
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
