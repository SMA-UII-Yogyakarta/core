# Dokumentasi Perbaikan Bug & Error — SMART Absen SMA UII (smauii-core)

**Tanggal:** 4 Agustus 2026  
**Branch:** `develop`  
**Commit Baseline:** `3a4e9e63` (fix: redirect role dashboards to their dedicated routes #27)  
**Dibuat oleh:** AI Assistant (Sebagai Asisten Pengembang)

---

## 📋 Ringkasan Eksekutif

Seluruh codebase `smauii-core` telah dibersihkan dari **semua error TypeScript, ESLint, PHPStan, dan Pint**. Build production berhasil, test suite lulus 100%, dan code style sesuai standar Laravel Pint.

| Kategori | Sebelum | Sesudah |
|----------|---------|---------|
| TypeScript/ESLint Errors | 42 errors | 0 |
| PHPStan Errors | 3 errors | 0 |
| Pint Style Violations | 1 file | 0 |
| PHPUnit Tests | 122 passed | 123 passed |
| Build Production | ❌ Failed | ✅ Success |

---

## 🔧 Detail Perbaikan per File

### 1. Frontend — TypeScript & ESLint (`resources/js/**`)

#### 1.1 `resources/js/Pages/Reports/Daily.tsx`
**Masalah:**
- `t("reports.classDetail", { class: ... })` — fungsi `t` hanya menerima 1 argumen (string key)
- `t("reports.totalStudents", { count: ... })` — sama
- Import tidak terpakai: `AttendanceChart`, `FiCalendar`, `FiUsers`
- Variabel `formatDate` didefinisikan tapi tidak dipakai

**Perbaikan:**
```typescript
// Sebelum
{t("reports.classDetail", { class: classDetail.class.name })}
{t("reports.totalStudents", { count: classDetail.students.length })}

// Sesudah
{t("reports.classDetail").replace("{class}", classDetail.class.name)}
{t("reports.totalStudents").replace("{count}", classDetail.students.length.toString())}
```
- Hapus import `AttendanceChart`, `FiCalendar`, `FiUsers`
- Hapus fungsi `formatDate` yang tidak dipakai

---

#### 1.2 `resources/js/Pages/Reports/Monthly.tsx`
**Masalah:**
- Destructuring `classDetail` dari props tapi tidak ada di interface `MonthlyReportProps`
- Import `FiCalendar` tidak terpakai

**Perbaikan:**
```typescript
// Hapus classDetail dari destructuring
export default function MonthlyReport({
    monthlyStats,
    classes,  // classDetail dihapus
    selectedMonth,
    selectedYear,
    selectedClassId,
}: MonthlyReportProps) {
```
- Hapus import `FiCalendar`

---

#### 1.3 `resources/js/Pages/Reports/Semester.tsx`
**Masalah:**
- Variabel `semesterLabels` didefinisikan tapi tidak dipakai
- Import `FiCalendar` tidak terpakai

**Perbaikan:**
- Hapus `const semesterLabels = { 1: "Ganjil...", 2: "Genap..." }`
- Hapus import `FiCalendar`

---

#### 1.4 `resources/js/Pages/Settings.tsx` — **Paling Banyak Perbaikan (8 errors)**
**Masalah Type Mismatch di `onChange` handlers:**

| Line | Sebelum | Sesudah |
|------|---------|---------|
| 108 | `onChange={(value: string \| number \| null) => setData("timezone", value ?? "")}` | `onChange={(value: string \| number \| null) => setData("timezone", value?.toString() ?? "")}` |
| 124 | `setData("locale", val)` (val bisa number) | `setData("locale", val?.toString() ?? "")` |
| 148 | `onChange={(value: string) => setData("attendance_open", value)}` (harus `ChangeEvent`) | `onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData("attendance_open", e.target.value)}` |
| 158 | Sama untuk `attendance_late` | Sama |
| 168 | Sama untuk `attendance_close` | Sama |
| 186 | `onChange={(checked: boolean) => setData("notifications_email", checked)}` (harus `ChangeEvent`) | `onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData("notifications_email", e.target.checked)}` |
| 196 | Sama untuk `notifications_push` | Sama |
| 214 | Sama untuk `two_factor` | Sama |

**Import tidak terpakai:** `FiSave`, `FiCalendar` → **Dihapus**

---

#### 1.5 `resources/js/Pages/SplashScreen.tsx`
**Masalah:**
- `setLanguage(lang)` — parameter harus `"id" | "en"` bukan `string`
- Destructuring `locale` tapi tidak dipakai
- Fungsi `handleLanguageChange` & `handleDevShortcuts` didefinisikan tapi tidak dipakai
- `AppLayout title="..."` — `AppLayout` belum support prop `title`

**Perbaikan:**
```typescript
// Cast eksplisit
const handleLanguageChange = (lang: string) => {
    setLanguage(lang as "id" | "en");
};

// Hapus locale dari destructuring
const { setLanguage, t } = useLanguage();

// Hapus fungsi yang tidak dipakai: handleLanguageChange, handleDevShortcuts

// Update AppLayout untuk support title
```

---

#### 1.6 `resources/js/Pages/Student/Attendance.tsx`
**Masalah:**
- Import `LoadingSpinner` tidak terpakai
- Destructuring `data` dari `useForm` tapi tidak dipakai
- `errors.username` & `errors.general` — field `username` & `general` tidak ada di form schema

**Perbaikan:**
```typescript
// Hapus import LoadingSpinner
// Hapus `data` dari destructuring
const { setData, post, processing } = useForm({...});

// Hapus block error yang invalid:
// {errors.username && <p>{errors.username}</p>}
// {errors.general && <p>{errors.general}</p>}
```

---

#### 1.7 `resources/js/Pages/Student/AttendanceHistory.tsx`
**Masalah:**
- `<AttendanceChart data={monthlyTrend} title="" />` — prop `title` tidak ada di component
- Import `AttendanceChart` sudah dihapus tapi masih dipakai

**Perbaikan:**
```typescript
// Tambah import kembali
import AttendanceChart from "@/Components/AttendanceChart";

// Hapus prop title
<AttendanceChart data={monthlyTrend} />
```

---

#### 1.8 `resources/js/Pages/Student/Dashboard.tsx`
**Masalah:** Prop `student` tidak dipakai di component

**Perbaikan:**
```typescript
export default function StudentDashboard({
    student: _student,  // prefix underscore = intentionally unused
    todayAttendance,
    stats,
}: PageProps) {
```

---

#### 1.9 `resources/js/Pages/Student/LiveAttendance.tsx`
**Masalah:** Prop `student` tidak dipakai

**Perbaikan:**
```typescript
export default function LiveAttendance({
    student: _student,
    todayAttendance,
}: PageProps) {
```

---

#### 1.10 `resources/js/Pages/Teacher/DutyDashboard.tsx`
**Masalah:** Prop `teacher` tidak dipakai

**Perbaikan:**
```typescript
export default function DashboardPiket({
    teacher: _teacher,
    isScheduled,
    today,
    classStats: initialClassStats,
}: PageProps) {
```

---

#### 1.11 `resources/js/Pages/Teacher/HomeroomDashboard.tsx`
**Masalah:** Prop `teacher` tidak dipakai

**Perbaikan:**
```typescript
export default function DashboardWaliKelas({
    teacher: _teacher,
    class: kelas,
    students,
    stats,
}: PageProps) {
```

---

#### 1.12 `resources/js/Pages/Guardian/LeaveApplication.tsx`
**Masalah:** Prop `guardian` tidak dipakai

**Perbaikan:**
```typescript
export default function WaliPengajuanIzin({
    guardian: _guardian,
    students,
    leaveRequests,
}: PageProps) {
```

---

#### 1.13 `resources/js/Pages/Overview.tsx`
**Masalah:** Import `FiTrendingUp`, `FiUsers`, `FiClock`, `FiAlertCircle` tidak terpakai; fungsi `formatDate` tidak dipakai

**Perbaikan:** Hapus semua import & fungsi yang tidak terpakai

---

#### 1.14 `resources/js/Pages/Profile.tsx`
**Masalah:** Import `FiSave` tidak terpakai

**Perbaikan:** Hapus import `FiSave`

---

#### 1.15 `resources/js/Layouts/AppLayout.tsx`
**Masalah:**
- Tidak support prop `title` (dibutuhkan `SplashScreen`)
- Import `PropsWithChildren` tidak terpakai
- JSX fragment `<>...</>` tidak punya closing tag yang proper

**Perbaikan:**
```typescript
import { Head, Link } from '@inertiajs/react';
// Hapus: import type { PropsWithChildren } from 'react';

interface AppLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
    return (
        <>
            {title && <Head title={title} />}
            <div className="...">
                ...
            </div>
        </>
    );
}
```

---

### 2. Backend — PHPStan (`app/**`)

#### 2.1 `app/Http/Controllers/Web/LeaveApplicationController.php` (Line 44)
**Error:** `Access to an undefined property App\Models\Guardian::$student`

**Root Cause:** Relasi di model `Guardian` adalah `students()` (plural, `HasMany`), bukan `student()` (singular).

**Perbaikan:**
```php
// Sebelum
$student = $guardian->student;
if (! $student) { ... }

// Sesudah
$students = $guardian->students;
if ($students->isEmpty()) { ... }
$student = $students->first();
```

---

#### 2.2 `app/Permissions/PermissionRegistry.php`

**Error 1 (Line 65):** `navSections()` should return `array<string, mixed>` but returns `list<array<...>>`

**Error 2 (Line 186):** `getNavFor()` should return `array<string, mixed>` but returns `list<array<mixed>>`

**Root Cause:** Array numeric (indexed) vs associative array dengan string keys.

**Perbaikan `navSections()`:**
```php
// Sebelum: array numeric [...]
return [
    ['key' => 'utama', 'label' => 'Utama', 'items' => [...]],
    ['key' => 'administrasi', ...],
    ...
];

// Sesudah: associative array dengan key string
return [
    'utama' => [
        'key' => 'utama',
        'label' => 'Utama',
        'items' => [...],
    ],
    'administrasi' => [
        'key' => 'administrasi',
        'label' => 'Administrasi',
        'roles' => ['admin'],
        'items' => [...],
    ],
    ...
];
```

**Perbaikan `getNavFor()`:**
```php
// Sebelum: $sections[] = ... (numeric push)
$sections[] = array_merge($section, ['items' => $filteredItems]);

// Sesudah: gunakan key dari iterasi
foreach (self::navSections() as $sectionKey => $section) {
    ...
    $sections[$sectionKey] = array_merge($section, ['items' => $filteredItems]);
}
```

---

### 3. Code Style — Laravel Pint

#### 3.1 `database/migrations/2026_08_03_105110_add_teacher_type_to_teachers_table.php`
**Violations:** `new_with_parentheses`, `class_definition`

**Perbaikan:** `./vendor/bin/pint` otomatis memperbaiki format class definition.

---

## ✅ Verifikasi Final (Semua Lulus)

```bash
# Frontend
bun run build      ✅ Built in 1m 2s (837 modules)
bun run lint       ✅ 0 problems

# Backend
php artisan test   ✅ 123 tests passed, 423 assertions
./vendor/bin/phpstan analyse --memory-limit=2G  ✅ 0 errors
./vendor/bin/pint --test  ✅ Code style passed
```

---

## 📝 Catatan Teknis Penting

### Pattern Translation `t()` di Project Ini
Fungsi `t(key)` **hanya menerima 1 argumen (string)**. Untuk interpolasi variabel, gunakan `.replace()`:
```typescript
// ✅ Benar
t("reports.classDetail").replace("{class}", className)
t("reports.totalStudents").replace("{count}", count.toString())

// ❌ Salah (akan error TS2554)
t("reports.classDetail", { class: className })
```

### Unused Props Convention
Gunakan prefix `_` untuk props yang sengaja tidak dipakai (mengikuti rule `@typescript-eslint/no-unused-vars` dengan `allowedUnusedArgs: /^_/`):
```typescript
export default function Component({ _student, todayAttendance }: PageProps) { ... }
```

### onChange Handler Pattern untuk Custom Components
Custom components (`SelectInput`, `Toggle`, `Input`) memerlukan handler yang extract value dari event:
```typescript
// SelectInput / Toggle
onChange={(value: string | number | null) => setData("field", value?.toString() ?? "")}

// Input type="time" / type="text"
onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData("field", e.target.value)}

// Toggle (checkbox)
onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData("field", e.target.checked)}
```

### PermissionRegistry Array Structure
Pastikan return type `array<string, mixed>` dengan associative array (string keys), bukan numeric array:
```typescript
// ✅ Benar
return ['key1' => [...], 'key2' => [...]];

// ❌ Salah
return [[...], [...]];
```

---

## 🎯 Status Keseluruhan

| Area | Status | Catatan |
|------|--------|---------|
| **Frontend Build** | ✅ | Zero TS/ESLint errors |
| **Frontend Lint** | ✅ | Zero ESLint problems |
| **Backend Tests** | ✅ | 123/123 passed |
| **Static Analysis** | ✅ | PHPStan 0 errors |
| **Code Style** | ✅ | Pint compliant |
| **Type Safety** | ✅ | Strict mode clean |

**Semua perbaikan dilakukan dengan pendekatan "fix the root cause, not suppress" — tidak ada `@ts-ignore`, `@phpstan-ignore`, atau eslint-disable comments ditambahkan.**

---

**Dokumen ini dibuat sebagai catatan resmi perbaikan batch 4 Agustus 2026 untuk referensi tim pengembangan.**