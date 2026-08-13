import { z } from "zod";

export const profileInfoSchema = z.object({
    name: z.string().trim().min(1, "Nama wajib diisi").max(100, "Nama maksimal 100 karakter"),
    email: z.string().trim().email("Format email tidak valid"),
});

export const passwordSecuritySchema = z
    .object({
        current_password: z.string().min(1, "Kata sandi saat ini wajib diisi"),
        password: z.string().min(6, "Kata sandi baru minimal 6 karakter"),
        password_confirmation: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Konfirmasi kata sandi tidak cocok dengan kata sandi baru",
        path: ["password_confirmation"],
    });

export type ProfileInfoFormInput = z.infer<typeof profileInfoSchema>;
export type PasswordSecurityFormInput = z.infer<typeof passwordSecuritySchema>;
