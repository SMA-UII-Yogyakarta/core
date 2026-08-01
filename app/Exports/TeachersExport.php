<?php

namespace App\Exports;

use App\Models\Teacher;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;

class TeachersExport
{
    public function export(string $filePath): void
    {
        $writer = new Writer();
        $writer->openToFile($filePath);

        $writer->addRow(Row::fromValues([
            'Kode Guru', 'Nama',
        ]));

        Teacher::chunk(200, function ($teachers) use ($writer) {
            foreach ($teachers as $t) {
                $writer->addRow(Row::fromValues([
                    $t->teacher_code,
                    $t->name,
                ]));
            }
        });

        $writer->close();
    }
}
