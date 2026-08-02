<?php

namespace App\Services;

use App\Exports\DailyRecapExport;
use App\Exports\MonthlyRecapExport;
use App\Exports\StudentsExport;
use App\Exports\TeachersExport;
use App\Models\Attendance;
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
        $students = Student::with('class')
            ->where('status', 'Active')
            ->when($classId, fn ($q) => $q->where('class_id', $classId))
            ->get();

        $attendances = Attendance::whereDate('attendance_date', $date)
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        $rows = $students->map(function ($s) use ($attendances) {
            $att = $attendances->get($s->id);

            return [
                'nis' => $s->nis,
                'name' => $s->name,
                'class' => $s->class->name ?? '-',
                'status' => $att->status ?? 'Absent',
                'check_in_time' => $att?->check_in_time,
            ];
        });

        $class = $classId ? SchoolClass::find($classId) : null;

        $pdf = Pdf::loadView('exports.daily-recap', [
            'date' => Carbon::parse($date)->translatedFormat('l, d F Y'),
            'students' => $rows,
            'class' => $class,
        ]);

        $path = storage_path('app/exports/daily-recap_' . $date . '_' . now()->timestamp . '.pdf');
        file_put_contents($path, $pdf->output());
        return $path;
    }

    public function monthlyRecapPdf(int $month, int $year, ?int $classId = null): string
    {
        $students = Student::with('class')
            ->where('status', 'Active')
            ->when($classId, fn ($q) => $q->where('class_id', $classId))
            ->get();

        $stats = Attendance::query()
            ->selectRaw('student_id, COUNT(*) as total, '
                . "SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present, "
                . "SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late")
            ->whereIn('student_id', $students->pluck('id'))
            ->whereYear('attendance_date', $year)
            ->whereMonth('attendance_date', $month)
            ->groupBy('student_id')
            ->get()
            ->keyBy('student_id');

        $rows = $students->map(function ($s) use ($stats) {
            $row = $stats->get($s->id);
            $total = (int) ($row->total ?? 0);
            $present = (int) ($row->present ?? 0);
            $late = (int) ($row->late ?? 0);
            $absent = max(0, $total - $present - $late);

            return [
                'nis' => $s->nis,
                'name' => $s->name,
                'class' => $s->class->name ?? '-',
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
            'students' => $rows,
            'class' => $class,
        ]);

        $path = storage_path('app/exports/monthly-recap_' . $month . '-' . $year . '_' . now()->timestamp . '.pdf');
        file_put_contents($path, $pdf->output());
        return $path;
    }
}
