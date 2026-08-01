<?php

namespace App\Exports;

use App\Models\Student;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;

class StudentsExport
{
    public function export(string $filePath): void
    {
        $writer = new Writer();
        $writer->openToFile($filePath);

        $writer->addRow(Row::fromValues([
            'NIS', 'NISN', 'Nama', 'Kelas', 'Tahun Masuk', 'Status',
        ]));

        Student::with('class')->chunk(200, function ($students) use ($writer) {
            foreach ($students as $s) {
                $writer->addRow(Row::fromValues([
                    $s->nis,
                    $s->nisn,
                    $s->name,
                    $s->class->name ?? '-',
                    $s->enrollment_year,
                    $s->status,
                ]));
            }
        });

        $writer->close();
    }
}
