<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengajuan_izin', function (Blueprint $table) {
            $table->id('id_izin');
            $table->foreignId('id_siswa')->constrained('siswa', 'id_siswa')->cascadeOnDelete();
            $table->foreignId('id_wali_murid')->constrained('wali_murid', 'id_wali_murid')->cascadeOnDelete();
            $table->string('kategori', 20); // Sakit, Acara, Lomba
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->string('bukti_dokumen_url', 500)->nullable();
            $table->string('status_approval', 20)->index(); // Pending, Disetujui, Ditolak

            $table->index('id_siswa');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengajuan_izin');
    }
};
