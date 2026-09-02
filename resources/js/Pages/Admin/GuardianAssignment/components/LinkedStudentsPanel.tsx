import { useMemo } from "react";
import { FiUserX, FiUserPlus, FiArrowLeft } from "react-icons/fi";
import { Button, Table, Avatar, Pagination, EmptyState, Card } from "@/Components";
import type { Column } from "@/Components/ui/Table";
import type { Student, Guardian } from "../types";

interface LinkedStudentsPanelProps {
    selectedGuardian: Guardian | null;
    linkedStudents: Student[];
    linkedPage: number;
    onPageChange: (page: number) => void;
    linkedPageSize: number;
    onAddStudent: () => void;
    onRemoveStudent: (studentId: number) => void;
}

export default function LinkedStudentsPanel({
    selectedGuardian,
    linkedStudents,
    linkedPage,
    onPageChange,
    linkedPageSize,
    onAddStudent,
    onRemoveStudent,
}: LinkedStudentsPanelProps) {
    const columns: Column<Student>[] = useMemo(
        () => [
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
                        <p className="text-[12px] text-text-secondary truncate">NIS: {s.nis} &middot; NISN: {s.nisn}</p>
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
                        onClick={() => onRemoveStudent(s.id)}
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
        ],
        [onRemoveStudent]
    );

    const linkedTotalPages = Math.max(1, Math.ceil(linkedStudents.length / linkedPageSize));
    const linkedSafePage = Math.min(Math.max(1, linkedPage), linkedTotalPages);
    const paginatedLinked = useMemo(() => {
        const start = (linkedSafePage - 1) * linkedPageSize;
        return linkedStudents.slice(start, start + linkedPageSize);
    }, [linkedStudents, linkedSafePage, linkedPageSize]);

    return (
        <div className="flex flex-col gap-4">
            <Card className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-[16px] font-bold text-primary font-inter">
                            Anak Terhubung: {selectedGuardian?.name ?? "Pilih Wali Murid"}
                        </h2>
                        <p className="text-[12px] text-text-secondary mt-0.5">
                            {selectedGuardian
                                ? `Kontak: ${selectedGuardian.phone ?? "-"} &middot; Alamat: ${selectedGuardian.address ?? "-"}`
                                : "Silakan pilih salah satu wali murid di kolom sebelah kiri."}
                        </p>
                    </div>
                    {selectedGuardian && (
                        <Button
                            onClick={onAddStudent}
                            className="shrink-0 whitespace-nowrap"
                            data-testid="btn-add-student"
                        >
                            <FiUserPlus className="mr-1.5" />
                            Hubungkan Siswa
                        </Button>
                    )}
                </div>
            </Card>

            {selectedGuardian ? (
                linkedStudents.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        <Table columns={columns} data={paginatedLinked} keyExtractor={(s: Student) => s.id} />
                        {linkedStudents.length > linkedPageSize && (
                            <div className="pt-2">
                                <Pagination
                                    currentPage={linkedSafePage}
                                    totalPages={linkedTotalPages}
                                    totalItems={linkedStudents.length}
                                    perPage={linkedPageSize}
                                    onPageChange={onPageChange}
                                    compact
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <EmptyState
                        variant="no-data"
                        title="Belum Ada Siswa Terhubung"
                        description="Wali murid ini belum memiliki hubungan dengan data siswa di database."
                        actionLabel="Hubungkan Siswa Sekarang"
                        actionOnClick={onAddStudent}
                    />
                )
            ) : (
                <Card className="text-center py-16 text-text-inactive my-auto">
                    <FiArrowLeft className="text-3xl mb-3 mx-auto" />
                    <p className="text-[14px]">Pilih salah satu wali murid di panel kiri untuk mengelola siswa terhubung.</p>
                </Card>
            )}
        </div>
    );
}