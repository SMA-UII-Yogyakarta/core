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

        return redirect()->back()->with('success', 'Siswa berhasil ditambahkan ke kelas.');
    }

    public function removeStudent(int $studentId)
    {
        $this->studentService->assignToClass($studentId, null);

        return redirect()->back()->with('success', 'Siswa berhasil dihapus dari kelas.');
    }
}
