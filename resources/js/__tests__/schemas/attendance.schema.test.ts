import { describe, expect, it } from "vitest";
import { attendanceCorrectionSchema } from "../../schemas/attendance.schema";

describe("Attendance Correction Zod Schema", () => {
    it("validates valid attendance correction data", () => {
        const validData = {
            student_id: 1,
            date: "2026-08-14",
            new_status: "Present" as const,
            reason: "Koreksi kehadiran dari guru piket",
        };

        const result = attendanceCorrectionSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it("fails when reason is too short", () => {
        const invalidData = {
            student_id: 1,
            date: "2026-08-14",
            new_status: "Present" as const,
            reason: "ok",
        };

        const result = attendanceCorrectionSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it("fails when new_status is invalid", () => {
        const invalidData = {
            student_id: 1,
            date: "2026-08-14",
            new_status: "InvalidStatus" as unknown as "Present",
            reason: "Alasan koreksi valid",
        };

        const result = attendanceCorrectionSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});
