import { useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import { FiUserX, FiFileText, FiImage, FiX, FiInfo, FiCircle } from "react-icons/fi";
import { FiMessageSquare, FiSearch, FiChevronRight } from "react-icons/fi";
import AppShell from "@/Layouts/AppShell";
import { useLanguage } from "@/Contexts/LanguageContext";
import PreviewImageModal from "@/Components/common/PreviewImageModal";
import {
    Table,
    Pagination,
    SearchBar,
    EmptyState,
    Drawer,
    PageHeader,
    StatCard,
    StatusBadge,
    MobileNativePagination,
} from "@/Components";
import { type RowStatus } from "@/utils/attentionPriority";
import type { StatusInput } from "@/Components/ui/StatusBadge";
import {
    getRowStatus,
    rowNote,
    translateCategory,
    formatTime,
    formatTimeSeconds,
    formatFullDate,
    formatDateTime,
    waPhone,
    sortAttention,
    type ApprovedLeaveInfo,
    type Student,
    type Translate,
} from "@/utils/attentionRows";
import type { Column } from "@/Components/ui/Table";

interface Teacher {
    id: number;
    name: string;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface Stats {
    total: number;
    present: number;
    late: number;
    absent: number;
    pending_leave?: number;
    sick_permission?: number;
    approved_permission?: number;
    truly_absent?: number;
}

interface PageProps {
    teacher: Teacher;
    class: SchoolClass | null;
    students: Student[];
    stats: Stats | null;
    pendingLeaveCount: number;
    expiredPendingCount: number;
    approvedLeaves: Record<number, ApprovedLeaveInfo>;
    lateThreshold: string | null;
    isSchoolDay: boolean;
}

const STATUS_BADGE_MAP: Record<RowStatus, { variant: StatusInput; labelKey: string }> = {
    absent: { variant: "absent", labelKey: "homeroom.badgeAbsent" },
    late: { variant: "late", labelKey: "homeroom.badgeLate" },
    pending: { variant: "pending", labelKey: "homeroom.badgePending" },
    permitted: { variant: "permission", labelKey: "homeroom.badgePermitted" },
    present: { variant: "present", labelKey: "homeroom.badgePresent" },
};

function guardianMessage(t: Translate, s: Student, className: string): string {
    const streakPart =
        s.consecutiveAbsences >= 2
            ? t("homeroom.waAbsentStreak", { count: s.consecutiveAbsences })
            : t("homeroom.waAbsentToday");
    const name = s.guardian_name ?? t("homeroom.waGuardianFallback");
    return t("homeroom.waMessage", {
        guardian: name,
        className,
        student: s.name,
        nis: s.nis,
        absence: streakPart,
    });
}

function ContactGuardianButton({ student, className }: { student: Student; className: string }) {
    const { t } = useLanguage();
    const phone = waPhone(student.guardian_phone);

    if (!phone) {
        return (
            <button
                type="button"
                disabled
                title={t("homeroom.waNoPhoneTitle")}
                className="w-full inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[12px] font-bold text-text-muted bg-muted border border-border cursor-not-allowed transition-all"
            >
                {t("homeroom.noContact")}
            </button>
        );
    }

    const href = `https://wa.me/${phone}?text=${encodeURIComponent(guardianMessage(t, student, className))}`;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold text-danger bg-danger-bg border border-danger-light hover:bg-danger-light/30 transition-all active:scale-[0.98]"
        >
            <FiMessageSquare className="shrink-0 text-[14px]" />
            <span>{t("homeroom.contactGuardian")}</span>
        </a>
    );
}

function isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
}

function BacklogBanner({ count }: { count: number }) {
    const { t } = useLanguage();
    if (count <= 0) return null;
    return (
        <Link
            href="/leave-requests/verification"
            className="flex items-center gap-2.5 bg-warning-bg border border-warning/40 rounded-xl px-3.5 py-3 text-[13px] text-text-warning-badge cursor-pointer active:scale-[0.98] transition-transform"
        >
            <span className="flex-1">
                <strong>{count}</strong> {t("homeroom.backlogBanner")}
            </span>
            <FiChevronRight className="text-[11px] shrink-0" />
        </Link>
    );
}

export default function HomeroomDashboard({
    class: schoolClass,
    students,
    stats,
    expiredPendingCount,
    approvedLeaves,
    lateThreshold,
    isSchoolDay,
}: PageProps) {
    const { t } = useLanguage();
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const pageSize = 10;

    const attentionStudents = useMemo(() => {
        const raw = sortAttention(students, approvedLeaves);
        if (!search.trim()) return raw;
        const q = search.toLowerCase();
        return raw.filter((s) => s.name.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q));
    }, [students, search, approvedLeaves]);

    const totalPages = Math.ceil(attentionStudents.length / pageSize) || 1;
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const paginatedAttention = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return attentionStudents.slice(start, start + pageSize);
    }, [attentionStudents, safePage, pageSize]);

    if (!schoolClass) {
        return (
            <AppShell title={t("homeroom.title")}>
                <EmptyState
                    variant="no-data"
                    icon={<FiUserX className="text-4xl" />}
                    title={t("homeroom.notAssignedTitle")}
                    description={t("homeroom.notAssignedDesc")}
                />
            </AppShell>
        );
    }

    if (!isSchoolDay) {
        return (
            <AppShell title={t("homeroom.title")}>
                <EmptyState
                    variant="no-data"
                    icon={<FiUserX className="text-4xl" />}
                    title={t("homeroom.notSchoolDayTitle")}
                    description={t("homeroom.notSchoolDayDesc")}
                />
            </AppShell>
        );
    }

    const classroomName = schoolClass.name ?? "-";

    const statsData = stats as Stats;

    const columns: Column<Student>[] = [
        {
            key: "nis",
            header: t("homeroom.nis"),
            className: "w-32",
            render: (s: Student) => <span className="font-bold text-text-primary text-[13px]">{s.nis}</span>,
        },
        {
            key: "name",
            header: t("homeroom.thName"),
            className: "min-w-[180px]",
            render: (s: Student) => (
                <span className="font-semibold text-text-primary text-[14px] whitespace-nowrap truncate block max-w-[240px]" title={s.name}>
                    {s.name}
                </span>
            ),
        },
        {
            key: "status",
            header: t("homeroom.thStatus"),
            className: "w-40 text-center",
            render: (s: Student) => {
                const st = getRowStatus(s, approvedLeaves);
                const badge = STATUS_BADGE_MAP[st];
                return (
                    <StatusBadge variant={badge.variant} label={t(badge.labelKey)} />
                );
            },
        },
        {
            key: "note",
            header: t("homeroom.thTime"),
            className: "text-[13px]",
            render: (s: Student) => {
                const st = getRowStatus(s, approvedLeaves);
                const note = rowNote(s, approvedLeaves, t);
                return (
                    <span className={`font-medium text-[13px] ${st === "late" ? "text-warning font-bold" : "text-text-secondary"}`}>
                        {note}
                    </span>
                );
            },
        },
        {
            key: "actions",
            header: t("homeroom.thAction"),
            className: "w-40 text-center",
            render: (s: Student) => {
                const st = getRowStatus(s, approvedLeaves);
                if (st === "pending") {
                    return (
                        <Link
                            href={`/leave-requests/verification?highlight=${s.nis}&submitted=${encodeURIComponent(s.pendingLeave?.created_at ?? "")}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-[12px] font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all mx-auto cursor-pointer"
                        >
                            {t("homeroom.btnVerify")}
                        </Link>
                    );
                }
                if (st === "absent") {
                    return (
                        <div onClick={(e) => e.stopPropagation()}>
                                                    <ContactGuardianButton student={s} className={schoolClass.name} />
                        </div>
                    );
                }
                return null;
            },
        },
    ];

    return (
        <AppShell title={t("homeroom.title")}>
            {/* Desktop Header */}
            <PageHeader
                title={`${t("homeroom.title")} — ${classroomName}`}
                description={t("homeroom.headerSubtitle")}
                className="hidden lg:flex shrink-0 mb-4"
            >
                <span className="hidden lg:inline self-start px-3 py-1.5 bg-muted border border-border rounded-lg text-[13px] font-medium text-text-secondary whitespace-nowrap">
                    {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </span>
            </PageHeader>

            <div className="space-y-6 font-inter">
                {/* ─── Mobile Stat Summary (with date) ─── */}
                <div className="lg:hidden rounded-xl border border-border bg-surface p-3 space-y-3">
                    <span className="text-[13px] font-medium text-text-secondary whitespace-nowrap block text-center">
                        <span className="inline-flex items-center gap-1">
                            {t("homeroom.today")}
                            <FiCircle className="w-1.5 h-1.5 fill-current" />
                            {new Date().toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </span>
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                        <StatCard compact label={t("homeroom.statOnTime")} value={statsData.present} variant="success" className="!flex-row-reverse !items-baseline !justify-center !gap-2 !min-h-0 !p-2.5" />
                        <StatCard compact label={t("homeroom.statLate")} value={statsData.late} variant="warning" className="!flex-row-reverse !items-baseline !justify-center !gap-2 !min-h-0 !p-2.5" />
                        <StatCard compact label={t("homeroom.statPermitFull")} value={statsData.approved_permission ?? 0} variant="primary" className="!flex-row-reverse !items-baseline !justify-center !gap-2 !min-h-0 !p-2.5" />
                        <StatCard compact label={t("homeroom.statAbsent")} value={statsData.truly_absent ?? 0} variant="danger" className="!flex-row-reverse !items-baseline !justify-center !gap-2 !min-h-0 !p-2.5" />
                    </div>
                </div>

                {/* ─── Desktop Stat Cards ─── */}
                <div className="hidden lg:grid grid-cols-4 gap-4">
                    <StatCard label={t("homeroom.statOnTimeFull")} value={statsData.present} variant="success" bgVariant="success-light" />
                    <StatCard label={t("homeroom.statLate")} value={statsData.late} variant="warning" bgVariant="warning-light" />
                    <StatCard label={t("homeroom.statPermitFull")} value={statsData.approved_permission ?? 0} variant="primary" bgVariant="primary-light" />
                    <StatCard label={t("homeroom.statAbsent")} value={statsData.truly_absent ?? 0} variant="danger" bgVariant="danger-light" />
                </div>

                {/* Backlog banner */}
                <BacklogBanner count={expiredPendingCount} />

                {/* Attention section */}
                <div className="flex flex-col gap-4">
                    {/* ─── Mobile search ─── */}
                    <div className="lg:hidden">
                        {!isSearchOpen && !search ? (
                            <div className="flex items-center justify-between">
                                <h3 className="text-[16px] font-bold text-text-primary font-inter">{t("homeroom.attentionTitle")}</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsSearchOpen(true)}
                                    className="p-2 -mr-2 pr-2 text-text-muted hover:text-primary transition-colors"
                                    aria-label={t("homeroom.openSearch")}
                                >
                                    <FiSearch className="text-[16px]" />
                                </button>
                            </div>
                        ) : (
                            <div className="sticky top-0 z-10 bg-surface py-3 -mx-4 px-4 self-start border-b border-border shadow-sm">
                                <div className="relative">
                                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-inactive text-sm pointer-events-none" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        onBlur={() => {
                                            if (!search) setIsSearchOpen(false);
                                        }}
                                        placeholder={t("homeroom.searchPlaceholder")}
                                        autoFocus
                                        className="h-10 pl-10 pr-10 w-full border border-border rounded-lg text-[14px] font-inter text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-text-inactive transition-all"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearch("");
                                                setCurrentPage(1);
                                                setIsSearchOpen(false);
                                            }}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-inactive hover:text-text-primary text-[14px] font-bold"
                                            aria-label={t("homeroom.openSearch")}
                                        >
                                            <FiX className="text-[16px]" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ─── Desktop search ─── */}
                    <div className="hidden lg:flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="text-[16px] font-bold text-text-primary font-inter">{t("homeroom.attentionTitle")}</h3>
                            <div className="w-72">
                                <SearchBar
                                    value={search}
                                    onChange={(val) => {
                                        setSearch(val);
                                        setCurrentPage(1);
                                    }}
                                    onSearch={() => setCurrentPage(1)}
                                    placeholder={t("homeroom.searchPlaceholder")}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-text-muted font-medium">
                            <FiInfo className="text-primary text-[14px] shrink-0" />
                            <span>{t("homeroom.attentionSubtitle", { className: classroomName })}</span>
                        </div>
                    </div>

                    {/* ─── Mobile Card List (page-based) ─── */}
                    <div className="lg:hidden flex flex-col min-h-[400px]">
                        <div className="flex-1 space-y-3">
                            {attentionStudents.length === 0 ? (
                                <div className="text-center py-8 text-[13px] text-text-muted">
                                    {t("homeroom.allPresent")}
                                </div>
                            ) : (
                                paginatedAttention.map((s) => {
                                    const st = getRowStatus(s, approvedLeaves);
                                    const badge = STATUS_BADGE_MAP[st];
                                    const borderColors = {
                                        absent: "border-danger",
                                        late: "border-warning",
                                        pending: "border-primary",
                                        permitted: "border-success",
                                        present: "border-success",
                                    };
                                    const isClickable = st !== "pending";
                                    return (
                                        <div
                                            key={s.id}
                                            onClick={isClickable ? () => setSelectedStudent(s) : undefined}
                                            className={`bg-surface ${borderColors[st]} border-l-4 rounded-xl p-4 space-y-3 ${isClickable ? "cursor-pointer active:scale-[0.98] transition-transform" : ""}`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="min-w-0 flex-1 text-[15px] font-bold text-text-primary truncate">{s.name}</h4>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <StatusBadge variant={badge.variant} label={t(badge.labelKey)} className="text-[10px]" />
                                                    {isClickable && (
                                                        <FiChevronRight className="text-[11px] text-text-muted" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="bg-background rounded-lg px-2.5 py-1.5">
                                                <p className="text-[12px] text-text-muted">{rowNote(s, approvedLeaves, t)}</p>
                                            </div>
                                            {st === "absent" && (
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <ContactGuardianButton student={s} className={schoolClass.name} />
                                                </div>
                                            )}
                                            {st === "pending" && (
                                                <Link
                                                    href={`/leave-requests/verification?highlight=${s.nis}&submitted=${encodeURIComponent(s.pendingLeave?.created_at ?? "")}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="relative block w-full text-center px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-bold"
                                                >
                                                    {t("homeroom.btnVerify")}
                                                    <FiChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white/70" />
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {attentionStudents.length > pageSize && (
                            <MobileNativePagination
                                currentPage={safePage}
                                totalPages={totalPages}
                                totalItems={attentionStudents.length}
                                perPage={pageSize}
                                onPageChange={setCurrentPage}
                                className="mb-4"
                                labels={{
                                    showingAll: t("ui.pagination.showingAll"),
                                    showingRange: t("ui.pagination.showingRange"),
                                    prev: t("ui.pagination.prev"),
                                    next: t("ui.pagination.next"),
                                    pageInfo: t("ui.pagination.pageInfo"),
                                    selectPage: t("ui.pagination.selectPage"),
                                    sheetTitle: t("ui.pagination.sheetTitle"),
                                    sheetSubtitle: t("ui.pagination.sheetSubtitle"),
                                    firstPage: t("ui.pagination.firstPage"),
                                    lastPage: t("ui.pagination.lastPage"),
                                    prevAria: t("ui.pagination.prevAria"),
                                    nextAria: t("ui.pagination.nextAria"),
                                }}
                            />
                        )}
                    </div>

                    {/* ─── Desktop Table ─── */}
                    <div className="hidden lg:block">
                        <Table<Student>
                            columns={columns}
                            data={paginatedAttention}
                            keyExtractor={(s) => s.id}
                            onRowClick={(s) => {
                                const st = getRowStatus(s, approvedLeaves);
                                if (st !== "pending") setSelectedStudent(s);
                            }}
                            emptyMessage={t("homeroom.allPresent")}
                        />
                    </div>

                    {/* Desktop footer (outside mobile flex container) */}
                    <div className="hidden lg:flex pt-2 justify-end shrink-0 mt-auto font-inter min-h-[36px]">
                        {attentionStudents.length > pageSize && (
                            <Pagination
                                currentPage={safePage}
                                totalPages={totalPages}
                                totalItems={attentionStudents.length}
                                perPage={pageSize}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Student Detail Drawer */}
            <Drawer
                open={selectedStudent !== null}
                onClose={() => setSelectedStudent(null)}
                title={t("homeroom.drawerTitle")}
                width="md"
            >
                {selectedStudent && (
                    <div className="space-y-4 text-text-primary text-[14px]">
                        <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                            <div>
                                <span className="text-[11px] font-bold text-text-inactive uppercase tracking-wider block">
                                    {t("homeroom.thStatus")}
                                </span>
                                <span className="font-bold text-[15px]">
                                    {t(STATUS_BADGE_MAP[getRowStatus(selectedStudent, approvedLeaves)].labelKey)}
                                </span>
                            </div>
                            <StatusBadge
                                variant={STATUS_BADGE_MAP[getRowStatus(selectedStudent, approvedLeaves)].variant}
                                label={t(STATUS_BADGE_MAP[getRowStatus(selectedStudent, approvedLeaves)].labelKey)}
                            />
                        </div>

                        <div className="border border-border/80 rounded-xl p-4 space-y-2">
                            <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">{t("homeroom.studentInfo")}</h3>
                            <div className="grid grid-cols-2 gap-3 text-[13px]">
                                <div>
                                    <span className="text-text-muted block text-[11px]">{t("homeroom.fullName")}</span>
                                    <span className="font-semibold">{selectedStudent.name}</span>
                                </div>
                                <div>
                                    <span className="text-text-muted block text-[11px]">{t("homeroom.nis")}</span>
                                    <span className="font-semibold">{selectedStudent.nis}</span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-border/80 rounded-xl p-4 space-y-2">
                            <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">{t("homeroom.detailDescription")}</h3>
                            <p className="text-[13px] text-text-secondary">
                                {rowNote(selectedStudent, approvedLeaves, t)}
                            </p>
                        </div>

                        {getRowStatus(selectedStudent, approvedLeaves) === "late" &&
                            (() => {
                                const att = selectedStudent.attendances[0];
                                return (
                                    <div className="border border-border/80 rounded-xl p-4 space-y-3">
                                        <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">
                                            {t("homeroom.detailTitle")}
                                        </h3>
                                        <div className="space-y-2.5 text-[13px]">
                                            <div className="flex justify-between gap-3">
                                                <span className="text-text-muted">{t("homeroom.checkInTime")}</span>
                                                <span className="font-semibold text-right">
                                                    {formatTimeSeconds(att?.check_in_time, t)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <span className="text-text-muted">{t("homeroom.lateDuration")}</span>
                                                <span className="font-semibold text-right">
                                                    {att?.late_minutes != null ? t("homeroom.lateMinutes", { minutes: att.late_minutes }) : "-"}
                                                </span>
                                            </div>
                                            {lateThreshold && (
                                                <div className="flex justify-between gap-3">
                                                    <span className="text-text-muted">{t("homeroom.lateThreshold")}</span>
                                                    <span className="font-semibold text-right">{formatTime(lateThreshold, t)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                        {getRowStatus(selectedStudent, approvedLeaves) === "permitted" &&
                            (() => {
                                const leave = approvedLeaves[selectedStudent.id];
                                if (!leave) return null;
                                const dateRange =
                                    leave.start_date === leave.end_date
                                        ? formatFullDate(leave.start_date)
                                        : `${formatFullDate(leave.start_date)} - ${formatFullDate(leave.end_date)}`;
                                return (
                                    <div className="border border-border/80 rounded-xl p-4 space-y-3">
                                        <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">
                                            {t("homeroom.leaveDetailTitle")}
                                        </h3>
                                        <div className="space-y-2.5 text-[13px]">
                                            <div className="flex justify-between gap-3">
                                                <span className="text-text-muted">{t("homeroom.detailCategory")}</span>
                                                <span className="font-semibold text-right">
                                                    {t("homeroom.permitAccepted", { category: translateCategory(leave.category, t) })}
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <span className="text-text-muted">{t("homeroom.leaveDates")}</span>
                                                <span className="font-semibold text-right">{dateRange}</span>
                                            </div>
                                            {leave.description && (
                                                <div className="flex justify-between gap-3">
                                                    <span className="text-text-muted">{t("homeroom.leaveDescription")}</span>
                                                    <span className="font-semibold text-right max-w-[60%]">
                                                        {leave.description}
                                                    </span>
                                                </div>
                                            )}
                                            {leave.document_url && (
                                                <div className="flex justify-between gap-3">
                                                    <span className="text-text-muted">{t("homeroom.leaveDocument")}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewUrl(leave.document_url)}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-[12px] font-semibold text-primary hover:bg-primary/5 transition-colors"
                                                    >
                                                        {isImageUrl(leave.document_url) ? (
                                                            <FiImage className="text-[14px] shrink-0" />
                                                        ) : (
                                                            <FiFileText className="text-[14px] shrink-0" />
                                                        )}
                                                        {t("homeroom.viewDocument")}
                                                        {isImageUrl(leave.document_url) && (
                                                            <img
                                                                src={leave.document_url}
                                                                alt={t("homeroom.leaveDocument")}
                                                                className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                                                            />
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                            <div className="flex justify-between gap-3">
                                                <span className="text-text-muted">{t("homeroom.submittedBy")}</span>
                                                <span className="font-semibold text-right">
                                                    {leave.guardian_name ?? "-"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <span className="text-text-muted">{t("homeroom.submittedOn")}</span>
                                                <span className="font-semibold text-right">
                                                    {formatDateTime(leave.created_at)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <span className="text-text-muted">{t("homeroom.acceptedOn")}</span>
                                                <span className="font-semibold text-right">
                                                    {formatDateTime(leave.updated_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                        {getRowStatus(selectedStudent, approvedLeaves) === "absent" &&
                            (() => {
                                const streak = selectedStudent.consecutiveAbsences;
                                return (
                                    <div className="border border-danger-light rounded-xl p-4 space-y-3 bg-danger-bg">
                                        <h3 className="font-bold text-danger text-[13px] uppercase tracking-wide">
                                            {streak >= 2 ? t("homeroom.absentTitleMulti", { count: streak }) : t("homeroom.absentTitleToday")}
                                        </h3>
                                        <p className="text-[13px] text-text-secondary">
                                            {streak >= 2
                                                ? t("homeroom.absentDescMulti", { count: streak })
                                                : t("homeroom.absentDescToday")}
                                        </p>
                                        <ContactGuardianButton student={selectedStudent} className={schoolClass.name} />
                                    </div>
                                );
                            })()}
                    </div>
                )}
            </Drawer>

            <PreviewImageModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
        </AppShell>
    );
}