<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Services\SchoolClassService;
use App\Services\StudentService;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function __construct(
        protected StudentService $studentService,
        protected SchoolClassService $schoolClassService,
    ) {
    }

    public function index(): Response
    {
        $students = $this->studentService->paginate(
            request()->only(['search', 'class_id', 'status']),
        );

        $classes = $this->schoolClassService->findAll();

        return Inertia::render('Admin/MasterData', [
            'activeTab' => 'siswa',
            'students' => $students,
            'classes' => $classes,
            'filters' => request()->only(['search', 'class_id', 'status']),
        ]);
    }

    public function store(StoreStudentRequest $request)
    {
        $this->studentService->create($request->validated());
        return redirect()->back()->with('success', 'Student added successfully.');
    }

    public function update(UpdateStudentRequest $request, int $id)
    {
        $this->studentService->update($id, $request->validated());
        return redirect()->back()->with('success', 'Student data updated successfully.');
    }

    public function destroy(int $id)
    {
        $this->studentService->delete($id);
        return redirect()->back()->with('success', 'Student deleted successfully.');
    }

    public function toggleStatus(int $id)
    {
        $this->studentService->toggleStatus($id);
        return redirect()->back()->with('success', 'Student status updated successfully.');
    }
}
