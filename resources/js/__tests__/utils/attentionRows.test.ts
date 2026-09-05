import { describe, expect, it } from "vitest";
import { translations } from "../../utils/translations";
import {
    formatRangeShort,
    formatRelativeDays,
    formatTime,
    formatTimeSeconds,
    getRowStatus,
    rowNote,
    sortAttention,
    waPhone,
    type ApprovedLeaveInfo,
    type Student,
    type Translate,
} from "../../utils/attentionRows";
import { attentionPriority } from "../../utils/attentionPriority";

function makeT(): Translate {
    return (key, params) => {
        let value = translations.id[key] ?? key;
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                value = value.replaceAll(`{${k}}`, String(v));
            }
        }
        return value;
    };
}

const t = makeT();

function makeStudent(overrides: Partial<Student> = {}): Student {
    return {
        id: 1,
        nis: "12345",
        name: "Budi",
        guardian_name: "Pak Budi",
        guardian_phone: "081234567",
        attendances: [],
        pendingLeave: null,
        consecutiveAbsences: 0,
        ...overrides,
    };
}

function makeLeave(overrides: Partial<ApprovedLeaveInfo> = {}): ApprovedLeaveInfo {
    return {
        category: "Sick",
        start_date: "2026-08-28",
        end_date: "2026-08-28",
        description: null,
        document_url: null,
        guardian_name: "Pak Budi",
        created_at: "2026-08-27T08:00:00.000Z",
        updated_at: "2026-08-27T09:00:00.000Z",
        ...overrides,
    };
}

describe("getRowStatus", () => {
    it("resolves to permitted when an approved leave is active today", () => {
        const s = makeStudent({ pendingLeave: null, consecutiveAbsences: 3 });
        expect(getRowStatus(s, { 1: makeLeave() })).toBe("permitted");
    });

    it("resolves to pending before absent streak", () => {
        const s = makeStudent({
            pendingLeave: { id: 1, category: "Sick", approval_status: "Pending", description: null, document_url: null, start_date: "2026-08-28", end_date: "2026-08-28", created_at: "2026-08-28T08:00:00.000Z" },
            consecutiveAbsences: 3,
        });
        expect(getRowStatus(s, {})).toBe("pending");
    });

    it("resolves to absent when a streak exists or no attendance record", () => {
        expect(getRowStatus(makeStudent({ consecutiveAbsences: 2 }), {})).toBe("absent");
        expect(getRowStatus(makeStudent(), {})).toBe("absent");
    });

    it("resolves to late for a late attendance today", () => {
        const s = makeStudent({ attendances: [{ id: 1, status: "Late", check_in_time: "07:15:30", late_minutes: 16 }] });
        expect(getRowStatus(s, {})).toBe("late");
    });

    it("resolves to present for an on-time attendance today", () => {
        const s = makeStudent({ attendances: [{ id: 1, status: "Present", check_in_time: "06:42:00", late_minutes: null }] });
        expect(getRowStatus(s, {})).toBe("present");
    });
});

describe("rowNote", () => {
    it("notes absent streak variants", () => {
        const approvedLeaves: Record<number, ApprovedLeaveInfo> = {};
        expect(rowNote(makeStudent({ consecutiveAbsences: 3 }), approvedLeaves, t)).toBe("Sudah 3× berturut-turut");
        expect(rowNote(makeStudent({ consecutiveAbsences: 2 }), approvedLeaves, t)).toBe("Sudah 2×");
        expect(rowNote(makeStudent({ consecutiveAbsences: 1 }), approvedLeaves, t)).toBe("1× hari ini");
    });

    it("notes pending leave with category, range and submitted age", () => {
        const today = new Date();
        const createdAt = new Date(today.getTime() - 86400000).toISOString();
        const s = makeStudent({
            pendingLeave: { id: 1, category: "Sick", approval_status: "Pending", description: null, document_url: null, start_date: "2026-08-28", end_date: "2026-08-30", created_at: createdAt },
        });
        expect(rowNote(s, {}, t)).toContain("Izin Sakit");
        expect(rowNote(s, {}, t)).toContain("28 Agu");
        expect(rowNote(s, {}, t)).toContain("kemarin");
    });

    it("notes approved leave as accepted", () => {
        const s = makeStudent({ consecutiveAbsences: 0 });
        expect(rowNote(s, { 1: makeLeave({ category: "Event" }) }, t)).toBe("Izin Acara Diterima · 28 Agu");
    });

    it("notes late with minutes and seconds", () => {
        const s = makeStudent({ attendances: [{ id: 1, status: "Late", check_in_time: "07:15:30", late_minutes: 16 }] });
        expect(rowNote(s, {}, t)).toBe("Terlambat 16 mnt · 07:15:30 WIB");
    });

    it("falls back to plain time for on-time attendance", () => {
        const s = makeStudent({ attendances: [{ id: 1, status: "Present", check_in_time: "06:42:00", late_minutes: null }] });
        expect(rowNote(s, {}, t)).toBe("06:42 WIB");
    });
});

describe("time formatting", () => {
    it("formats times with and without seconds", () => {
        expect(formatTimeSeconds("07:15:30", t)).toBe("07:15:30 WIB");
        expect(formatTimeSeconds("2026-08-28T07:15:30.000Z", t)).toBe("07:15:30 WIB");
        expect(formatTime("2026-08-28T07:00:00.000Z", t)).toBe("07:00 WIB");
        expect(formatTimeSeconds(null, t)).toBe("-");
    });

    it("formats short ranges", () => {
        expect(formatRangeShort("2026-08-28")).toBe("28 Agu");
        expect(formatRangeShort("2026-08-28", "2026-08-30")).toBe("28 Agu – 30 Agu");
        expect(formatRangeShort(undefined)).toBe("-");
    });

    it("formats relative day labels", () => {
        const yesterday = new Date(Date.now() - 86400000).toISOString();
        const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();
        expect(formatRelativeDays(new Date().toISOString(), t)).toBe("hari ini");
        expect(formatRelativeDays(yesterday, t)).toBe("kemarin");
        expect(formatRelativeDays(tenDaysAgo, t)).toBe("10 hari lalu");
        expect(formatRelativeDays(undefined, t)).toBe("-");
    });
});

describe("waPhone", () => {
    it("converts leading 0 to 62 prefix", () => {
        expect(waPhone("081234567890")).toBe("6281234567890");
    });

    it("converts leading 8 to 62 prefix", () => {
        expect(waPhone("81234567890")).toBe("6281234567890");
    });

    it("keeps already-international numbers intact", () => {
        expect(waPhone("6281234567890")).toBe("6281234567890");
    });

    it("strips non-digit characters", () => {
        expect(waPhone("+62 812-3456-7890")).toBe("6281234567890");
    });

    it("returns null for empty or missing input", () => {
        expect(waPhone()).toBeNull();
        expect(waPhone("")).toBeNull();
        expect(waPhone(null)).toBeNull();
    });

    it("returns null for a number too short to be valid", () => {
        expect(waPhone("08123")).toBeNull();
        expect(waPhone("8123456")).toBeNull();
    });
});

describe("absent semantics", () => {
    it("ranks absent streak >= 3 with highest priority", () => {
        expect(getRowStatus(makeStudent({ consecutiveAbsences: 3 }), {})).toBe("absent");
        expect(attentionPriority("absent", 3)).toBe(1);
    });

    it("resolves a student with no attendance today to absent", () => {
        expect(getRowStatus(makeStudent(), {})).toBe("absent");
    });

    it("gives approved leave precedence over an absent streak", () => {
        expect(getRowStatus(makeStudent({ consecutiveAbsences: 3 }), { 1: makeLeave() })).toBe("permitted");
    });

    it("gives pending leave precedence over an absent streak", () => {
        const s = makeStudent({
            pendingLeave: { id: 1, category: "Sick", approval_status: "Pending", description: null, document_url: null, start_date: "2026-08-28", end_date: "2026-08-28", created_at: "2026-08-28T08:00:00.000Z" },
            consecutiveAbsences: 3,
        });
        expect(getRowStatus(s, {})).toBe("pending");
    });
});

describe("sortAttention", () => {
    it("orders by priority then NIS within same status", () => {
        const approvedLeaves: Record<number, ApprovedLeaveInfo> = {};
        const students: Student[] = [
            makeStudent({ id: 1, nis: "2425B", name: "Beta", consecutiveAbsences: 1 }),
            makeStudent({ id: 2, nis: "2425A", name: "Alpha", consecutiveAbsences: 1 }),
            makeStudent({ id: 3, nis: "2425C", name: "Charlie", consecutiveAbsences: 3 }),
        ];
        const sorted = sortAttention(students, approvedLeaves);
        // streak 3 (priority 1) first, then streak 1 pair ordered by NIS
        expect(sorted.map((s) => s.nis)).toEqual(["2425C", "2425A", "2425B"]);
    });

    it("filters out students present on time", () => {
        const approvedLeaves: Record<number, ApprovedLeaveInfo> = {};
        const present = makeStudent({ id: 1, nis: "2425001", attendances: [{ id: 1, status: "Present", check_in_time: "06:40:00", late_minutes: null }] });
        const late = makeStudent({ id: 2, nis: "2425002", attendances: [{ id: 1, status: "Late", check_in_time: "07:15:30", late_minutes: 16 }] });
        const sorted = sortAttention([present, late], approvedLeaves);
        expect(sorted.map((s) => s.nis)).toEqual(["2425002"]);
    });

    it("uses numeric NIS comparison", () => {
        const approvedLeaves: Record<number, ApprovedLeaveInfo> = {};
        const students: Student[] = [
            makeStudent({ id: 1, nis: "24250", consecutiveAbsences: 1 }),
            makeStudent({ id: 2, nis: "2425009", consecutiveAbsences: 1 }),
        ];
        const sorted = sortAttention(students, approvedLeaves);
        expect(sorted.map((s) => s.nis)).toEqual(["24250", "2425009"]);
    });
});