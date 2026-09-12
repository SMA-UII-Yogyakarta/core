import { describe, expect, it } from "vitest";
import { leaveApplicationSchema } from "../../schemas/leaveRequest.schema";

describe("Leave Application Zod Schema", () => {
    it("validates valid leave application data", () => {
        const validData = {
            student_id: 1,
            category: "Sick" as const,
            start_date: "2026-08-15",
            end_date: "2026-08-16",
            description: "Sakit demam",
        };

        const result = leaveApplicationSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it("fails when category is invalid", () => {
        const invalidData = {
            student_id: 1,
            category: "Vacation" as unknown as "Sick",
            start_date: "2026-08-15",
            end_date: "2026-08-16",
            description: "Liburan",
        };

        const result = leaveApplicationSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it("fails when description is too short", () => {
        const invalidData = {
            student_id: 1,
            category: "Sick" as const,
            start_date: "2026-08-15",
            end_date: "2026-08-16",
            description: "ab",
        };

        const result = leaveApplicationSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it("fails when end_date is before start_date", () => {
        const invalidData = {
            student_id: 1,
            category: "Sick" as const,
            start_date: "2026-08-16",
            end_date: "2026-08-15",
            description: "Sakit flu",
        };

        const result = leaveApplicationSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe("Tanggal akhir izin tidak boleh sebelum tanggal mulai");
        }
    });

    it("succeeds when end_date is equal to start_date", () => {
        const validData = {
            student_id: 1,
            category: "Sick" as const,
            start_date: "2026-08-15",
            end_date: "2026-08-15",
            description: "Sakit satu hari",
        };

        const result = leaveApplicationSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });
});
