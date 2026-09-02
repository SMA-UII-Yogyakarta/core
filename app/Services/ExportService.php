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
    public function __construct(
        protected AcademicCalendarService $calendarService,
    ) {
    }

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
            $resolved = \App\Services\SemesterHelper::resolveDates($year, $semester);
            $start = $resolved['start'];
            $end = $resolved['end'];
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

        $summary = $this->calendarService->summarizeApprovedLeaveDays(
            $leaves,
            $start,
            $end,
        );
        $sickDays = $summary['sick'];
        $permitDays = $summary['permit'];

        $schoolDays = 0;
        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            $dateStr = $d->toDateString();
            if ($this->calendarService->isSchoolDay($dateStr) && $this->calendarService->isAlpaApplicable($dateStr)) {
                $schoolDays++;
            }
        }

        $rows = [];
        $no = 1;

        if ($period === 'harian') {
            $attendances = Attendance::whereIn('student_id', $studentIds)
                ->whereDate('attendance_date', $start)
                ->get()
                ->keyBy('student_id');

            $dailyLeaves = LeaveRequest::whereIn('student_id', $studentIds)
                ->whereDate('start_date', '<=', $start)
                ->whereDate('end_date', '>=', $start)
                ->get()
                ->keyBy('student_id');

            $idx = 0;
            foreach ($students as $student) {
                $att = $attendances->get($student->id);
                $leave = $dailyLeaves->get($student->id);

                $statusLabel = 'ALPHA';
                $waktuKet = 'Belum ada kabar';
                $photoUrl = null;
                $photoType = null;

                if ($att) {
                    if ($att->status === 'Present') {
                        $statusLabel = 'HADIR';
                        $waktuKet = Carbon::parse($att->check_in_time)->format('H:i') . ' WIB';
                        $photoUrl = $att->photo_url;
                        $photoType = $photoUrl ? 'selfie' : null;
                    } elseif ($att->status === 'Late') {
                        $statusLabel = 'TERLAMBAT';
                        $waktuKet = Carbon::parse($att->check_in_time)->format('H:i') . ' WIB';
                        $photoUrl = $att->photo_url;
                        $photoType = $photoUrl ? 'selfie' : null;
                    }
                } elseif ($leave) {
                    if ($leave->approval_status === 'Approved') {
                        $statusLabel = $leave->category === 'Sick' ? 'SAKIT' : 'IZIN';
                        $waktuKet = $leave->description ?? ($leave->category === 'Sick' ? 'Surat Dokter' : 'Izin Keluarga');
                        $photoUrl = $leave->document_url;
                        $photoType = $photoUrl ? 'bukti' : null;
                    } elseif ($leave->approval_status === 'Pending') {
                        $statusLabel = 'BELUM VERIFIKASI';
                        $waktuKet = 'Menunggu validasi Wali Kelas';
                        $photoUrl = $leave->document_url;
                        $photoType = $photoUrl ? 'bukti' : null;
                    }
                }
                $idx++;

                $className = $student->class ? explode(' (', $student->class->name)[0] : '-';

                $rows[] = [
                    'no' => $no++,
                    'name' => $student->name,
                    'class' => $className,
                    'present' => ($statusLabel === 'HADIR' || $statusLabel === 'TERLAMBAT') ? 1 : 0,
                    'permission' => ($statusLabel === 'IZIN') ? 1 : 0,
                    'sick' => ($statusLabel === 'SAKIT') ? 1 : 0,
                    'absent' => ($statusLabel === 'ALPHA') ? 1 : 0,
                    'status' => $statusLabel,
                    'waktu_keterangan' => $waktuKet,
                    'photo_url' => $photoUrl,
                    'photo_type' => $photoType,
                ];
            }

            return $rows;
        }

        foreach ($students as $student) {
            $stat = $stats->get($student->id);
            $present = (int) ($stat->present ?? 0);
            $late = (int) ($stat->late ?? 0);
            $izin = $permitDays[$student->id] ?? 0;
            $sakit = $sickDays[$student->id] ?? 0;

            $className = $student->class ? explode(' (', $student->class->name)[0] : '-';

            $rows[] = [
                'no' => $no++,
                'name' => $student->name,
                'class' => $className,
                'present' => $present + $late,
                'permission' => $permitDays[$student->id] ?? 0,
                'sick' => $sickDays[$student->id] ?? 0,
                'absent' => max(0, $schoolDays - $present - $late - ($permitDays[$student->id] ?? 0) - ($sickDays[$student->id] ?? 0)),
            ];
        }

        return $rows;
    }

    public function semesterRecapXlsx(int $semester, int $year, ?int $classId = null): string
    {
        $path = $this->exportPath('semester-recap_' . $semester . '-' . $year . '_' . now()->timestamp . '.xlsx');
        app(SemesterRecapExport::class)->export($path, $semester, $year, $classId);
        return $path;
    }

    public function semesterRecapPdf(int $semester, int $year, ?int $classId = null): string
    {
        $resolved = \App\Services\SemesterHelper::resolveDates($year, $semester);
        $start = $resolved['start'];
        $end = $resolved['end'];

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

        $summary = $this->calendarService->summarizeApprovedLeaveDays(
            $leaves,
            $start,
            $end,
        );
        $sickDays = $summary['sick'];
        $permitDays = $summary['permit'];

        $schoolDays = 0;
        for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
            $dateStr = $d->toDateString();
            if ($this->calendarService->isSchoolDay($dateStr) && $this->calendarService->isAlpaApplicable($dateStr)) {
                $schoolDays++;
            }
        }

        $rows = $students->map(function ($s) use ($stats, $sickDays, $permitDays, $schoolDays) {
            $stat = $stats->get($s->id);
            $present = (int) ($stat->present ?? 0);
            $late = (int) ($stat->late ?? 0);
            $permission = $permitDays[$s->id] ?? 0;
            $sick = $sickDays[$s->id] ?? 0;

            return [
                'nis' => $s->nis,
                'name' => $s->name,
                'class' => $s->class->name ?? '-',
                'present' => $present,
                'late' => $late,
                'permission' => $permission,
                'sick' => $sick,
                'absent' => max(0, $schoolDays - $present - $late - $permission - $sick),
                'percentage' => $schoolDays > 0 ? round((($present + $late) / $schoolDays) * 100, 1) . '%' : '0%',
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

    /**
     * @param  array<int, int>|null  $classIds  null means all classes
     */
    public function studentsXlsx(?array $classIds = null): string
    {
        $path = $this->exportPath('students_' . now()->timestamp . '.xlsx');
        (new StudentsExport($classIds))->export($path);
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
                'percentage' => $total > 0 ? round((($present + $late) / $total) * 100, 1) . '%' : '0%',
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
