import { describe, expect, it } from "vitest";
import { studentSchema } from "../../schemas/student.schema";

describe("Student Form Zod Schema", () => {
    it("validates valid student data successfully", () => {
        const validData = {
            nis: "24250001",
            nisn: "0081234501",
            name: "Ahmad Reza Pahlevi",
            class_id: 1,
            guardian_id: 1,
            birth_date: "2009-04-12",
            phone: "081234567890",
            address: "Jl. Sorowajan Baru, Banguntapan",
            enrollment_year: 2024,
            status: "Active" as const,
        };

        const result = studentSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it("fails when NIS is empty", () => {
        const invalidData = {
            nis: "",
            nisn: "0081234501",
            name: "Ahmad Reza",
            enrollment_year: 2024,
            status: "Active" as const,
        };

        const result = studentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            expect(errors.nis).toBeDefined();
        }
    });

    it("fails when name is empty", () => {
        const invalidData = {
            nis: "24250001",
            nisn: "0081234501",
            name: "",
            enrollment_year: 2024,
            status: "Active" as const,
        };

        const result = studentSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            expect(errors.name).toBeDefined();
        }
    });
});
