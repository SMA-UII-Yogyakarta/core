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
                request()->only(['search']),
            );
            return Inertia::render('Admin/MasterData', [
                'activeTab' => 'guru',
                'teachers' => $teachers,
                'filters' => request()->only(['search', 'tab']),
            ]);
        }

        if ($tab === 'class') {
            $this->authorize('viewAny', \App\Models\SchoolClass::class);
            $classes = $this->schoolClassService->paginate(
                request()->only(['search']),
            );
            $assignedTeacherIds = \App\Models\SchoolClass::whereNotNull('teacher_id')
                ->pluck('teacher_id')
                ->unique();
            $availableTeachers = \App\Models\Teacher::whereNotIn('id', $assignedTeacherIds)
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get();
            $total = $classes->total();
            $isClientMode = $total <= 100;

            return Inertia::render('Admin/MasterData', [
                'activeTab' => 'classes',
                'schoolClasses' => $classes,
                'allTeachers' => $availableTeachers,
                'searchConfig' => [
                    'mode' => $isClientMode ? 'client' : 'server',
                    'allData' => $isClientMode ? $classes->all() : null,
                ],
                'filters' => request()->only(['search', 'tab']),
            ]);
        }

        if ($tab === 'guardians') {
            $this->authorize('viewAny', \App\Models\Guardian::class);
            $guardians = $this->guardianService->paginate(
                request()->only(['search']),
            );
            return Inertia::render('Admin/MasterData', [
                'activeTab' => 'wali',
                'guardians' => $guardians,
                'filters' => request()->only(['search', 'tab']),
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
                'name' => $c->name,
            ])
            ->values()
            ->all();

        return Inertia::render('Admin/MasterData', [
            'activeTab' => 'siswa',
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
}
