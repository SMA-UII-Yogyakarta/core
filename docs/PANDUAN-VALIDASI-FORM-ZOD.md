# Panduan Standar Validasi Form dengan Zod & Inertia.js
**SMART Presensi — SMA UII Yogyakarta**

---

## 1. Latar Belakang & Urgensi Penerapan Zod

Dalam pengembangan aplikasi monolitik modern berbasis **Laravel + Inertia.js + React + TypeScript**, validasi data memegang peranan krusial dalam menjaga integritas data dan menghadirkan pengalaman pengguna (*User Experience*) yang cepat dan responsif.

### Mengapa Tim Membutuhkan Zod?
1. **Single Source of Truth untuk Tipe Form (Type Inference):**
   * Menghilangkan duplikasi penulisan antarmuka TypeScript manual (`interface FormState`) dan nilai awal form.
   * Tipe data form diturunkan secara otomatis (*inferred*) langsung dari skema: `type StudentFormData = z.infer<typeof studentSchema>;`.
2. **First-Line Defense (Validasi Klien Instan):**
   * Memberikan *feedback* seketika kepada pengguna di browser (seperti format NISN tidak valid, email salah format, konfirmasi kata sandi tidak cocok, atau lampiran file terlalu besar) **sebelum** request jaringan dikirim ke server.
3. **Data Sanitization & Coercion:**
   * Memastikan data string ter-trim otomatis (`z.string().trim()`), angka di-cast dengan aman (`z.coerce.number()`), dan input kosong diubah menjadi `null`/`undefined` sesuai ekspektasi database.
4. **Standarisasi Kontrak Form Antar Pengembang:**
   * Seluruh anggota tim memiliki acuan standar yang seragam dalam menyusun form input, pesan error berbahasa Indonesia, dan batasan panjang karakter.

---

## 2. Arsitektur Validasi Hibrida (Two-Tier Architecture)

Sistem menerapkan arsitektur validasi dua lapis (*Hybrid Validation*):

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                           PENGGUNA SUBMIT FORM                          │
 └─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                    LAPIS 1: ZOD (Client-Side Validation)                │
 │  • Cek field required, regex NIS/NISN, panjang karakter, format email  │
 │  • Cek ukuran & ekstensi file lampiran (PDF/JPEG max 2MB)               │
 │  • Cek kecocokan password & konfirmasi password                        │
 └─────────────────────────────────────────────────────────────────────────┘
                     │                                     │
             [Validasi Gagal]                      [Validasi Lolos]
                     │                                     │
                     ▼                                     ▼
        Tampilkan error instan di UI         Kirim payload via Inertia useForm
        (Tanpa network round-trip)                         │
                                                           ▼
                                      ┌────────────────────────────────────────┐
                                      │  LAPIS 2: LARAVEL (Server & DB Guard)  │
                                      │  • Otorisasi Policy / Role check       │
                                      │  • Database Unique constraints (NISN) │
                                      │  • Relasi Foreign Key exists (Class ID)│
                                      └────────────────────────────────────────┘
                                            │                      │
                                     [HTTP 422 Error]         [HTTP 200/302 OK]
                                            │                      │
                                            ▼                      ▼
                               Inertia petakan error     Operasi Berhasil &
                               ke input komponen UI       Toast Success
```

---

## 3. Struktur Direktori Skema

Semua skema Zod diletakkan pada direktori `resources/js/schemas/` dengan pemisahan per domain:

```
resources/js/
├── schemas/
│   ├── index.ts                 # Export seluruh skema
│   ├── student.schema.ts        # Skema Siswa (create, edit)
│   ├── teacher.schema.ts        # Skema Guru
│   ├── guardian.schema.ts       # Skema Wali Murid
│   ├── schoolClass.schema.ts    # Skema Kelas
│   ├── leaveRequest.schema.ts   # Skema Pengajuan & Verifikasi Izin
│   ├── attendance.schema.ts     # Skema Koreksi Absensi & Check-in
│   ├── holiday.schema.ts        # Skema Hari Libur & Jam Operasional
│   ├── notification.schema.ts   # Skema Notifikasi Pengumuman
│   └── profile.schema.ts        # Skema Ubah Profil & Keamanan
```

---

## 4. Helper Validasi: `validateWithZod`

Untuk menjaga kode tetap bersih (*clean*), tidak over-engineer, dan kompatibel 100% dengan Inertia `useForm`, gunakan helper utilitas sederhana:

```ts
// resources/js/utils/zodHelper.ts
import { z } from "zod";

export function validateForm<T extends z.ZodTypeAny>(
    schema: T,
    data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!errors[path]) {
            errors[path] = issue.message;
        }
    }
    return { success: false, errors };
}
```

---

## 5. Contoh Penerapan Standar pada Komponen React

```tsx
import { useForm } from "@inertiajs/react";
import { studentSchema, type StudentFormInput } from "@/schemas/student.schema";
import { validateForm } from "@/utils/zodHelper";
import { Input, SelectInput, Button, Drawer } from "@/Components";

export default function StudentDrawer({ open, onClose }) {
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm<StudentFormInput>({
        nis: "",
        nisn: "",
        name: "",
        class_id: "",
        birth_date: "",
        phone: "",
        address: "",
        enrollment_year: new Date().getFullYear(),
        status: "Active",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        // 1. Validasi Client via Zod
        const validation = validateForm(studentSchema, data);
        if (!validation.success) {
            // Pasang pesan error Zod ke state error Inertia
            for (const [field, message] of Object.entries(validation.errors)) {
                setError(field as keyof StudentFormInput, message);
            }
            return;
        }

        // 2. Submit ke Server jika Zod lolos
        post("/master-data/students", {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Drawer open={open} onClose={onClose} title="Tambah Siswa" onSubmit={handleSubmit} loading={processing}>
            <Input
                label="NIS"
                value={data.nis}
                onChange={(e) => setData("nis", e.target.value)}
                error={errors.nis}
            />
            <Input
                label="NISN"
                value={data.nisn}
                onChange={(e) => setData("nisn", e.target.value)}
                error={errors.nisn}
            />
            <Input
                label="Nama Lengkap"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                error={errors.name}
            />
        </Drawer>
    );
}
```

---

## 6. Standar Pesan Error Bahasa Indonesia

Seluruh skema wajib menggunakan pesan error Bahasa Indonesia yang jelas dan informatif:

* `z.string().min(1, "Nama lengkap wajib diisi")`
* `z.string().email("Format email tidak valid (contoh: user@uii.ac.id)")`
* `z.string().regex(/^\d{10}$/, "NISN harus terdiri dari 10 digit angka")`
* `z.number().min(2000, "Tahun masuk minimal tahun 2000")`
* `z.instanceof(File).refine(f => f.size <= 2 * 1024 * 1024, "Ukuran file maksimal 2 MB")`

---

## 7. Prinsip Anti Over-Engineering untuk Tim

1. **Gunakan helper ringan `validateForm`:** Jangan menginstal wrapper form pihak ketiga yang terlalu berat jika Inertia `useForm` sudah mencukupi kebutuhan proyek.
2. **Jangan menduplikasi validasi DB:** Hindari membuat simulasi async check database di client. Biarkan Laravel `FormRequest` menangani `unique` dan `exists`.
3. **Ekspor Tipe Data Otomatis:** Selalu ekspor tipe hasil inferensi skema (`export type Foo = z.infer<typeof fooSchema>`) agar antarmuka tipe di seluruh halaman tetap sinkron.
