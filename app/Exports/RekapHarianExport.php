<?php

namespace App\Exports;

use App\Models\Attendance;
use App\Models\Student;
use OpenSpout\Writer\Common\Creator\WriterEntityFactory;

class RekapHarianExport
{
    public function export(string $filePath, string $date, ?int $classId = null): void
    {
        $writer = WriterEntityFactory::createXLSXWriter();
        $writer->openToFile($filePath);

        $header = WriterEntityFactory::createRowFromArray([
            'NIS', 'Nama', 'Kelas', 'Status', 'Jam Masuk',
        ]);
        $writer->addRow($header);

        $query = Student::with(['class', 'attendances' => function ($q) use ($date) {
            $q->whereDate('attendance_date', $date);
        }])->where('status', 'Active');

        if ($classId) {
            $query->where('class_id', $classId);
        }

        $query->chunk(200, function ($students) use ($writer) {
            foreach ($students as $s) {
                $att = $s->attendances->first();
                $row = WriterEntityFactory::createRowFromArray([
                    $s->nis,
                    $s->name,
                    $s->class?->name ?? '-',
                    $att?->status ?? 'Absent',
                    $att?->check_in_time ?? '-',
                ]);
                $writer->addRow($row);
            }
        });

        $writer->close();
    }
}
