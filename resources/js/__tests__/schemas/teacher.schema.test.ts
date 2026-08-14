import { describe, expect, it } from "vitest";
import { teacherSchema } from "../../schemas/teacher.schema";

describe("Teacher Form Zod Schema", () => {
    it("validates valid teacher data successfully", () => {
        const validData = {
            name: "Budi Hartono, S.Pd.",
            teacher_code: "TCH-001",
        };

        const result = teacherSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it("fails when teacher code is empty", () => {
        const invalidData = {
            name: "Budi Hartono",
            teacher_code: "",
        };

        const result = teacherSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            expect(errors.teacher_code).toBeDefined();
        }
    });

    it("fails when name is empty", () => {
        const invalidData = {
            name: "",
            teacher_code: "TCH-001",
        };

        const result = teacherSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});
