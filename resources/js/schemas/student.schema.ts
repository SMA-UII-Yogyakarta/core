import { z } from "zod";

export const studentSchema = z.object({
    nis: z.string().trim().min(1, "NIS wajib diisi").max(20, "NIS maksimal 20 karakter"),
    nisn: z.string().trim().min(1, "NISN wajib diisi").max(20, "NISN maksimal 20 karakter"),
    name: z.string().trim().min(1, "Nama lengkap wajib diisi").max(100, "Nama maksimal 100 karakter"),
    class_id: z.union([z.string(), z.number()]).optional().nullable(),
    birth_date: z.string().optional().nullable(),
    phone: z.string().trim().max(20, "Nomor telepon maksimal 20 karakter").optional().nullable(),
    address: z.string().trim().optional().nullable(),
    enrollment_year: z.coerce.number().min(2000, "Tahun masuk minimal tahun 2000").max(2100, "Tahun tidak valid"),
    guardian_id: z.union([z.string(), z.number()]).optional().nullable(),
    status: z.enum(["Active", "Inactive"]).default("Active"),
    email: z.string().trim().email("Format email tidak valid").optional().or(z.literal("")),
    password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
});

export type StudentFormInput = z.infer<typeof studentSchema>;
