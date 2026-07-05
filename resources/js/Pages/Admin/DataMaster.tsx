import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Button,
    Table,
    Pagination,
    LoadingSkeleton,
    ErrorState,
    StatusBadge,
} from "@/Components/ui/index";
import {
    FaDatabase,
    FaPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaUserGraduate,
    FaChalkboardTeacher,
    FaUserTie,
    FaSchool,
    FaEye,
    FaInbox,
} from "react-icons/fa";

type TabType = "siswa" | "guru" | "wali" | "kelas";

interface DataItem {
    id: number;
    nama: string;
    nis?: string;
    nip?: string;
    kelas?: string;
    jenis_kelamin: string;
    status: string;
}

interface Column {
    key: string;
    label: string;
    render?: (value: any, row: DataItem) => React.ReactNode;
}

const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
    { key: "siswa", label: "Siswa", icon: FaUserGraduate },
    { key: "guru", label: "Guru", icon: FaChalkboardTeacher },
    { key: "wali", label: "Wali Murid", icon: FaUserTie },
    { key: "kelas", label: "Kelas", icon: FaSchool },
];

const mockData: Record<TabType, DataItem[]> = {
    siswa: [
        {
            id: 1,
            nama: "Ahmad Fauzi",
            nis: "2426001",
            kelas: "X-A",
            jenis_kelamin: "L",
            status: "active",
        },
        {
            id: 2,
            nama: "Siti Nurhaliza",
            nis: "2426002",
            kelas: "X-B",
            jenis_kelamin: "P",
            status: "active",
        },
        {
            id: 3,
            nama: "Budi Santoso",
            nis: "2426003",
            kelas: "XI-A",
            jenis_kelamin: "L",
            status: "active",
        },
        {
            id: 4,
            nama: "Dewi Lestari",
            nis: "2426004",
            kelas: "X-A",
            jenis_kelamin: "P",
            status: "active",
        },
        {
            id: 5,
            nama: "Rizky Pratama",
            nis: "2426005",
            kelas: "XII-A",
            jenis_kelamin: "L",
            status: "inactive",
        },
        {
            id: 6,
            nama: "Ani Rahmawati",
            nis: "2426006",
            kelas: "XI-B",
            jenis_kelamin: "P",
            status: "active",
        },
        {
            id: 7,
            nama: "Fajar Hidayat",
            nis: "2426007",
            kelas: "X-B",
            jenis_kelamin: "L",
            status: "active",
        },
        {
            id: 8,
            nama: "Citra Ayu Kusuma",
            nis: "2426008",
            kelas: "XII-B",
            jenis_kelamin: "P",
            status: "active",
        },
        {
            id: 9,
            nama: "Dimas Ardiansyah",
            nis: "2426009",
            kelas: "XI-A",
            jenis_kelamin: "L",
            status: "inactive",
        },
        {
            id: 10,
            nama: "Rina Marlina",
            nis: "2426010",
            kelas: "X-A",
            jenis_kelamin: "P",
            status: "active",
        },
    ],
    guru: [
        {
            id: 11,
            nama: "Dra. Sri Wahyuni",
            nip: "196805142007012001",
            kelas: "-",
            jenis_kelamin: "P",
            status: "active",
        },
        {
            id: 12,
            nama: "Drs. Supriyadi",
            nip: "196907152008011002",
            kelas: "-",
            jenis_kelamin: "L",
            status: "active",
        },
        {
            id: 13,
            nama: "Fitriani, S.Pd.",
            nip: "198203102009022003",
            kelas: "-",
            jenis_kelamin: "P",
            status: "inactive",
        },
    ],
    wali: [
        {
            id: 14,
            nama: "H. Ahmad Rofi'i",
            kelas: "Wali dari: Ahmad Fauzi",
            jenis_kelamin: "L",
            status: "active",
        },
        {
            id: 15,
            nama: "Hj. Siti Maemunah",
            kelas: "Wali dari: Siti Nurhaliza",
            jenis_kelamin: "P",
            status: "active",
        },
    ],
    kelas: [
        {
            id: 16,
            nama: "X-A",
            kelas: "Wali Kelas: Dra. Sri Wahyuni",
            jenis_kelamin: "-",
            status: "active",
        },
        {
            id: 17,
            nama: "X-B",
            kelas: "Wali Kelas: Drs. Supriyadi",
            jenis_kelamin: "-",
            status: "active",
        },
        {
            id: 18,
            nama: "XI-A",
            kelas: "Wali Kelas: Fitriani, S.Pd.",
            jenis_kelamin: "-",
            status: "active",
        },
        {
            id: 19,
            nama: "XI-B",
            kelas: "Wali Kelas: -",
            jenis_kelamin: "-",
            status: "inactive",
        },
        {
            id: 20,
            nama: "XII-A",
            kelas: "Wali Kelas: -",
            jenis_kelamin: "-",
            status: "active",
        },
        {
            id: 21,
            nama: "XII-B",
            kelas: "Wali Kelas: -",
            jenis_kelamin: "-",
            status: "active",
        },
    ],
};

export default function DataMaster() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>("siswa");
    const [searchQuery, setSearchQuery] = useState("");
    const [data, setData] = useState<DataItem[]>([]);

    useEffect(() => {
        setLoading(true);
        setError(null);

        setTimeout(() => {
            setData(mockData[activeTab]);
            setLoading(false);
        }, 400);
    }, [activeTab]);

    // Filter data by search
    const filteredData = data.filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            item.nama.toLowerCase().includes(q) ||
            (item.nis && item.nis.toLowerCase().includes(q)) ||
            (item.nip && item.nip.toLowerCase().includes(q)) ||
            (item.kelas && item.kelas.toLowerCase().includes(q))
        );
    });

    const getIdentityLabel = (item: DataItem) => {
        if (item.nis) return `NIS: ${item.nis}`;
        if (item.nip) return `NIP: ${item.nip}`;
        return "-";
    };

    const getSubtitle = (item: DataItem) => {
        if (activeTab === "kelas") return item.kelas ?? "-";
        if (item.kelas) return `Kelas: ${item.kelas}`;
        return item.kelas ?? "-";
    };

    // Desktop columns
    const desktopColumns: Column[] = [
        {
            key: "index",
            label: "No",
            render: (_: any, __: DataItem, i?: number) => (
                <span>{(i ?? 0) + 1}</span>
            ),
        },
        {
            key: "identity",
            label: "Nama / NIS",
            render: (_: any, row: DataItem) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-text-primary">
                        {row.nama}
                    </span>
                    <span className="text-xs text-text-muted">
                        {getIdentityLabel(row)}
                    </span>
                </div>
            ),
        },
        {
            key: "kelas",
            label: activeTab === "kelas" ? "Wali Kelas" : "Kelas / NIP",
            render: (_: any, row: DataItem) => (
                <span className="text-sm text-text-secondary">
                    {getSubtitle(row)}
                </span>
            ),
        },
        {
            key: "jenis_kelamin",
            label: "Jenis Kelamin",
            render: (_: any, row: DataItem) => (
                <span className="text-sm text-text-secondary">
                    {row.jenis_kelamin === "L"
                        ? "Laki-laki"
                        : row.jenis_kelamin === "P"
                          ? "Perempuan"
                          : "-"}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (_: any, row: DataItem) => (
                <StatusBadge status={row.status} />
            ),
        },
        {
            key: "aksi",
            label: "Aksi",
            render: (_: any, row: DataItem) => (
                <div className="flex items-center gap-2">
                    <Button variant="detail" size="sm" icon={FaEye} />
                    <Button variant="edit" size="sm" icon={FaEdit} />
                    <Button variant="delete" size="sm" icon={FaTrash} />
                </div>
            ),
        },
    ];

    // Fix: render needs index — wrap Table with a custom render for No column
    const enrichedColumns = desktopColumns.map((col) => {
        if (col.key === "index") {
            return {
                ...col,
                render: (_: any, __: DataItem, index?: number) => (
                    <span>{(index ?? 0) + 1}</span>
                ),
            };
        }
        return col;
    });

    // For mobile card list — different column setup since we render cards
    const MobileCardList = () => {
        if (loading) return <LoadingSkeleton />;
        if (error)
            return (
                <ErrorState
                    message={error}
                    onRetry={() => window.location.reload()}
                />
            );
        if (filteredData.length === 0)
            return (
                <div className="flex flex-col items-center py-12 text-text-muted">
                    <FaInbox className="w-12 h-12 mb-4" />
                    <p className="text-sm">
                        Tidak ada data {activeTab} ditemukan
                    </p>
                </div>
            );

        return (
            <div className="flex flex-col gap-3">
                {filteredData.map((item) => (
                    <div
                        key={item.id}
                        className="bg-surface rounded-lg border border-border p-4"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold text-text-primary">
                                    {item.nama}
                                </span>
                                <span className="text-xs text-text-muted">
                                    {activeTab === "kelas"
                                        ? item.kelas
                                        : getIdentityLabel(item)}
                                </span>
                                <span className="text-xs text-text-muted">
                                    {getSubtitle(item)}
                                </span>
                            </div>
                            <StatusBadge status={item.status} />
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                            <Button variant="detail" size="sm" icon={FaEye}>
                                Detail
                            </Button>
                            <Button variant="edit" size="sm" icon={FaEdit}>
                                Edit
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <Head title="Data Master" />

            {/* ===== Mobile Layout ===== */}
            <div className="lg:hidden flex flex-col gap-4">
                {/* Title */}
                <h1 className="text-lg font-bold text-text-primary">
                    Data Master
                </h1>

                {/* Search */}
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Cari data..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 py-[11px] bg-surface border border-border rounded-md text-xs text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>

                {/* Tab filter */}
                <div className="flex overflow-x-auto gap-2 pb-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setActiveTab(tab.key);
                                setSearchQuery("");
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                                activeTab === tab.key
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-surface text-text-muted border border-border hover:text-text-secondary"
                            }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Card list */}
                <MobileCardList />
            </div>

            {/* ===== Desktop Layout ===== */}
            <div className="hidden lg:flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-bold text-text-primary">
                            Data Master
                        </h1>
                        {/* Tab filter inline */}
                        <div className="flex items-center gap-1 ml-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => {
                                        setActiveTab(tab.key);
                                        setSearchQuery("");
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                        activeTab === tab.key
                                            ? "bg-primary text-white shadow-sm"
                                            : "text-text-muted hover:text-text-secondary"
                                    }`}
                                >
                                    <tab.icon className="w-3 h-3" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button variant="add" size="md" icon={FaPlus}>
                        Tambah Data Baru
                    </Button>
                </div>

                {/* Search + actions */}
                <div className="flex items-center justify-between">
                    <div className="relative w-72">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nama, NIS, atau NIP..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-9 pr-3 py-[11px] bg-surface border border-border rounded-md text-xs text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="filter" size="sm" icon={FaSearch}>
                            Filter
                        </Button>
                        <Button variant="import" size="sm">
                            Export
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-surface rounded-lg border border-border overflow-hidden">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : error ? (
                        <ErrorState
                            message={error}
                            onRetry={() => window.location.reload()}
                        />
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-background border-b border-border">
                                    {desktopColumns.map((col) => (
                                        <th
                                            key={col.key}
                                            className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider"
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-surface divide-y divide-border">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={desktopColumns.length}
                                            className="px-4 py-12"
                                        >
                                            <div className="flex flex-col items-center py-12 text-text-muted">
                                                <FaInbox className="w-12 h-12 mb-4" />
                                                <p className="text-sm">
                                                    Tidak ada data {activeTab}{" "}
                                                    ditemukan
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-background/50 transition-colors"
                                        >
                                            {desktopColumns.map((col) => (
                                                <td
                                                    key={col.key}
                                                    className="px-4 py-3 text-text-primary"
                                                >
                                                    {col.key === "index" ? (
                                                        index + 1
                                                    ) : col.key ===
                                                      "identity" ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-text-primary">
                                                                {item.nama}
                                                            </span>
                                                            <span className="text-xs text-text-muted">
                                                                {getIdentityLabel(
                                                                    item,
                                                                )}
                                                            </span>
                                                        </div>
                                                    ) : col.key === "kelas" ? (
                                                        <span className="text-sm text-text-secondary">
                                                            {getSubtitle(item)}
                                                        </span>
                                                    ) : col.key ===
                                                      "jenis_kelamin" ? (
                                                        <span className="text-sm text-text-secondary">
                                                            {item.jenis_kelamin ===
                                                            "L"
                                                                ? "Laki-laki"
                                                                : item.jenis_kelamin ===
                                                                    "P"
                                                                  ? "Perempuan"
                                                                  : "-"}
                                                        </span>
                                                    ) : col.key === "status" ? (
                                                        <StatusBadge
                                                            status={item.status}
                                                        />
                                                    ) : col.key === "aksi" ? (
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="detail"
                                                                size="sm"
                                                                icon={FaEye}
                                                            />
                                                            <Button
                                                                variant="edit"
                                                                size="sm"
                                                                icon={FaEdit}
                                                            />
                                                            <Button
                                                                variant="delete"
                                                                size="sm"
                                                                icon={FaTrash}
                                                            />
                                                        </div>
                                                    ) : null}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}

DataMaster.layout = (page: React.ReactNode) => (
    <AdminLayout
        title="Data Master"
        user={{ name: "Admin SMAUII", email: "admin@smauii.sch.id" }}
    >
        {page}
    </AdminLayout>
);
