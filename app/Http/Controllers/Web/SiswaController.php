<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use App\Services\StudentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SiswaController extends Controller
{
    public function __construct(
        protected StudentService $studentService,
        protected AttendanceService $attendanceService,
    ) {
    }

    public function dashboard()
    {
        $student = $this->studentService->findByUserId(auth()->id());

        if (! $student) {
            return redirect()->route('dashboard')->with('error', 'Data siswa tidak ditemukan.');
        }

        $todayAttendance = $this->attendanceService->todayByStudent($student->id);
        $stats = $this->attendanceService->getStudentStats($student->id);

        return Inertia::render('Siswa/Dashboard', [
            'student' => [
                'id' => $student->id,
                'nis' => $student->nis,
                'nisn' => $student->nisn,
                'name' => $student->name,
                'class' => $student->class ? ['id' => $student->class->id, 'name' => $student->class->name] : null,
            ],
            'todayAttendance' => $todayAttendance ? [
                'id' => $todayAttendance->id,
                'status' => $todayAttendance->status,
                'check_in_time' => $todayAttendance->check_in_time,
                'attendance_date' => $todayAttendance->attendance_date->toDateString(),
            ] : null,
            'stats' => $stats,
        ]);
    }

    public function livePresensi()
    {
        $student = $this->studentService->findByUserId(auth()->id());

        if (! $student) {
            return redirect()->route('dashboard')->with('error', 'Data siswa tidak ditemukan.');
        }

        $todayAttendance = $this->attendanceService->todayByStudent($student->id);

        return Inertia::render('Siswa/LivePresensi', [
            'student' => [
                'id' => $student->id,
                'nis' => $student->nis,
                'name' => $student->name,
                'class' => $student->class ? ['id' => $student->class->id, 'name' => $student->class->name] : null,
            ],
            'todayAttendance' => $todayAttendance ? [
                'id' => $todayAttendance->id,
                'status' => $todayAttendance->status,
                'check_in_time' => $todayAttendance->check_in_time,
                'attendance_date' => $todayAttendance->attendance_date->toDateString(),
            ] : null,
        ]);
    }

    public function checkIn(Request $request)
    {
        $student = $this->studentService->findByUserId(auth()->id());

        if (! $student) {
            return redirect()->back()->with('error', 'Data siswa tidak ditemukan.');
        }

        try {
            $this->attendanceService->checkIn($student->id, $request->all());
            return redirect()->route('siswa.dashboard')->with('success', 'Presensi berhasil.');
        } catch (\RuntimeException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function riwayat()
    {
        $student = $this->studentService->findByUserId(auth()->id());

        if (! $student) {
            return redirect()->route('dashboard')->with('error', 'Data siswa tidak ditemukan.');
        }

        $bulan = (int) request('bulan', date('m'));
        $tahun = (int) request('tahun', date('Y'));

        $attendances = $this->attendanceService->history($student->id);
        $stats = $this->attendanceService->getStudentStats($student->id);

        return Inertia::render('Siswa/RiwayatKehadiran', [
            'student' => [
                'id' => $student->id,
                'nis' => $student->nis,
                'name' => $student->name,
                'class' => $student->class ? ['id' => $student->class->id, 'name' => $student->class->name] : null,
            ],
            'attendances' => $attendances->items(),
            'leaveRequests' => $student->leaveRequests()->latest()->get()->toArray(),
            'bulan' => $bulan,
            'tahun' => $tahun,
            'stats' => $stats,
        ]);
    }
}
