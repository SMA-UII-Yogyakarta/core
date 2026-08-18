import { z } from "zod";

export const locationSettingSchema = z.object({
    name: z.string().min(3, "Nama lokasi minimal 3 karakter").max(255, "Nama lokasi maksimal 255 karakter"),
    address: z.string().min(5, "Alamat sekolah minimal 5 karakter").max(500, "Alamat sekolah maksimal 500 karakter"),
    latitude: z.number().min(-90, "Latitude harus di antara -90 dan 90").max(90, "Latitude harus di antara -90 dan 90"),
    longitude: z.number().min(-180, "Longitude harus di antara -180 dan 180").max(180, "Longitude harus di antara -180 dan 180"),
    radius_meters: z.number().min(10, "Radius minimal 10 meter").max(5000, "Radius maksimal 5000 meter"),
    is_active: z.boolean().optional(),
});

export type LocationSettingSchemaType = z.infer<typeof locationSettingSchema>;
