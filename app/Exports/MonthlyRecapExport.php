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

        $query = Student::with('class')->where('status', 'Active');

        if ($classId) {
            $query->where('class_id', $classId);
        }

        $query->chunk(200, function ($students) use ($writer, $month, $year) {
            foreach ($students as $s) {
                $total = Attendance::where('student_id', $s->id)
                    ->whereYear('attendance_date', $year)
                    ->whereMonth('attendance_date', $month)
                    ->count();

                $hadir = Attendance::where('student_id', $s->id)
                    ->whereYear('attendance_date', $year)
                    ->whereMonth('attendance_date', $month)
                    ->where('status', 'Present')
                    ->count();

                $terlambat = Attendance::where('student_id', $s->id)
                    ->whereYear('attendance_date', $year)
                    ->whereMonth('attendance_date', $month)
                    ->where('status', 'Late')
                    ->count();

                $alpa = max(0, $total - $hadir - $terlambat);
                $persentase = $total > 0 ? round(($hadir / $total) * 100, 1) . '%' : '0%';

                $writer->addRow(Row::fromValues([
                    $s->nis, $s->name, $s->class->name ?? '-',
                    $hadir, $terlambat, $alpa, $persentase,
                ]));
            }
        });

        $writer->close();
    }
}
