<?php

namespace App\Exports;

use App\Models\Student;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\Common\Creator\WriterEntityFactory;

class StudentsExport
{
    public function export(string $filePath): void
    {
        $writer = WriterEntityFactory::createXLSXWriter();
        $writer->openToFile($filePath);

        $header = WriterEntityFactory::createRowFromArray([
            'NIS', 'NISN', 'Nama', 'Kelas', 'Tahun Masuk', 'Status',
        ]);
        $writer->addRow($header);

        Student::with('class')->chunk(200, function ($students) use ($writer) {
            foreach ($students as $s) {
                $row = WriterEntityFactory::createRowFromArray([
                    $s->nis,
                    $s->nisn,
                    $s->name,
                    $s->class?->name ?? '-',
                    $s->enrollment_year,
                    $s->status,
                ]);
                $writer->addRow($row);
            }
        });

        $writer->close();
    }
}
