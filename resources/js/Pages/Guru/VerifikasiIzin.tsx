import { useState, useEffect } from "react";
import {
    FaCheck,
    FaTimes,
    FaEye,
    FaPaperclip,
    FaCalendarAlt,
    FaUserGraduate,
    FaFileImage,
} from "react-icons/fa";
import GuruLayout from "@/Layouts/GuruLayout";
import {
    Button,
    StatusBadge,
    TabSwitcher,
    Pagination,
    EmptyState,
    ErrorState,
} from "@/Components/ui/index";

/* ===== Types ===== */
type TabKey = "all" | "pending" | "approved" | "rejected";

interface LeaveRequest {
    id: number;
    studentName: string;
    class: string;
    startDate: string;
    endDate: string;
    type: "izin" | "sakit";
    typeLabel: string;
    description: string;
    attachment: string | null;
    status: "pending" | "approved" | "rejected";
}

/* ===== Mock Data ===== */
const initialRequests: LeaveRequest[] = [
    {
        id: 1,
        studentName: "Ahmad Reza Pahlevi",
        class: "X-A",
        startDate: "10 Jun 2026",
        endDate: "12 Jun 2026",
        type: "sakit",
        typeLabel: "SAKIT",
        description:
            "Demam tinggi, tidak bisa masuk sekolah. Sudah diperiksa dokter dan dianjurkan istirahat 3 hari.",
        attachment: "surat_dokter.pdf",
        status: "pending",
    },
    {
        id: 2,
        studentName: "Siti Nurhaliza",
        class: "X-A",
        startDate: "15 Jun 2026",
        endDate: "15 Jun 2026",
        type: "izin",
        typeLabel: "IZIN",
        description: "Ada acara keluarga (pernikahan kakak)",
        attachment: null,
        status: "pending",
    },
    {
        id: 3,
        studentName: "Budi Santoso",
        class: "X-B",
        startDate: "08 Jun 2026",
        endDate: "08 Jun 2026",
        type: "sakit",
        typeLabel: "SAKIT",
        description: "Sakit perut, tidak bisa hadir",
        attachment: null,
        status: "approved",
    },
    {
        id: 4,
        studentName: "Dewi Lestari",
        class: "X-A",
        startDate: "05 Jun 2026",
        endDate: "05 Jun 2026",
        type: "izin",
        typeLabel: "IZIN",
        description: "Izin mengikuti lomba OSN tingkat kota",
        attachment: "surat_lomba.pdf",
        status: "rejected",
    },
    {
        id: 5,
        studentName: "Rudi Hermawan",
        class: "X-A",
        startDate: "02 Jun 2026",
        endDate: "04 Jun 2026",
        type: "sakit",
        typeLabel: "SAKIT",
        description: "Demam berdarah, rawat inap",
        attachment: "surat_rs.pdf",
        status: "approved",
    },
    {
        id: 6,
        studentName: "Ani Safitri",
        class: "X-B",
        startDate: "12 Jun 2026",
        endDate: "12 Jun 2026",
        type: "izin",
        typeLabel: "IZIN",
        description: "Keperluan keluarga mendadak",
        attachment: null,
        status: "pending",
    },
];

const tabs = [
    { key: "all" as TabKey, label: "Semua" },
    { key: "pending" as TabKey, label: "Menunggu" },
    { key: "approved" as TabKey, label: "Disetujui" },
    { key: "rejected" as TabKey, label: "Ditolak" },
];

export default function VerifikasiIzin() {
    const [activeTab, setActiveTab] = useState<TabKey>("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [requests, setRequests] = useState<LeaveRequest[]>([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setRequests(initialRequests);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleApprove = (id: number) => {
        setActionLoading(id);
        setTimeout(() => {
            setRequests((prev) =>
                prev.map((r) =>
                    r.id === id ? { ...r, status: "approved" as const } : r,
                ),
            );
            setActionLoading(null);
        }, 1000);
    };

    const handleReject = (id: number) => {
        setActionLoading(id);
        setTimeout(() => {
            setRequests((prev) =>
                prev.map((r) =>
                    r.id === id ? { ...r, status: "rejected" as const } : r,
                ),
            );
            setActionLoading(null);
        }, 1000);
    };

    const filteredRequests =
        activeTab === "all"
            ? requests
            : requests.filter((r) => r.status === activeTab);

    const pendingCount = requests.filter((r) => r.status === "pending").length;

    const paginationLinks = [
        { url: "#", label: "pagination.previous", active: false },
        { url: "#", label: "1", active: true },
        { url: "#", label: "2", active: false },
        { url: "#", label: "pagination.next", active: false },
    ];

    /* ===== Loading ===== */
    if (loading) {
        return (
            <GuruLayout title="Verifikasi Izin & Sakit">
                <div className="flex gap-3 mb-4">
                    <div className="h-10 w-40 bg-surface animate-pulse rounded-lg border border-border" />
                    <div className="h-10 w-40 bg-surface animate-pulse rounded-lg border border-border" />
                </div>
                <div className="h-10 bg-surface animate-pulse rounded-lg border border-border mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-20 bg-surface animate-pulse rounded-lg border border-border"
                        />
                    ))}
                </div>
            </GuruLayout>
        );
    }

    /* ===== Error ===== */
    if (error) {
        return (
            <GuruLayout title="Verifikasi Izin & Sakit">
                <ErrorState
                    message={error}
                    onRetry={() => {
                        setError(null);
                        setLoading(true);
                        setTimeout(() => {
                            setRequests(initialRequests);
                            setLoading(false);
                        }, 800);
                    }}
                />
            </GuruLayout>
        );
    }

    return (
        <GuruLayout title="Verifikasi Izin & Sakit">
            {/* Header Stats */}
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-surface rounded-lg border border-border px-4 py-2 flex items-center gap-2">
                    <span className="text-xs text-text-muted">
                        Menunggu Verifikasi:
                    </span>
                    <span className="text-sm font-bold text-amber-600">
                        {pendingCount}
                    </span>
                </div>
                <div className="bg-surface rounded-lg border border-border px-4 py-2 flex items-center gap-2">
                    <span className="text-xs text-text-muted">
                        Total Pengajuan:
                    </span>
                    <span className="text-sm font-bold text-text-primary">
                        {requests.length}
                    </span>
                </div>
            </div>

            {/* TabSwitcher */}
            <div className="mb-4">
                <TabSwitcher
                    tabs={tabs.map((t) => ({
                        key: t.key,
                        label: t.label,
                        count: t.key === "pending" ? pendingCount : undefined,
                    }))}
                    activeTab={activeTab}
                    onChange={(key) => setActiveTab(key as TabKey)}
                />
            </div>

            {/* ===== Desktop: Table ===== */}
            <div className="hidden md:block bg-surface rounded-lg border border-border overflow-hidden">
                {filteredRequests.length === 0 ? (
                    <div className="p-4">
                        <EmptyState
                            title="Tidak Ada Pengajuan"
                            description="Tidak ada pengajuan izin atau sakit."
                        />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-background border-b border-border">
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
                                            No
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
                                            Nama
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
                                            Kelas
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
                                            Tanggal
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
                                            Jenis
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
                                            Keterangan
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase">
                                            Status
                                        </th>
                                        <th className="text-center px-4 py-3 text-xs font-semibold text-text-muted uppercase">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-border">
                                    {filteredRequests.map((request, idx) => (
                                        <tr
                                            key={request.id}
                                            className="hover:bg-background/50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-text-primary text-xs">
                                                {idx + 1}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs font-semibold text-text-primary">
                                                    {request.studentName}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-text-secondary text-xs">
                                                {request.class}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-text-secondary">
                                                    {request.startDate}
                                                    {request.endDate !==
                                                    request.startDate
                                                        ? ` — ${request.endDate}`
                                                        : ""}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                        request.type === "sakit"
                                                            ? "bg-danger/10 text-danger border border-danger/20"
                                                            : "bg-primary/10 text-primary border border-primary/20"
                                                    }`}
                                                >
                                                    {request.typeLabel}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <p
                                                        className="text-xs text-text-secondary max-w-[180px] truncate"
                                                        title={
                                                            request.description
                                                        }
                                                    >
                                                        {request.description}
                                                    </p>
                                                    {request.attachment && (
                                                        <button
                                                            title="Lihat lampiran"
                                                            className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                                                        >
                                                            <FaPaperclip className="w-3 h-3" />
                                                            <span className="text-[10px]">
                                                                Surat
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge
                                                    status={request.status}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    {request.status ===
                                                    "pending" ? (
                                                        <>
                                                            <Button
                                                                variant="detail"
                                                                size="sm"
                                                                icon={FaCheck}
                                                                loading={
                                                                    actionLoading ===
                                                                    request.id
                                                                }
                                                                onClick={() =>
                                                                    handleApprove(
                                                                        request.id,
                                                                    )
                                                                }
                                                            >
                                                                Setujui
                                                            </Button>
                                                            <Button
                                                                variant="delete"
                                                                size="sm"
                                                                icon={FaTimes}
                                                                loading={
                                                                    actionLoading ===
                                                                    request.id
                                                                }
                                                                onClick={() =>
                                                                    handleReject(
                                                                        request.id,
                                                                    )
                                                                }
                                                            >
                                                                Tolak
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            variant="detail"
                                                            size="sm"
                                                            icon={FaEye}
                                                        >
                                                            Detail
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-border">
                            <Pagination links={paginationLinks} />
                        </div>
                    </>
                )}
            </div>

            {/* ===== Mobile: Card List ===== */}
            <div className="md:hidden space-y-3">
                {filteredRequests.length === 0 ? (
                    <EmptyState
                        title="Tidak Ada Pengajuan"
                        description="Tidak ada pengajuan izin atau sakit."
                    />
                ) : (
                    filteredRequests.map((request) => (
                        <div
                            key={request.id}
                            className="bg-surface rounded-lg border border-border p-4"
                        >
                            {/* Header */}
                            {/* Image placeholder + info row */}
                            <div className="flex gap-3 mb-3">
                                {/* Image placeholder (120x120) */}
                                <div className="w-[120px] h-[120px] shrink-0 bg-background border border-border rounded-lg flex flex-col items-center justify-center">
                                    <FaFileImage className="w-8 h-8 text-text-muted mb-1" />
                                    <span className="text-[10px] text-text-muted">
                                        {request.attachment ?? "Tidak ada"}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-text-primary truncate">
                                        {request.studentName}
                                    </p>
                                    <p className="text-[11px] text-text-muted">
                                        {request.class}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                                        <FaCalendarAlt className="w-3 h-3 text-text-muted shrink-0" />
                                        <span className="truncate">
                                            {request.startDate}
                                            {request.endDate !==
                                            request.startDate
                                                ? ` — ${request.endDate}`
                                                : ""}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                request.type === "sakit"
                                                    ? "bg-danger/10 text-danger border border-danger/20"
                                                    : "bg-primary/10 text-primary border border-primary/20"
                                            }`}
                                        >
                                            {request.typeLabel}
                                        </span>
                                        <StatusBadge status={request.status} />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-text-secondary mb-3 line-clamp-2">
                                {request.description}
                            </p>

                            {/* Actions */}
                            {request.status === "pending" && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="detail"
                                        size="sm"
                                        className="flex-1"
                                        icon={FaCheck}
                                        loading={actionLoading === request.id}
                                        onClick={() =>
                                            handleApprove(request.id)
                                        }
                                    >
                                        Setujui
                                    </Button>
                                    <Button
                                        variant="delete"
                                        size="sm"
                                        className="flex-1"
                                        icon={FaTimes}
                                        loading={actionLoading === request.id}
                                        onClick={() => handleReject(request.id)}
                                    >
                                        Tolak
                                    </Button>
                                </div>
                            )}

                            {request.status !== "pending" && (
                                <Button
                                    variant="detail"
                                    size="sm"
                                    className="w-full"
                                    icon={FaEye}
                                >
                                    Detail
                                </Button>
                            )}
                        </div>
                    ))
                )}

                {/* Mobile Pagination */}
                {filteredRequests.length > 0 && (
                    <div className="mt-4">
                        <Pagination links={paginationLinks} />
                    </div>
                )}
            </div>
        </GuruLayout>
    );
}
