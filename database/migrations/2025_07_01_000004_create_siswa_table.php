<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('siswa', function (Blueprint $table) {
            $table->id('id_siswa');
            $table->foreignId('id_user')->constrained('users', 'id')->cascadeOnDelete();
            $table->foreignId('id_kelas')->constrained('kelas', 'id_kelas')->nullOnDelete();

            $table->string('nis', 30)->unique();
            $table->string('nisn', 30)->unique();
            $table->string('nama', 100)->index();
            $table->date('tanggal_lahir');
            $table->string('no_hp', 20)->nullable();
            $table->text('alamat')->nullable();
            $table->year('tahun_angkatan');
            $table->string('status', 20)->index(); // Aktif, Non-Aktif

            $table->foreignId('id_wali_murid')->nullable()->constrained('wali_murid', 'id_wali_murid')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('siswa');
    }
};
