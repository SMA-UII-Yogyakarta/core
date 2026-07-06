<?php

namespace App\Exports;

use App\Models\Teacher;
use OpenSpout\Writer\Common\Creator\WriterEntityFactory;

class TeachersExport
{
    public function export(string $filePath): void
    {
        $writer = WriterEntityFactory::createXLSXWriter();
        $writer->openToFile($filePath);

        $header = WriterEntityFactory::createRowFromArray([
            'Kode Guru', 'Nama',
        ]);
        $writer->addRow($header);

        Teacher::chunk(200, function ($teachers) use ($writer) {
            foreach ($teachers as $t) {
                $row = WriterEntityFactory::createRowFromArray([
                    $t->teacher_code,
                    $t->name,
                ]);
                $writer->addRow($row);
            }
        });

        $writer->close();
    }
}
