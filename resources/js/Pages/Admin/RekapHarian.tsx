import { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Button,
    StatCard,
    StatusBadge,
    Table,
    EmptyState,
    ErrorState,
    LoadingSkeleton,
} from "@/Components/ui/index";
import {
    FaDownload,
    FaUsers,
    FaCheck,
    FaTimes,
    FaFileAlt,
} from "react-icons/fa";

interface Siswa {
    id: number;
    nama: string;
    kelas: string;
    jamMasuk: string;
    jamKeluar: string;
    status: string;
}

interface Summary {
    totalHadir: number;
    totalTidakHadir: number;
    totalIzin: number;
    totalSakit: number;
}

const mockSiswa: Siswa[] = [
    {
        id: 1,
        nama: "Ahmad Fauzi",
        kelas: "X-A",
        jamMasuk: "07:15",
        jamKeluar: "15:30",
        status: "present",
    },
    {
        id: 2,
        nama: "Budi Santoso",
        kelas: "X-A",
        jamMasuk: "07:30",
        jamKeluar: "15:30",
        status: "present",
    },
    {
        id: 3,
        nama: "Citra Dewi",
        kelas: "X-A",
        jamMasuk: "07:45",
        jamKeluar: "15:30",
        status: "late",
    },
    {
        id: 4,
        nama: "Dian Permata",
        kelas: "X-B",
        jamMasuk: "-",
        jamKeluar: "-",
        status: "absent",
    },
    {
        id: 5,
        nama: "Eko Prasetyo",
        kelas: "X-B",
        jamMasuk: "-",
        jamKeluar: "-",
        status: "sick",
    },
    {
        id: 6,
        nama: "Fitri Handayani",
        kelas: "XI-A",
        jamMasuk: "-",
        jamKeluar: "-",
        status: "permit",
    },
    {
        id: 7,
        nama: "Gilang Ramadhan",
        kelas: "XI-A",
        jamMasuk: "07:10",
        jamKeluar: "15:30",
        status: "present",
    },
    {
        id: 8,
        nama: "Hana Safira",
        kelas: "XI-B",
        jamMasuk: "07:20",
        jamKeluar: "15:30",
        status: "present",
    },
];

const mockSummary: Summary = {
    totalHadir: 6,
    totalTidakHadir: 1,
    totalIzin: 1,
    totalSakit: 1,
};

function getTodayDate() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function formatDateDisplay(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

const statusMap: Record<string, string> = {
    present: "present",
    late: "late",
    absent: "absent",
    sick: "sick",
    permit: "permit",
};

function getStatusKey(status: string): string {
    return statusMap[status] ?? "absent";
}

export default function RekapHarian() {
    const [tanggal, setTanggal] = useState(getTodayDate());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [siswa, setSiswa] = useState<Siswa[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);

    useEffect(() => {
        simulateFetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function simulateFetch() {
        setLoading(true);
        setError(null);

        setTimeout(() => {
            setSummary(mockSummary);
            setSiswa(mockSiswa);
            setLoading(false);
        }, 600);
    }

    function handleFilter() {
        setLoading(true);
        setError(null);

        setTimeout(() => {
            setSummary(mockSummary);
            setSiswa(mockSiswa);
            setLoading(false);
        }, 400);
    }

    function handleEkspor() {
        alert("Mengunduh rekap harian...");
    }

    const columns = [
        {
            key: "no",
            label: "No",
            render: (_: unknown, __: unknown, idx?: number) => (idx ?? 0) + 1,
        },
        { key: "nama", label: "Nama" },
        { key: "kelas", label: "Kelas" },
        { key: "jamMasuk", label: "Jam Masuk" },
        { key: "jamKeluar", label: "Jam Keluar" },
        {
            key: "status",
            label: "Status",
            render: (value: string) => {
                const statusKey = getStatusKey(value);
                const labelMap: Record<string, string> = {
                    present: "Hadir",
                    late: "Terlambat",
                    absent: "Alpha",
                    sick: "Sakit",
                    permit: "Izin",
                };
                return <StatusBadge status={statusKey} />;
            },
        },
    ];

    // Re-map for table rendering with index
    const tableData = siswa.map((s, idx) => ({ ...s, no: idx + 1 }));

    return (
        <AdminLayout title="Rekap Harian">
            <Head title="Rekap Harian" />

            {/* Date Filter */}
            <div className="flex flex-col md:flex-row md:items-end gap-3 mb-6">
                <div className="w-full md:w-auto md:min-w-[240px]">
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                        Tanggal
                    </label>
                    <input
                        type="date"
                        value={tanggal}
                        onChange={(e) => setTanggal(e.target.value)}
                        className="w-full h-10 px-3 bg-surface border border-border-input rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
                <Button variant="primary" size="md" onClick={handleFilter}>
                    Tampilkan
                </Button>
                {tanggal && (
                    <p className="text-xs text-text-muted mt-1 md:mt-0 md:ml-2 md:self-center">
                        {formatDateDisplay(tanggal)}
                    </p>
                )}
            </div>

            {/* Summary — Mobile 2x2 grid, Desktop row */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-24 bg-background animate-pulse rounded-lg"
                        />
                    ))}
                </div>
            ) : error ? null : summary ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <StatCard
                        title="Total Hadir"
                        value={summary.totalHadir}
                        icon={FaCheck}
                        color="success"
                    />
                    <StatCard
                        title="Tidak Hadir"
                        value={summary.totalTidakHadir}
                        icon={FaTimes}
                        color="danger"
                    />
                    <StatCard
                        title="Izin"
                        value={summary.totalIzin}
                        icon={FaFileAlt}
                        color="accent"
                    />
                    <StatCard
                        title="Sakit"
                        value={summary.totalSakit}
                        icon={FaUsers}
                        color="warning"
                    />
                </div>
            ) : null}

            {/* Ekspor Button */}
            <div className="flex justify-end mb-4">
                <Button
                    variant="import"
                    size="sm"
                    icon={FaDownload}
                    onClick={handleEkspor}
                >
                    Ekspor
                </Button>
            </div>

            {/* Content */}
            {loading ? (
                <LoadingSkeleton />
            ) : error ? (
                <ErrorState message={error} onRetry={simulateFetch} />
            ) : siswa.length === 0 ? (
                <EmptyState title="Belum ada data rekap harian" />
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                        <Table columns={columns} data={tableData} />
                    </div>

                    {/* Mobile Card List */}
                    <div className="md:hidden space-y-3">
                        {siswa.map((s) => {
                            const statusKey = getStatusKey(s.status);
                            const labelMap: Record<string, string> = {
                                present: "Hadir",
                                late: "Terlambat",
                                absent: "Alpha",
                                sick: "Sakit",
                                permit: "Izin",
                            };
                            return (
                                <div
                                    key={s.id}
                                    className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm text-text-primary">
                                            {s.nama}
                                        </span>
                                        <StatusBadge status={statusKey} />
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                                        <span>{s.kelas}</span>
                                        {s.status === "present" ||
                                        s.status === "late" ? (
                                            <>
                                                <span className="flex items-center gap-1">
                                                    <span className="text-text-muted">
                                                        Masuk:
                                                    </span>{" "}
                                                    {s.jamMasuk}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="text-text-muted">
                                                        Keluar:
                                                    </span>{" "}
                                                    {s.jamKeluar}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-text-muted">
                                                -
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
