<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Student;
use App\Services\GuardianService;
use App\Services\SchoolClassService;
use App\Services\StudentService;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function __construct(
        protected StudentService $studentService,
        protected SchoolClassService $schoolClassService,
        protected GuardianService $guardianService,
    ) {
    }

    public function index(): Response
    {
        $tab = request()->query('tab', 'students');

        if ($tab === 'teachers') {
            $this->authorize('viewAny', \App\Models\Teacher::class);
            $teachers = resolve(\App\Services\TeacherService::class)->paginate(
                request()->only(['search', 'teacher_type']),
            );
            return Inertia::render('Admin/MasterData', [
                'activeTab' => 'guru',
                'teachers' => $teachers,
                'filters' => request()->only(['search', 'tab', 'teacher_type']),
            ]);
        }

        if ($tab === 'class') {
            $this->authorize('viewAny', \App\Models\SchoolClass::class);
            $classes = $this->schoolClassService->paginate(
                request()->only(['search', 'level']),
            );
            $allTeachers = \App\Models\Teacher::select(['id', 'name'])
                ->orderBy('name')
                ->get();
            $total = $classes->total();
            $isClientMode = $total <= 100;

            return Inertia::render('Admin/MasterData', [
                'activeTab' => 'classes',
                'schoolClasses' => $classes,
                'allTeachers' => $allTeachers,
                'classOptions' => $classes->map(fn ($c) => ['id' => $c->id, 'name' => $c->name])->all(),
                'searchConfig' => [
                    'mode' => $isClientMode ? 'client' : 'server',
                    'allData' => $isClientMode ? $classes->all() : null,
                ],
                'filters' => request()->only(['search', 'tab', 'level']),
            ]);
        }

        if ($tab === 'guardians') {
            $this->authorize('viewAny', \App\Models\Guardian::class);
            $guardians = $this->guardianService->paginate(
                request()->only(['search', 'has_student']),
            );
            return Inertia::render('Admin/MasterData', [
                'activeTab' => 'guardians',
                'guardians' => $guardians,
                'filters' => request()->only(['search', 'tab', 'has_student']),
            ]);
        }

        // Default: students
        $this->authorize('viewAny', Student::class);

        $students = $this->studentService->paginate(
            request()->only(['search', 'class_id', 'status']),
        );

        /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\SchoolClass> $classes */
        $classes = $this->schoolClassService->findAll();
        $guardians = $this->guardianService->findAll();

        $classOptions = $classes
            ->map(static fn (\App\Models\SchoolClass $c): array => [
                'id' => $c->id,
                'name' => $c->full_name,
            ])
            ->values()
            ->all();

        $hasTabParam = request()->has('tab');

        return Inertia::render('Admin/MasterData', [
            'activeTab' => $hasTabParam ? 'siswa' : null,
            'students' => $students,
            'classOptions' => $classOptions,
            'allGuardians' => $guardians,
            'filters' => request()->only(['search', 'class_id', 'status', 'tab']),
        ]);
    }

    public function store(StoreStudentRequest $request)
    {
        $this->authorize('create', Student::class);

        $this->studentService->create($request->validated());
        return redirect()->back()->with('success', 'Siswa berhasil ditambahkan.');
    }

    public function update(UpdateStudentRequest $request, int $id)
    {
        $this->authorize('update', Student::class);

        $this->studentService->update($id, $request->validated());
        return redirect()->back()->with('success', 'Data siswa berhasil diperbarui.');
    }

    public function destroy(int $id)
    {
        $this->authorize('delete', Student::class);

        $this->studentService->delete($id);
        return redirect()->back()->with('success', 'Siswa berhasil dihapus.');
    }

    public function bulkDestroy(\Illuminate\Http\Request $request)
    {
        $this->authorize('delete', Student::class);

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:students,id',
        ]);

        $count = $this->studentService->bulkDelete($validated['ids']);

        return redirect()->back()->with(
            'success',
            $count . ' siswa terpilih berhasil dihapus.',
        );
    }

    public function toggleStatus(int $id)
    {
        $this->authorize('update', Student::class);

        $this->studentService->toggleStatus($id);
        return redirect()->back()->with('success', 'Status siswa berhasil diperbarui.');
    }

    public function create(): Response
    {
        $tab = request()->query('tab', 'students');

        $students = $this->studentService->paginate(request()->only(['search', 'class_id', 'status']));
        $teachers = resolve(\App\Services\TeacherService::class)->paginate(request()->only(['search', 'teacher_type']));
        $classes = $this->schoolClassService->paginate(request()->only(['search', 'level']));
        $guardians = $this->guardianService->paginate(request()->only(['search']));

        $allClasses = $this->schoolClassService->findAll();
        $classOptions = $allClasses->map(fn ($c) => ['id' => $c->id, 'name' => $c->full_name])->values()->all();
        $allGuardians = $this->guardianService->findAll()->map(fn ($g) => ['id' => $g->id, 'name' => $g->name])->values()->all();
        $allTeachers = \App\Models\Teacher::select(['id', 'name'])->orderBy('name')->get();

        return Inertia::render('Admin/MasterData/MobileFormPage', [
            'mode' => 'create',
            'tab' => $tab,
            'students' => $students,
            'teachers' => $teachers,
            'schoolClasses' => $classes,
            'guardians' => $guardians,
            'classOptions' => $classOptions,
            'allGuardians' => $allGuardians,
            'allTeachers' => $allTeachers,
        ]);
    }

    public function importForm(): Response
    {
        $tab = request()->query('tab', 'students');

        $students = $this->studentService->paginate(request()->only(['search', 'class_id', 'status']));
        $teachers = resolve(\App\Services\TeacherService::class)->paginate(request()->only(['search', 'teacher_type']));
        $classes = $this->schoolClassService->paginate(request()->only(['search', 'level']));
        $guardians = $this->guardianService->paginate(request()->only(['search']));

        $allClasses = $this->schoolClassService->findAll();
        $classOptions = $allClasses->map(fn ($c) => ['id' => $c->id, 'name' => $c->full_name])->values()->all();
        $allGuardians = $this->guardianService->findAll()->map(fn ($g) => ['id' => $g->id, 'name' => $g->name])->values()->all();
        $allTeachers = \App\Models\Teacher::select(['id', 'name'])->orderBy('name')->get();

        return Inertia::render('Admin/MasterData/MobileFormPage', [
            'mode' => 'import',
            'tab' => $tab,
            'students' => $students,
            'teachers' => $teachers,
            'schoolClasses' => $classes,
            'guardians' => $guardians,
            'classOptions' => $classOptions,
            'allGuardians' => $allGuardians,
            'allTeachers' => $allTeachers,
        ]);
    }

    public function editForm(string $entity, int $id): Response
    {
        $students = $this->studentService->paginate(request()->only(['search', 'class_id', 'status']));
        $teachers = resolve(\App\Services\TeacherService::class)->paginate(request()->only(['search', 'teacher_type']));
        $classes = $this->schoolClassService->paginate(request()->only(['search', 'level']));
        $guardians = $this->guardianService->paginate(request()->only(['search']));

        $allClasses = $this->schoolClassService->findAll();
        $classOptions = $allClasses->map(fn ($c) => ['id' => $c->id, 'name' => $c->full_name])->values()->all();
        $allGuardians = $this->guardianService->findAll()->map(fn ($g) => ['id' => $g->id, 'name' => $g->name])->values()->all();
        $allTeachers = \App\Models\Teacher::select(['id', 'name'])->orderBy('name')->get();

        $item = match ($entity) {
            'students' => Student::with(['class', 'guardian'])->findOrFail($id),
            'teachers' => \App\Models\Teacher::findOrFail($id),
            'classes' => \App\Models\SchoolClass::findOrFail($id),
            'guardians' => \App\Models\Guardian::findOrFail($id),
            default => abort(404),
        };

        $mode = request()->is('*detail*') ? 'detail' : 'edit';

        return Inertia::render('Admin/MasterData/MobileFormPage', [
            'mode' => $mode,
            'tab' => $entity,
            'item' => $item,
            'students' => $students,
            'teachers' => $teachers,
            'schoolClasses' => $classes,
            'guardians' => $guardians,
            'classOptions' => $classOptions,
            'allGuardians' => $allGuardians,
            'allTeachers' => $allTeachers,
        ]);
    }
}
