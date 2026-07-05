import { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Button,
    Input,
    Table,
    EmptyState,
    ErrorState,
    LoadingSkeleton,
} from "@/Components/ui/index";
import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";

interface Kelas {
    id: number;
    nama: string;
    tingkat: string;
    waliKelas: string;
    jumlahSiswa: number;
}

const mockKelas: Kelas[] = [
    {
        id: 1,
        nama: "X-A",
        tingkat: "X",
        waliKelas: "Dra. Siti Aminah",
        jumlahSiswa: 32,
    },
    {
        id: 2,
        nama: "X-B",
        tingkat: "X",
        waliKelas: "Budi Hartono, S.Pd.",
        jumlahSiswa: 30,
    },
    {
        id: 3,
        nama: "XI-A",
        tingkat: "XI",
        waliKelas: "Dr. Ahmad Rifai",
        jumlahSiswa: 28,
    },
    {
        id: 4,
        nama: "XI-B",
        tingkat: "XI",
        waliKelas: "Rina Wijaya, S.Pd.",
        jumlahSiswa: 31,
    },
    {
        id: 5,
        nama: "XII-A",
        tingkat: "XII",
        waliKelas: "Prof. Dr. H. Hasan",
        jumlahSiswa: 27,
    },
    {
        id: 6,
        nama: "XII-B",
        tingkat: "XII",
        waliKelas: "Nurul Huda, S.Pd.",
        jumlahSiswa: 29,
    },
];

const columnClasses = [
    { key: "no", label: "No" },
    { key: "nama", label: "Nama Kelas" },
    { key: "tingkat", label: "Tingkat" },
    { key: "waliKelas", label: "Wali Kelas" },
    { key: "jumlahSiswa", label: "Jumlah Siswa" },
    {
        key: "aksi",
        label: "Aksi",
        render: (_: unknown, row: Kelas) => (
            <div className="flex items-center gap-2">
                <Button
                    variant="edit"
                    size="sm"
                    icon={FaEdit}
                    onClick={() => handleEdit(row)}
                >
                    Edit
                </Button>
                <Button
                    variant="delete"
                    size="sm"
                    icon={FaTrash}
                    onClick={() => handleHapus(row)}
                >
                    Hapus
                </Button>
            </div>
        ),
    },
];

function handleEdit(row: Kelas) {
    alert(`Edit kelas: ${row.nama}`);
}

function handleHapus(row: Kelas) {
    alert(`Hapus kelas: ${row.nama}`);
}

export default function MasterKelas() {
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [kelas, setKelas] = useState<Kelas[]>([]);

    useEffect(() => {
        simulateFetch();
    }, []);

    function simulateFetch() {
        setLoading(true);
        setError(null);

        setTimeout(() => {
            setKelas(mockKelas);
            setLoading(false);
        }, 600);
    }

    function handleTambah() {
        alert("Tambah kelas baru");
    }

    const filtered = kelas.filter(
        (k) =>
            k.nama.toLowerCase().includes(search.toLowerCase()) ||
            k.waliKelas.toLowerCase().includes(search.toLowerCase()) ||
            k.tingkat.toLowerCase().includes(search.toLowerCase()),
    );

    const tableData = filtered.map((k, idx) => ({ ...k, no: idx + 1 }));

    const tingkatBadge = (tingkat: string) => {
        const colors: Record<string, string> = {
            X: "bg-primary/10 text-primary",
            XI: "bg-amber-100 text-amber-600",
            XII: "bg-success/10 text-success",
        };
        return (
            <span
                className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md ${colors[tingkat] ?? "bg-background text-text-muted"}`}
            >
                {tingkat}
            </span>
        );
    };

    return (
        <AdminLayout title="Master Kelas">
            <Head title="Master Kelas" />

            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                <div className="w-full md:w-64">
                    <Input
                        placeholder="Cari kelas atau wali kelas..."
                        icon={FaSearch}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button
                    variant="add"
                    size="md"
                    icon={FaPlus}
                    onClick={handleTambah}
                >
                    Tambah Kelas Baru
                </Button>
            </div>

            {/* Content */}
            {loading ? (
                <LoadingSkeleton />
            ) : error ? (
                <ErrorState message={error} onRetry={simulateFetch} />
            ) : filtered.length === 0 ? (
                <EmptyState
                    title={
                        search
                            ? "Kelas tidak ditemukan"
                            : "Belum ada data kelas"
                    }
                />
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                        <Table columns={columnClasses} data={tableData} />
                    </div>

                    {/* Mobile Card List */}
                    <div className="md:hidden space-y-3">
                        {filtered.map((k) => (
                            <div
                                key={k.id}
                                className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-sm text-text-primary">
                                        {k.nama}
                                    </span>
                                    {tingkatBadge(k.tingkat)}
                                </div>
                                <div className="flex flex-col gap-1 text-xs text-text-secondary">
                                    <span>
                                        <span className="text-text-muted">
                                            Wali Kelas:
                                        </span>{" "}
                                        {k.waliKelas}
                                    </span>
                                    <span>
                                        <span className="text-text-muted">
                                            Jumlah Siswa:
                                        </span>{" "}
                                        {k.jumlahSiswa}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 pt-1 border-t border-border">
                                    <Button
                                        variant="edit"
                                        size="sm"
                                        icon={FaEdit}
                                        onClick={() => handleEdit(k)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="delete"
                                        size="sm"
                                        icon={FaTrash}
                                        onClick={() => handleHapus(k)}
                                    >
                                        Hapus
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
