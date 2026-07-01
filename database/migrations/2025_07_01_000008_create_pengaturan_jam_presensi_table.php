<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengaturan_jam_presensi', function (Blueprint $table) {
            $table->id('id_pengaturan');
            $table->string('hari', 20); // Senin, Selasa, Rabu, Kamis, Jumat, Sabtu
            $table->time('jam_buka_masuk');
            $table->time('batas_terlambat');
            $table->time('jam_tutup_masuk');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengaturan_jam_presensi');
    }
};
