import React from "react";
import type { LeaveRequest } from "@/types";
import Button from "./Button";

interface LeaveRequestCardProps {
    leaveRequest: LeaveRequest;
    onDetailClick?: (lr: LeaveRequest) => void;
    onImagePreview?: (url: string) => void;
    onApprove?: (lr: LeaveRequest) => void;
    onReject?: (lr: LeaveRequest) => void;
    checkboxSlot?: React.ReactNode;
    actionSlot?: React.ReactNode;
    isHomeroom?: boolean;
}

const statusBorderClass: Record<string, string> = {
    Pending: "border-l-warning",
    Approved: "border-l-success",
    Rejected: "border-l-danger",
};

const categoryLabels: Record<string, string> = {
    Sick: "Sakit",
    Event: "Izin Acara",
    Competition: "Lomba",
    Other: "Lainnya",
};

const categoryBadgeConfig: Record<string, { bg: string; text: string }> = {
    Sick: { bg: "bg-medical-bg", text: "text-medical" },
    Event: { bg: "bg-permit-bg", text: "text-permit" },
    Competition: { bg: "bg-achievement-bg", text: "text-achievement" },
    Other: { bg: "bg-info-bg", text: "text-info" },
};

export function LeaveRequestCard({
    leaveRequest,
    onDetailClick,
    onImagePreview,
    onApprove,
    onReject,
    checkboxSlot,
    actionSlot,
    isHomeroom = true,
}: LeaveRequestCardProps) {
    const borderClass = statusBorderClass[leaveRequest.approval_status] || "border-l-border";

    const guardianName = leaveRequest.guardian?.name
        ? `Ibu/Bapak ${leaveRequest.guardian.name}`
        : "Ibu/Bapak Wali Murid";

    const guardianInfo = `${guardianName} (Wali Murid)`;

    const formatDate = (dateString: string) => {
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;
            return d.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const formatRelativeOrTime = (dateString: string) => {
        if (!dateString) return "Baru saja";
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;
            return d.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const durationDays = () => {
        if (!leaveRequest.start_date || !leaveRequest.end_date) return "1 Hari";
        const start = new Date(leaveRequest.start_date.split("T")[0]);
        const end = new Date(leaveRequest.end_date.split("T")[0]);
        const diff = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);
        return `${diff} Hari`;
    };

    const catConfig = categoryBadgeConfig[leaveRequest.category] || { bg: "bg-info-bg", text: "text-info" };
    const catLabel = (categoryLabels[leaveRequest.category] || leaveRequest.category || "LAINNYA").toUpperCase();

    return (
        <div
            className={`bg-surface border border-border rounded-2xl p-5 sm:p-6 overflow-hidden shadow-xs relative border-l-[6px] ${borderClass} font-inter flex flex-col sm:flex-row gap-5 items-start mb-5 transition-all hover:border-primary/30`}
        >
            {/* Left Thumbnail (130px Aspect Ratio with 🔍 Perbesar) */}
            <div className="w-full sm:w-[130px] shrink-0">
                <div className="w-full sm:w-[130px] h-[130px] bg-slate-200/60 border border-border rounded-xl overflow-hidden flex flex-col justify-between relative shadow-2xs">
                    <div className="flex-1 flex items-center justify-center text-text-muted">
                        <i className="fas fa-file-prescription text-3xl opacity-70"></i>
                    </div>
                    {leaveRequest.document_url ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onImagePreview) onImagePreview(leaveRequest.document_url!);
                                else window.open(leaveRequest.document_url!, "_blank");
                            }}
                            className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-t border-border/50"
                        >
                            <i className="fas fa-search-plus text-[10px]"></i> Perbesar
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
                    {/* Top Row: Name on Left, Category Pill Badge on Right */}
                    <div className="flex justify-between items-center mb-1 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            {checkboxSlot && <div className="shrink-0" onClick={(e) => e.stopPropagation()}>{checkboxSlot}</div>}
                            <h3 className="font-bold text-primary text-[18px] leading-snug truncate">
                                {leaveRequest.student?.name || "Tanpa Nama"}
                            </h3>
                        </div>
                        <div className="shrink-0">
                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${catConfig.bg} ${catConfig.text}`}>
                                {catLabel}
                            </span>
                        </div>
                    </div>

                    {/* Subtitle Line: Diajukan oleh */}
                    <p className="text-[12px] text-text-muted mb-3 flex items-center gap-1.5 leading-none">
                        <i className="fas fa-user text-[11px]"></i> Diajukan oleh: {guardianInfo} - {formatRelativeOrTime(leaveRequest.created_at || "")}
                    </p>

                    {/* Metadata Gray Box */}
                    <div className="bg-muted/70 border border-border/60 rounded-xl p-4 text-[13px] font-inter">
                        <div className="flex flex-col gap-1.5">
                            <div>
                                <span className="font-semibold text-text-muted mr-2">Tanggal:</span>
                                <span className="text-danger font-bold">
                                    {formatDate(leaveRequest.start_date)} ({durationDays()})
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold text-text-muted mr-2">Keterangan:</span>
                                <span className="text-text-primary font-medium leading-relaxed">
                                    {leaveRequest.description || "Tidak ada keterangan."}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="mt-4 flex justify-end items-center gap-2.5">
                    {actionSlot ? (
                        actionSlot
                    ) : !isHomeroom && leaveRequest.approval_status === "Pending" ? (
                        <div className="text-[12px] font-bold text-danger border border-dashed border-danger/40 bg-danger-bg px-3.5 py-1.5 rounded-xl inline-flex items-center gap-1.5">
                            <i className="fas fa-lock text-[11px]"></i> Hak akses persetujuan hanya untuk Wali Kelas.
                        </div>
                    ) : leaveRequest.approval_status === "Pending" && (onApprove || onReject) ? (
                        <div className="flex gap-2.5">
                            {onReject && (
                                <Button
                                    type="button"
                                    variant="danger-outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onReject(leaveRequest);
                                    }}
                                >
                                    <i className="fas fa-times mr-1 text-[11px]" /> Tolak
                                </Button>
                            )}
                            {onApprove && (
                                <Button
                                    type="button"
                                    variant="success"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onApprove(leaveRequest);
                                    }}
                                >
                                    <i className="fas fa-check mr-1 text-[11px]" /> Setujui Izin
                                </Button>
                            )}
                        </div>
                    ) : onDetailClick ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDetailClick(leaveRequest);
                            }}
                            className="px-4 py-1.5 bg-surface border border-border rounded-xl text-[12px] font-bold text-text-primary hover:bg-muted transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                            <i className="fas fa-eye text-[11px]"></i> Detail
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}