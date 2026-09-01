import { useState } from "react";
import { useLanguage } from "@/Contexts/LanguageContext";
import { FiCamera, FiFileText } from "react-icons/fi";
import PreviewImageModal from "@/Components/common/PreviewImageModal";

interface Student {
    id: number;
    name: string;
    nis: string;
    status: string;
    status_message?: string | null;
    leave_reason?: string | null;
    check_in_time: string | null;
    photo_url?: string | null;
    document_url?: string | null;
}

interface DailyTableProps {
    students: Student[];
}

type RowStatus = "present" | "late" | "sick" | "permission" | "absent" | "pending" | "no_update" | "no_check_in" | "not_open";

function normalizeStatus(status: string): RowStatus {
    const s = status.toLowerCase();
    if (s === "late") return "late";
    if (s === "sick") return "sick";
    if (s === "permission") return "permission";
    if (s === "present") return "present";
    if (s === "pending") return "pending";
    if (s === "noupdate") return "no_update";
    if (s === "nocheckin") return "no_check_in";
    if (s === "notopen") return "not_open";
    return "absent";
}

function getBadgeStyle(status: RowStatus, t: (key: string) => string) {
    const styles: Record<RowStatus, { label: string; classes: string }> = {
        present: { label: t("reports.statusPresent"), classes: "bg-success-light text-success" },
        late: { label: t("reports.statusLate"), classes: "bg-warning-light text-warning" },
        sick: { label: t("reports.statusSick"), classes: "bg-danger-light text-danger" },
        permission: { label: t("reports.statusPermission"), classes: "bg-primary/10 text-primary" },
        absent: { label: t("reports.statusAbsent"), classes: "bg-danger-light text-danger" },
        pending: { label: t("reports.statusPending"), classes: "bg-info-light text-info" },
        no_update: { label: "-", classes: "bg-transparent text-text-muted" },
        no_check_in: { label: t("reports.noteNotCheckedIn"), classes: "bg-background text-text-muted border border-border" },
        not_open: { label: t("reports.statusNotOpen"), classes: "bg-background text-text-muted border border-border" },
    };
    return styles[status];
}

function getButtonConfig(status: RowStatus, photoUrl?: string | null, docUrl?: string | null, t?: (key: string) => string) {
    if ((status === "present" || status === "late") && photoUrl) {
        return { label: t?.("reports.btnViewSelfie") ?? "Lihat Swafoto", icon: "camera" as const, url: photoUrl };
    }
    if ((status === "sick" || status === "permission" || status === "pending") && docUrl) {
        return { label: t?.("reports.btnViewProof") ?? "Lihat Bukti", icon: "file" as const, url: docUrl };
    }
    return null;
}

function TimeDisplay({ time, t }: { time: string; t: (key: string) => string }) {
    const [h, m, s] = time.split(":");
    const parts = t("reports.noteCheckIn").split("{time}");
    return (
        <>
            {parts[0]}{h}:{m}:
            <span className="text-[10px] font-normal">{s}</span>
            {parts[1]}
        </>
    );
}

function LeaveNote({ text }: { text: string }) {
    return (
        <span
            title={text}
            className="block max-w-[200px] mx-auto truncate"
            style={{ color: "var(--color-text-secondary)" }}
        >
            {text}
        </span>
    );
}

function rowNote(status: RowStatus, checkInTime: string | null, t: (key: string) => string, message?: string | null, leaveReason?: string | null): React.ReactNode {
    if (status === "absent") return t("reports.noteNoUpdate");
    if (status === "sick" || status === "permission") {
        const reason = leaveReason?.trim();
        return reason ? <LeaveNote text={reason} /> : t("reports.noteLeaveRequest");
    }
    if (status === "pending") return t("reports.notePendingVerification");
    if (status === "no_update") return "-";
    if (status === "not_open") return message || t("reports.statusNotOpen");
    if (checkInTime) return <TimeDisplay time={checkInTime} t={t} />;
    return "-";
}

const BORDER_COLORS: Record<RowStatus, string> = {
    present: "var(--color-success)",
    late: "var(--color-warning)",
    sick: "var(--color-medical)",
    permission: "var(--color-primary)",
    absent: "var(--color-danger)",
    pending: "var(--color-info)",
    no_update: "var(--color-text-muted)",
    no_check_in: "var(--color-text-muted)",
    not_open: "var(--color-text-muted)",
};

export default function DailyTable({ students }: DailyTableProps) {
    const { t } = useLanguage();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const HEADERS = [
        { label: t("reports.headerNo"), align: "left" as const },
        { label: t("reports.headerName"), align: "left" as const, sticky: true },
        { label: t("reports.headerNis"), align: "left" as const },
        { label: t("reports.headerStatus"), align: "center" as const },
        { label: t("reports.headerTimeNote"), align: "center" as const },
        { label: t("reports.headerPhoto"), align: "center" as const },
    ];

    return (
        <>
            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-collapse font-inter min-w-[640px]">
                    <thead>
                        <tr className="bg-background border-b border-border">
                            {HEADERS.map((h) => (
                                <th
                                    key={h.label}
                                    className={`px-4 py-3 text-${h.align} text-[12px] font-semibold text-text-muted uppercase tracking-wide ${
                                        h.sticky ? "max-xl:sticky max-xl:left-0 max-xl:z-10 max-xl:bg-background" : ""
                                    }`}
                                >
                                    {h.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center text-text-muted text-[13px] py-10">
                                    {t("reports.emptyDaily")}
                                </td>
                            </tr>
                        ) : (
                            students.map((s, i) => {
                                const status = normalizeStatus(s.status);
                                const badge = getBadgeStyle(status, t);
                                const btn = getButtonConfig(status, s.photo_url, s.document_url, t);
                                return (
                                    <tr
                                        key={s.id}
                                        className="border-b border-border last:border-b-0 hover:bg-background transition-colors"
                                    >
                                        <td className="px-4 py-3 text-[13px] text-text-muted">{i + 1}</td>
                                        <td className="px-4 py-3 text-[13px] font-bold text-text-primary max-xl:sticky max-xl:left-0 max-xl:bg-white max-xl:z-5">
                                            {s.name}
                                        </td>
                                        <td className="px-4 py-3 text-[13px] text-text-primary">{s.nis}</td>
                                        <td className="px-4 py-3 text-center">
                                            {status === "no_update" ? (
                                                <span className="text-[13px] font-bold text-text-muted">-</span>
                                            ) : (
                                                <span
                                                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${badge.classes}`}
                                                >
                                                    {badge.label}
                                                </span>
                                            )}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-[13px] text-center"
                                            style={{ color: status === "late" ? "var(--color-warning)" : "var(--color-text-muted)" }}
                                        >
                                            {rowNote(status, s.check_in_time, t, s.status_message, s.leave_reason)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {btn ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewUrl(btn.url)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border border-border text-text-primary hover:bg-background transition-colors"
                                                >
                                                    {btn.icon === "camera" ? (
                                                        <FiCamera className="text-[11px]" />
                                                    ) : (
                                                        <FiFileText className="text-[11px]" />
                                                    )}
                                                    {btn.label}
                                                </button>
                                            ) : (
                                                <span className="text-text-muted text-[13px]">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden">
                {students.length === 0 ? (
                    <div className="py-12 text-center text-text-muted text-[13px]">
                        {t("reports.emptyDaily")}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {students.map((s) => {
                            const status = normalizeStatus(s.status);
                            const badge = getBadgeStyle(status, t);
                            const btn = getButtonConfig(status, s.photo_url, s.document_url, t);
                            return (
                                <div
                                    key={s.id}
                                    className="bg-surface border border-border border-l-4 rounded-xl p-3"
                                    style={{ borderLeftColor: BORDER_COLORS[status] }}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <p className="text-[14px] font-bold text-text-primary truncate">{s.name}</p>
                                        {status === "no_update" ? (
                                            <span className="text-[13px] font-bold text-text-muted shrink-0">-</span>
                                        ) : (
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase ${badge.classes}`}
                                            >
                                                {badge.label}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[12px] text-text-muted mb-2">NIS: {s.nis}</p>
                                    <div className="bg-background rounded-lg px-3 py-2 mb-2">
                                        <p className="text-[13px] text-text-secondary">
                                            {rowNote(status, s.check_in_time, t, s.status_message, s.leave_reason)}
                                        </p>
                                    </div>
                                    {btn && (
                                        <button
                                            type="button"
                                            onClick={() => setPreviewUrl(btn.url)}
                                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium border border-border text-text-primary hover:bg-background transition-colors"
                                        >
                                            {btn.icon === "camera" ? (
                                                <FiCamera className="text-[12px]" />
                                            ) : (
                                                <FiFileText className="text-[12px]" />
                                            )}
                                            {btn.label}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <PreviewImageModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
        </>
    );
}
