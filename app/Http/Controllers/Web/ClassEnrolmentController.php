<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\SchoolClassService;
use App\Services\StudentService;
use Inertia\Inertia;

class ClassEnrolmentController extends Controller
{
    public function __construct(
        protected SchoolClassService $schoolClassService,
        protected StudentService $studentService,
    ) {
    }

    public function index()
    {
        $classId = request('class_id');
        $classes = $this->schoolClassService->findAll();

        $students = [];
        $selectedClass = null;

        if ($classId) {
            $selectedClass = $this->schoolClassService->findById($classId);
            $students = $this->studentService->findByClass($classId);
        }

        $unassignedStudents = $this->studentService->findUnassigned();

        return Inertia::render('Admin/ClassEnrolment', [
            'classes' => $classes,
            'selectedClassId' => $classId,
            'selectedClass' => $selectedClass,
            'students' => $students,
            'unassignedStudents' => $unassignedStudents,
        ]);
    }

    public function assignStudent()
    {
        $classId = request('class_id');
        $studentId = request('student_id');

        $this->studentService->assignToClass($studentId, $classId);

        return redirect()->back()->with('success', 'Student added to class successfully.');
    }

    public function removeStudent(int $studentId)
    {
        $this->studentService->assignToClass($studentId, null);

        return redirect()->back()->with('success', 'Student removed from class successfully.');
    }

    public function bulkAssign(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'class_id' => 'required|integer|exists:school_classes,id',
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'integer|exists:students,id',
        ]);

        $count = $this->studentService->bulkAssignToClass($validated['student_ids'], (int) $validated['class_id']);

        return redirect()->back()->with('success', $count . ' siswa berhasil ditambahkan ke kelas.');
    }

    public function bulkRemove(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'integer|exists:students,id',
        ]);

        $count = $this->studentService->bulkAssignToClass($validated['student_ids'], null);

        return redirect()->back()->with('success', $count . ' siswa berhasil dikeluarkan dari kelas.');
    }
}
