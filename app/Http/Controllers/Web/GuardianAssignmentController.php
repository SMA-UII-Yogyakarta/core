<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Guardian;
use App\Models\Student;
use App\Services\GuardianService;
use App\Services\StudentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuardianAssignmentController extends Controller
{
    public function __construct(
        protected GuardianService $guardianService,
        protected StudentService $studentService,
    ) {
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Guardian::class);

        $guardianId = $request->query('guardian_id');
        $guardians = Guardian::with('user')->orderBy('name')->get();

        $selectedGuardian = null;
        $linkedStudents = [];

        if ($guardianId) {
            $selectedGuardian = Guardian::with(['user', 'students.class'])->find($guardianId);
            if ($selectedGuardian) {
                $linkedStudents = $selectedGuardian->students;
            }
        } elseif ($guardians->isNotEmpty()) {
            $selectedGuardian = Guardian::with(['user', 'students.class'])->find($guardians->first()->id);
            if ($selectedGuardian) {
                $linkedStudents = $selectedGuardian->students;
                $guardianId = (string) $selectedGuardian->id;
            }
        }

        $unassignedStudents = Student::with('class')
            ->whereNull('guardian_id')
            ->orderBy('name')
            ->get();

        $allStudents = Student::with('class')
            ->orderBy('name')
            ->select(['id', 'nis', 'nisn', 'name', 'class_id', 'guardian_id'])
            ->get();

        return Inertia::render('Admin/GuardianAssignment', [
            'guardians' => $guardians,
            'selectedGuardianId' => $guardianId ? (int) $guardianId : null,
            'selectedGuardian' => $selectedGuardian,
            'linkedStudents' => $linkedStudents,
            'unassignedStudents' => $unassignedStudents,
            'allStudents' => $allStudents,
        ]);
    }

    public function assignStudent(Request $request)
    {
        $this->authorize('update', Guardian::class);

        $validated = $request->validate([
            'guardian_id' => 'required|exists:guardians,id',
            'student_id' => 'required|exists:students,id',
        ]);

        $student = Student::findOrFail($validated['student_id']);
        $student->update(['guardian_id' => $validated['guardian_id']]);

        return redirect()->back()->with('success', 'Siswa berhasil dihubungkan dengan Wali Murid.');
    }

    public function removeStudent(int $studentId)
    {
        $this->authorize('update', Guardian::class);

        $student = Student::findOrFail($studentId);
        $student->update(['guardian_id' => null]);

        return redirect()->back()->with('success', 'Hubungan siswa dengan Wali Murid berhasil dilepas.');
    }
}
