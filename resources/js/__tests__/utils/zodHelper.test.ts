import { describe, expect, it } from "vitest";
import { z } from "zod";
import { validateForm } from "../../utils/zodHelper";

describe("Zod Helper Utility", () => {
    const testSchema = z.object({
        name: z.string().min(3, "Nama minimal 3 karakter"),
        age: z.number().min(15, "Usia minimal 15 tahun"),
    });

    it("returns success and data for valid input", () => {
        const result = validateForm(testSchema, { name: "Ahmad", age: 16 });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual({ name: "Ahmad", age: 16 });
        }
    });

    it("returns formatted error map for invalid input", () => {
        const result = validateForm(testSchema, { name: "A", age: 12 });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.errors.name).toBe("Nama minimal 3 karakter");
            expect(result.errors.age).toBe("Usia minimal 15 tahun");
        }
    });
});
