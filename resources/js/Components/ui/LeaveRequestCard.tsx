import React from "react";
import { StatusBadge } from "@/Components";
import type { StatusVariant } from "@/types/component";

export interface LeaveRequest {
    id: number;
    category: string;
    start_date: string;
    end_date: string;
    description?: string | null;
    document_url: string | null;
    approval_status: string;
    student: {
        id: number;
        nisn: string;
        name: string;
        class: { id: number; name: string } | null;
    };
    guardian: {
        id: number;
        name: string;
        phone?: string | null;
    } | null;
    created_at: string;
}

interface LeaveRequestCardProps {
    leaveRequest: LeaveRequest;
    onDetailClick?: (lr: LeaveRequest) => void;
    checkboxSlot?: React.ReactNode;
    actionSlot?: React.ReactNode;
}

const statusToVariant: Record<string, StatusVariant> = {
    Pending: "pending",
    Approved: "approved",
    Rejected: "rejected",
};

const statusBorderColors: Record<string, string> = {
    Pending: "#F59E0B", // amber-500
    Approved: "#10B981", // emerald-500
    Rejected: "#EF4444", // red-500
};

const statusLabels: Record<string, string> = {
    Pending: "MENUNGGU",
    Approved: "DISETUJUI",
    Rejected: "DITOLAK",
};

const categoryLabels: Record<string, string> = {
    Sick: "Sakit",
    Event: "Kegiatan",
    Competition: "Lomba",
    Other: "Lainnya",
};

export function LeaveRequestCard({
    leaveRequest,
    onDetailClick,
    checkboxSlot,
    actionSlot,
}: LeaveRequestCardProps) {
    const statusLabel = leaveRequest.approval_status;
    const variant = statusToVariant[statusLabel] ?? "pending";
    const borderColor = statusBorderColors[statusLabel] ?? "#64748B";

    const guardianInfo = leaveRequest.guardian?.name
        ? `Ibu/Bapak ${leaveRequest.guardian.name} (Wali Murid)`
        : "Siswa";

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

    const formatDateTime = (dateString: string) => {
        if (!dateString) return "Baru saja";
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;
            return d.toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }) + " WIB";
        } catch {
            return dateString;
        }
    };

    return (
        <div
            className="flex flex-row bg-surface border border-border rounded-xl p-0 overflow-hidden shadow-sm relative transition-colors hover:border-primary/30"
            style={{ borderLeftWidth: "6px", borderLeftColor: borderColor }}
        >
            {/* Image Placeholder / Attachment side */}
            <div className="flex w-[80px] sm:w-[150px] pt-4 sm:pt-6 pl-2 sm:pl-0 justify-center shrink-0">
                <div className="w-[60px] h-[60px] sm:w-[110px] sm:h-[110px] bg-slate-200/60 rounded-lg sm:rounded-xl overflow-hidden flex flex-col relative">
                    {leaveRequest.document_url ? (
                        <>
                            <div className="flex-1 flex items-center justify-center">
                                <i className="fas fa-file-prescription text-2xl sm:text-4xl text-slate-400"></i>
                            </div>
                            <a
                                href={leaveRequest.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-[20px] sm:h-[30px] bg-slate-600 hover:bg-slate-700 transition-colors flex items-center justify-center text-[9px] sm:text-[11.5px] text-white font-medium"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <i className="fas fa-search-plus sm:mr-1.5"></i> <span className="hidden sm:inline">Perbesar</span>
                            </a>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <i className="fas fa-image text-xl sm:text-3xl mb-0.5 sm:mb-1 opacity-50"></i>
                            <span className="text-[8px] sm:text-[10px] font-medium opacity-70">Kosong</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content side */}
            <div className="flex-1 p-3 sm:p-5 flex flex-col min-w-0">
                <div className="flex justify-between items-start mb-1 gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        {checkboxSlot && <div className="mt-1 shrink-0" onClick={(e) => e.stopPropagation()}>{checkboxSlot}</div>}
                        <h3 className="font-bold text-[#29347A] text-[15px] sm:text-[18px] truncate">
                            {leaveRequest.student.name}
                        </h3>
                    </div>
                    <div className="shrink-0">
                        <StatusBadge variant={variant} label={statusLabels[statusLabel] ?? statusLabel} />
                    </div>
                </div>

                <p className="text-[11px] sm:text-[13px] text-text-muted mb-4 sm:mb-6 flex items-start sm:items-center gap-1.5 leading-tight">
                    <i className="fas fa-user-edit"></i> Diajukan oleh: {guardianInfo} - {formatDateTime(leaveRequest.created_at)}
                </p>

                <div className="bg-slate-50/80 rounded-xl p-3 sm:p-4 text-[12px] sm:text-[13.5px] grid grid-cols-1 md:grid-cols-2 gap-y-2 sm:gap-y-3 gap-x-6">
                    <div>
                        <span className="font-semibold text-slate-600 mr-2">Kategori:</span>
                        <span className={leaveRequest.category === 'Sick' ? "text-danger font-bold" : "text-primary font-bold"}>
                            {categoryLabels[leaveRequest.category] ?? leaveRequest.category}
                        </span>
                    </div>
                    <div>
                        <span className="font-semibold text-slate-600 mr-2">Tanggal:</span>
                        <span className="text-text-secondary">
                            {leaveRequest.start_date === leaveRequest.end_date
                                ? formatDate(leaveRequest.start_date)
                                : `${formatDate(leaveRequest.start_date)} s/d ${formatDate(leaveRequest.end_date)}`}
                        </span>
                    </div>
                    <div>
                        <span className="font-semibold text-slate-600 mr-2">Kelas:</span>
                        <span className="text-text-secondary">{leaveRequest.student.class?.name ?? "-"}</span>
                    </div>
                    <div>
                        <span className="font-semibold text-slate-600 mr-2">Wali Murid:</span>
                        <span className="text-text-secondary">{leaveRequest.guardian?.name ?? "-"}</span>
                    </div>
                    <div className="md:col-span-2 mt-1">
                        <span className="font-semibold text-slate-600 mr-2">Keterangan:</span>
                        <span className="text-text-secondary leading-relaxed">
                            {leaveRequest.description || "Tidak ada keterangan tertulis."}
                        </span>
                    </div>
                </div>

                {/* Actions Section */}
                <div className="mt-5 flex flex-col sm:flex-row justify-between items-end gap-3">
                    <div className="text-[11px] text-danger border border-dashed border-danger/40 bg-danger/5 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <i className="fas fa-lock"></i> Hak akses persetujuan disesuaikan dengan peran Anda.
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                        {onDetailClick && (
                            <button
                                type="button"
                                onClick={() => onDetailClick(leaveRequest)}
                                className="px-3 py-1.5 flex-1 sm:flex-none bg-surface border border-border rounded-lg text-[12px] font-bold text-text-primary hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
                            >
                                <i className="fas fa-eye"></i> Detail
                            </button>
                        )}
                        {actionSlot}
                    </div>
                </div>
            </div>
        </div>
    );
}
