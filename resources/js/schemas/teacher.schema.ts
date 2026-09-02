import { z } from "zod";

export const teacherSchema = z.object({
    teacher_code: z.string().trim().min(1, "Kode guru wajib diisi").max(20, "Kode guru maksimal 20 karakter"),
    name: z.string().trim().min(1, "Nama guru wajib diisi").max(100, "Nama guru maksimal 100 karakter"),
    email: z.string().trim().email("Format email tidak valid").optional().or(z.literal("")),
    teacher_type: z.union([z.string(), z.array(z.string())]).optional(),
    password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
});

export type TeacherFormInput = z.infer<typeof teacherSchema>;
