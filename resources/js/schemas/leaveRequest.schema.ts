import { z } from "zod";

export const leaveApplicationSchema = z
    .object({
        student_id: z
            .union([z.string(), z.number()])
            .refine((val) => Boolean(val), "Pilih anak yang akan diajukan izin"),
        category: z.enum(["Sick", "Event", "Competition", "Other"], {
            message: "Pilih kategori izin yang valid",
        }),
        start_date: z.string().min(1, "Tanggal mulai izin wajib diisi"),
        end_date: z.string().optional().nullable().or(z.literal("")),
        description: z.string().trim().min(3, "Keterangan izin minimal 3 karakter"),
    })
    .refine(
        (data) => {
            if (!data.start_date || !data.end_date) return true;
            return data.end_date >= data.start_date;
        },
        {
            message: "Tanggal akhir izin tidak boleh sebelum tanggal mulai",
            path: ["end_date"],
        },
    );

export type LeaveApplicationFormInput = z.infer<typeof leaveApplicationSchema>;
