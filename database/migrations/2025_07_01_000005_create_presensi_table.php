<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presensi', function (Blueprint $table) {
            $table->id('id_presensi');
            $table->foreignId('id_siswa')->constrained('siswa', 'id_siswa')->cascadeOnDelete();
            $table->date('tanggal')->index();
            $table->time('waktu_masuk');
            $table->string('latitude', 20);
            $table->string('longitude', 20);
            $table->string('foto_url', 500);
            $table->string('status_kehadiran', 20)->index(); // Hadir, Terlambat, Alpa

            $table->index(['id_siswa', 'tanggal']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presensi');
    }
};
