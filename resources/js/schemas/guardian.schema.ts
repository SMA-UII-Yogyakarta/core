import { z } from "zod";

export const guardianSchema = z.object({
    name: z.string().trim().min(1, "Nama wali murid wajib diisi").max(100, "Nama maksimal 100 karakter"),
    phone: z.string().trim().max(20, "Nomor telepon maksimal 20 karakter").optional().nullable().or(z.literal("")),
    address: z.string().trim().optional().nullable().or(z.literal("")),
    email: z.string().trim().email("Format email tidak valid").optional().or(z.literal("")),
    password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
});

export type GuardianFormInput = z.infer<typeof guardianSchema>;
