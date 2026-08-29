<?php

namespace App\Exports;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Student;
use App\Services\AcademicCalendarService;
use Carbon\Carbon;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;

class SemesterRecapExport
{
    public function __construct(
        protected AcademicCalendarService $calendarService,
    ) {
    }

    public function export(string $filePath, int $semester, int $year, ?int $classId = null): void
    {
        $semMonths = $semester === 1 ? range(1, 6) : range(7, 12);
        $start = Carbon::create($year, $semMonths[0], 1);
        $end = Carbon::create($year, $semMonths[5], Carbon::create($year, $semMonths[5], 1)->daysInMonth);

        $writer = new Writer();
        $writer->openToFile($filePath);

        $writer->addRow(Row::fromValues([
            'NIS', 'Nama', 'Kelas', 'Total Masuk', 'Total Izin', 'Total Sakit', 'Total Alpa', 'Persentase',
        ]));

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

        foreach ($students as $s) {
            $stat = $stats->get($s->id);
            $present = (int) ($stat->present ?? 0);
            $late = (int) ($stat->late ?? 0);
            $izin = $permitDays[$s->id] ?? 0;
            $sakit = $sickDays[$s->id] ?? 0;
            $alpa = max(0, $schoolDays - $present - $late - $izin - $sakit);
            $persentase = $schoolDays > 0 ? round((($present + $late) / $schoolDays) * 100, 1) . '%' : '0%';

            $writer->addRow(Row::fromValues([
                $s->nis, $s->name, $s->class->name ?? '-',
                $present + $late, $izin, $sakit, $alpa, $persentase,
            ]));
        }

        $writer->close();
    }
}
