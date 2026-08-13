import { z } from "zod";

export const notificationSchema = z.object({
    title: z.string().trim().min(3, "Judul notifikasi minimal 3 karakter").max(150, "Judul maksimal 150 karakter"),
    content: z.string().trim().min(5, "Isi pengumuman minimal 5 karakter"),
    target_group: z.enum(["all", "student", "teacher", "guardian"], {
        message: "Pilih target penerima yang valid",
    }),
});

export type NotificationFormInput = z.infer<typeof notificationSchema>;
