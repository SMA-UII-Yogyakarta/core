import { z } from "zod";

export const schoolClassSchema = z.object({
    name: z.string().trim().min(1, "Nama kelas wajib diisi").max(50, "Nama kelas maksimal 50 karakter"),
    level: z.enum(["X", "XI", "XII"], { message: "Pilih tingkatan kelas yang valid" }),
    capacity: z.coerce.number().min(1, "Kapasitas minimal 1 siswa").max(100, "Kapasitas maksimal 100 siswa"),
    teacher_id: z.union([z.string(), z.number()]).optional().nullable(),
});

export type SchoolClassFormInput = z.infer<typeof schoolClassSchema>;
