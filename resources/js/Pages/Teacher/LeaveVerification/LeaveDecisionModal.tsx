import { useState } from "react";
import Modal from "@/Components/common/Modal";
import { Button, Input } from "@/Components";
import { FiCheck, FiX } from "react-icons/fi";
import type { LeaveRequest } from "./types";

interface LeaveDecisionModalProps {
    open: boolean;
    type: "approve" | "reject" | "revert" | null;
    leave: LeaveRequest | null;
    isSubmitting: boolean;
    onClose: () => void;
    onConfirm: (leaveId: number, type: "approve" | "reject" | "revert", reason?: string) => void;
}

const commonRejectReasons = [
    "Surat dokter tidak terbaca / buram",
    "Tanggal surat tidak sesuai dengan rentang izin",
    "Tidak ada tanda tangan orang tua / dokter",
    "Dokumen lampiran bukan surat resmi",
];

export default function LeaveDecisionModal({
    open,
    type,
    leave,
    isSubmitting,
    onClose,
    onConfirm,
}: LeaveDecisionModalProps) {
    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("");

    if (!leave || !type) return null;

    const handleConfirm = () => {
        const finalReason = customReason || selectedReason;
        onConfirm(leave.id, type, type === "reject" ? finalReason : undefined);
    };

    const isApprove = type === "approve";
    const isReject = type === "reject";
    const isRevert = type === "revert";

    const title = isApprove
        ? "Setujui Permohonan Izin"
        : isReject
        ? "Tolak Permohonan Izin"
        : "Kembalikan ke Status Menunggu";

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
        >
            <div className="space-y-4">
                {/* Summary Box */}
                <div className="p-3.5 rounded-xl bg-surface-hover border border-border-default space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-text-primary">
                            {leave.student.name}
                        </span>
                        <span className="text-[12px] text-text-muted">
                            NIS: {leave.student.nis}
                        </span>
                    </div>
                    <div className="text-[12px] text-text-secondary">
                        Kategori: <strong className="text-text-primary">{leave.category}</strong> • Periode:{" "}
                        <strong className="text-text-primary">
                            {leave.start_date} s.d. {leave.end_date}
                        </strong>
                    </div>
                </div>

                {isApprove && (
                    <p className="text-[13px] text-text-secondary leading-relaxed">
                        Dengan menyetujui, kehadiran siswa pada rentang tanggal tersebut akan tercatat sah
                        sebagai izin/sakit yang terverifikasi wali kelas.
                    </p>
                )}

                {isRevert && (
                    <p className="text-[13px] text-text-secondary leading-relaxed">
                        Permohonan izin ini akan dikembalikan ke status <strong>Menunggu Verifikasi (Pending)</strong> dan dapat ditinjau ulang.
                    </p>
                )}

                {isReject && (
                    <div className="space-y-3">
                        <label className="block text-[13px] font-medium text-text-primary">
                            Pilih Alasan Penolakan:
                        </label>
                        <div className="space-y-1.5">
                            {commonRejectReasons.map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => {
                                        setSelectedReason(r);
                                        setCustomReason("");
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-[13px] border transition-all ${
                                        selectedReason === r && !customReason
                                            ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-medium"
                                            : "border-border-default hover:bg-surface-hover text-text-secondary"
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="block text-[12px] font-medium text-text-primary mb-1">
                                Atau Tulis Catatan Khusus:
                            </label>
                            <Input
                                placeholder="Contoh: Harap unggah ulang surat keterangan dokter yang jelas..."
                                value={customReason}
                                onChange={(e) => {
                                    setCustomReason(e.target.value);
                                    setSelectedReason("");
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-border-default">
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Batal
                    </Button>
                    <Button
                        variant={isReject ? "danger" : "primary"}
                        onClick={handleConfirm}
                        disabled={isSubmitting || (isReject && !selectedReason && !customReason.trim())}
                        icon={isApprove ? <FiCheck size={16} /> : isReject ? <FiX size={16} /> : undefined}
                    >
                        {isSubmitting
                            ? "Memproses..."
                            : isApprove
                            ? "Ya, Setujui Izin"
                            : isReject
                            ? "Tolak Izin Ini"
                            : "Kembalikan Status"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
