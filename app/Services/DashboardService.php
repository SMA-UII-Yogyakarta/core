<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Student;
use Carbon\Carbon;

class DashboardService
{
    public function __construct(
        protected AttendanceService $attendanceService,
    ) {
    }

    public function getAdminStats(): array
    {
        $today = now()->toDateString();
        $totalStudents = Student::where('status', 'Active')->count();

        $attendances = Attendance::where('attendance_date', $today)->get();

        $present = $attendances->where('status', 'Present')->count();
        $late = $attendances->where('status', 'Late')->count();

        $sickPermissionToday = LeaveRequest::where('approval_status', 'Approved')
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->count();

        $hadirTerdata = $present + $late;
        $absent = max(0, $totalStudents - $hadirTerdata - $sickPermissionToday);

        return [
            'total_students' => $totalStudents,
            'hadir_terdata' => $hadirTerdata,
            'late' => $late,
            'sakit_izin' => $sickPermissionToday,
            'alpa' => $absent,
        ];
    }

    public function getTodayAttendance(): array
    {
        $today = now()->toDateString();

        return Attendance::with(['student.user', 'student.class'])
            ->where('attendance_date', $today)
            ->latest('check_in_time')
            ->take(50)
            ->get()
            ->toArray();
    }

    public function getPendingLeaveCount(): int
    {
        return LeaveRequest::where('approval_status', 'Pending')->count();
    }

    public function getMonthlyAttendanceStats(?int $month = null, ?int $year = null): array
    {
        $month = $month ?? now()->month;
        $year = $year ?? now()->year;

        $totalStudents = Student::where('status', 'Active')->count();
        $workingDays = $this->getWorkingDaysInMonth($month, $year);

        $attendances = Attendance::whereYear('attendance_date', $year)
            ->whereMonth('attendance_date', $month)
            ->get();

        $totalPresent = $attendances->where('status', 'Present')->count();
        $totalLate = $attendances->where('status', 'Late')->count();

        return [
            'month' => Carbon::create($year, $month)->locale('id')->monthName,
            'total_siswa' => $totalStudents,
            'hari_efektif' => $workingDays,
            'total_present' => $totalPresent,
            'total_terlambat' => $totalLate,
            'rata_hadir_per_hari' => $workingDays > 0 ? round(($totalPresent + $totalLate) / $workingDays, 1) : 0,
        ];
    }

    private function getWorkingDaysInMonth(int $month, int $year): int
    {
        $start = Carbon::create($year, $month, 1);
        $end = $start->copy()->endOfMonth();
        $workingDays = 0;

        while ($start->lte($end)) {
            if ($start->isWeekday()) {
                $workingDays++;
            }
            $start->addDay();
        }

        return $workingDays;
    }
}
