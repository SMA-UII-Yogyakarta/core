import { FiCalendar, FiCheck, FiImage, FiRotateCcw, FiX } from "react-icons/fi";
import { Avatar, Button, StatusBadge, Table } from "@/Components";
import type { Column } from "@/Components/ui/Table";
import type { LeaveRequest } from "./types";
import { calculateDuration, categoryConfig, formatDate, formatRelativeTime, getUrgencyInfo } from "./types";

interface TeacherLeaveVerificationTableProps {
    requests: LeaveRequest[];
    onPreviewImage: (url: string) => void;
    onApprove: (request: LeaveRequest) => void;
    onReject: (request: LeaveRequest) => void;
    onRevert: (request: LeaveRequest) => void;
}

const statusLabel: Record<LeaveRequest["approval_status"], string> = {
    Pending: "Menunggu",
    Approved: "Disetujui",
    Rejected: "Ditolak",
};

export default function TeacherLeaveVerificationTable({
    requests,
    onPreviewImage,
    onApprove,
    onReject,
    onRevert,
}: TeacherLeaveVerificationTableProps) {
    const columns: Column<LeaveRequest>[] = [
        {
            key: "student",
            header: "Siswa",
            className: "text-left min-w-[210px]",
            render: (request) => (
                <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={request.student?.name || "Tanpa Nama"} size="sm" />
                    <div className="min-w-0">
                        <div className="font-bold text-[13px] text-text-primary truncate" title={request.student?.name}>
                            {request.student?.name || "Tanpa Nama"}
                        </div>
                        <div className="text-[11px] text-text-muted">NIS: {request.student?.nis || "-"}</div>
                    </div>
                </div>
            ),
        },
        {
            key: "request",
            header: "Pengajuan",
            className: "text-left min-w-[150px]",
            render: (request) => {
                const category = categoryConfig[request.category] ?? categoryConfig.Other;

                return (
                    <div className="flex flex-col items-start gap-1">
                        <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${category.badgeBgColor} ${category.textColor} ${category.borderColor}`}
                        >
                            {category.label}
                        </span>
                        <span className="text-[11px] text-text-muted">
                            Diajukan {formatRelativeTime(request.created_at)}
                        </span>
                        {request.guardian && (
                            <span
                                className="text-[11px] text-text-muted truncate max-w-[150px]"
                                title={request.guardian.name}
                            >
                                Wali: {request.guardian.name}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            key: "period",
            header: "Periode Izin",
            className: "text-left min-w-[205px]",
            render: (request) => {
                const urgency = getUrgencyInfo(request.start_date);
                const duration = calculateDuration(request.start_date, request.end_date);

                return (
                    <div>
                        <div className="flex items-start gap-1.5 text-[12px] text-text-primary">
                            <FiCalendar className="mt-0.5 shrink-0 text-text-muted" />
                            <span>
                                <strong>{formatDate(request.start_date)}</strong>
                                {request.start_date !== request.end_date && (
                                    <>
                                        {" "}
                                        s.d. <strong>{formatDate(request.end_date)}</strong>
                                    </>
                                )}
                                <span className="text-text-muted"> ({duration} Hari)</span>
                            </span>
                        </div>
                        {urgency && (
                            <span
                                className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                    urgency.isOverdue
                                        ? "bg-danger/10 text-danger border border-danger/20"
                                        : "bg-warning-bg text-warning border border-warning/20"
                                }`}
                            >
                                {urgency.label}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            key: "description",
            header: "Keterangan",
            className: "text-left min-w-[220px]",
            render: (request) => (
                <div className="text-[12px] text-text-secondary">
                    <span className="block max-w-[230px] truncate" title={request.description || "-"}>
                        {request.description || "-"}
                    </span>
                    {request.document_url && (
                        <button
                            type="button"
                            onClick={() => onPreviewImage(request.document_url!)}
                            className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                        >
                            <FiImage /> Lihat lampiran
                        </button>
                    )}
                </div>
            ),
        },
        {
            key: "status",
            header: "Status",
            className: "text-center w-32",
            render: (request) => (
                <StatusBadge
                    variant={request.approval_status}
                    label={statusLabel[request.approval_status]}
                    className="py-1 text-[11px]"
                />
            ),
        },
        {
            key: "actions",
            header: "Aksi",
            className: "text-center w-56",
            render: (request) => {
                const isPending = request.approval_status === "Pending";

                return (
                    <div className="flex items-center justify-center gap-1.5">
                        {isPending ? (
                            <>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onReject(request)}
                                    icon={<FiX size={13} />}
                                >
                                    Tolak
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => onApprove(request)}
                                    icon={<FiCheck size={13} />}
                                >
                                    Setujui
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRevert(request)}
                                icon={<FiRotateCcw size={13} />}
                            >
                                Revert
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <Table
            columns={columns}
            data={requests}
            keyExtractor={(request) => request.id}
            minWidthClassName="min-w-[980px]"
            dense
            fill
        />
    );
}
