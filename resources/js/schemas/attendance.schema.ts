import { z } from "zod";

export const attendanceCorrectionSchema = z.object({
    student_id: z.coerce.number().min(1, "Siswa wajib dipilih"),
    date: z.string().min(1, "Tanggal wajib diisi"),
    new_status: z.enum(["Present", "Late", "Absent", "Sick", "Permit"], {
        message: "Pilih status kehadiran yang valid",
    }),
    reason: z.string().trim().min(3, "Alasan koreksi minimal 3 karakter"),
});

export type AttendanceCorrectionFormInput = z.infer<typeof attendanceCorrectionSchema>;
