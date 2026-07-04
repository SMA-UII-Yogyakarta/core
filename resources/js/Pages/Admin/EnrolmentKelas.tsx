import { useState } from "react";
import { router } from "@inertiajs/react";
import { Button, Table, FilterBar } from "@/Components";
import AdminLayout from "@/Layouts/AdminLayout";
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

    const handleFilter = () => {
        router.get(
            "/admin/enrolment-kelas",
            { class_id: classId || undefined },
            { preserveState: true },
        );
    };

    const handleRemove = (studentId: number) => {
        setRemoveConfirmId(studentId);
    };

    const confirmRemove = () => {
        if (removeConfirmId === null) return;
        router.delete(`/admin/enrolment-kelas/remove/${removeConfirmId}`, {
            preserveState: true,
            onSuccess: () => setRemoveConfirmId(null),
        });
    };

    const handleAssign = (studentId: number) => {
        router.post(
            "/admin/enrolment-kelas/assign",
            {
                student_id: studentId,
                class_id: classId,
            },
            { preserveState: true, onSuccess: () => setShowAddModal(false) },
        );
    };

    const columns: Column<Student>[] = [
        { key: "nis", header: "NIS" },
        { key: "nisn", header: "NISN" },
        { key: "name", header: "Nama Siswa" },
        {
            key: "actions",
            header: "Aksi",
            render: (s) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(s.id)}
                >
                    <span className="text-danger">Hapus</span>
                </Button>
            ),
        },
    ];

    return (
        <AdminLayout title="Enrolment Siswa Kelas" activeMenu="Enrolment Kelas">
            <h1 className="text-[18px] font-bold text-text-primary font-inter mb-6">
                Enrolment Siswa Kelas
            </h1>

            <FilterBar className="mb-6">
                <FilterBar.Select
                    label="Pilih Kelas"
                    options={[
                        { value: "", label: "-- Pilih Kelas --" },
                        ...classes.map((c) => ({
                            value: c.id.toString(),
                            label: `${c.name}${c.teacher ? ` (${c.teacher.name})` : ""}`,
                        })),
                    ]}
                    value={classId}
                    onChange={(e) => {
                        setClassId(e.target.value);
                    }}
                />
                <Button variant="primary" onClick={handleFilter}>
                    Tampilkan
                </Button>
            </FilterBar>

            {selectedClass && (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[16px] font-bold text-text-primary font-inter">
                            Kelas: {selectedClass.name}
                            {selectedClass.teacher && (
                                <span className="text-text-muted text-[13px] font-normal ml-2">
                                    — Wali: {selectedClass.teacher.name}
                                </span>
                            )}
                        </h2>
                        <Button
                            onClick={() => setShowAddModal(true)}
                            disabled={unassignedStudents.length === 0}
                        >
                            + Tambah Siswa
                        </Button>
                    </div>

                    <section className="bg-surface border border-border rounded-lg p-4 lg:p-6 mb-6">
                        <Table
                            columns={columns}
                            data={students}
                            keyExtractor={(s) => s.id}
                            emptyMessage="Belum ada siswa di kelas ini."
                        />
                    </section>
                </>
            )}

            {!selectedClassId && (
                <div className="bg-surface border border-border rounded-lg p-12 text-center">
                    <p className="text-text-muted font-inter text-[14px]">
                        Silakan pilih kelas untuk menampilkan daftar siswa.
                    </p>
                </div>
            )}

            {/* Add Student Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setShowAddModal(false)}
                    />
                    <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-lg max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-border">
                            <h3 className="text-[16px] font-bold text-text-primary font-inter">
                                Tambah Siswa ke {selectedClass?.name}
                            </h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-text-muted hover:text-text-primary text-xl"
                                type="button"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="p-5">
                            {unassignedStudents.length === 0 ? (
                                <p className="text-text-muted text-center py-8">
                                    Tidak ada siswa yang belum terdaftar di
                                    kelas.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse font-inter">
                                        <thead>
                                            <tr className="bg-background border-b border-border">
                                                <th className="px-3 py-2 text-left text-[12px] font-semibold text-text-muted">
                                                    NIS
                                                </th>
                                                <th className="px-3 py-2 text-left text-[12px] font-semibold text-text-muted">
                                                    Nama
                                                </th>
                                                <th className="px-3 py-2 text-center text-[12px] font-semibold text-text-muted">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {unassignedStudents.map((s) => (
                                                <tr
                                                    key={s.id}
                                                    className="border-b border-border last:border-b-0"
                                                >
                                                    <td className="px-3 py-2 text-[13px]">
                                                        {s.nis}
                                                    </td>
                                                    <td className="px-3 py-2 text-[13px] font-medium">
                                                        {s.name}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                handleAssign(
                                                                    s.id,
                                                                )
                                                            }
                                                        >
                                                            Tambah
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {removeConfirmId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setRemoveConfirmId(null)}
                    />
                    <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-sm p-6 text-center">
                        <h3 className="text-[16px] font-bold text-text-primary mb-2">
                            Konfirmasi Hapus
                        </h3>
                        <p className="text-[13px] text-text-muted mb-6">
                            Apakah Anda yakin ingin menghapus siswa dari kelas
                            ini?
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="ghost"
                                onClick={() => setRemoveConfirmId(null)}
                            >
                                Batal
                            </Button>
                            <Button variant="danger" onClick={confirmRemove}>
                                Hapus
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
