import { useState, useMemo } from "react";
import { router, useForm } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import {
    PageHeader,
    Card,
    Table,
    StatusBadge,
    ActionButton,
    Drawer,
    SelectInput,
    Input,
    Button,
    Pagination,
    SearchBar,
    ConfirmDialog,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import type { StatusVariant } from "@/types/component";
import { attendanceCorrectionSchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";

interface Student {
    id: number;
    nis: string;
    name: string;
    class: string;
    original_status: string;
    overridden_status: string | null;
    current_status: string;
    override_id: number | null;
    check_in_time: string | null;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface Props {
    students: Student[];
    classes: SchoolClass[];
    filters: { date: string; class_id: number | null };
}

const statusToVariant: Record<string, StatusVariant> = {
    Present: "present",
    Late: "late",
    Absent: "absent",
    Sick: "sick",
    Permit: "permission",
};

const statusOptions = [
    { value: "Present", label: "Hadir (Present)" },
    { value: "Late", label: "Terlambat (Late)" },
    { value: "Absent", label: "Alpa (Absent)" },
    { value: "Sick", label: "Sakit (Sick)" },
    { value: "Permit", label: "Izin (Permit)" },
];

export default function KoreksiAbsensi({ students, classes, filters }: Props) {
    const [selectedDate, setSelectedDate] = useState(filters.date);
    const [selectedClass, setSelectedClass] = useState(filters.class_id ? String(filters.class_id) : "");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; overrideId: number | null }>({
        open: false,
        overrideId: null,
    });
    const pageSize = 10;

    const filteredStudents = useMemo(() => {
        if (!search.trim()) return students;
        const q = search.toLowerCase();
        return students.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.nis.toLowerCase().includes(q) ||
                s.class.toLowerCase().includes(q),
        );
    }, [students, search]);

    const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const paginatedStudents = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return filteredStudents.slice(start, start + pageSize);
    }, [filteredStudents, safePage, pageSize]);

    const { data, setData, post, processing, errors, setError, clearErrors, reset } = useForm({
        student_id: 0,
        date: filters.date,
        new_status: "Present",
        reason: "",
    });

    const applyFilter = () => {
        router.get(
            "/attendance-correction",
            {
                date: selectedDate,
                class_id: selectedClass || undefined,
            },
            { preserveState: true },
        );
    };

    const openCorrectionDrawer = (student: Student) => {
        clearErrors();
        setSelectedStudent(student);
        setData({
            student_id: student.id,
            date: selectedDate,
            new_status: student.current_status || "Present",
            reason: "",
        });
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedStudent(null);
        reset();
        clearErrors();
    };

    const submitOverride = () => {
        clearErrors();
        const valid = validateForm(attendanceCorrectionSchema, data);
        if (!valid.success) {
            (Object.keys(valid.errors) as (keyof typeof data)[]).forEach((key) => {
                const msg = valid.errors[key];
                if (msg) setError(key, msg);
            });
            return;
        }

        post("/attendance-correction", {
            preserveScroll: true,
            onSuccess: () => closeDrawer(),
        });
    };

    const deleteOverride = (overrideId: number) => {
        setDeleteConfirm({ open: true, overrideId });
    };

    const handleConfirmedDelete = () => {
        if (!deleteConfirm.overrideId) return;
        router.delete(`/attendance-correction/${deleteConfirm.overrideId}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteConfirm({ open: false, overrideId: null }),
        });
    };

    const columns: Column<Student>[] = [
        {
            key: "nis",
            header: "NIS",
            render: (s) => <span className="font-semibold text-text-primary">{s.nis}</span>,
            className: "w-28",
        },
        {
            key: "name",
            header: "Nama Siswa",
            render: (s) => (
                <div>
                    <p className="font-bold text-text-primary">{s.name}</p>
                    <p className="text-[12px] text-text-muted">{s.class}</p>
                </div>
            ),
        },
        {
            key: "check_in_time",
            header: "Jam Masuk",
            render: (s) => (
                <span className="text-[13px] font-medium text-text-secondary">{s.check_in_time ?? "—"}</span>
            ),
        },
        {
            key: "original_status",
            header: "Status Asli",
            render: (s) => {
                const variant = statusToVariant[s.original_status] ?? "absent";
                return <StatusBadge variant={variant} />;
            },
            className: "text-center",
        },
        {
            key: "current_status",
            header: "Status Saat Ini",
            render: (s) => {
                const variant = statusToVariant[s.current_status] ?? "absent";
                return (
                    <div className="flex items-center gap-1.5 justify-center">
                        <StatusBadge variant={variant} />
                        {s.override_id && (
                            <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                Koreksi
                            </span>
                        )}
                    </div>
                );
            },
            className: "text-center",
        },
        {
            key: "actions",
            header: <div className="text-center w-full">Aksi</div>,
            render: (s) => (
                <div className="flex items-center gap-2 justify-end">
                    <ActionButton
                        variant="edit"
                        icon="fa-pen"
                        label="Koreksi"
                        onClick={() => openCorrectionDrawer(s)}
                    />
                    {s.override_id && (
                        <ActionButton
                            variant="delete"
                            icon="fa-undo"
                            label="Reset"
                            onClick={() => deleteOverride(s.override_id!)}
                        />
                    )}
                </div>
            ),
            className: "w-px whitespace-nowrap text-right",
        },
    ];

    return (
        <AppShell title="Koreksi Absensi">
            <div className="space-y-6">
                <PageHeader
                    title="Koreksi Absensi"
                    description="Sesuaikan atau ubah status absensi siswa harian secara manual dengan pencatatan alasan resmi."
                />

                {/* Filter Toolbar */}
                <Card>
                    <div className="p-4 flex flex-wrap gap-4 items-end">
                        <div className="w-full sm:w-48">
                            <Input
                                label="Tanggal Absensi"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-56">
                            <SelectInput
                                label="Pilih Kelas"
                                value={selectedClass}
                                onChange={(val) => setSelectedClass(val as string)}
                                options={[
                                    { value: "", label: "Semua Kelas" },
                                    ...classes.map((c) => ({ value: String(c.id), label: c.name })),
                                ]}
                            />
                        </div>
                        <Button variant="primary" onClick={applyFilter} className="h-10">
                            <i className="fas fa-filter mr-2 text-[12px]" />
                            Terapkan Filter
                        </Button>
                        <div className="w-full sm:w-64 sm:ml-auto">
                            <SearchBar
                                value={search}
                                onChange={(val) => {
                                    setSearch(val);
                                    setCurrentPage(1);
                                }}
                                onSearch={() => setCurrentPage(1)}
                                placeholder="Cari nama, NIS, kelas..."
                            />
                        </div>
                    </div>
                </Card>

                {/* Student Table */}
                <Card>
                    <Table
                        columns={columns}
                        data={paginatedStudents}
                        keyExtractor={(s) => s.id}
                        emptyMessage={search ? "Tidak ditemukan siswa yang cocok dengan pencarian." : "Tidak ada data siswa untuk tanggal dan kelas yang dipilih."}
                    />
                    {filteredStudents.length > pageSize && (
                        <div className="p-4 border-t border-border bg-surface">
                            <Pagination
                                currentPage={safePage}
                                totalPages={totalPages}
                                totalItems={filteredStudents.length}
                                perPage={pageSize}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </Card>

                {/* Correction Drawer */}
                <Drawer
                    open={isDrawerOpen}
                    onClose={closeDrawer}
                    title={`Koreksi Absensi: ${selectedStudent?.name ?? ""}`}
                    width="md"
                    onSubmit={submitOverride}
                    submitLabel="Simpan Koreksi"
                    loading={processing}
                >
                    <div className="space-y-4">
                        <div className="p-3 bg-muted/50 rounded-lg text-[13px] text-text-secondary space-y-1">
                            <p>
                                <strong>NIS:</strong> {selectedStudent?.nis}
                            </p>
                            <p>
                                <strong>Kelas:</strong> {selectedStudent?.class}
                            </p>
                            <p>
                                <strong>Status Terakhir:</strong> {selectedStudent?.current_status}
                            </p>
                        </div>

                        <SelectInput
                            label="Status Kehadiran Baru"
                            value={data.new_status}
                            onChange={(val) => setData("new_status", val as string)}
                            options={statusOptions}
                            error={errors.new_status}
                        />

                        <div>
                            <label className="block text-sm font-medium text-primary mb-1.5 font-inter">
                                Alasan Koreksi
                            </label>
                            <textarea
                                value={data.reason}
                                onChange={(e) => setData("reason", e.target.value)}
                                rows={4}
                                placeholder="Contoh: Kesalahan sistem perekaman, izin disampaikan via telepon, dispensasi lomba..."
                                className="w-full border border-border rounded-lg px-4 py-2.5 text-[14px] font-inter bg-surface placeholder:text-text-inactive focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent resize-none"
                            />
                            {errors.reason && (
                                <p className="mt-1 text-[11px] text-danger font-medium font-inter">{errors.reason}</p>
                            )}
                        </div>
                    </div>
                </Drawer>
            </div>

            <ConfirmDialog
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, overrideId: null })}
                onConfirm={handleConfirmedDelete}
                title="Reset Koreksi Absensi"
                message="Hapus koreksi absensi ini dan kembalikan ke status asli?"
                variant="danger"
            />
        </AppShell>
    );
}
