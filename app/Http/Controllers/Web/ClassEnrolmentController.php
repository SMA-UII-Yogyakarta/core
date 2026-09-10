<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\SchoolClassService;
use App\Services\StudentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassEnrolmentController extends Controller
{
    public function __construct(
        protected SchoolClassService $schoolClassService,
        protected StudentService $studentService,
    ) {
    }

    public function index(Request $request)
    {
        $request->validate([
            'class_id' => 'nullable|integer|exists:school_classes,id',
        ]);

        $classId = $request->integer('class_id') ?: null;
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

    public function assignStudent(Request $request)
    {
        $validated = $request->validate([
            'class_id' => 'required|integer|exists:school_classes,id',
            'student_id' => 'required|integer|exists:students,id',
        ]);

        $this->studentService->assignToClass((int) $validated['student_id'], (int) $validated['class_id']);

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
