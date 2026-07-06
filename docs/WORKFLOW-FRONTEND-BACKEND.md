# Workflow Frontend-Backend: Panduan Kolaborasi Fathan & Ihsan

**Dokumen ini untuk:**
- **Fathan** — Junior Frontend Developer (Inertia/React/TS)
- **Ihsan** — Junior Backend Developer (Laravel/PostgreSQL)

**Tujuan:** Menghilangkan bottleneck dengan alur kerja yang rigid, terstruktur,
dan saling terikat kontrak (contract-first development).

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Arsitektur Aplikasi](#2-arsitektur-aplikasi)
3. [Alur Data End-to-End](#3-alur-data-end-to-end)
4. [Dual Controller Pattern](#4-dual-controller-pattern)
5. [Route Contract](#5-route-contract)
6. [Form & Validation](#6-form--validation)
7. [Shared Types](#7-shared-types)
8. [Service Layer](#8-service-layer)
9. [State & Error Handling](#9-state--error-handling)
10. [PR & Review Workflow](#10-pr--review-workflow)
11. [Checklist Feature Baru](#11-checklist-feature-baru)
12. [Common Scenarios](#12-common-scenarios)
13. [Glossary](#13-glossary)

---

## 1. Pendahuluan

### Masalah yang Ingin Diselesaikan

| Masalah | Dampak | Solusi |
|---------|--------|--------|
| Ihsan nunggu halaman selesai untuk tes endpoint | Waktu tunggu, revisi bolak-balik | **Contract-first**: sepakat Route + Response dulu |
| Fathan nunggu API jadi untuk mulai ngoding | Idle, deadline mepet | **Mock data + Inertia fallback**: pake data dummy dulu |
| Type mismatch antara backend & frontend | Bug di production | **Shared types**: Backend define → Frontend tiru |
| N+1 query tidak ketahuan | Slow page load | **Eager loading wajib** di Service |
| Error tidak konsisten | Frontend bingung handle error | **Standard error response** |

### Prinsip Tim

```
1. Contract dulu → koding kemudian
2. Backend define shape → Frontend konsumsi
3. Service layer = satu-satunya tempat logic
4. Setiap feature = 1 migration + 1 service + 1 controller + 1 page
5. Test sebelum PR (backend: PHPUnit, frontend: liat manual di browser)
```

---

## 2. Arsitektur Aplikasi

### Diagram Layering

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (React)                              │
│                                                                     │
│  Pages/         ← Halaman penuh (di-load Inertia)                  │
│  Components/    ← Komponen reusable                                │
│  Layouts/       ← Layout wrapper                                   │
│  types/         ← TypeScript interfaces                            │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ Inertia::render() + props (JSON)
                           │ atau axios (API)
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        LARAVEL                                      │
│                                                                     │
│  Routes/         ← web.php (Inertia) + api.php (Sanctum)           │
│  Controllers/    ← Web/ (Inertia) + Api/ (JSON)                   │
│  Requests/       ← Form Request validation                         │
│  Services/       ← Business logic (SATU-SATUNYA tempat logic)      │
│  Models/         ← Eloquent ORM + relationships                    │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ SQL query
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                            │
│                                                                     │
│  migrations/      ← Schema definition                              │
│  seeders/         ← Data awal                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### InertiaJS: Bagaimana Frontend & Backend Terhubung

**InertiaJS** adalah bridge yang membuat Laravel dan React seolah-olah dalam 1
aplikasi. Bedanya dengan SPA biasa:

| Aspek | SPA Biasa (React + API) | InertiaJS |
|-------|------------------------|-----------|
| Routing | React Router | Laravel Routes |
| Data fetching | useEffect + axios | Controller → `Inertia::render()` |
| Form submit | axios/fetch | `router.post()`, `router.patch()` |
| Navigation | `<Link to="...">` | `<Link href="...">` |
| Auth | JWT/OAuth token | Laravel session + Sanctum |
| Page load | JSON → render | HTML + props (server-rendered) |

**Inertia tidak menggantikan API.** API tetap ada untuk mobile/third-party.
Web pakai Inertia, mobile/eksternal pakai API.

### Kapan Pakai Inertia vs API

| Situasi | Pakai |
|---------|-------|
| Admin panel (web browser) | **Inertia** (web.php + Web\Controller) |
| Mobile app (Flutter/React Native) | **API** (api.php + Api\Controller) |
| SSO dengan sistem lain | **API** (api.php + token Sanctum) |
| Internal dashboard | **Inertia** |
| Laporan export PDF/Excel | **API** atau console command |
| Third-party integration | **API** |

---

## 3. Alur Data End-to-End

### Web (Inertia) — Contoh: Halaman Data Master

```
Ihsan (Backend)
──────
1. Migration: bikin tabel students
2. Model: Student.php (fillable, casts, relations)
3. Service: StudentService.php (paginate, create, update, delete, toggleStatus)
4. Form Request: StoreStudentRequest.php, UpdateStudentRequest.php
5. Controller: Web\StudentController.php (index, store, update, destroy, toggleStatus)
6. Route: routes/web.php → GET /admin/data-master
         ──┐
           │
           │ Inertia::render('Admin/DataMaster', [...props])
           ▼
Fathan (Frontend)
──────
7. Pages/Admin/DataMaster.tsx ← terima props dari backend
8. Components/Table, Button, Pagination ← dipake di page
9. router.get(), router.post(), router.delete() ← komunikasi balik ke backend
```

### API (Sanctum) — Contoh: Endpoint Students

```
Ihsan
──────
1-4. (sama seperti di atas)
5. Controller: Api\StudentController.php (index, show, store, update, destroy)
6. Route: routes/api.php → GET /api/students
         ──┐
           │
           │ JSON response
           ▼
Fathan (atau siapapun konsumen API)
──────
7. axios.get('/api/students', { headers: { Authorization: 'Bearer...' } })
8. Data langsung dipake (tanpa Inertia)
```

### Diagram Sequence: Fitur Baru

```
Ihsan                            Fathan
  │                                │
  ├─ 1. Migration ────────────────┤ (Ihsan define schema)
  ├─ 2. Model ────────────────────┤
  ├─ 3. Service ──────────────────┤
  ├─ 4. Form Request ─────────────┤
  │                                │
  ├─ 5. Route + Controller ───────┤
  │    (Inertia::render dengan    │
  │     props structure lengkap,   │
  │     pakai data dummy dulu)     │
  │              │                 │
  │              ▼                 │
  ├─ 6. Share contract ke Fathan ──┤ (link route + props shape)
  │                                │
  │                    ┌───────────┤
  │                    │ Fathan:   │
  │                    │ 7. Bikin  │
  │                    │ Page.tsx  │
  │                    │ 8. Bikin  │
  │                    │ Components│
  │                    │ 9. Submit │
  │                    │ PR        │
  │                    └───────────┤
  ├─ 10. Ihsan connect ke         │
  │     real database ────────────┤
  │                                │
  └── 11. Integration test ────────┘
```

---

## 4. Dual Controller Pattern

Setiap fitur punya **2 controller**: Web (Inertia) + API (JSON).

### Struktur

```
app/Http/Controllers/
├── Controller.php                    ← Base abstract (empty)
├── Web/
│   ├── StudentController.php        ← Inertia: return view + props
│   ├── TeacherController.php
│   ├── SchoolClassController.php
│   └── GuardianController.php
└── Api/
    ├── AuthController.php           ← Token-based auth
    ├── StudentController.php        ← JSON: return response()->json()
    ├── TeacherController.php
    ├── SchoolClassController.php
    └── GuardianController.php
```

### Web Controller (Inertia)

```php
// app/Http/Controllers/Web/StudentController.php

class StudentController extends Controller
{
    public function __construct(
        protected StudentService $studentService,
        protected SchoolClassService $schoolClassService,
    ) {}

    public function index(): Response
    {
        $students = $this->studentService->paginate(
            request()->only(['search', 'class_id', 'status'])
        );

        $classes = $this->schoolClassService->findAll();

        return Inertia::render('Admin/DataMaster', [
            'activeTab' => 'siswa',
            'students'  => $students,     // ← ini yang diterima Fathan sebagai props
            'classes'   => $classes,
            'filters'   => request()->only(['search', 'class_id', 'status']),
        ]);
    }

    public function store(StoreStudentRequest $request)
    {
        $this->studentService->create($request->validated());
        return redirect()->back()->with('success', 'Siswa berhasil ditambahkan.');
    }
}
```

### API Controller (JSON)

```php
// app/Http/Controllers/Api/StudentController.php

class StudentController extends Controller
{
    public function __construct(
        protected StudentService $studentService,
    ) {}

    public function index(): JsonResponse
    {
        $students = $this->studentService->paginate(
            request()->only(['search', 'class_id', 'status'])
        );

        return response()->json($students);  // ← JSON langsung
    }

    public function store(StoreStudentRequest $request): JsonResponse
    {
        $student = $this->studentService->create($request->validated());
        return response()->json($student, 201);  // ← 201 Created
    }
}
```

### Aturan Dual Controller

| Aspek | Web Controller | API Controller |
|-------|---------------|----------------|
| Return type | `Inertia\Response` atau `redirect()` | `JsonResponse` |
| Error handling | Redirect back + `withErrors()` | JSON `{ message: "..." }` + status code |
| Auth middleware | `auth:sanctum` (session) | `auth:sanctum` (token) |
| Pagination format | Sama (LengthAwarePaginator) | Sama (otomatis json) |
| Service call | Sama | Sama |

**Keduanya panggil Service yang SAMA.** Logic tidak boleh ada di controller.

---

## 5. Route Contract

### 5.1 Web Routes (Inertia)

File: `routes/web.php`

**Aturan:**
- Nama route pakai **kebab-case**
- Prefix per fitur
- Setiap route harus punya **name** (biar Fathan bisa pake `route()`)

```php
// routes/web.php

Route::middleware(["auth:sanctum"])->group(function () {
    Route::prefix("/admin/data-master")->group(function () {
        // GET — render halaman
        Route::get("/", [StudentController::class, "index"])
            ->name("admin.data-master");

        // POST / PATCH / DELETE — CRUD
        Route::post("/siswa", [StudentController::class, "store"])
            ->name("admin.data-master.siswa.store");
        Route::patch("/siswa/{student}", [StudentController::class, "update"])
            ->name("admin.data-master.siswa.update");
        Route::delete("/siswa/{student}", [StudentController::class, "destroy"])
            ->name("admin.data-master.siswa.destroy");
        Route::patch("/siswa/{student}/toggle-status", [StudentController::class, "toggleStatus"])
            ->name("admin.data-master.siswa.toggle");
    });
});
```

### 5.2 API Routes (Sanctum)

File: `routes/api.php`

**Aturan:**
- Prefix `/api/` otomatis
- Resource route untuk CRUD standar
- Route name prefix `api.`
- Response selalu JSON

```php
// routes/api.php

Route::post("/login", [AuthController::class, "login"])->name("api.login");

Route::middleware("auth:sanctum")->group(function () {
    Route::post("/logout", [AuthController::class, "logout"])->name("api.logout");
    Route::get("/user", [AuthController::class, "user"])->name("api.user");

    // API Resource
    Route::apiResource("students", StudentController::class);
    Route::apiResource("teachers", TeacherController::class);
    Route::apiResource("classes", SchoolClassController::class);
    Route::apiResource("guardians", GuardianController::class);
});
```

### 5.3 Contract Template

Setiap kali Ihsan selesai bikin route, wajib share contract ini ke Fathan:

````markdown
## Route Contract: Data Master

### Web Routes (Inertia)

| Method | URL | Name | Controller | Notes |
|--------|-----|------|------------|-------|
| GET | `/admin/data-master` | `admin.data-master` | `StudentController@index` | Props lihat di bawah |
| POST | `/admin/data-master/siswa` | `admin.data-master.siswa.store` | `StudentController@store` | Validasi di StoreStudentRequest |
| PATCH | `/admin/data-master/siswa/{id}` | `admin.data-master.siswa.update` | `StudentController@update` | |
| DELETE | `/admin/data-master/siswa/{id}` | `admin.data-master.siswa.destroy` | `StudentController@destroy` | |

### Inertia Props — GET /admin/data-master

```typescript
interface StudentDataMasterProps {
  activeTab: string;           // "siswa" | "guru" | "kelas" | "wali"
  students?: {
    data: Student[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number;
    to: number;
  };
  classes?: SchoolClass[];
  filters: {
    search?: string;
    class_id?: string;
    status?: string;
  };
  errors?: Record<string, string>;
  flash?: { success?: string };
}

interface Student {
  id: number;
  nis: string;
  nisn: string;
  name: string;
  class: { id: number; name: string } | null;
  status: "Active" | "Inactive";
  user: { email?: string } | null;
}

interface SchoolClass {
  id: number;
  name: string;
  teacher?: { id: number; name: string } | null;
}
```

### Flash Messages

| Event | Key | Example |
|-------|-----|---------|
| Create success | `flash.success` | "Siswa berhasil ditambahkan." |
| Update success | `flash.success` | "Data siswa berhasil diperbarui." |
| Delete success | `flash.success` | "Siswa berhasil dihapus." |

### Error Responses (validation)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "nis": ["NIS sudah terdaftar."],
    "name": ["Nama wajib diisi."]
  }
}
```

Inertia akan otomatis parse error ini ke props `errors`.
Fathan tinggal pake `errors.nis`, `errors.name` di form.
````

---

## 6. Form & Validation

### 6.1 Backend: Form Request

Setiap operasi write (create/update) harus punya Form Request.

```php
// app/Http/Requests/StoreStudentRequest.php

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;  // Authorization di middleware atau Gate
    }

    public function rules(): array
    {
        return [
            'nis'             => 'required|string|max:30|unique:students,nis',
            'nisn'            => 'required|string|max:30|unique:students,nisn',
            'name'            => 'required|string|max:100',
            'class_id'        => 'required|exists:school_classes,id',
            'birth_date'      => 'required|date',
            'phone'           => 'nullable|string|max:20',
            'address'         => 'nullable|string',
            'enrollment_year' => 'required|integer|min:2000|max:2099',
            'guardian_id'     => 'nullable|exists:guardians,id',
            'email'           => 'nullable|email|max:100|unique:users,email',
            'password'        => 'nullable|string|min:6',
        ];
    }

    // Custom error messages (kalo perlu)
    public function messages(): array
    {
        return [
            'nis.required'  => 'NIS wajib diisi.',
            'nis.unique'    => 'NIS sudah terdaftar.',
            'class_id.required' => 'Kelas wajib dipilih.',
        ];
    }
}
```

### 6.2 Frontend: Inertia Form

Fathan menggunakan **`useForm`** dari `@inertiajs/react`.

```tsx
import { useForm } from '@inertiajs/react';

export default function TambahSiswaForm({ classes }: { classes: SchoolClass[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nis: '',
        nisn: '',
        name: '',
        class_id: '',
        birth_date: '',
        phone: '',
        address: '',
        enrollment_year: new Date().getFullYear().toString(),
        guardian_id: '',
        email: '',
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/data-master/siswa', {
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={submit}>
            {/* NIS */}
            <div>
                <label>NIS</label>
                <input
                    type="text"
                    value={data.nis}
                    onChange={(e) => setData('nis', e.target.value)}
                />
                {errors.nis && <p className="text-red-500 text-sm">{errors.nis}</p>}
            </div>

            {/* Kelas */}
            <select
                value={data.class_id}
                onChange={(e) => setData('class_id', e.target.value)}
            >
                <option value="">Pilih Kelas</option>
                {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
            {errors.class_id && <p className="text-red-500 text-sm">{errors.class_id}</p>}

            {/* Submit */}
            <button type="submit" disabled={processing}>
                {processing ? 'Menyimpan...' : 'Simpan'}
            </button>
        </form>
    );
}
```

### 6.3 Aturan Form

| Aturan | Ihsan | Fathan |
|--------|-------|--------|
| Validasi | Define di Form Request | Tampilkan `errors.*` di form |
| Error message | Bahasa Indonesia | Langsung dari backend |
| Unique constraint | Cek via SQL | Tampilkan error "NIS sudah terdaftar" |
| Processing state | - | Disabled button + loading text |

**Ihsan tidak perlu nunggu Fathan bikin form nya.**
Fathan tidak perlu tanya validasi apa aja — baca aja Form Request nya.

### 6.4 Standard Error Response

Backend selalu return error dalam format ini:

```json
// Validation Error (422)
{
  "message": "The given data was invalid.",
  "errors": {
    "nis": ["NIS sudah terdaftar."],
    "class_id": ["Kelas wajib dipilih."]
  }
}

// Not Found (404)
{
  "message": "Siswa tidak ditemukan."
}

// Server Error (500)
{
  "message": "Terjadi kesalahan. Silakan coba lagi."
}
```

Inertia otomatis parsing validation errors ke props `errors`.
API manual: frontend harus handle sendiri.

---

## 7. Shared Types

### 7.1 Backend: Data Shape (harus didokumentasikan Ihsan)

Ihsan wajib define **data shape** yang akan dikirim ke frontend.
Bisa lewat contract document atau langsung di docblock controller.

```php
/**
 * @return array{
 *     activeTab: string,
 *     students: LengthAwarePaginator,
 *     classes: Collection,
 *     filters: array,
 * }
 */
public function index(): Response
{
    // ...
}
```

### 7.2 Frontend: TypeScript Interface

Fathan harus membuat TypeScript interface yang **sama persis** dengan
data dari backend.

```tsx
// types/index.ts — shared types untuk seluruh aplikasi

// ─── User ───
export interface User {
    id: number;
    username: string;
    name: string;
    email: string;
    email_verified_at: string | null;
    role: 'admin' | 'student' | 'teacher' | 'guardian';
    created_at: string;
    updated_at: string;
}

// ─── Student ───
export interface Student {
    id: number;
    user_id: number;
    class_id: number;
    nis: string;
    nisn: string;
    name: string;
    birth_date: string;
    phone: string | null;
    address: string | null;
    enrollment_year: number;
    status: 'Active' | 'Inactive';
    guardian_id: number | null;
    created_at: string;

    // Relations (loaded via ->with())
    user?: User | null;
    class?: SchoolClass | null;
    guardian?: Guardian | null;
}

// ─── Teacher ───
export interface Teacher {
    id: number;
    user_id: number;
    name: string;
    teacher_code: string;
    created_at: string;

    user?: User | null;
    school_classes?: SchoolClass[];
}

// ─── Guardian ───
export interface Guardian {
    id: number;
    user_id: number;
    name: string;
    phone: string | null;
    address: string | null;

    user?: User | null;
    students?: Pick<Student, 'id' | 'name'>[];
}

// ─── SchoolClass ───
export interface SchoolClass {
    id: number;
    name: string;
    teacher_id: number | null;

    teacher?: Teacher | null;
    students?: Student[];
}

// ─── Attendance ───
export interface Attendance {
    id: number;
    student_id: number;
    attendance_date: string;
    check_in_time: string | null;
    latitude: string | null;
    longitude: string | null;
    photo_url: string | null;
    status: 'present' | 'late' | 'absent' | 'sick' | 'permit';

    student?: Student;
}

// ─── LeaveRequest ───
export interface LeaveRequest {
    id: number;
    student_id: number;
    guardian_id: number;
    category: 'Sick' | 'Event' | 'Competition';
    start_date: string;
    end_date: string;
    document_url: string | null;
    approval_status: 'pending' | 'approved' | 'rejected';

    student?: Student;
    guardian?: Guardian;
}

// ─── Pagination (generic) ───
export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}

// ─── Inertia Page Props ───
export interface PageProps {
    auth: {
        user: User | null;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
    [key: string]: unknown;
}
```

### 7.3 Siapa Define Apa?

| Layer | Siapa | Output |
|-------|-------|--------|
| Database (migration) | Ihsan | Kolom, tipe, index, FK |
| Model (fillable, casts, relations) | Ihsan | `$fillable`, `$casts`, `relation()` |
| Service return type | Ihsan | Docblock `@return` |
| **TypeScript interface** | **Fathan** | `types/index.ts` |
| Inertia PageProps | Fathan | `types/inertia.d.ts` + per-page props |

**Aturan:** Kalau Ihsan ubah structure response, wajib info Fathan.
Fathan update TypeScript interface sebelum ngoding.

### 7.4 Inertia PageProps Augmentation

```tsx
// types/inertia.d.ts
import type { User } from '@/types';

declare module '@inertiajs/react' {
    interface PageProps {
        auth: {
            user: User | null;
        };
        flash?: {
            success?: string;
            error?: string;
        };
        errors?: Record<string, string>;
        [key: string]: unknown;  // ← important: biar bisa tambah props lain
    }
}

export {};
```

### 7.5 Per-Halaman Props (generic)

Untuk halaman spesifik, Fathan define interface di file page masing-masing:

```tsx
// Pages/Admin/DataMaster.tsx

interface DataMasterPageProps extends PageProps {
    activeTab?: string;
    students?: PaginatedData<Student>;
    teachers?: PaginatedData<Teacher>;
    schoolClasses?: PaginatedData<SchoolClass>;
    guardians?: PaginatedData<Guardian>;
    classes?: SchoolClass[];
    filters?: { search?: string; class_id?: string; status?: string };
}
```

---

## 8. Service Layer

### 8.1 Prinsip

> **TIDAK ADA LOGIC DI CONTROLLER.**
> Semua logic bisnis WAJIB di Service.

### 8.2 Struktur Service

```php
// app/Services/StudentService.php

class StudentService
{
    // READ
    public function paginate(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return Student::query()
            ->with(['user', 'class', 'guardian'])  // ← EAGER LOADING WAJIB
            ->when($filters['search'] ?? null, fn($q, $v) =>
                $q->whereAny(['name', 'nis', 'nisn'], 'like', "%{$v}%"))
            ->when($filters['class_id'] ?? null, fn($q, $v) =>
                $q->where('class_id', $v))
            ->when($filters['status'] ?? null, fn($q, $v) =>
                $q->where('status', $v))
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id): ?Student
    {
        return Student::with(['user', 'class', 'guardian', 'attendances', 'leaveRequests'])
            ->find($id);
    }

    // WRITE (wrapping in DB::transaction)
    public function create(array $data): Student
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'username' => $data['nis'],
                'name'     => $data['name'],
                'email'    => $data['email'] ?? null,
                'password' => Hash::make($data['password'] ?? 'password'),
                'role'     => 'student',
            ]);
            $user->assignRole('student');

            return Student::create([
                'user_id'         => $user->id,
                'class_id'        => $data['class_id'],
                'nis'             => $data['nis'],
                'nisn'            => $data['nisn'],
                'name'            => $data['name'],
                'birth_date'      => $data['birth_date'],
                'phone'           => $data['phone'] ?? null,
                'address'         => $data['address'] ?? null,
                'enrollment_year' => $data['enrollment_year'],
                'status'          => $data['status'] ?? 'Active',
                'guardian_id'     => $data['guardian_id'] ?? null,
            ])->load(['user', 'class', 'guardian']);
        });
    }

    public function update(int $id, array $data): Student
    {
        return DB::transaction(function () use ($id, $data) {
            $student = Student::findOrFail($id);
            $student->update($data);

            if (isset($data['name'])) {
                $student->user->update(['name' => $data['name']]);
            }

            return $student->fresh(['user', 'class', 'guardian']);
        });
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $student = Student::findOrFail($id);
            $student->user->delete();
        });
    }

    public function toggleStatus(int $id): Student
    {
        $student = Student::findOrFail($id);
        $student->update([
            'status' => $student->status === 'Active' ? 'Inactive' : 'Active',
        ]);
        return $student->fresh();
    }
}
```

### 8.3 Aturan Service

| Aturan | Wajib? | Karena |
|--------|--------|--------|
| `->with()` untuk eager loading | ✅ WAJIB | Mencegah N+1 query |
| `DB::transaction()` untuk write | ✅ WAJIB | Atomic operation |
| `findOrFail()` untuk get by ID | ✅ WAJIB | Biar 404 otomatis |
| Docblock `@return` type | ✅ WAJIB | Dokumentasi shape |
| Filtering via `when()` | ✅ WAJIB | Biar aman dari SQL injection |
| Pagination via `paginate()` | ✅ WAJIB | Bukan `get()` |
| Accessor/mutator di Model | ⚠️ Kalau perlu | Transform data sebelum dikirim |

### 8.4 Eager Loading Wajib

❌ **JANGAN:**
```php
public function index()
{
    return Student::paginate();  // N+1: setiap student query user & class terpisah
}
```

✅ **LAKUKAN:**
```php
public function index()
{
    return Student::with(['user', 'class', 'guardian'])->paginate();  // 1 query join
}
```

### 8.5 Standarisasi Nama Method Service

| Method | Fungsi | Return |
|--------|--------|--------|
| `findAll()` | Ambil semua data (tanpa pagination) | `Collection` |
| `findById(int $id)` | Ambil 1 data by ID | `Model` atau `null` |
| `paginate(array $filters, int $perPage)` | Data dengan pagination + filter | `LengthAwarePaginator` |
| `create(array $data)` | Buat data baru | `Model` |
| `update(int $id, array $data)` | Update data | `Model` |
| `delete(int $id)` | Hapus data | `void` |
| `toggleStatus(int $id)` | Toggle active/inactive | `Model` |

---

## 9. State & Error Handling

### 9.1 Loading State

Inertia handle loading secara global.
Fathan tinggal pake `processing` dari `useForm()` atau `usePage()`.

```tsx
// Form submit
const { data, setData, post, processing, errors } = useForm({...});

<button type="submit" disabled={processing}>
    {processing ? 'Menyimpan...' : 'Simpan'}
</button>
```

Untuk navigasi Inertia, ada progress bar otomatis (warna merah `#f53003`).
Fathan tidak perlu bikin loading indicator sendiri.

### 9.2 Empty State

Backend kirim data kosong → Frontend tampilkan empty state.

```tsx
// Di Page
{students.total === 0 ? (
    <div className="text-center py-10">
        <i className="fas fa-users text-4xl text-slate-gray mb-4" />
        <p className="text-sm text-slate-gray">Belum ada data siswa.</p>
        <Button variant="primary" className="mt-4">Tambah Siswa Baru</Button>
    </div>
) : (
    <Table ... />
)}
```

### 9.3 Error State

| Tipe Error | Backend | Frontend |
|------------|---------|----------|
| Validation | `FormRequest` → 422 | `errors.*` di form |
| Not Found | `findOrFail()` → 404 | Redirect ke halaman error |
| Server error | Exception → 500 | Tampilkan "Terjadi kesalahan" |
| Auth error | `auth:sanctum` → 401 | Redirect ke login |
| Forbidden | Gate/Policy → 403 | Tampilkan "Tidak punya akses" |

### 9.4 Flash Messages

Backend kirim flash via `->with('success', '...')`.
Inertia auto parse ke props `flash`.

```tsx
// Di Layout / App.tsx (global)
import { usePage } from '@inertiajs/react';

function FlashMessage() {
    const { flash } = usePage().props;

    if (!flash?.success && !flash?.error) return null;

    return (
        <div className={`p-4 rounded-lg mb-4 ${
            flash.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
            {flash.success || flash.error}
        </div>
    );
}
```

### 9.5 Standard Response Contract

Backend WAJIB konsisten dengan format response:

**Success:**
```json
{
  "data": { ... }    // Single object (show, store, update)
}
```

```json
{
  "data": [...],     // Collection (index)
  "meta": {
    "current_page": 1,
    "last_page": 10,
    "total": 100
  }
}
```

**Error (API):**
```json
{
  "message": "Pesan error",
  "errors": { "field": ["Error detail"] }  // Optional, untuk validation
}
```

---

## 10. PR & Review Workflow

### 10.1 Branching

```
main
├── feat/admin-data-master        ← Ihsan: backend
├── feat/admin-data-master-ui     ← Fathan: frontend (bisa overlap)
└── feat/live-presensi
    ├── feat/live-presensi-api    ← Ihsan
    └── feat/live-presensi-ui     ← Fathan
```

**Aturan:**
- Backend & Frontend bisa branch terpisah
- Backend wajib selesai duluan (contract)
- Frontend bisa mulai dengan data dummy
- Merge ke `main` setelah reviewer (Sandiko) approve

### 10.2 Checklist PR Backend (Ihsan)

```
☐ Migration sudah jalan (php artisan migrate)
☐ Seeder sudah include data sample
☐ Model sudah punya fillable, casts, relations
☐ Service sudah dengan eager loading
☐ Form Request validasi lengkap
☐ Controller: Web + API sudah sesuai pattern
☐ Route name sudah di-set
☐ Contract sudah dishare ke Fathan (route + props shape)
☐ php artisan test — semua passing
☐ Tidak ada dump() atau dd() — bersih dari debug
```

### 10.3 Checklist PR Frontend (Fathan)

```
☐ TypeScript interface sudah sesuai contract backend
☐ Page props dideclare sesuai Inertia::render()
☐ Form menggunakan useForm() dengan field sesuai Form Request
☐ Validation error muncul di form
☐ Loading state (processing) di button submit
☐ Empty state untuk data kosong
☐ Flash message untuk success/error
☐ Responsive (cek desktop + mobile)
☐ bun run build — tidak ada TypeScript error
```

### 10.4 Reviewer Checklist (Sandiko)

```
☐ Logic tidak ada di Controller (semua di Service)
☐ Eager loading → tidak ada N+1
☐ Form Request tidak kosong
☐ TypeScript strict — tidak ada `any`
☐ Error handling sesuai standar
☐ Hardcoded string tidak ada (pake design tokens)
☐ Nama route konsisten
```

### 10.5 Timeline Feature Baru

```
Day 1:
  Ihsan: Migration + Model + Service + FormRequest + Controller + Route + contract
  Fathan: Baca contract, siapkan Page skeleton + mock data

Day 2:
  Ihsan: PR backend → Sandiko review
  Fathan: Implementasi page + komponen (pake data dummy)

Day 3:
  Ihsan: Fix review → merge → backend live
  Fathan: Connect ke backend asli (ganti data dummy)
  Fathan: PR frontend → Sandiko review

Day 4:
  Fathan: Fix review → merge
  Sandiko: Integration test (full flow)
```

---

## 11. Checklist Feature Baru

### Template untuk Setiap Fitur Baru

Buat copy checklist ini di card Trello setiap kali mulai fitur baru:

```markdown
## Feature: [Nama Fitur]

### Backend (Ihsan)
- [ ] Migration (+ seeder)
- [ ] Model ($fillable, $casts, relations)
- [ ] Service (CRUD + business logic)
- [ ] Form Request (validation rules)
- [ ] Web Controller (Inertia::render)
- [ ] API Controller (JSON resource)
- [ ] Route (web.php + api.php)
- [ ] Contract dishare ke Fathan

### Frontend (Fathan)
- [ ] TypeScript interface (types/index.ts)
- [ ] Page (Pages/...tsx)
- [ ] Components (Components/...tsx)
- [ ] Inertia form (useForm)
- [ ] Error handling (validation, empty, error)
- [ ] Flash messages (success)
- [ ] Responsive

### Integration
- [ ] Backend test (php artisan test)
- [ ] Frontend build (bun run build)
- [ ] Manual flow test (browser)
```

---

## 12. Common Scenarios

### Skenario 1: Ihsan Selesai Backend Duluan

```
Ihsan:
1. Push branch feat/xxx
2. Kirim contract ke Fathan (via Trello card comment atau Slack)
3. Create PR → minta review Sandiko

Fathan (setelah terima contract):
1. Baca contract
2. Bikin Page.tsx dengan props sesuai contract
3. Pake data dummy dulu (`const data: Student[] = [...]`)
4. Bikin Components yang diperlukan
5. Kalo backend udah merge → ganti dummy pake usePage().props
```

### Skenario 2: Fathan Selesai Frontend Duluan

```
Fathan:
1. Bikin Page.tsx + Components dengan data dummy
2. Create PR → minta review Sandiko (frontend-only)

Ihsan (masih ngerjain backend):
1. Sesuaikan Service return type dengan yang dipake Fathan
2. Kalo Fathan pake field yang ternyata beda → diskusi
3. Backend selesai → connect
```

### Skenario 3: Ada Perubahan Schema

```
Ihsan:
1. Migration baru (bukan edit migration lama!)
2. Update Model ($fillable, $casts)
3. Update Service
4. Update Form Request
5. Info Fathan: "Field X berubah jadi Y"
6. Buat migration untuk rename/ubah kolom

Fathan:
1. Update TypeScript interface
2. Update form field
3. Update table column render
```

### Skenario 4: Halaman Butuh Data dari Banyak Service

```php
// Web Controller: Dashboard perlu data dari 3 service
class DashboardController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService,
        protected StudentService $studentService,
        protected LeaveRequestService $leaveRequestService,
    ) {}

    public function __invoke(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => $this->attendanceService->getDailyStats(),
            'recentAbsences' => $this->attendanceService->getRecentAbsences(),
            'pendingLeaves' => $this->leaveRequestService->getPending(),
        ]);
    }
}
```

### Skenario 5: Search + Filter + Pagination

**Backend (Ihsan):**
```php
// Service
public function paginate(array $filters = [], int $perPage = 10): LengthAwarePaginator
{
    return Student::query()
        ->with(['user', 'class', 'guardian'])
        ->when($filters['search'] ?? null, fn($q, $v) =>
            $q->whereAny(['name', 'nis', 'nisn'], 'like', "%{$v}%"))
        ->when($filters['class_id'] ?? null, fn($q, $v) =>
            $q->where('class_id', $v))
        ->when($filters['status'] ?? null, fn($q, $v) =>
            $q->where('status', $v))
        ->latest()
        ->paginate($perPage);
}
```

**Frontend (Fathan):**
```tsx
// Search + filter via Inertia GET request
const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/data-master',
        { ...filters, search, tab: currentTab },
        { preserveState: true }
    );
};

// Pagination
<Pagination
    currentPage={students.current_page}
    totalPages={students.last_page}
    totalItems={students.total}
    onPageChange={(page) =>
        router.get('/admin/data-master',
            { ...filters, page },
            { preserveState: true }
        )
    }
/>
```

### Skenario 6: Export Laporan (Excel/PDF)

Backend handle export sebagai file download.
Tidak perlu Inertia — langsung akses URL.

```php
// Route
Route::get('/admin/rekap/export', [RekapController::class, 'exportExcel'])
    ->name('admin.rekap.export');

// Controller
public function exportExcel(Request $request)
{
    return Excel::download(new RekapExport($request->filters), 'rekap.xlsx');
}
```

```tsx
// Frontend — download langsung
<a href="/admin/rekap/export?month=6&year=2026" className="...">
    <i className="fas fa-file-excel" /> Export Excel
</a>
```

### Skenario 7: Deploy & Testing

```bash
# Ihsan — sebelum push
php artisan migrate:fresh --seed
php artisan test

# Fathan — sebelum push
bun run build           # Cek TypeScript error
# Manual cek di browser

# Sandiko — review PR
# Cek di local: git checkout branch, composer install, npm install
# php artisan migrate:fresh --seed
# bun run dev → buka browser
```

---

## 13. Glossary

| Istilah | Arti |
|---------|------|
| **InertiaJS** | Bridge Laravel + React (server-rendered SPA) |
| **Sanctum** | Laravel auth untuk SPA + API token |
| **Controller** | Penghubung Route ke Service |
| **Service** | Tempat logic bisnis (CRUD, filter, perhitungan) |
| **Form Request** | Class validasi terpisah |
| **Eager Loading** | `->with('relation')` — mencegah N+1 |
| **N+1 Query** | Query berulang karena lazy loading |
| **Contract** | Sepakat Route + Request + Response shape |
| **Dual Controller** | Web (Inertia) + API (JSON) untuk 1 fitur |
| **Route name** | `->name('admin.data-master')` — identitas route |
| **Flash message** | Pesan sukses/error sekali pakai |
| **Processing** | State loading di Inertia form |
| **DB::transaction** | Atomic operation — rollback kalau gagal |
| **Pagination** | `paginate()` → data terpotong per halaman |
| **Resource** | `apiResource()` — CRUD route otomatis |
| **Policy/Gate** | Authorization Laravel |
| **Middleware** | Filter request (auth, role) |
| **Bun** | Package manager frontend |
| **Vite** | Build tool (dev server HMR) |
| **PHPUnit** | Testing framework PHP |
| **Trello** | Project management (card per fitur) |

---

## Lampiran

### A. Template Contract

Copy ini setiap Ihsan mau share contract ke Fathan:

```markdown
## Route Contract: [Nama Fitur]

### Web (Inertia)

| Method | URL | Name | Controller |
|--------|-----|------|------------|
| GET | `/xxx` | `xxx` | `XxxController@index` |

### Inertia Props — GET /xxx
\```typescript
interface Props {
  // ... (isi)
}
\```

### API

| Method | URL | Name |
|--------|-----|------|
| GET | `/api/xxx` | `api.xxx` |

### API Response
\```json
{
  "data": [...]
}
\```

### Flash Messages
- success: "..."

### Errors
- 404: { "message": "..." }
- 422: { "message": "...", "errors": {...} }
```

### B. Template Issue (kalo ada yang tidak sesuai)

```markdown
## Issue: [Judul]

### Tipe
backend / frontend / contract

### Deskripsi
[Apa yang tidak sesuai?]

### Lokasi
- Backend: [file:line]
- Frontend: [file:line]

### Yang Diharapkan
[...]

### Yang Terjadi
[...]

### Screenshot
[...]
```

### C. Estimasi Waktu Pengerjaan

| Task | Ihsan | Fathan |
|------|-------|--------|
| CRUD sederhana (1 tabel) | 2-3 jam | 3-4 jam |
| Halaman dashboard (read-only) | 1 jam | 2-3 jam |
| Form kompleks (multi-tabel) | 3-4 jam | 4-6 jam |
| Export laporan | 2-3 jam | 30 menit |
| Setting/konfigurasi | 1-2 jam | 1-2 jam |

---

> **Prinsip Tim:**
> _Contract dulu, koding kemudian._
> _Backend define shape, frontend consume._
> _Service = satu-satunya tempat logic._
> _Error handling bukan afterthought._
> _Kalau mentok 30 menit, angkat tangan._
