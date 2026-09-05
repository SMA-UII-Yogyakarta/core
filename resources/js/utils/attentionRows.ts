import { attentionPriority, type RowStatus } from "@/utils/attentionPriority";

export type Translate = (key: string, params?: Record<string, string | number>) => string;

export interface StudentAttendance {
    id: number;
    status: string;
    check_in_time: string | null;
    late_minutes: number | null;
}

export interface LeaveInfo {
    id: number;
    category: string;
    approval_status: string;
    description: string | null;
    document_url: string | null;
    start_date: string;
    end_date: string;
    created_at: string;
}

export interface Student {
    id: number;
    nis: string;
    name: string;
    guardian_name: string | null;
    guardian_phone: string | null;
    attendances: StudentAttendance[];
    pendingLeave: LeaveInfo | null;
    consecutiveAbsences: number;
}

export interface ApprovedLeaveInfo {
    category: string;
    start_date: string;
    end_date: string;
    description: string | null;
    document_url: string | null;
    guardian_name: string | null;
    created_at: string;
    updated_at: string;
}

const CATEGORY_KEYS: Record<string, string> = {
    Sick: "homeroom.sick",
    Event: "homeroom.event",
    Competition: "homeroom.competition",
    Other: "homeroom.other",
};

export function translateCategory(cat: string | undefined, t: Translate): string {
    if (!cat) return "";
    const key = CATEGORY_KEYS[cat];
    return key ? t(key) : cat;
}

export function getRowStatus(s: Student, approvedLeaves: Record<number, ApprovedLeaveInfo>): RowStatus {
    if (approvedLeaves[s.id]) return "permitted";
    if (s.pendingLeave?.approval_status === "Pending") return "pending";
    if (s.consecutiveAbsences > 0) return "absent";
    const att = s.attendances[0];
    if (!att) return "absent";
    if (att.status.toLowerCase() === "late") return "late";
    return "present";
}

export function formatTime(val: string | null | undefined, t: Translate): string {
    if (!val) return "-";
    const time = val.includes("T") ? val.split("T")[1]?.slice(0, 5) : val.slice(0, 5);
    return time ? `${time} ${t("homeroom.timeWib")}` : "-";
}

export function formatTimeSeconds(val: string | null | undefined, t: Translate): string {
    if (!val) return "-";
    const time = val.includes("T") ? val.split("T")[1]?.slice(0, 8) : val.slice(0, 8);
    return time ? `${time} ${t("homeroom.timeWib")}` : "-";
}

export function formatShortDate(val?: string): string {
    if (!val) return "-";
    const dt = new Date(val);
    if (Number.isNaN(dt.getTime())) return val;
    return dt.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function formatFullDate(val?: string): string {
    if (!val) return "-";
    const dt = new Date(val);
    if (Number.isNaN(dt.getTime())) return val;
    return dt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateTime(val?: string): string {
    if (!val) return "-";
    const dt = new Date(val);
    if (Number.isNaN(dt.getTime())) return val;
    const date = dt.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
    const time = dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
    return `${date} ${time}`;
}

export function formatRangeShort(start?: string, end?: string): string {
    if (!start) return "-";
    if (!end || end === start) return formatShortDate(start);
    return `${formatShortDate(start)} – ${formatShortDate(end)}`;
}

export function formatRelativeDays(val: string | undefined, t: Translate): string {
    if (!val) return "-";
    const dt = new Date(val);
    if (Number.isNaN(dt.getTime())) return formatShortDate(val);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const start = new Date(dt);
    start.setHours(0, 0, 0, 0);
    const diffDays = Math.round((startOfToday.getTime() - start.getTime()) / 86400000);
    if (diffDays <= 0) return t("homeroom.relativeToday");
    if (diffDays === 1) return t("homeroom.relativeYesterday");
    return t("homeroom.relativeDaysAgo", { count: diffDays });
}

export function rowNote(s: Student, approvedLeaves: Record<number, ApprovedLeaveInfo>, t: Translate): string {
    const status = getRowStatus(s, approvedLeaves);
    if (status === "absent") {
        if (s.consecutiveAbsences >= 3) {
            return t("homeroom.noteAbsentStreak", { count: s.consecutiveAbsences });
        }
        if (s.consecutiveAbsences === 2) return t("homeroom.noteAbsentTwice");
        return t("homeroom.noteAbsentOnce");
    }
    if (status === "pending") {
        const p = s.pendingLeave;
        return t("homeroom.notePending", {
            category: translateCategory(p?.category, t),
            range: formatRangeShort(p?.start_date, p?.end_date),
            submitted: formatRelativeDays(p?.created_at, t),
        });
    }
    if (status === "permitted") {
        const l = approvedLeaves[s.id];
        return t("homeroom.notePermitted", {
            category: translateCategory(l?.category, t),
            range: l ? ` · ${formatRangeShort(l.start_date, l.end_date)}` : "",
        });
    }
    const att = s.attendances[0];
    if (status === "late" && att?.late_minutes != null) {
        return t("homeroom.noteLate", {
            minutes: att.late_minutes,
            time: formatTimeSeconds(att.check_in_time, t),
        });
    }
    return formatTime(att?.check_in_time, t);
}

export function waPhone(phone?: string | null): string | null {
    if (!phone) return null;
    let digits = phone.replace(/\D/g, "");
    if (!digits || digits.length < 8) return null;
    if (digits.startsWith("0")) digits = "62" + digits.slice(1);
    else if (digits.startsWith("8")) digits = "62" + digits;
    return digits;
}

export function sortAttention(students: Student[], approvedLeaves: Record<number, ApprovedLeaveInfo>): Student[] {
    return students
        .filter((s) => getRowStatus(s, approvedLeaves) !== "present")
        .sort((a, b) => {
            const sa = getRowStatus(a, approvedLeaves);
            const sb = getRowStatus(b, approvedLeaves);
            const pa = attentionPriority(sa, a.consecutiveAbsences);
            const pb = attentionPriority(sb, b.consecutiveAbsences);
            if (pa !== pb) return pa - pb;
            if (sa === "absent") {
                const d = b.consecutiveAbsences - a.consecutiveAbsences;
                if (d !== 0) return d;
            }
            return a.nis.localeCompare(b.nis, undefined, { numeric: true });
        });
}