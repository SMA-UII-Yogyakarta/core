<?php

namespace App\Exports;

use App\Models\Attendance;
use App\Models\Student;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;

class MonthlyRecapExport
{
    public function export(string $filePath, int $month, int $year, ?int $classId = null): void
    {
        $writer = new Writer();
        $writer->openToFile($filePath);

        $writer->addRow(Row::fromValues([
            'NIS', 'Nama', 'Kelas', 'Total Hadir', 'Total Terlambat', 'Total Alpa', 'Persentase',
        ]));

        $students = Student::with('class')
            ->where('status', 'Active')
            ->when($classId, fn ($q) => $q->where('class_id', $classId))
            ->get();

        $stats = Attendance::query()
            ->selectRaw('student_id, COUNT(*) as total, '
                . "SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as on_time, "
                . "SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late")
            ->whereIn('student_id', $students->pluck('id'))
            ->whereYear('attendance_date', $year)
            ->whereMonth('attendance_date', $month)
            ->groupBy('student_id')
            ->get()
            ->keyBy('student_id');

        foreach ($students as $s) {
            $row = $stats->get($s->id);
            $total = (int) ($row->total ?? 0);
            $onTime = (int) ($row->on_time ?? 0);
            $late = (int) ($row->late ?? 0);
            $absent = max(0, $total - $onTime - $late);
            $persentase = $total > 0 ? round(($onTime / $total) * 100, 1) . '%' : '0%';

            $writer->addRow(Row::fromValues([
                $s->nis, $s->name, $s->class->name ?? '-',
                $onTime, $late, $absent, $persentase,
            ]));
        }

        $writer->close();
    }
}
