<?php

namespace App\Services;

use App\Exports\DailyRecapExport;
use App\Exports\MonthlyRecapExport;
use App\Exports\SemesterRecapExport;
use App\Exports\StudentsExport;
use App\Exports\TeachersExport;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ExportService
{
    /**
     * Ensure the exports directory exists before writing files.
     * CI and fresh installs may not have storage/app/exports yet.
     */
    private function exportPath(string $filename): string
    {
        $dir = storage_path('app/exports');

        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        return $dir . DIRECTORY_SEPARATOR . $filename;
    }

    public function previewData(string $period, string $date, int $month, int $year, int $semester, ?int $classId = null): array
    {
        $start = Carbon::parse($date)->startOfDay();
        $end = $start->copy();

        if ($period === 'bulanan') {
            $start = Carbon::create($year, $month, 1)->startOfDay();
            $end = $start->copy()->endOfMonth()->startOfDay();
        } elseif ($period === 'semester') {
            $start = Carbon::create($year, $semester === 1 ? 1 : 7, 1)->startOfDay();
            $end = Carbon::create($year, $semester === 1 ? 6 : 12, $semester === 1 ? 30 : 31)->startOfDay();
        }

        $students = Student::with('class')
            ->where('status', 'Active')
            ->when($classId, fn ($q) => $q->where('class_id', $classId))
            ->orderBy('class_id')
            ->get();

        $studentIds = $students->pluck('id');

        $stats = Attendance::query()
            ->selectRaw('student_id, COUNT(*) as total, '
                . "SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present, "
                . "SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late")
            ->whereIn('student_id', $studentIds)
            ->whereDate('attendance_date', '>=', $start)
            ->whereDate('attendance_date', '<=', $end)
            ->groupBy('student_id')
            ->get()
            ->keyBy('student_id');

        $leaves = LeaveRequest::query()
            ->select('student_id', 'category', 'start_date', 'end_date')
            ->whereIn('student_id', $studentIds)
            ->where('approval_status', 'Approved')
            ->get();

        $sickDays = [];
        $permitDays = [];

        foreach ($leaves as $leave) {
            $overlapStart = $leave->start_date->startOfDay()->greaterThan($start)
                ? $leave->start_date->startOfDay()
                : $start->copy();
            $overlapEnd = $leave->end_date->startOfDay()->lessThan($end)
                ? $leave->end_date->startOfDay()
                : $end->copy();

            if ($overlapEnd->lessThan($overlapStart)) {
                continue;
            }

            $days = 0;
            for ($d = $overlapStart->copy(); $d->lte($overlapEnd); $d->addDay()) {
                if ($d->isWeekday()) {
                    $days++;
                }
            }

            if ($leave->category === 'Sick') {
                $sickDays[$leave->student_id] = ($sickDays[$leave->student_id] ?? 0) + $days;
            } elseif ($leave->category === 'Permission') {
                $permitDays[$leave->student_id] = ($permitDays[$leave->student_id] ?? 0) + $days;
            }
        }

        $schoolDays = 0;
        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            if ($d->isWeekday()) {
                $schoolDays++;
            }
        }

        $rows = [];
        $no = 1;

        foreach ($students as $student) {
            $stat = $stats->get($student->id);
            $present = (int) ($stat->present ?? 0);
            $late = (int) ($stat->late ?? 0);
            $izin = $permitDays[$student->id] ?? 0;
            $sakit = $sickDays[$student->id] ?? 0;

            $rows[] = [
                'no' => $no++,
                'name' => $student->name,
                'class' => $student->class->name ?? '-',
                'masuk' => $present + $late,
                'izin' => $izin,
                'sakit' => $sakit,
                'alpha' => max(0, $schoolDays - $present - $late - $izin - $sakit),
            ];
        }

        return $rows;
    }

    public function semesterRecapXlsx(int $semester, int $year, ?int $classId = null): string
    {
        $path = $this->exportPath('semester-recap_' . $semester . '-' . $year . '_' . now()->timestamp . '.xlsx');
        (new SemesterRecapExport())->export($path, $semester, $year, $classId);
        return $path;
    }

    public function semesterRecapPdf(int $semester, int $year, ?int $classId = null): string
    {
        $semMonths = $semester === 1 ? range(1, 6) : range(7, 12);
        $start = Carbon::create($year, $semMonths[0], 1);
        $end = Carbon::create($year, $semMonths[5], Carbon::create($year, $semMonths[5], 1)->daysInMonth);

        $students = Student::with('class')
            ->where('status', 'Active')
            ->when($classId, fn ($q) => $q->where('class_id', $classId))
            ->get();

        $stats = Attendance::query()
            ->selectRaw('student_id, COUNT(*) as total, '
                . "SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present, "
                . "SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late")
            ->whereIn('student_id', $students->pluck('id'))
            ->whereDate('attendance_date', '>=', $start)
            ->whereDate('attendance_date', '<=', $end)
            ->groupBy('student_id')
            ->get()
            ->keyBy('student_id');

        $leaves = LeaveRequest::query()
            ->select('student_id', 'category', 'start_date', 'end_date')
            ->whereIn('student_id', $students->pluck('id'))
            ->where('approval_status', 'Approved')
            ->get();

        $sickDays = [];
        $permitDays = [];

        foreach ($leaves as $leave) {
            $overlapStart = $leave->start_date->startOfDay()->greaterThan($start)
                ? $leave->start_date->startOfDay()
                : $start->copy();
            $overlapEnd = $leave->end_date->startOfDay()->lessThan($end)
                ? $leave->end_date->startOfDay()
                : $end->copy();

            if ($overlapEnd->lessThan($overlapStart)) {
                continue;
            }

            $days = 0;
            for ($d = $overlapStart->copy(); $d->lte($overlapEnd); $d->addDay()) {
                if ($d->isWeekday()) {
                    $days++;
                }
            }

            if ($leave->category === 'Sick') {
                $sickDays[$leave->student_id] = ($sickDays[$leave->student_id] ?? 0) + $days;
            } elseif ($leave->category === 'Permission') {
                $permitDays[$leave->student_id] = ($permitDays[$leave->student_id] ?? 0) + $days;
            }
        }

        $schoolDays = 0;
        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            if ($d->isWeekday()) {
                $schoolDays++;
            }
        }

        $rows = $students->map(function ($s) use ($stats, $sickDays, $permitDays, $schoolDays) {
            $stat = $stats->get($s->id);
            $present = (int) ($stat->present ?? 0);
            $late = (int) ($stat->late ?? 0);
            $izin = $permitDays[$s->id] ?? 0;
            $sakit = $sickDays[$s->id] ?? 0;

            return [
                'nis' => $s->nis,
                'name' => $s->name,
                'class' => $s->class->name ?? '-',
                'present' => $present,
                'late' => $late,
                'izin' => $izin,
                'sakit' => $sakit,
                'absent' => max(0, $schoolDays - $present - $late - $izin - $sakit),
                'percentage' => $schoolDays > 0 ? round(($present / $schoolDays) * 100, 1) . '%' : '0%',
            ];
        });

        $class = $classId ? SchoolClass::find($classId) : null;
        $semesterName = $semester === 1 ? 'Semester Ganjil' : 'Semester Genap';

        $pdf = Pdf::loadView('exports.semester-recap', [
            'semesterName' => $semesterName,
            'year' => $year,
            'students' => $rows,
            'class' => $class,
        ]);

        $path = $this->exportPath('semester-recap_' . $semester . '-' . $year . '_' . now()->timestamp . '.pdf');
        file_put_contents($path, $pdf->output());
        return $path;
    }

    public function studentsXlsx(): string
    {
        $path = $this->exportPath('students_' . now()->timestamp . '.xlsx');
        (new StudentsExport())->export($path);
        return $path;
    }

    public function teachersXlsx(): string
    {
        $path = $this->exportPath('teachers_' . now()->timestamp . '.xlsx');
        (new TeachersExport())->export($path);
        return $path;
    }

    public function dailyRecapXlsx(string $date, ?int $classId = null): string
    {
        $path = $this->exportPath('daily-recap_' . $date . '_' . now()->timestamp . '.xlsx');
        (new DailyRecapExport())->export($path, $date, $classId);
        return $path;
    }

    public function monthlyRecapXlsx(int $month, int $year, ?int $classId = null): string
    {
        $path = $this->exportPath('monthly-recap_' . $month . '-' . $year . '_' . now()->timestamp . '.xlsx');
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

        $path = $this->exportPath('daily-recap_' . $date . '_' . now()->timestamp . '.pdf');
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

        $path = $this->exportPath('monthly-recap_' . $month . '-' . $year . '_' . now()->timestamp . '.pdf');
        file_put_contents($path, $pdf->output());
        return $path;
    }
}
