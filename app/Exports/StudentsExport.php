<?php

namespace App\Exports;

use App\Models\Student;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;

class StudentsExport
{
    /**
     * @param  array<int, int>|null  $classIds  null means all classes
     */
    public function __construct(
        protected ?array $classIds = null,
    ) {
    }

    public function export(string $filePath): void
    {
        $writer = new Writer();
        $writer->openToFile($filePath);

        $writer->addRow(Row::fromValues([
            'NIS', 'NISN', 'Nama', 'Kelas', 'Tahun Masuk', 'Status',
        ]));

        Student::with('class')
            ->when($this->classIds !== null, fn ($q) => $q->whereIn('class_id', $this->classIds))
            ->chunk(200, function ($students) use ($writer) {
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
