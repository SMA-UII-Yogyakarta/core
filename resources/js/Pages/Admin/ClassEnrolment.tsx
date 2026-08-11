import { useState } from "react";
import { router } from "@inertiajs/react";
import { Button, Table } from "@/Components";
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

    const handleRemove = (studentId: number) => {
        setRemoveConfirmId(studentId);
    };

    const confirmRemove = () => {
        if (removeConfirmId === null) return;
        router.delete(`/class-enrolment/remove/${removeConfirmId}`, {
            preserveState: true,
            onSuccess: () => setRemoveConfirmId(null),
        });
    };

    const handleAssign = (studentId: number) => {
        router.post(
            "/class-enrolment/assign",
            {
                student_id: studentId,
                class_id: classId,
            },
            { preserveState: true, onSuccess: () => setShowAddModal(false) },
        );
    };

    const columns: Column<Student>[] = [
        {
            key: "select",
            header: (
                <input
                    type="checkbox"
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
            ),
            render: () => (
                <input
                    type="checkbox"
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
            ),
            className: "w-8",
        },
        {
            key: "nisn",
            header: "NISN",
            render: (s) => <span className="font-semibold text-text-primary">{s.nisn}</span>
        },
        {
            key: "name",
            header: "Nama Lengkap",
            render: (s) => <span className="text-text-primary">{s.name}</span>
        },
        {
            key: "actions",
            header: "Aksi",
            className: "w-16 text-center",
            render: (s) => (
                <button
                    onClick={() => handleRemove(s.id)}
                    className="text-danger hover:text-danger/80 transition-colors p-1 cursor-pointer"
                    type="button"
                    aria-label="Hapus siswa"
                >
                    <i className="fas fa-times text-[16px]" />
                </button>
            ),
        },
    ];

    return (
        <AppShell title="Manajemen & Enrolment Kelas">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-[24px] font-bold text-text-primary font-inter leading-tight">
                    Manajemen & Enrolment Kelas
                </h1>
                <p className="text-[14px] text-text-secondary font-inter mt-1">
                    Petakan rombongan belajar dan tetapkan Wali Kelas untuk tahun ajaran aktif.
                </p>
            </div>

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
                            <select
                                value={classId}
                                onChange={(e) => {
                                    const nextId = e.target.value;
                                    setClassId(nextId);
                                    router.get(
                                        "/class-enrolment",
                                        { class_id: nextId || undefined },
                                        { preserveState: true }
                                    );
                                }}
                                className="border border-border rounded-lg px-3.5 py-2.5 text-[14px] font-inter text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-full"
                            >
                                <option value="">-- Pilih Kelas --</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id.toString()}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Wali Kelas Display */}
                        <div className="flex flex-col gap-1.5 mt-2">
                            <label className="text-[13px] font-semibold text-text-secondary font-inter">
                                Tetapkan Wali Kelas
                            </label>
                            <div className="border border-border bg-slate-50 text-text-primary rounded-lg px-3.5 py-2.5 text-[14px] font-medium font-inter min-w-full">
                                {selectedClass?.teacher?.name ?? "Belum ada Wali Kelas ditetapkan"}
                            </div>
                        </div>

                        <p className="text-[11px] text-text-muted font-inter mt-auto leading-relaxed border-t border-border/60 pt-4">
                            <i className="fas fa-info-circle mr-1 text-text-inactive" />
                            Pastikan data guru sudah terdaftar di Data Master sebelum ditetapkan.
                        </p>
                    </div>
                </div>

                {/* Column 2: Daftar Siswa Terdaftar (Right) */}
                <div className="lg:col-span-3">
                    {selectedClass ? (
                        <div className="bg-surface border border-border rounded-xl p-6 shadow-card flex flex-col min-h-[440px]">
                            {/* Card Header */}
                            <div className="flex items-center justify-between mb-4 pb-2">
                                <h2 className="text-[16px] font-bold text-text-primary font-inter">
                                    Daftar Siswa Terdaftar
                                </h2>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    disabled={unassignedStudents.length === 0}
                                    className="flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-white disabled:opacity-50 disabled:pointer-events-none rounded-lg px-3.5 py-2 text-[13px] font-bold transition-colors cursor-pointer"
                                    type="button"
                                >
                                    <i className="fas fa-user-plus text-[12px]" />
                                    <span>Tambah Siswa</span>
                                </button>
                            </div>

                            {/* Table */}
                            <div className="flex-1 overflow-x-auto">
                                <Table
                                    columns={columns}
                                    data={students}
                                    keyExtractor={(s) => s.id}
                                    emptyMessage="Belum ada siswa di kelas ini."
                                />
                            </div>

                            {/* Card Footer */}
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                                <span className="text-[13px] font-semibold text-text-secondary font-inter">
                                    Total: {students.length} Siswa
                                </span>
                                <button
                                    onClick={() => alert("Pembaruan kelas berhasil disimpan!")}
                                    className="flex items-center gap-1.5 bg-success hover:bg-success/90 text-white rounded-lg px-4 py-2 text-[13px] font-bold transition-colors cursor-pointer"
                                    type="button"
                                >
                                    <i className="fas fa-check text-[12px]" />
                                    <span>Simpan Pembaruan</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-surface border border-border rounded-xl p-12 text-center shadow-card flex flex-col items-center justify-center min-h-[440px]">
                            <i className="fas fa-school text-text-inactive text-4xl mb-4" />
                            <p className="text-text-muted font-inter text-[14px] max-w-sm">
                                Silakan pilih kelas di kolom sebelah kiri untuk menampilkan daftar siswa terdaftar.
                            </p>
                        </div>
                    )}
                </div>
            </div>

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
                                    Tidak ada siswa yang belum terdaftar di kelas.
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
                            Apakah Anda yakin ingin menghapus siswa dari kelas ini?
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
        </AppShell>
    );
}
