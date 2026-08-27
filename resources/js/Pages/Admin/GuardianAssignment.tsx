import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import { Button, Table, PageHeader, Avatar, Modal, SearchBar, Pagination } from "@/Components";
import { FiUserX, FiCheckCircle, FiUserPlus, FiPlus, FiArrowLeft } from "react-icons/fi";
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
    const [guardianPage, setGuardianPage] = useState(1);
    const guardianPageSize = 10;

    const [showAddModal, setShowAddModal] = useState(false);
    const [modalTab, setModalTab] = useState<"unassigned" | "all">("unassigned");
    const [studentSearch, setStudentSearch] = useState("");
    const [modalPage, setModalPage] = useState(1);
    const modalPageSize = 10;

    const [linkedPage, setLinkedPage] = useState(1);
    const linkedPageSize = 10;
    const [removeConfirmId, setRemoveConfirmId] = useState<number | null>(null);

    const filteredGuardians = useMemo(() => {
        return guardians.filter(
            (g) =>
                g.name.toLowerCase().includes(guardianSearch.toLowerCase()) ||
                (g.phone && g.phone.includes(guardianSearch)) ||
                (g.user?.email && g.user.email.toLowerCase().includes(guardianSearch.toLowerCase())),
        );
    }, [guardians, guardianSearch]);

    const guardianTotalPages = Math.ceil(filteredGuardians.length / guardianPageSize) || 1;
    const guardianSafePage = Math.min(Math.max(1, guardianPage), guardianTotalPages);
    const paginatedGuardians = useMemo(() => {
        const start = (guardianSafePage - 1) * guardianPageSize;
        return filteredGuardians.slice(start, start + guardianPageSize);
    }, [filteredGuardians, guardianSafePage, guardianPageSize]);

    const linkedTotalPages = Math.ceil(linkedStudents.length / linkedPageSize) || 1;
    const linkedSafePage = Math.min(Math.max(1, linkedPage), linkedTotalPages);
    const paginatedLinked = useMemo(() => {
        const start = (linkedSafePage - 1) * linkedPageSize;
        return linkedStudents.slice(start, start + linkedPageSize);
    }, [linkedStudents, linkedSafePage, linkedPageSize]);

    const modalStudents = useMemo(() => {
        const list = modalTab === "unassigned" ? unassignedStudents : allStudents;
        if (!studentSearch.trim()) return list;
        const q = studentSearch.toLowerCase();
        return list.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.nis.toLowerCase().includes(q) ||
                s.nisn.toLowerCase().includes(q),
        );
    }, [modalTab, unassignedStudents, allStudents, studentSearch]);

    const modalTotalPages = Math.ceil(modalStudents.length / modalPageSize) || 1;
    const modalSafePage = Math.min(Math.max(1, modalPage), modalTotalPages);
    const paginatedModalStudents = useMemo(() => {
        const start = (modalSafePage - 1) * modalPageSize;
        return modalStudents.slice(start, start + modalPageSize);
    }, [modalStudents, modalSafePage, modalPageSize]);

    const handleSelectGuardian = (id: string) => {
        setGuardianId(id);
        setLinkedPage(1);
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
            className: "w-12 whitespace-nowrap",
        },
        {
            key: "name",
            header: "Nama Siswa",
            className: "w-full min-w-0",
            render: (s) => (
                <div className="min-w-0 max-w-[200px] sm:max-w-none">
                    <p className="font-semibold text-primary truncate" title={s.name}>{s.name}</p>
                    <p className="text-[12px] text-text-secondary truncate">NIS: {s.nis} · NISN: {s.nisn}</p>
                </div>
            ),
        },
        {
            key: "class",
            header: "Kelas",
            className: "w-1 whitespace-nowrap text-center",
            render: (s) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-surface-raised border border-border text-text-primary whitespace-nowrap shrink-0">
                    {s.class?.name ?? "Belum Masuk Kelas"}
                </span>
            ),
        },
        {
            key: "actions",
            header: <div className="text-center w-full">Aksi</div>,
            className: "w-16 text-center whitespace-nowrap",
            render: (s) => (
                <button
                    onClick={() => handleRemove(s.id)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md text-danger hover:text-danger/90 hover:bg-danger-bg active:bg-danger-light border border-transparent hover:border-danger-light transition-colors cursor-pointer"
                    type="button"
                    title="Lepas hubungan wali"
                    aria-label={`Lepas hubungan ${s.name}`}
                    data-testid={`btn-remove-student-${s.id}`}
                >
                    <FiUserX className="text-[14px]" />
                </button>
            ),
        },
    ];

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
                        onChange={(val) => {
                            setGuardianSearch(val);
                            setGuardianPage(1);
                        }}
                        onSearch={() => setGuardianPage(1)}
                        placeholder="Cari nama atau telepon wali..."
                    />

                    <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
                        {paginatedGuardians.map((g) => {
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
                                            <FiCheckCircle />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {filteredGuardians.length > guardianPageSize && (
                        <div className="pt-2 border-t border-border">
                            <Pagination
                                currentPage={guardianSafePage}
                                totalPages={guardianTotalPages}
                                totalItems={filteredGuardians.length}
                                perPage={guardianPageSize}
                                onPageChange={setGuardianPage}
                            />
                        </div>
                    )}
                </div>

                {/* Right Column: Daftar Siswa Terhubung */}
                <div className="lg:col-span-7 flex flex-col gap-4 bg-surface border border-border rounded-xl p-5 shadow-card min-h-[480px]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                        <div>
                            <h2 className="text-[15px] font-bold text-text-primary font-inter">
                                {selectedGuardian
                                    ? `Siswa Binaan: ${selectedGuardian.name}`
                                    : "Siswa Binaan"}
                            </h2>
                            <p className="text-[12px] text-text-secondary mt-0.5">
                                {selectedGuardian
                                    ? `${linkedStudents.length} siswa terhubung dengan wali murid ini.`
                                    : "Pilih wali murid di sebelah kiri untuk melihat siswa terhubung."}
                            </p>
                        </div>
                        {selectedGuardian && (
                            <Button
                                onClick={() => {
                                    setStudentSearch("");
                                    setModalPage(1);
                                    setShowAddModal(true);
                                }}
                                className="shrink-0 whitespace-nowrap"
                                data-testid="btn-add-student"
                            >
                                <FiUserPlus className="mr-1.5" />
                                Hubungkan Siswa
                            </Button>
                        )}
                    </div>

                    {selectedGuardian ? (
                        linkedStudents.length > 0 ? (
                            <div className="mt-2 flex flex-col gap-3">
                                <Table
                                    columns={columns}
                                    data={paginatedLinked}
                                    keyExtractor={(s: Student) => s.id}
                                />
                                {linkedStudents.length > linkedPageSize && (
                                    <div className="pt-2 border-t border-border">
                                        <Pagination
                                            currentPage={linkedSafePage}
                                            totalPages={linkedTotalPages}
                                            totalItems={linkedStudents.length}
                                            perPage={linkedPageSize}
                                            onPageChange={setLinkedPage}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-border/80 rounded-xl my-auto">
                                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 text-lg">
                                    <FiUserX />
                                </div>
                                <h3 className="text-[15px] font-bold text-text-primary">Belum Ada Siswa Terhubung</h3>
                                <p className="text-[13px] text-text-secondary max-w-sm mx-auto mt-1 mb-4">
                                    Wali murid ini belum memiliki hubungan dengan data siswa di database.
                                </p>
                                <Button
                                    onClick={() => {
                                        setStudentSearch("");
                                        setModalPage(1);
                                        setShowAddModal(true);
                                    }}
                                >
                                    <FiPlus className="mr-1.5" />
                                    Hubungkan Siswa Sekarang
                                </Button>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-16 text-text-inactive my-auto">
                            <FiArrowLeft className="text-3xl mb-3 mx-auto" />
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
                            onClick={() => {
                                setModalTab("unassigned");
                                setModalPage(1);
                            }}
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
                            onClick={() => {
                                setModalTab("all");
                                setModalPage(1);
                            }}
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
                        onChange={(val) => {
                            setStudentSearch(val);
                            setModalPage(1);
                        }}
                        onSearch={() => setModalPage(1)}
                        placeholder="Cari nama, NIS, atau NISN siswa..."
                    />

                    <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
                        {paginatedModalStudents.length > 0 ? (
                            paginatedModalStudents.map((s) => (
                                <div
                                    key={s.id}
                                    className="p-3 border border-border rounded-lg flex items-center justify-between hover:bg-surface-raised transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                                        <Avatar name={s.name} size="sm" variant="accent" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13px] font-bold text-text-primary truncate" title={s.name}>{s.name}</p>
                                            <p className="text-[11px] text-text-secondary truncate">
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

                    {modalStudents.length > modalPageSize && (
                        <div className="pt-3 border-t border-border">
                            <Pagination
                                currentPage={modalSafePage}
                                totalPages={modalTotalPages}
                                totalItems={modalStudents.length}
                                perPage={modalPageSize}
                                onPageChange={setModalPage}
                            />
                        </div>
                    )}
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
