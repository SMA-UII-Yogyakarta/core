import { Avatar, Button } from "@/Components";
import {
    FiCalendar,
    FiCheck,
    FiX,
    FiRotateCcw,
    FiImage,
} from "react-icons/fi";
import {
    type LeaveRequest,
    categoryConfig,
    formatDate,
    formatRelativeTime,
    calculateDuration,
    getDocumentTypeLabel,
    getUrgencyInfo,
} from "./types";

interface LeaveRequestCardProps {
    leave: LeaveRequest;
    isPending: boolean;
    onPreviewImage: (url: string) => void;
    onApprove: (leave: LeaveRequest) => void;
    onReject: (leave: LeaveRequest) => void;
    onRevert: (leave: LeaveRequest) => void;
}

export default function LeaveRequestCard({
    leave,
    isPending,
    onPreviewImage,
    onApprove,
    onReject,
    onRevert,
}: LeaveRequestCardProps) {

    const cat = categoryConfig[leave.category] ?? categoryConfig.Other;
    const duration = calculateDuration(leave.start_date, leave.end_date);
    const docLabel = getDocumentTypeLabel(leave.document_url);
    const urgency = isPending ? getUrgencyInfo(leave.start_date) : null;

    return (
        <div
            className={`p-4 sm:p-5 rounded-2xl bg-surface border transition-all duration-200 shadow-sm ${
                isPending
                    ? "border-border-default hover:border-brand-primary/40 hover:shadow-md"
                    : leave.approval_status === "Approved"
                    ? "border-status-success/30 bg-status-success/5"
                    : "border-status-danger/30 bg-status-danger/5"
            }`}
        >
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                    <Avatar name={leave.student.name} size="md" />
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-text-primary text-[15px]">
                                {leave.student.name}
                            </span>
                            <span className="text-[12px] text-text-muted">
                                NIS: {leave.student.nis}
                            </span>
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
                                            ? "bg-status-danger/10 text-status-danger border border-status-danger/20"
                                            : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                    }`}
                                >
                                    {urgency.label}
                                </span>
                            )}

                            <span className="text-[12px] text-text-muted">
                                Diajukan {formatRelativeTime(leave.created_at)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Status or Quick Action for Desktop */}
                <div className="flex items-center gap-2 self-end sm:self-start">
                    {isPending ? (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onReject(leave)}
                                icon={<FiX size={14} />}
                            >
                                Tolak
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => onApprove(leave)}
                                icon={<FiCheck size={14} />}
                            >
                                Setujui
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span
                                className={`px-3 py-1 rounded-full text-[12px] font-semibold ${
                                    leave.approval_status === "Approved"
                                        ? "bg-status-success/10 text-status-success border border-status-success/20"
                                        : "bg-status-danger/10 text-status-danger border border-status-danger/20"
                                }`}
                            >
                                {leave.approval_status === "Approved" ? "Disetujui" : "Ditolak"}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRevert(leave)}
                                icon={<FiRotateCcw size={14} />}
                                title="Ubah status"
                            >
                                Revert
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Dates & Range Info */}
            <div className="mt-4 pt-3.5 border-t border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
                <div className="flex items-center gap-2 text-text-primary">
                    <FiCalendar className="text-text-muted shrink-0" size={15} />
                    <span>
                        <strong>{formatDate(leave.start_date)}</strong>
                        {leave.start_date !== leave.end_date && (
                            <> s.d. <strong>{formatDate(leave.end_date)}</strong></>
                        )}
                        <span className="text-text-muted ml-1.5 font-normal">
                            ({duration} Hari)
                        </span>
                    </span>
                </div>

                {leave.guardian && (
                    <div className="text-text-secondary text-[12px]">
                        Diajukan oleh wali: <strong className="text-text-primary">{leave.guardian.name}</strong>
                    </div>
                )}
            </div>

            {/* Description & Document Preview */}
            {(leave.description || leave.document_url || leave.rejection_reason) && (
                <div className="mt-3.5 pt-3 border-t border-border-default space-y-2.5">
                    {leave.description && (
                        <div className="text-[13px] text-text-secondary leading-relaxed bg-surface-hover/60 p-3 rounded-xl border border-border-default">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block mb-1">
                                Keterangan / Alasan Siswa:
                            </span>
                            {leave.description}
                        </div>
                    )}

                    {leave.rejection_reason && (
                        <div className="text-[13px] text-status-danger leading-relaxed bg-status-danger/5 p-3 rounded-xl border border-status-danger/20">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-status-danger block mb-1">
                                Catatan Penolakan:
                            </span>
                            {leave.rejection_reason}
                        </div>
                    )}

                    {leave.document_url && (
                        <div className="flex items-center gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => onPreviewImage(leave.document_url!)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-hover hover:bg-border-default text-brand-primary text-[12px] font-medium border border-border-default transition-colors"
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
