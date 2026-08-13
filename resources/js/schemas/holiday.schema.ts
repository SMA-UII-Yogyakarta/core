import { z } from "zod";

export const holidaySchema = z.object({
    holiday_date: z.string().min(1, "Tanggal libur wajib diisi"),
    description: z.string().trim().min(3, "Keterangan libur minimal 3 karakter"),
    is_holiday: z.boolean().default(true),
});

export type HolidayFormInput = z.infer<typeof holidaySchema>;
