import { useState, useEffect } from "react";
import {
    FaUserGraduate,
    FaCalendarAlt,
    FaFileAlt,
    FaUpload,
    FaCheckCircle,
    FaTimesCircle,
    FaPaperclip,
    FaChevronDown,
} from "react-icons/fa";
import WaliMuridLayout from "@/Layouts/WaliMuridLayout";
import {
    Button,
    Input,
    Badge,
    StatusBadge,
    TabSwitcher,
    EmptyState,
    ErrorState,
} from "@/Components/ui/index";

/* ===== Types ===== */
type LeaveType = "sakit" | "keluarga" | "lainnya";
type TabFilter = "all" | "pending" | "approved" | "rejected";

interface LeaveHistoryItem {
    id: number;
    childName: string;
    startDate: string;
    endDate: string;
    type: LeaveType;
    typeLabel: string;
    description: string;
    status: "pending" | "approved" | "rejected";
    attachment: string | null;
}

/* ===== Mock Data ===== */
const mockChildren = [
    { id: 1, name: "Ahmad Reza Pahlevi", class: "X-A (Reguler)" },
    { id: 2, name: "Siti Nurhaliza", class: "XI-B (Reguler)" },
];

const leaveHistory: LeaveHistoryItem[] = [
    {
        id: 1,
        childName: "Ahmad Reza Pahlevi",
        startDate: "10 Jun 2026",
        endDate: "12 Jun 2026",
        type: "sakit",
        typeLabel: "Sakit",
        description: "Demam tinggi, tidak bisa masuk sekolah",
        status: "approved",
        attachment: "surat_dokter.pdf",
    },
    {
        id: 2,
        childName: "Ahmad Reza Pahlevi",
        startDate: "20 Mei 2026",
        endDate: "20 Mei 2026",
        type: "keluarga",
        typeLabel: "Keperluan Keluarga",
        description: "Ada acara keluarga",
        status: "pending",
        attachment: null,
    },
    {
        id: 3,
        childName: "Siti Nurhaliza",
        startDate: "05 Jun 2026",
        endDate: "05 Jun 2026",
        type: "lainnya",
        typeLabel: "Lainnya",
        description: "Izin mengikuti lomba",
        status: "rejected",
        attachment: null,
    },
];

const leaveTypeOptions: { value: LeaveType; label: string }[] = [
    { value: "sakit", label: "Sakit" },
    { value: "keluarga", label: "Keperluan Keluarga" },
    { value: "lainnya", label: "Lainnya" },
];

const tabOptions = [
    { key: "all" as TabFilter, label: "Semua" },
    { key: "pending" as TabFilter, label: "Menunggu" },
    { key: "approved" as TabFilter, label: "Disetujui" },
    { key: "rejected" as TabFilter, label: "Ditolak" },
];

const statusBadgeStyles: Record<string, { label: string; className: string }> =
    {
        sakit: {
            label: "SAKIT",
            className: "bg-danger/10 text-danger border border-danger/20",
        },
        keluarga: {
            label: "Keperluan Keluarga",
            className: "bg-accent/20 text-primary border border-accent/30",
        },
        lainnya: {
            label: "Lainnya",
            className: "bg-background text-text-muted border border-border",
        },
    };

export default function PengajuanIzin() {
    const [selectedChild, setSelectedChild] = useState(mockChildren[0].id);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [leaveType, setLeaveType] = useState<LeaveType>("sakit");
    const [description, setDescription] = useState("");
    const [attachment, setAttachment] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<TabFilter>("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        if (!selectedChild) {
            setSubmitError("Silakan pilih anak");
            setSubmitting(false);
            return;
        }
        if (!startDate) {
            setSubmitError("Silakan pilih tanggal mulai");
            setSubmitting(false);
            return;
        }
        if (!endDate) {
            setSubmitError("Silakan pilih tanggal selesai");
            setSubmitting(false);
            return;
        }
        if (!description.trim()) {
            setSubmitError("Silakan isi keterangan");
            setSubmitting(false);
            return;
        }

        setTimeout(() => {
            setSubmitting(false);
            setSubmitSuccess(true);
            setStartDate("");
            setEndDate("");
            setLeaveType("sakit");
            setDescription("");
            setAttachment(null);
            setTimeout(() => setSubmitSuccess(false), 3000);
        }, 1500);
    };

    const filteredHistory =
        activeTab === "all"
            ? leaveHistory
            : leaveHistory.filter((item) => item.status === activeTab);

    return (
        <WaliMuridLayout title="Pengajuan Izin">
            <div className="md:grid md:grid-cols-2 md:gap-6">
                {/* ===== Form Section ===== */}
                <div>
                    <div className="bg-surface rounded-lg border border-border p-4 md:p-6">
                        <h2 className="text-sm font-bold text-text-primary mb-4">
                            Form Pengajuan Izin
                        </h2>

                        {submitSuccess && (
                            <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 flex items-center gap-3 text-sm font-semibold text-success">
                                <FaCheckCircle className="w-4 h-4 shrink-0" />
                                <span>Pengajuan izin berhasil dikirim!</span>
                            </div>
                        )}

                        {submitError && (
                            <div className="mb-4 p-3 rounded-lg bg-danger-light border border-danger-border flex items-center gap-3">
                                <FaTimesCircle className="text-danger shrink-0" />
                                <span className="text-xs text-danger font-semibold">
                                    {submitError}
                                </span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Pilih Anak */}
                            <div>
                                <label className="text-xs font-medium text-text-secondary block mb-1">
                                    Pilih Anak
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedChild}
                                        onChange={(e) =>
                                            setSelectedChild(
                                                Number(e.target.value),
                                            )
                                        }
                                        className="w-full h-10 px-3 bg-surface border border-border rounded-md text-xs text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 pr-10"
                                    >
                                        {mockChildren.map((child) => (
                                            <option
                                                key={child.id}
                                                value={child.id}
                                            >
                                                {child.name} — {child.class}
                                            </option>
                                        ))}
                                    </select>
                                    <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
                                </div>
                            </div>

                            {/* Tanggal Mulai */}
                            <Input
                                label="Tanggal Mulai"
                                type="date"
                                icon={FaCalendarAlt}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />

                            {/* Tanggal Selesai */}
                            <Input
                                label="Tanggal Selesai"
                                type="date"
                                icon={FaCalendarAlt}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />

                            {/* Jenis Izin — Radio */}
                            <div>
                                <label className="text-xs font-medium text-text-secondary block mb-2">
                                    Jenis Izin
                                </label>
                                <div className="space-y-2">
                                    {leaveTypeOptions.map((opt) => (
                                        <label
                                            key={opt.value}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="leaveType"
                                                value={opt.value}
                                                checked={
                                                    leaveType === opt.value
                                                }
                                                onChange={() =>
                                                    setLeaveType(opt.value)
                                                }
                                                className="w-4 h-4 text-primary accent-primary border-border focus:ring-primary"
                                            />
                                            <span className="text-xs text-text-primary">
                                                {opt.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Keterangan */}
                            <div>
                                <label className="text-xs font-medium text-text-secondary block mb-1">
                                    Keterangan
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    rows={4}
                                    placeholder="Jelaskan alasan izin..."
                                    className="w-full px-3 py-2 bg-surface border border-border rounded-md text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                />
                            </div>

                            {/* Upload Bukti */}
                            <div>
                                <label className="text-xs font-medium text-text-secondary block mb-1">
                                    Upload Bukti{" "}
                                    <span className="text-text-muted">
                                        (opsional)
                                    </span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="attachment"
                                        onChange={(e) =>
                                            setAttachment(
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    <label
                                        htmlFor="attachment"
                                        className="flex items-center gap-3 w-full h-10 px-3 bg-surface border border-dashed border-border rounded-md text-xs text-text-muted cursor-pointer hover:bg-background transition-colors"
                                    >
                                        <FaUpload className="w-3.5 h-3.5 shrink-0" />
                                        <span>
                                            {attachment
                                                ? attachment.name
                                                : "Klik untuk upload (PDF, JPG, PNG)"}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full"
                                loading={submitting}
                                icon={FaFileAlt}
                            >
                                Ajukan Izin
                            </Button>
                        </form>
                    </div>
                </div>

                {/* ===== Riwayat Section ===== */}
                <div className="mt-6 md:mt-0">
                    <div className="bg-surface rounded-lg border border-border p-4 md:p-6">
                        <h2 className="text-sm font-bold text-text-primary mb-4">
                            Riwayat Pengajuan
                        </h2>

                        {/* Tab Filter */}
                        <div className="mb-4">
                            <TabSwitcher
                                tabs={tabOptions.map((t) => ({
                                    key: t.key,
                                    label: t.label,
                                }))}
                                activeTab={activeTab}
                                onChange={(key) =>
                                    setActiveTab(key as TabFilter)
                                }
                            />
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-24 bg-background animate-pulse rounded-lg"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Error */}
                        {!loading && submitError && (
                            <ErrorState message={submitError} />
                        )}

                        {/* Empty */}
                        {!loading && filteredHistory.length === 0 && (
                            <EmptyState
                                title="Belum Ada Pengajuan"
                                description="Tidak ada riwayat pengajuan izin."
                            />
                        )}

                        {/* Data */}
                        {!loading && filteredHistory.length > 0 && (
                            <div className="space-y-3">
                                {filteredHistory.map((item) => {
                                    const typeBadge =
                                        statusBadgeStyles[item.type] ??
                                        statusBadgeStyles.lainnya;
                                    return (
                                        <div
                                            key={item.id}
                                            className="p-3 bg-background rounded-lg border border-border"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <FaUserGraduate className="w-3.5 h-3.5 text-text-muted" />
                                                    <span className="text-xs font-semibold text-text-primary">
                                                        {item.childName}
                                                    </span>
                                                </div>
                                                <StatusBadge
                                                    status={item.status}
                                                />
                                            </div>

                                            <div className="space-y-1 mb-2">
                                                <div className="flex items-center gap-2 text-[11px] text-text-muted">
                                                    <FaCalendarAlt className="w-3 h-3" />
                                                    <span>
                                                        {item.startDate} —{" "}
                                                        {item.endDate}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeBadge.className}`}
                                                    >
                                                        {typeBadge.label}
                                                    </span>
                                                    {item.attachment && (
                                                        <span className="flex items-center gap-1 text-[11px] text-primary">
                                                            <FaPaperclip className="w-3 h-3" />
                                                            {item.attachment}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-[11px] text-text-secondary line-clamp-2">
                                                {item.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </WaliMuridLayout>
    );
}
