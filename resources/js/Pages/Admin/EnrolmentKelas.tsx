import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Button,
    Badge,
    Input,
    LoadingSkeleton,
    ErrorState,
} from "@/Components/ui/index";
import {
    FaChalkboardTeacher,
    FaPlus,
    FaSearch,
    FaTrash,
    FaUsers,
    FaTimes,
    FaCheck,
    FaInbox,
} from "react-icons/fa";

interface Student {
    id: number;
    nis: string;
    nama: string;
}

interface ClassData {
    id: number;
    name: string;
    wali_kelas: string;
    total_siswa: number;
    students: Student[];
}

const mockClasses: ClassData[] = [
    {
        id: 1,
        name: "X-A",
        wali_kelas: "Dra. Sri Wahyuni",
        total_siswa: 32,
        students: [
            { id: 101, nis: "2426001", nama: "Ahmad Fauzi" },
            { id: 102, nis: "2426004", nama: "Dewi Lestari" },
            { id: 103, nis: "2426010", nama: "Rina Marlina" },
            { id: 104, nis: "2426011", nama: "Hendra Gunawan" },
        ],
    },
    {
        id: 2,
        name: "X-B",
        wali_kelas: "Drs. Supriyadi",
        total_siswa: 30,
        students: [
            { id: 201, nis: "2426002", nama: "Siti Nurhaliza" },
            { id: 202, nis: "2426007", nama: "Fajar Hidayat" },
        ],
    },
    {
        id: 3,
        name: "XI-A",
        wali_kelas: "Fitriani, S.Pd.",
        total_siswa: 28,
        students: [
            { id: 301, nis: "2426003", nama: "Budi Santoso" },
            { id: 302, nis: "2426009", nama: "Dimas Ardiansyah" },
        ],
    },
    {
        id: 4,
        name: "XI-B",
        wali_kelas: "-",
        total_siswa: 0,
        students: [],
    },
    {
        id: 5,
        name: "XII-A",
        wali_kelas: "-",
        total_siswa: 26,
        students: [{ id: 501, nis: "2426005", nama: "Rizky Pratama" }],
    },
    {
        id: 6,
        name: "XII-B",
        wali_kelas: "-",
        total_siswa: 24,
        students: [{ id: 601, nis: "2426008", nama: "Citra Ayu Kusuma" }],
    },
];

export default function EnrolmentKelas() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [newNis, setNewNis] = useState("");

    useEffect(() => {
        setLoading(true);
        setError(null);

        setTimeout(() => {
            setClasses(mockClasses);
            if (mockClasses.length > 0) {
                setSelectedClassId(mockClasses[0].id);
            }
            setLoading(false);
        }, 400);
    }, []);

    const selectedClass =
        classes.find((c) => c.id === selectedClassId) ?? classes[0];

    const handleRemoveStudent = (studentId: number) => {
        setClasses((prev) =>
            prev.map((cls) => {
                if (cls.id !== selectedClassId) return cls;
                return {
                    ...cls,
                    total_siswa: cls.total_siswa - 1,
                    students: cls.students.filter((s) => s.id !== studentId),
                };
            }),
        );
    };

    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNis.trim()) return;

        const newId = Date.now();
        setClasses((prev) =>
            prev.map((cls) => {
                if (cls.id !== selectedClassId) return cls;
                return {
                    ...cls,
                    total_siswa: cls.total_siswa + 1,
                    students: [
                        ...cls.students,
                        {
                            id: newId,
                            nis: newNis.trim(),
                            nama: `Siswa Baru (${newNis.trim()})`,
                        },
                    ],
                };
            }),
        );
        setNewNis("");
        setShowModal(false);
    };

    /* ---------- Mobile: Class Cards ---------- */
    const MobileClassCards = () => {
        if (loading) return <LoadingSkeleton />;
        if (error)
            return (
                <ErrorState
                    message={error}
                    onRetry={() => window.location.reload()}
                />
            );
        if (classes.length === 0)
            return (
                <div className="flex flex-col items-center py-12 text-text-muted">
                    <FaInbox className="w-12 h-12 mb-4" />
                    <p className="text-sm">Belum ada kelas yang terdaftar</p>
                </div>
            );

        return (
            <div className="flex flex-col gap-4">
                {classes.map((cls) => (
                    <div
                        key={cls.id}
                        className="bg-surface rounded-lg border border-border p-4"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-primary uppercase">
                                    {cls.name}
                                </span>
                                <span className="text-[10px] font-semibold text-accent bg-accent/20 px-2 py-0.5 rounded-full">
                                    KELAS AKTIF
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-text-muted">
                                <FaUsers className="w-3 h-3" />
                                <span className="text-xs font-medium">
                                    {cls.total_siswa} Siswa
                                </span>
                            </div>
                        </div>

                        {/* Wali Kelas */}
                        <p className="text-xs text-text-muted mb-3">
                            Wali Kelas:{" "}
                            <span className="text-text-secondary font-medium">
                                {cls.wali_kelas}
                            </span>
                        </p>

                        {/* Student list */}
                        {cls.students.length > 0 ? (
                            <div className="flex flex-col gap-1.5">
                                {cls.students.map((student) => (
                                    <div
                                        key={student.id}
                                        className="flex items-center justify-between bg-background rounded-md px-3 py-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-text-primary">
                                                {student.nama}
                                            </span>
                                            <span className="text-[10px] text-text-muted">
                                                ({student.nis})
                                            </span>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleRemoveStudent(student.id)
                                            }
                                            className="text-text-inactive hover:text-danger transition-colors"
                                            title="Hapus siswa"
                                        >
                                            <FaTrash className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-text-muted italic text-center py-3">
                                Belum ada siswa di kelas ini
                            </p>
                        )}

                        {/* Add button per class */}
                        <button
                            onClick={() => {
                                setSelectedClassId(cls.id);
                                setShowModal(true);
                            }}
                            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-primary border border-dashed border-border rounded-md hover:bg-primary-light/50 transition-colors"
                        >
                            <FaPlus className="w-3 h-3" />
                            Tambah Siswa
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    /* ---------- Desktop: Dropdown + Table ---------- */
    const DesktopView = () => {
        if (loading) return <LoadingSkeleton />;
        if (error)
            return (
                <ErrorState
                    message={error}
                    onRetry={() => window.location.reload()}
                />
            );
        if (classes.length === 0)
            return (
                <div className="flex flex-col items-center py-12 text-text-muted">
                    <FaInbox className="w-12 h-12 mb-4" />
                    <p className="text-sm">Belum ada kelas yang terdaftar</p>
                </div>
            );

        return (
            <div className="flex flex-col gap-5">
                {/* Class selector */}
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-text-secondary whitespace-nowrap">
                        Pilih Kelas:
                    </label>
                    <div className="relative">
                        <select
                            value={selectedClassId ?? ""}
                            onChange={(e) =>
                                setSelectedClassId(Number(e.target.value))
                            }
                            className="w-48 h-10 px-3 py-[9px] bg-surface border border-border rounded-md text-xs text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
                        >
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name} ({cls.total_siswa} siswa)
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg
                                className="w-3 h-3 text-text-muted"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                        <Badge variant="success" size="md">
                            {selectedClass?.total_siswa ?? 0} Siswa
                        </Badge>
                        <span className="text-xs text-text-muted">
                            Wali Kelas: {selectedClass?.wali_kelas ?? "-"}
                        </span>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-surface rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-background border-b border-border">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-12">
                                    No
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                    NIS
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                    Nama Siswa
                                </th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-24">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {!selectedClass ||
                            selectedClass.students.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-12">
                                        <div className="flex flex-col items-center py-12 text-text-muted">
                                            <FaInbox className="w-12 h-12 mb-4" />
                                            <p className="text-sm">
                                                Belum ada siswa di kelas ini
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                selectedClass.students.map((student, index) => (
                                    <tr
                                        key={student.id}
                                        className="hover:bg-background/50 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-text-muted text-sm">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-3 text-text-primary text-sm font-mono">
                                            {student.nis}
                                        </td>
                                        <td className="px-4 py-3 text-text-primary text-sm font-medium">
                                            {student.nama}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Button
                                                variant="delete"
                                                size="sm"
                                                icon={FaTrash}
                                                onClick={() =>
                                                    handleRemoveStudent(
                                                        student.id,
                                                    )
                                                }
                                            >
                                                Hapus
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Add student button */}
                <div className="flex justify-end">
                    <Button
                        variant="add"
                        size="md"
                        icon={FaPlus}
                        onClick={() => setShowModal(true)}
                    >
                        Tambah Siswa
                    </Button>
                </div>
            </div>
        );
    };

    /* ---------- Add Student Modal ---------- */
    const AddStudentModal = () => {
        if (!showModal) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Overlay */}
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={() => setShowModal(false)}
                />

                {/* Modal */}
                <div className="relative bg-surface rounded-xl border border-border shadow-lg w-full max-w-md p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-bold text-text-primary">
                            Tambah Siswa
                        </h3>
                        <button
                            onClick={() => setShowModal(false)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-background transition-colors"
                        >
                            <FaTimes className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <form
                        onSubmit={handleAddStudent}
                        className="flex flex-col gap-4"
                    >
                        <div>
                            <label className="text-xs font-medium text-text-secondary mb-1 block">
                                Kelas Tujuan
                            </label>
                            <p className="text-sm font-bold text-text-primary">
                                {selectedClass?.name ?? "-"}
                            </p>
                        </div>

                        <Input
                            label="NIS Siswa"
                            placeholder="Masukkan NIS siswa"
                            icon={FaSearch}
                            value={newNis}
                            onChange={(e) => setNewNis(e.target.value)}
                            required
                        />

                        <div className="flex items-center gap-3 justify-end mt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="md"
                                onClick={() => setShowModal(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                icon={FaCheck}
                            >
                                Tambahkan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <>
            <Head title="Enrolment Kelas" />

            {/* ===== Mobile Layout ===== */}
            <div className="lg:hidden flex flex-col gap-4">
                <h1 className="text-lg font-bold text-text-primary">
                    Enrolment Kelas
                </h1>
                <MobileClassCards />
            </div>

            {/* ===== Desktop Layout ===== */}
            <div className="hidden lg:block">
                <DesktopView />
            </div>

            {/* ===== Modal (shared) ===== */}
            <AddStudentModal />
        </>
    );
}

EnrolmentKelas.layout = (page: React.ReactNode) => (
    <AdminLayout
        title="Enrolment Kelas"
        user={{ name: "Admin SMAUII", email: "admin@smauii.sch.id" }}
    >
        {page}
    </AdminLayout>
);
