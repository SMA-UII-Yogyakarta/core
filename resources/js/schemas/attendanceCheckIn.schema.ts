import { z } from "zod";

export const attendanceCheckInSchema = z.object({
    latitude: z
        .union([z.number(), z.string()])
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val >= -90 && val <= 90 && val !== 0, {
            message: "Koordinat GPS latitude tidak valid. Pastikan GPS aktif.",
        }),
    longitude: z
        .union([z.number(), z.string()])
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val >= -180 && val <= 180 && val !== 0, {
            message: "Koordinat GPS longitude tidak valid. Pastikan GPS aktif.",
        }),
    photo_blob: z
        .string()
        .min(50, "Foto selfie bukti kehadiran wajib diambil melalui kamera."),
});

export type AttendanceCheckInForm = z.infer<typeof attendanceCheckInSchema>;
