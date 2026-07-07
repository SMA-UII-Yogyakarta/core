<?php

namespace App\Services;

use App\Exports\DailyRecapExport;
use App\Exports\MonthlyRecapExport;
use App\Exports\StudentsExport;
use App\Exports\TeachersExport;
use App\Models\SchoolClass;
use App\Models\Student;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ExportService
{
    public function studentsXlsx(): string
    {
        $path = storage_path('app/exports/students_' . now()->timestamp . '.xlsx');
        (new StudentsExport())->export($path);
        return $path;
    }

    public function teachersXlsx(): string
    {
        $path = storage_path('app/exports/teachers_' . now()->timestamp . '.xlsx');
        (new TeachersExport())->export($path);
        return $path;
    }

    public function dailyRecapXlsx(string $date, ?int $classId = null): string
    {
        $path = storage_path('app/exports/daily-recap_' . $date . '_' . now()->timestamp . '.xlsx');
        (new DailyRecapExport())->export($path, $date, $classId);
        return $path;
    }

    public function monthlyRecapXlsx(int $month, int $year, ?int $classId = null): string
    {
        $path = storage_path('app/exports/monthly-recap_' . $month . '-' . $year . '_' . now()->timestamp . '.xlsx');
        (new MonthlyRecapExport())->export($path, $month, $year, $classId);
        return $path;
    }

    public function dailyRecapPdf(string $date, ?int $classId = null): string
    {
        $query = Student::with('class')->where('status', 'Active');
        if ($classId) {
            $query->where('class_id', $classId);
        }

        $students = $query->get()->map(function ($s) use ($date) {
            $att = \App\Models\Attendance::where('student_id', $s->id)
                ->whereDate('attendance_date', $date)->first();
            return [
                'nis' => $s->nis,
                'name' => $s->name,
                'class' => $s->class?->name ?? '-',
                'status' => $att?->status ?? 'Absent',
                'check_in_time' => $att?->check_in_time,
            ];
        });

        $class = $classId ? SchoolClass::find($classId) : null;

        $pdf = Pdf::loadView('exports.daily-recap', [
            'date' => Carbon::parse($date)->translatedFormat('l, d F Y'),
            'students' => $students,
            'class' => $class,
        ]);

        $path = storage_path('app/exports/daily-recap_' . $date . '_' . now()->timestamp . '.pdf');
        file_put_contents($path, $pdf->output());
        return $path;
    }

    public function monthlyRecapPdf(int $month, int $year, ?int $classId = null): string
    {
        $query = Student::with('class')->where('status', 'Active');
        if ($classId) {
            $query->where('class_id', $classId);
        }

        $students = $query->get()->map(function ($s) use ($month, $year) {
            $total = \App\Models\Attendance::where('student_id', $s->id)
                ->whereYear('attendance_date', $year)
                ->whereMonth('attendance_date', $month)->count();
            $present = \App\Models\Attendance::where('student_id', $s->id)
                ->whereYear('attendance_date', $year)
                ->whereMonth('attendance_date', $month)
                ->where('status', 'Present')->count();
            $late = \App\Models\Attendance::where('student_id', $s->id)
                ->whereYear('attendance_date', $year)
                ->whereMonth('attendance_date', $month)
                ->where('status', 'Late')->count();
            $absent = max(0, $total - $present - $late);

            return [
                'nis' => $s->nis,
                'name' => $s->name,
                'class' => $s->class?->name ?? '-',
                'present' => $present,
                'late' => $late,
                'absent' => $absent,
                'percentage' => $total > 0 ? round(($present / $total) * 100, 1) . '%' : '0%',
            ];
        });

        $class = $classId ? SchoolClass::find($classId) : null;
        $monthName = Carbon::create($year, $month)->translatedFormat('F');

        $pdf = Pdf::loadView('exports.monthly-recap', [
            'monthName' => $monthName,
            'year' => $year,
            'students' => $students,
            'class' => $class,
        ]);

        $path = storage_path('app/exports/monthly-recap_' . $month . '-' . $year . '_' . now()->timestamp . '.pdf');
        file_put_contents($path, $pdf->output());
        return $path;
    }
}
