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
        $this->authorize('viewAny', Student::class);

        $students = $this->studentService->paginate(
            request()->only(['search', 'class_id', 'status']),
        );

        $classes = $this->schoolClassService->findAll();
        $guardians = $this->guardianService->findAll();

        return Inertia::render('Admin/MasterData', [
            'activeTab' => 'siswa',
            'students' => $students,
            'classOptions' => $classes->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
            ])->values(),
            'allGuardians' => $guardians,
            'filters' => request()->only(['search', 'class_id', 'status']),
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
