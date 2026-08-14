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
});
