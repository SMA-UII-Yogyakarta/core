import { describe, expect, it } from "vitest";
import { attendanceCheckInSchema } from "../../schemas/attendanceCheckIn.schema";
import { validateForm } from "../../utils/zodHelper";

describe("Attendance Check-In Zod Schema", () => {
    it("validates valid attendance check-in data successfully", () => {
        const payload = {
            latitude: -7.797061,
            longitude: 110.399583,
            photo_blob: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=",
        };

        const result = validateForm(attendanceCheckInSchema, payload);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.latitude).toBe(-7.797061);
            expect(result.data.longitude).toBe(110.399583);
        }
    });

    it("fails when GPS coordinates are missing or zero", () => {
        const payload = {
            latitude: 0,
            longitude: 0,
            photo_blob: "data:image/jpeg;base64,validphoto12345678901234567890123456789012345678901234567890",
        };

        const result = validateForm(attendanceCheckInSchema, payload);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.errors.latitude).toBeDefined();
            expect(result.errors.longitude).toBeDefined();
        }
    });

    it("fails when photo blob is empty or too short", () => {
        const payload = {
            latitude: -7.797061,
            longitude: 110.399583,
            photo_blob: "short",
        };

        const result = validateForm(attendanceCheckInSchema, payload);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.errors.photo_blob).toBe("Foto selfie bukti kehadiran wajib diambil melalui kamera.");
        }
    });
});
