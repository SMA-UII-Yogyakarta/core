import { useLanguage } from "@/Contexts/LanguageContext";

interface Student {
    id: number;
    name: string;
    nis: string;
    status: string;
    check_in_time: string | null;
}

interface DailyTableProps {
    students: Student[];
}

type RowStatus = "present" | "late" | "sick" | "permission" | "absent" | "pending";

function normalizeStatus(status: string): RowStatus {
    const s = status.toLowerCase();
    if (s === "late") return "late";
    if (s === "sick") return "sick";
    if (s === "permission") return "permission";
    if (s === "present") return "present";
    if (s === "pending") return "pending";
    return "absent";
}

function getBadgeStyle(status: RowStatus, t: (key: string) => string) {
    const styles: Record<RowStatus, { label: string; classes: string }> = {
        present: { label: t("reports.statusPresent"), classes: "bg-success-light text-success" },
        late: { label: t("reports.statusLate"), classes: "bg-warning-light text-warning" },
        sick: { label: t("reports.statusSick"), classes: "bg-danger-light text-danger" },
        permission: { label: t("reports.statusPermission"), classes: "bg-primary/10 text-primary" },
        absent: { label: t("reports.statusAbsent"), classes: "bg-danger-light text-danger" },
        pending: { label: t("reports.statusPending"), classes: "bg-primary/10 text-primary" },
    };
    return styles[status];
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

function rowNote(status: RowStatus, checkInTime: string | null, t: (key: string) => string): React.ReactNode {
    if (status === "absent") return t("reports.noteNoUpdate");
    if (status === "sick" || status === "permission") return t("reports.noteLeaveRequest");
    if (status === "pending") return t("reports.notePendingVerification");
    if (checkInTime) return <TimeDisplay time={checkInTime} t={t} />;
    return "-";
}

export default function DailyTable({ students }: DailyTableProps) {
    const { t } = useLanguage();

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
                                            <span
                                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${badge.classes}`}
                                            >
                                                {badge.label}
                                            </span>
                                        </td>
                                        <td
                                            className="px-4 py-3 text-[13px] text-center"
                                            style={{ color: status === "late" ? "#F59E0B" : "#64748B" }}
                                        >
                                            {rowNote(status, s.check_in_time, t)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {s.check_in_time ? (
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border border-border text-text-primary hover:bg-background transition-colors"
                                                >
                                                    <i className="fas fa-camera text-[11px]" />
                                                    {t("reports.btnPhotoSelfie")}
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
                    <div className="divide-y divide-border">
                        {students.map((s, i) => {
                            const status = normalizeStatus(s.status);
                            const badge = getBadgeStyle(status, t);
                            return (
                                <div key={s.id} className="px-4 py-3 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="text-[13px] text-text-muted shrink-0">{i + 1}</span>
                                        <div className="min-w-0">
                                            <p className="text-[14px] font-bold text-text-primary truncate">{s.name}</p>
                                            <p className="text-[12px] text-text-muted mt-0.5">
                                                NIS: {s.nis} &middot; {rowNote(status, s.check_in_time, t)}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 uppercase ${badge.classes}`}
                                    >
                                        {badge.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
