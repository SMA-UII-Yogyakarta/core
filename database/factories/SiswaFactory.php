<?php

namespace Database\Factories;

use App\Models\Siswa;
use Illuminate\Database\Eloquent\Factories\Factory;

class SiswaFactory extends Factory
{
    protected $model = Siswa::class;

    public function definition(): array
    {
        return [
            'nis' => fake()->unique()->numerify('##########'),
            'nisn' => fake()->unique()->numerify('##############'),
            'nama' => fake()->name(),
            'tanggal_lahir' => fake()->date(max: '2010-01-01'),
            'tahun_angkatan' => 2025,
            'status' => 'Aktif',
        ];
    }
}
