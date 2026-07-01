<?php

namespace Database\Factories;

use App\Models\PengaturanJamPresensi;
use Illuminate\Database\Eloquent\Factories\Factory;

class PengaturanJamPresensiFactory extends Factory
{
    protected $model = PengaturanJamPresensi::class;

    public function definition(): array
    {
        return [
            'hari' => 'Senin',
            'jam_buka_masuk' => '06:00:00',
            'batas_terlambat' => '07:00:00',
            'jam_tutup_masuk' => '08:00:00',
        ];
    }
}
