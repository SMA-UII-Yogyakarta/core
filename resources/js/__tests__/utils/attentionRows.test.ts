import { describe, expect, it } from "vitest";
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
} from "../../utils/attentionRows";
import { attentionPriority } from "../../utils/attentionPriority";

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
    it("resolves to diizinkan when an approved leave is active today", () => {
        const s = makeStudent({ pendingLeave: null, consecutiveAbsences: 3 });
        expect(getRowStatus(s, { 1: makeLeave() })).toBe("diizinkan");
    });

    it("resolves to pending before alpa streak", () => {
        const s = makeStudent({
            pendingLeave: { id: 1, category: "Sick", approval_status: "Pending", description: null, document_url: null, start_date: "2026-08-28", end_date: "2026-08-28", created_at: "2026-08-28T08:00:00.000Z" },
            consecutiveAbsences: 3,
        });
        expect(getRowStatus(s, {})).toBe("pending");
    });

    it("resolves to alpa when a streak exists or no attendance record", () => {
        expect(getRowStatus(makeStudent({ consecutiveAbsences: 2 }), {})).toBe("alpa");
        expect(getRowStatus(makeStudent(), {})).toBe("alpa");
    });

    it("resolves to terlambat for a late attendance today", () => {
        const s = makeStudent({ attendances: [{ id: 1, status: "Late", check_in_time: "07:15:30", late_minutes: 16 }] });
        expect(getRowStatus(s, {})).toBe("terlambat");
    });

    it("resolves to hadir for an on-time attendance today", () => {
        const s = makeStudent({ attendances: [{ id: 1, status: "Present", check_in_time: "06:42:00", late_minutes: null }] });
        expect(getRowStatus(s, {})).toBe("hadir");
    });
});

describe("rowNote", () => {
    it("notes alpa streak variants", () => {
        const approvedLeaves: Record<number, ApprovedLeaveInfo> = {};
        expect(rowNote(makeStudent({ consecutiveAbsences: 3 }), approvedLeaves)).toBe("Sudah 3× berturut-turut");
        expect(rowNote(makeStudent({ consecutiveAbsences: 2 }), approvedLeaves)).toBe("Sudah 2×");
        expect(rowNote(makeStudent({ consecutiveAbsences: 1 }), approvedLeaves)).toBe("1× hari ini");
    });

    it("notes pending leave with category, range and submitted age", () => {
        const today = new Date();
        const createdAt = new Date(today.getTime() - 86400000).toISOString();
        const s = makeStudent({
            pendingLeave: { id: 1, category: "Sick", approval_status: "Pending", description: null, document_url: null, start_date: "2026-08-28", end_date: "2026-08-30", created_at: createdAt },
        });
        expect(rowNote(s, {})).toContain("Izin Sakit");
        expect(rowNote(s, {})).toContain("28 Agu");
        expect(rowNote(s, {})).toContain("kemarin");
    });

    it("notes approved leave as received", () => {
        const s = makeStudent({ consecutiveAbsences: 0 });
        expect(rowNote(s, { 1: makeLeave({ category: "Event" }) })).toBe("Izin Acara Diterima · 28 Agu");
    });

    it("notes terlambat with minutes and seconds", () => {
        const s = makeStudent({ attendances: [{ id: 1, status: "Late", check_in_time: "07:15:30", late_minutes: 16 }] });
        expect(rowNote(s, {})).toBe("Terlambat 16 mnt · 07:15:30 WIB");
    });

    it("falls back to plain time for on-time attendance", () => {
        const s = makeStudent({ attendances: [{ id: 1, status: "Present", check_in_time: "06:42:00", late_minutes: null }] });
        expect(rowNote(s, {})).toBe("06:42 WIB");
    });
});

describe("time formatting", () => {
    it("formats times with and without seconds", () => {
        expect(formatTimeSeconds("07:15:30")).toBe("07:15:30 WIB");
        expect(formatTimeSeconds("2026-08-28T07:15:30.000Z")).toBe("07:15:30 WIB");
        expect(formatTime("2026-08-28T07:00:00.000Z")).toBe("07:00 WIB");
        expect(formatTimeSeconds(null)).toBe("-");
    });

    it("formats short ranges", () => {
        expect(formatRangeShort("2026-08-28")).toBe("28 Agu");
        expect(formatRangeShort("2026-08-28", "2026-08-30")).toBe("28 Agu – 30 Agu");
        expect(formatRangeShort(undefined)).toBe("-");
    });

    it("formats relative day labels", () => {
        const yesterday = new Date(Date.now() - 86400000).toISOString();
        const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();
        expect(formatRelativeDays(new Date().toISOString())).toBe("hari ini");
        expect(formatRelativeDays(yesterday)).toBe("kemarin");
        expect(formatRelativeDays(tenDaysAgo)).toBe("10 hari lalu");
        expect(formatRelativeDays(undefined)).toBe("-");
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

describe("alpa semantics", () => {
    it("ranks alpa streak >= 3 with highest priority", () => {
        expect(getRowStatus(makeStudent({ consecutiveAbsences: 3 }), {})).toBe("alpa");
        expect(attentionPriority("alpa", 3)).toBe(1);
    });

    it("resolves a student with no attendance today to alpa", () => {
        expect(getRowStatus(makeStudent(), {})).toBe("alpa");
    });

    it("gives approved leave precedence over an alpa streak", () => {
        expect(getRowStatus(makeStudent({ consecutiveAbsences: 3 }), { 1: makeLeave() })).toBe("diizinkan");
    });

    it("gives pending leave precedence over an alpa streak", () => {
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