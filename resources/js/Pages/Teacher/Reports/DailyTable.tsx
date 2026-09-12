import { useState } from "react";
import { FiCalendar, FiCamera, FiClock, FiFileText } from "react-icons/fi";
import { Button, MobileNativePagination, StatusBadge, Table, TableFooter, TableSection } from "@/Components";
import type { Column } from "@/Components/ui/Table";
import PreviewImageModal from "@/Components/common/PreviewImageModal";
import { useLanguage } from "@/Contexts/LanguageContext";
import { useClientPagination } from "@/hooks/useClientPagination";

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
    isHoliday?: boolean;
}

type RowStatus =
    | "present"
    | "late"
    | "sick"
    | "permission"
    | "absent"
    | "pending"
    | "no_update"
    | "no_check_in"
    | "not_open";

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

function getBadgeLabel(status: RowStatus, t: (key: string) => string): string {
    switch (status) {
        case "present":
            return t("reports.statusPresent");
        case "late":
            return t("reports.statusLate");
        case "sick":
            return t("reports.statusSick");
        case "permission":
            return t("reports.statusPermission");
        case "absent":
            return t("reports.statusAbsent");
        case "pending":
            return t("reports.statusPending");
        case "no_update":
            return "-";
        case "no_check_in":
            return t("reports.noteNotCheckedIn");
        case "not_open":
            return t("reports.statusNotOpen");
    }
}

function getButtonConfig(
    status: RowStatus,
    t: (key: string) => string,
    photoUrl?: string | null,
    docUrl?: string | null,
) {
    if ((status === "present" || status === "late") && photoUrl) {
        return { label: t("reports.btnViewSelfie"), icon: "camera" as const, url: photoUrl };
    }
    if ((status === "sick" || status === "permission" || status === "pending") && docUrl) {
        return { label: t("reports.btnViewProof"), icon: "file" as const, url: docUrl };
    }
    return null;
}

function TimeDisplay({ time, t }: { time: string; t: (key: string) => string }) {
    const [h, m, s] = time.split(":");
    const parts = t("reports.noteCheckIn").split("{time}");
    return (
        <>
            {parts[0]}
            {h}:{m}:<span className="text-[10px] font-normal">{s}</span>
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

function rowNote(
    status: RowStatus,
    checkInTime: string | null,
    t: (key: string) => string,
    message?: string | null,
    leaveReason?: string | null,
): React.ReactNode {
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

export default function DailyTable({ students, isHoliday = false }: DailyTableProps) {
    const { t } = useLanguage();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const {
        setCurrentPage,
        totalPages,
        safePage,
        paginatedData: paginatedStudents,
        pageSize,
    } = useClientPagination(students, 1, 10);

    const tableData = paginatedStudents.map((student, index) => ({
        ...student,
        displayNumber: (safePage - 1) * pageSize + index + 1,
    }));

    const columns: Column<(typeof tableData)[number]>[] = [
        {
            key: "displayNumber",
            header: t("reports.headerNo"),
            className: "w-12 text-center",
            render: (student) => <span className="font-bold text-text-secondary text-[13px]">{student.displayNumber}</span>,
        },
        {
            key: "name",
            header: t("reports.headerName"),
            className: "font-bold text-text-primary text-[14px] min-w-[180px]",
            render: (student) => (
                <span className="font-bold text-text-primary text-[14px] whitespace-nowrap truncate block max-w-[240px] sm:max-w-[320px]" title={student.name}>
                    {student.name}
                </span>
            ),
        },
        {
            key: "nis",
            header: t("reports.headerNis"),
            className: "font-semibold text-text-primary text-[13px] min-w-[90px]",
        },
        {
            key: "status",
            header: t("reports.headerStatus"),
            className: "w-40 text-center",
            render: (student) => {
                const status = normalizeStatus(student.status);
                return (
                    <StatusBadge
                        variant={status}
                        label={getBadgeLabel(status, t)}
                        className="text-[11px] font-bold px-2.5 py-1 uppercase"
                    />
                );
            },
        },
        {
            key: "check_in_time",
            header: t("reports.headerTimeNote"),
            className: "text-[13px]",
            render: (student) => {
                const status = normalizeStatus(student.status);
                return (
                    <span
                        className="font-bold text-text-primary"
                        style={{ color: status === "late" ? "var(--color-warning)" : undefined }}
                    >
                        {rowNote(status, student.check_in_time, t, student.status_message, student.leave_reason)}
                    </span>
                );
            },
        },
        {
            key: "photo_url",
            header: t("reports.headerPhoto"),
            className: "w-36 text-center",
            render: (student) => {
                const status = normalizeStatus(student.status);
                const button = getButtonConfig(status, t, student.photo_url, student.document_url);
                return button ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={button.icon === "camera" ? <FiCamera className="text-[12px]" /> : <FiFileText className="text-[12px]" />}
                        onClick={() => setPreviewUrl(button.url)}
                        className="text-[12px] font-bold text-primary hover:bg-primary-light h-8 px-3 rounded-lg"
                    >
                        {button.label}
                    </Button>
                ) : (
                    <span className="text-text-muted text-[13px]">-</span>
                );
            },
        },
    ];

    return (
        <>
            {/* Tablet & Desktop */}
            <TableSection desktopOnly className="w-full font-inter">
                {isHoliday && (
                    <div className="px-4 py-3 text-[13px] font-bold text-warning bg-warning-light flex items-center gap-2 shrink-0">
                        <FiCalendar className="text-[12px]" />
                        {t("reports.holidayNotice")}
                    </div>
                )}
                <Table
                    columns={columns}
                    data={tableData}
                    keyExtractor={(student) => student.id}
                    emptyMessage={t("reports.emptyDaily")}
                    minWidthClassName="min-w-[640px]"
                    fill
                />

                <TableFooter
                    info={t("reports.footerNote")}
                    currentPage={safePage}
                    totalPages={totalPages}
                    totalItems={students.length}
                    perPage={pageSize}
                    onPageChange={setCurrentPage}
                />
            </TableSection>

            {/* Mobile */}
            <div className="sm:hidden">
                {isHoliday && (
                    <div className="mb-2 px-4 py-3 text-[13px] font-bold text-warning bg-warning-light flex items-center gap-2 rounded-xl">
                        <FiCalendar className="text-[12px]" />
                        {t("reports.holidayNotice")}
                    </div>
                )}
                {students.length === 0 ? (
                    <div className="py-12 text-center text-text-muted text-[13px]">{t("reports.emptyDaily")}</div>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {paginatedStudents.map((s) => {
                            const status = normalizeStatus(s.status);
                            const label = getBadgeLabel(status, t);
                            const btn = getButtonConfig(status, t, s.photo_url, s.document_url);
                            return (
                                <div
                                    key={s.id}
                                    className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex flex-col gap-2.5 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[14px] font-bold text-text-primary truncate">{s.name}</p>
                                            <p className="text-[12px] text-text-muted mt-0.5">NIS: {s.nis}</p>
                                        </div>
                                        <StatusBadge
                                            variant={status}
                                            label={label}
                                            className="text-[12px] font-semibold px-2.5 py-0.5 shrink-0"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[12.5px]">
                                        <div className="flex items-center gap-1.5 text-text-secondary min-w-0 flex-1 mr-2">
                                            <span className="flex items-center gap-1.5 font-semibold text-text-primary">
                                                <FiClock className="text-[13px] text-emerald-600 shrink-0" />
                                                <span className="truncate">
                                                    {rowNote(status, s.check_in_time, t, s.status_message, s.leave_reason)}
                                                </span>
                                            </span>
                                        </div>
                                        {btn && (
                                            <button
                                                type="button"
                                                onClick={() => setPreviewUrl(btn.url)}
                                                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-primary/25 bg-primary/5 text-primary text-[11px] font-bold hover:bg-primary/10 active:scale-95 transition-all cursor-pointer"
                                            >
                                                {btn.icon === "camera" ? (
                                                    <FiCamera className="text-[11px]" />
                                                ) : (
                                                    <FiFileText className="text-[11px]" />
                                                )}
                                                {btn.label}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {students.length > pageSize && (
                            <div className="pt-2 font-inter">
                                <MobileNativePagination
                                    currentPage={safePage}
                                    totalPages={totalPages}
                                    totalItems={students.length}
                                    perPage={pageSize}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <PreviewImageModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
        </>
    );
}
