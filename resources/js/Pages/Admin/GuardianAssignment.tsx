import { useState } from "react";
import { router } from "@inertiajs/react";
import { Button, Table, PageHeader, Avatar, Modal, SearchBar } from "@/Components";
import AppShell from "@/Layouts/AppShell";
import type { Column } from "@/Components/ui/Table";

interface Guardian {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    user?: { email?: string; username?: string } | null;
}

interface Student {
    id: number;
    nis: string;
    nisn: string;
    name: string;
    class?: { id: number; name: string } | null;
}

interface PageProps {
    guardians: Guardian[];
    selectedGuardianId: number | null;
    selectedGuardian: Guardian | null;
    linkedStudents: Student[];
    unassignedStudents: Student[];
    allStudents: Student[];
}

export default function GuardianAssignment({
    guardians = [],
    selectedGuardianId,
    selectedGuardian,
    linkedStudents = [],
    unassignedStudents = [],
    allStudents = [],
}: PageProps) {
    const [guardianId, setGuardianId] = useState(selectedGuardianId?.toString() ?? "");
    const [guardianSearch, setGuardianSearch] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [modalTab, setModalTab] = useState<"unassigned" | "all">("unassigned");
    const [studentSearch, setStudentSearch] = useState("");
    const [removeConfirmId, setRemoveConfirmId] = useState<number | null>(null);

    const filteredGuardians = guardians.filter(
        (g) =>
            g.name.toLowerCase().includes(guardianSearch.toLowerCase()) ||
            (g.phone && g.phone.includes(guardianSearch)) ||
            (g.user?.email && g.user.email.toLowerCase().includes(guardianSearch.toLowerCase())),
    );

    const handleSelectGuardian = (id: string) => {
        setGuardianId(id);
        router.get(
            "/guardian-assignment",
            { guardian_id: id },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleAssign = (studentId: number) => {
        if (!guardianId) return;
        router.post(
            "/guardian-assignment/assign",
            {
                guardian_id: guardianId,
                student_id: studentId,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => setShowAddModal(false),
            },
        );
    };

    const handleRemove = (studentId: number) => {
        setRemoveConfirmId(studentId);
    };

    const confirmRemove = () => {
        if (removeConfirmId === null) return;
        router.delete(`/guardian-assignment/remove/${removeConfirmId}`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setRemoveConfirmId(null),
        });
    };

    const columns: Column<Student>[] = [
        {
            key: "avatar",
            header: "",
            render: (s) => <Avatar name={s.name} size="sm" variant="accent" />,
            className: "w-12",
        },
        {
            key: "name",
            header: "Nama Siswa",
            render: (s) => (
                <div>
                    <p className="font-semibold text-primary">{s.name}</p>
                    <p className="text-[12px] text-text-secondary">NIS: {s.nis} · NISN: {s.nisn}</p>
                </div>
            ),
        },
        {
            key: "class",
            header: "Kelas",
            render: (s) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-surface-raised border border-border text-text-primary">
                    {s.class?.name ?? "Belum Masuk Kelas"}
                </span>
            ),
        },
        {
            key: "actions",
            header: "Aksi",
            className: "w-20 text-center",
            render: (s) => (
                <button
                    onClick={() => handleRemove(s.id)}
                    className="text-danger hover:text-danger/80 transition-colors p-1.5 rounded-lg hover:bg-danger/10 cursor-pointer"
                    type="button"
                    title="Lepas hubungan wali"
                    aria-label={`Lepas hubungan ${s.name}`}
                    data-testid={`btn-remove-student-${s.id}`}
                >
                    <i className="fas fa-unlink text-[14px]" />
                </button>
            ),
        },
    ];

    const modalStudents = (modalTab === "unassigned" ? unassignedStudents : allStudents).filter(
        (s) =>
            s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
            s.nis.includes(studentSearch) ||
            s.nisn.includes(studentSearch),
    );

    return (
        <AppShell title="Relasi Wali Murid & Siswa">
            <PageHeader
                title="Relasi Wali Murid & Siswa"
                description="Hubungkan orang tua / wali murid dengan siswa binaan untuk pemantauan kehadiran dan izin."
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Daftar Wali Murid */}
                <div className="lg:col-span-5 flex flex-col gap-4 bg-surface border border-border rounded-xl p-5 shadow-card">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <h2 className="text-[15px] font-bold text-primary font-inter">
                            Pilih Wali Murid ({guardians.length})
                        </h2>
                    </div>

                    <SearchBar
                        value={guardianSearch}
                        onChange={setGuardianSearch}
                        onSearch={() => {}}
                        placeholder="Cari nama atau telepon wali..."
                    />

                    <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
                        {filteredGuardians.map((g) => {
                            const isSelected = g.id.toString() === guardianId;
                            return (
                                <button
                                    key={g.id}
                                    type="button"
                                    onClick={() => handleSelectGuardian(g.id.toString())}
                                    data-testid={`guardian-item-${g.id}`}
                                    className={`text-left p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                                        isSelected
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-border/60 hover:border-primary/40 bg-surface"
                                    }`}
                                >
                                    <Avatar name={g.name} size="sm" variant={isSelected ? "primary" : "muted"} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-text-primary truncate">{g.name}</p>
                                        <p className="text-[12px] text-text-secondary truncate">
                                            {g.phone || "Tidak ada telepon"} · {g.user?.email || "-"}
                                        </p>
                                        {g.address && (
                                            <p className="text-[11px] text-text-inactive truncate mt-0.5">
                                                {g.address}
                                            </p>
                                        )}
                                    </div>
                                    {isSelected && (
                                        <span className="text-primary font-bold text-[12px]">
                                            <i className="fas fa-check-circle" />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Daftar Siswa Terhubung */}
                <div className="lg:col-span-7 flex flex-col gap-4 bg-surface border border-border rounded-xl p-5 shadow-card min-h-[480px]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                        <div>
                            <h2 className="text-[16px] font-bold text-primary font-inter">
                                Anak Terhubung: {selectedGuardian?.name ?? "Pilih Wali Murid"}
                            </h2>
                            <p className="text-[12px] text-text-secondary">
                                {selectedGuardian
                                    ? `Kontak: ${selectedGuardian.phone ?? "-"} · Alamat: ${selectedGuardian.address ?? "-"}`
                                    : "Silakan pilih salah satu wali murid di kolom sebelah kiri."}
                            </p>
                        </div>
                        {selectedGuardian && (
                            <Button
                                onClick={() => {
                                    setStudentSearch("");
                                    setShowAddModal(true);
                                }}
                                data-testid="btn-add-student"
                            >
                                <i className="fas fa-user-plus mr-1.5" />
                                Hubungkan Siswa
                            </Button>
                        )}
                    </div>

                    {selectedGuardian ? (
                        linkedStudents.length > 0 ? (
                            <div className="mt-2">
                                <Table
                                    columns={columns}
                                    data={linkedStudents}
                                    keyExtractor={(s: Student) => s.id}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-border/80 rounded-xl my-auto">
                                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 text-lg">
                                    <i className="fas fa-users-slash" />
                                </div>
                                <h3 className="text-[15px] font-bold text-text-primary">Belum Ada Siswa Terhubung</h3>
                                <p className="text-[13px] text-text-secondary max-w-sm mx-auto mt-1 mb-4">
                                    Wali murid ini belum memiliki hubungan dengan data siswa di database.
                                </p>
                                <Button onClick={() => setShowAddModal(true)}>
                                    <i className="fas fa-plus mr-1.5" />
                                    Hubungkan Siswa Sekarang
                                </Button>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-16 text-text-inactive my-auto">
                            <i className="fas fa-arrow-left text-3xl mb-3" />
                            <p className="text-[14px]">Pilih salah satu wali murid di panel kiri untuk mengelola siswa terhubung.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Hubungkan Siswa */}
            <Modal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={`Hubungkan Siswa ke ${selectedGuardian?.name ?? "Wali Murid"}`}
                width="lg"
            >
                <div className="flex flex-col gap-4">
                    <div className="flex border-b border-border">
                        <button
                            type="button"
                            onClick={() => setModalTab("unassigned")}
                            className={`pb-2.5 px-4 text-[13px] font-bold border-b-2 transition-colors cursor-pointer ${
                                modalTab === "unassigned"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-text-secondary hover:text-text-primary"
                            }`}
                        >
                            Siswa Belum Punya Wali ({unassignedStudents.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setModalTab("all")}
                            className={`pb-2.5 px-4 text-[13px] font-bold border-b-2 transition-colors cursor-pointer ${
                                modalTab === "all"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-text-secondary hover:text-text-primary"
                            }`}
                        >
                            Semua Siswa ({allStudents.length})
                        </button>
                    </div>

                    <SearchBar
                        value={studentSearch}
                        onChange={setStudentSearch}
                        onSearch={() => {}}
                        placeholder="Cari nama, NIS, atau NISN siswa..."
                    />

                    <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
                        {modalStudents.length > 0 ? (
                            modalStudents.map((s) => (
                                <div
                                    key={s.id}
                                    className="p-3 border border-border rounded-lg flex items-center justify-between hover:bg-surface-raised transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar name={s.name} size="sm" variant="accent" />
                                        <div>
                                            <p className="text-[13px] font-bold text-text-primary">{s.name}</p>
                                            <p className="text-[11px] text-text-secondary">
                                                NIS: {s.nis} · {s.class?.name ?? "Tanpa Kelas"}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleAssign(s.id)}
                                        data-testid={`btn-assign-${s.id}`}
                                    >
                                        Hubungkan
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-6 text-text-inactive text-[13px]">
                                Tidak ada data siswa yang cocok dengan pencarian.
                            </p>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Modal Konfirmasi Lepas Hubungan */}
            <Modal
                open={removeConfirmId !== null}
                onClose={() => setRemoveConfirmId(null)}
                title="Konfirmasi Lepas Hubungan"
                width="sm"
            >
                <div className="flex flex-col gap-4 py-2">
                    <p className="text-[14px] text-text-primary font-inter">
                        Apakah Anda yakin ingin melepas hubungan siswa ini dari wali murid <strong>{selectedGuardian?.name}</strong>?
                    </p>
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                        <Button variant="ghost" onClick={() => setRemoveConfirmId(null)}>
                            Batal
                        </Button>
                        <Button variant="danger" onClick={confirmRemove} data-testid="btn-confirm-unlink">
                            Lepas Hubungan
                        </Button>
                    </div>
                </div>
            </Modal>
        </AppShell>
    );
}
