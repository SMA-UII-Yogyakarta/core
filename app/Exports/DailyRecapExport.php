<?php

namespace App\Exports;

use App\Models\Student;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;

class DailyRecapExport
{
    public function export(string $filePath, string $date, ?int $classId = null): void
    {
        $writer = new Writer();
        $writer->openToFile($filePath);

        $writer->addRow(Row::fromValues([
            'NIS', 'Nama', 'Kelas', 'Status', 'Jam Masuk',
        ]));

        $query = Student::with(['class', 'attendances' => function ($q) use ($date) {
            $q->whereDate('attendance_date', $date);
        }])->where('status', 'Active');

        if ($classId) {
            $query->where('class_id', $classId);
        }

        $query->chunk(200, function ($students) use ($writer) {
            foreach ($students as $s) {
                $att = $s->attendances->first();
                $writer->addRow(Row::fromValues([
                    $s->nis,
                    $s->name,
                    $s->class->name ?? '-',
                    $att->status ?? 'Absent',
                    $att->check_in_time ?? '-',
                ]));
            }
        });

        $writer->close();
    }
}
