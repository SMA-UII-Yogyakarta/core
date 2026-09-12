import type React from "react";
import {
    FiCalendar,
    FiCheck,
    FiEye,
    FiFileText,
    FiImage,
    FiLock,
    FiMaximize2,
    FiRotateCcw,
    FiUser,
    FiX,
} from "react-icons/fi";
import type { LeaveRequest } from "@/types";
import { formatIndonesianDate } from "@/utils/helpers";
import Avatar from "./Avatar";
import Button from "./Button";
import StatusBadge from "./StatusBadge";

export interface LeaveRequestItem {
    id: number;
    student?: { name?: string | null; nis?: string | null; [key: string]: any } | null;
    guardian?: { name?: string | null; [key: string]: any } | null;
    category: string;
    start_date: string;
    end_date: string;
    description?: string | null;
    document_url?: string | null;
    approval_status: string;
    rejection_reason?: string | null;
    created_at?: string | null;
    [key: string]: any;
}

export interface LeaveRequestCardProps<T extends LeaveRequestItem = LeaveRequest> {
    leaveRequest?: T;
    leave?: T;
    isPending?: boolean;
    onDetailClick?: (lr: T) => void;
    onImagePreview?: (url: string) => void;
    onPreviewImage?: (url: string) => void;
    onApprove?: (lr: T) => void;
    onReject?: (lr: T) => void;
    onRevert?: (lr: T) => void;
    showUrgency?: boolean;
    showRejection?: boolean;
    rejectionReason?: string | null;
    checkboxSlot?: React.ReactNode;
    actionSlot?: React.ReactNode;
    isHomeroom?: boolean;
    variant?: "admin" | "teacher" | "auto";
    className?: string;
}

const statusBorderClass: Record<string, string> = {
    Pending: "border-l-warning",
    Approved: "border-l-success",
    Rejected: "border-l-danger",
};

const categoryConfig: Record<string, { label: string; textColor: string; badgeBgColor: string; borderColor: string }> =
    {
        Sick: {
            label: "Sakit",
            textColor: "text-text-medical",
            badgeBgColor: "bg-medical-bg",
            borderColor: "border-l-medical",
        },
        Event: {
            label: "Izin Acara",
            textColor: "text-text-permit",
            badgeBgColor: "bg-permit-bg",
            borderColor: "border-l-permit",
        },
        Competition: {
            label: "Lomba",
            textColor: "text-text-achievement",
            badgeBgColor: "bg-achievement-bg",
            borderColor: "border-l-achievement",
        },
        Other: {
            label: "Lainnya",
            textColor: "text-text-info",
            badgeBgColor: "bg-info-bg",
            borderColor: "border-l-info",
        },
    };

export const daysUntil = (dateStr: string): number => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const getUrgencyInfo = (startDate: string) => {
    if (!startDate) return null;
    const days = daysUntil(startDate);
    if (days < -1) {
        const n = Math.abs(days);
        return { label: `Terlambat ${n} hari`, isOverdue: true };
    }
    if (days === -1) return { label: "Kemarin", isOverdue: true };
    if (days === 0) return { label: "Hari ini", isOverdue: false };
    if (days === 1) return { label: "Besok", isOverdue: false };
    return null;
};

export const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 1;
    const startDate = new Date(start.split("T")[0]);
    const endDate = new Date(end.split("T")[0]);
    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);
};

export const getDocumentTypeLabel = (url: string | null | undefined): string => {
    if (!url) return "Dokumen";
    if (url.includes("doctor") || url.includes("surat")) return "Surat Dokter";
    if (url.includes("invitation") || url.includes("undangan")) return "Undangan";
    return "Dokumen";
};

export const formatRelativeTime = (dateStr: string): string => {
    if (!dateStr) return "Baru saja";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Baru saja";
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays === 1) return "Kemarin";
    return formatIndonesianDate(dateStr);
};

export function LeaveRequestCard<T extends LeaveRequestItem = any>(props: LeaveRequestCardProps<T>) {
    const {
        leaveRequest,
        leave,
        isPending,
        onDetailClick,
        onImagePreview,
        onPreviewImage,
        onApprove,
        onReject,
        onRevert,
        showUrgency,
        rejectionReason,
        checkboxSlot,
        actionSlot,
        isHomeroom = true,
        variant = "auto",
        className = "",
    } = props;

    const lr = leaveRequest ?? leave;
    if (!lr) return null;

    const isPendingState = isPending ?? lr.approval_status === "Pending";
    const previewHandler = onPreviewImage ?? onImagePreview;
    const resolvedRejectionReason = rejectionReason ?? (lr as { rejection_reason?: string | null }).rejection_reason;
    const resolvedVariant = variant !== "auto" ? variant : onRevert || (leave && !leaveRequest) ? "teacher" : "admin";

    const borderClass = statusBorderClass[lr.approval_status] || "border-l-border";
    const cat = categoryConfig[lr.category] ?? categoryConfig.Other;
    const duration = calculateDuration(lr.start_date, lr.end_date);
    const docLabel = getDocumentTypeLabel(lr.document_url);
    const urgency = showUrgency !== false && (showUrgency || isPendingState) ? getUrgencyInfo(lr.start_date) : null;

    const guardianName = lr.guardian?.name ? `Ibu/Bapak ${lr.guardian.name}` : "Ibu/Bapak Wali Murid";
    const guardianInfo = `${guardianName} (Wali Murid)`;

    // --- Teacher Layout (Avatar-based) ---
    if (resolvedVariant === "teacher") {
        return (
            <div
                className={`p-4 sm:p-5 rounded-2xl bg-surface border border-border transition-all duration-200 shadow-xs ${
                    isPendingState
                        ? "hover:border-primary/40 hover:shadow-md"
                        : lr.approval_status === "Approved"
                          ? "border-success/30 bg-success/5"
                          : "border-danger/30 bg-danger/5"
                } ${className}`}
            >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                        {checkboxSlot && (
                            <div className="pt-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                {checkboxSlot}
                            </div>
                        )}
                        <Avatar name={lr.student?.name || "Tanpa Nama"} size="md" />
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-text-primary text-[15px]">
                                    {lr.student?.name || "Tanpa Nama"}
                                </span>
                                {lr.student?.nis && (
                                    <span className="text-[12px] text-text-muted">NIS: {lr.student.nis}</span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cat.badgeBgColor} ${cat.textColor} ${cat.borderColor}`}
                                >
                                    {cat.label}
                                </span>

                                {urgency && (
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                            urgency.isOverdue
                                                ? "bg-danger/10 text-danger border border-danger/20"
                                                : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                        }`}
                                    >
                                        {urgency.label}
                                    </span>
                                )}

                                <span className="text-[12px] text-text-muted">
                                    Diajukan {formatRelativeTime(lr.created_at || "")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status or Quick Action for Desktop */}
                    <div className="flex items-center gap-2 self-stretch sm:self-start justify-end flex-wrap">
                        {actionSlot ? (
                            actionSlot
                        ) : isPendingState ? (
                            <div className="flex items-center gap-2">
                                {onReject && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => onReject(lr)}
                                        icon={<FiX size={14} />}
                                    >
                                        Tolak
                                    </Button>
                                )}
                                {onApprove && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => onApprove(lr)}
                                        icon={<FiCheck size={14} />}
                                    >
                                        Setujui
                                    </Button>
                                )}
                                {onDetailClick && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDetailClick(lr)}
                                        icon={<FiEye size={14} />}
                                    >
                                        Detail
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <StatusBadge
                                    variant={lr.approval_status}
                                    label={lr.approval_status === "Approved" ? "Disetujui" : "Ditolak"}
                                    className="px-3 py-1"
                                />
                                {onRevert && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRevert(lr)}
                                        icon={<FiRotateCcw size={14} />}
                                        title="Ubah status"
                                    >
                                        Revert
                                    </Button>
                                )}
                                {onDetailClick && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDetailClick(lr)}
                                        icon={<FiEye size={14} />}
                                    >
                                        Detail
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Dates & Range Info */}
                <div className="mt-1 pt-3.5 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
                    <div className="flex items-center gap-2 text-text-primary">
                        <FiCalendar className="text-text-muted shrink-0" size={15} />
                        <span>
                            <strong>{formatIndonesianDate(lr.start_date)}</strong>
                            {lr.start_date !== lr.end_date && (
                                <>
                                    {" "}
                                    s.d. <strong>{formatIndonesianDate(lr.end_date)}</strong>
                                </>
                            )}
                            <span className="text-text-muted ml-1.5 font-normal">({duration} Hari)</span>
                        </span>
                    </div>

                    {lr.guardian && (
                        <div className="text-text-secondary text-[12px]">
                            Diajukan oleh wali: <strong className="text-text-primary">{lr.guardian.name}</strong>
                        </div>
                    )}
                </div>

                {/* Description & Document Preview */}
                {(lr.description || lr.document_url || resolvedRejectionReason) && (
                    <div className="mt-3.5 pt-3 border-t border-border space-y-2.5">
                        {lr.description && (
                            <div className="text-[13px] text-text-secondary leading-relaxed bg-muted/60 p-3 rounded-xl border border-border">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block mb-1">
                                    Keterangan / Alasan Siswa:
                                </span>
                                {lr.description}
                            </div>
                        )}

                        {resolvedRejectionReason && (
                            <div className="text-[13px] text-danger leading-relaxed bg-danger/5 p-3 rounded-xl border border-danger/20">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-danger block mb-1">
                                    Catatan Penolakan:
                                </span>
                                {resolvedRejectionReason}
                            </div>
                        )}

                        {lr.document_url && (
                            <div className="flex items-center gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (previewHandler) previewHandler(lr.document_url!);
                                        else window.open(lr.document_url!, "_blank");
                                    }}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-border text-primary text-[12px] font-medium border border-border transition-colors"
                                >
                                    <FiImage size={14} />
                                    Lihat Lampiran {docLabel}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // --- Admin Layout (Side-Thumbnail based) ---
    return (
        <div
            className={`bg-surface border border-border rounded-2xl p-5 sm:p-6 overflow-hidden shadow-xs relative border-l-[6px] ${borderClass} font-inter flex flex-col sm:flex-row gap-5 items-start transition-all hover:border-primary/30 ${className}`}
        >
            {/* Left Thumbnail (130px Aspect Ratio with 🔍 Perbesar) */}
            <div className="w-full sm:w-[130px] shrink-0">
                <div className="w-full sm:w-[130px] h-[130px] bg-slate-200/60 border border-border rounded-xl overflow-hidden flex flex-col justify-between relative shadow-2xs">
                    <div className="flex-1 flex items-center justify-center text-text-muted">
                        <FiFileText className="text-3xl opacity-70" />
                    </div>
                    {lr.document_url ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (previewHandler) previewHandler(lr.document_url!);
                                else window.open(lr.document_url!, "_blank");
                            }}
                            className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-t border-border/50"
                        >
                            <FiMaximize2 className="text-[12px]" /> Perbesar
                        </button>
                    ) : (
                        <div className="w-full py-1.5 bg-muted border-t border-border/50 flex items-center justify-center text-[10px] text-text-muted font-semibold">
                            Tidak ada berkas
                        </div>
                    )}
                </div>
            </div>

            {/* Right Main Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-between w-full">
                <div>
                    {/* Top Row: Name on Left, Urgency & Category Pill Badge on Right */}
                    <div className="flex justify-between items-center mb-1 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            {checkboxSlot && (
                                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                    {checkboxSlot}
                                </div>
                            )}
                            <h3 className="font-bold text-primary text-[18px] leading-snug truncate">
                                {lr.student?.name || "Tanpa Nama"}
                            </h3>
                        </div>
                        <div className="shrink-0 flex items-center gap-1.5">
                            {urgency && (
                                <span
                                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                        urgency.isOverdue
                                            ? "bg-danger/10 text-danger border border-danger/20"
                                            : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                    }`}
                                >
                                    {urgency.label}
                                </span>
                            )}
                            <span
                                className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${cat.badgeBgColor} ${cat.textColor}`}
                            >
                                {cat.label.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Subtitle Line: Diajukan oleh */}
                    <p className="text-[12px] text-text-muted mb-3 flex items-center gap-1.5 leading-none">
                        <FiUser className="text-[12px]" /> Diajukan oleh: {guardianInfo} -{" "}
                        {formatRelativeTime(lr.created_at || "")}
                    </p>

                    {/* Metadata Gray Box */}
                    <div className="bg-muted/70 border border-border/60 rounded-xl p-4 text-[13px] font-inter space-y-1.5">
                        <div>
                            <span className="font-semibold text-text-muted mr-2">Tanggal:</span>
                            <span className="text-danger font-bold">
                                {formatIndonesianDate(lr.start_date)} ({duration} Hari)
                            </span>
                        </div>
                        <div>
                            <span className="font-semibold text-text-muted mr-2">Keterangan:</span>
                            <span className="text-text-primary font-medium leading-relaxed">
                                {lr.description || "Tidak ada keterangan."}
                            </span>
                        </div>
                        {resolvedRejectionReason && (
                            <div className="pt-1.5 border-t border-border/50 text-[12px] text-danger font-medium">
                                <span className="font-semibold mr-1">Catatan Penolakan:</span>
                                {resolvedRejectionReason}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="mt-4 flex justify-end items-center gap-2.5">
                    {actionSlot ? (
                        actionSlot
                    ) : !isHomeroom && isPendingState ? (
                        <div className="text-[12px] font-bold text-danger border border-dashed border-danger/40 bg-danger-bg px-3.5 py-1.5 rounded-xl inline-flex items-center gap-1.5">
                            <FiLock className="text-[12px]" /> Hak akses persetujuan hanya untuk Wali Kelas.
                        </div>
                    ) : isPendingState && (onApprove || onReject) ? (
                        <div className="flex gap-2.5">
                            {onReject && (
                                <Button
                                    type="button"
                                    variant="danger-outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onReject(lr);
                                    }}
                                >
                                    <FiX className="mr-1 text-[13px]" /> Tolak
                                </Button>
                            )}
                            {onApprove && (
                                <Button
                                    type="button"
                                    variant="success"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onApprove(lr);
                                    }}
                                >
                                    <FiCheck className="mr-1 text-[13px]" /> Setujui Izin
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            {onRevert && !isPendingState && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRevert(lr);
                                    }}
                                    icon={<FiRotateCcw size={14} />}
                                >
                                    Revert
                                </Button>
                            )}
                            {onDetailClick && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDetailClick(lr);
                                    }}
                                    className="px-4 py-1.5 bg-surface border border-border rounded-xl text-[12px] font-bold text-text-primary hover:bg-muted transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                    <FiEye className="text-[12px]" /> Detail
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LeaveRequestCard;
