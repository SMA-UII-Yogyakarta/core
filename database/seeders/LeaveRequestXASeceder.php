<?php

namespace Database\Seeders;

use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Seeder;

class LeaveRequestXASeceder extends Seeder
{
    public function run(): void
    {
        try {
            $class = SchoolClass::query()->where('name', 'X-A (Reguler)')->firstOrFail();
        } catch (ModelNotFoundException) {
            $this->command->error('Class X-A (Reguler) not found.');
            return;
        }

        $students = Student::query()
            ->where('class_id', $class->id)
            ->orderBy('id')
            ->with('guardian')
            ->get();

        if ($students->isEmpty()) {
            $this->command->error('No students in X-A (Reguler).');
            return;
        }

        $samples = [
            ['student_idx' => 0, 'category' => 'Sick', 'status' => 'Pending', 'days_ago' => 0, 'duration' => 2, 'desc' => 'Demam tinggi sejak semalam, lampiran surat dokter RS JIH.'],
            ['student_idx' => 1, 'category' => 'Event', 'status' => 'Pending', 'days_ago' => 1, 'duration' => 2, 'desc' => 'Menghadiri pernikahan kakak kandung di luar kota.'],
            ['student_idx' => 2, 'category' => 'Sick', 'status' => 'Approved', 'days_ago' => 3, 'duration' => 3, 'desc' => 'Sakit flu, istirahat di rumah.'],
            ['student_idx' => 3, 'category' => 'Competition', 'status' => 'Rejected', 'days_ago' => 5, 'duration' => 3, 'desc' => 'Mengikuti olimpiade matematika tingkat nasional.'],
            ['student_idx' => 4, 'category' => 'Sick', 'status' => 'Pending', 'days_ago' => 0, 'duration' => 1, 'desc' => 'Flu ringan, batuk pilek sejak kemarin.'],
            ['student_idx' => 0, 'category' => 'Event', 'status' => 'Pending', 'days_ago' => 2, 'duration' => 2, 'desc' => 'Pernikahan saudara sepupu di Bandung.'],
            ['student_idx' => 1, 'category' => 'Competition', 'status' => 'Pending', 'days_ago' => 3, 'duration' => 3, 'desc' => 'Lomba sains tingkat provinsi di Semarang.'],
            ['student_idx' => 2, 'category' => 'Sick', 'status' => 'Pending', 'days_ago' => 0, 'duration' => 1, 'desc' => 'Sakit perut, mual sejak pagi.'],
            ['student_idx' => 3, 'category' => 'Event', 'status' => 'Pending', 'days_ago' => 0, 'duration' => 1, 'desc' => 'Izin keluarga mendadak, ada urusan orang tua.'],
            ['student_idx' => 4, 'category' => 'Event', 'status' => 'Approved', 'days_ago' => 7, 'duration' => 1, 'desc' => 'Pernikahan tetangga dekat, diminta hadir.'],
            ['student_idx' => 0, 'category' => 'Sick', 'status' => 'Pending', 'days_ago' => 0, 'duration' => 3, 'desc' => 'Demam dan batuk, sudah periksa ke klinik.'],
            ['student_idx' => 1, 'category' => 'Competition', 'status' => 'Pending', 'days_ago' => 1, 'duration' => 3, 'desc' => 'Turnamen futsal antar-sekolah di Yogyakarta.'],
            ['student_idx' => 2, 'category' => 'Event', 'status' => 'Rejected', 'days_ago' => 8, 'duration' => 2, 'desc' => 'Acara keluarga besar di Solo.'],
            ['student_idx' => 3, 'category' => 'Sick', 'status' => 'Approved', 'days_ago' => 4, 'duration' => 1, 'desc' => 'Sakit kepala parah, istirahat di rumah.'],
            ['student_idx' => 4, 'category' => 'Event', 'status' => 'Pending', 'days_ago' => 0, 'duration' => 2, 'desc' => 'Pengajian keluarga di kampung halaman.'],
        ];

        foreach ($samples as $ls) {
            $student = $students->get($ls['student_idx']);

            if (! $student) {
                continue;
            }

            $startDate = now()->subDays($ls['days_ago'])->format('Y-m-d');
            $endDate = now()->subDays($ls['days_ago'])->addDays($ls['duration'] - 1)->format('Y-m-d');

            LeaveRequest::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'start_date' => $startDate,
                ],
                [
                    'guardian_id' => $student->guardian_id,
                    'category' => $ls['category'],
                    'end_date' => $endDate,
                    'description' => $ls['desc'],
                    'approval_status' => $ls['status'],
                    'document_url' => 'https://via.placeholder.com/600x800?text=Surat+Izin+' . urlencode($student->name),
                ],
            );
        }

        $this->command->info('Seeded ' . count($samples) . ' leave requests for X-A (Reguler).');
    }
}
