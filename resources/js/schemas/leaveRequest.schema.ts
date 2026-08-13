import { z } from "zod";

export const leaveApplicationSchema = z.object({
    student_id: z.union([z.string(), z.number()]).refine((val) => Boolean(val), "Pilih anak yang akan diajukan izin"),
    category: z.enum(["Sick", "Event", "Competition", "Other"], {
        message: "Pilih kategori izin yang valid",
    }),
    start_date: z.string().min(1, "Tanggal mulai izin wajib diisi"),
    end_date: z.string().optional().nullable().or(z.literal("")),
    description: z.string().trim().min(3, "Keterangan izin minimal 3 karakter"),
});

export type LeaveApplicationFormInput = z.infer<typeof leaveApplicationSchema>;
