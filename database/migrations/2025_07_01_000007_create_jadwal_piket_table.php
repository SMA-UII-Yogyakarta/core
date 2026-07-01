<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_piket', function (Blueprint $table) {
            $table->id('id_jadwal');
            $table->foreignId('id_guru')->constrained('guru', 'id_guru')->cascadeOnDelete();
            $table->string('hari_tugas', 20)->index(); // Senin, Selasa, Rabu, Kamis, Jumat

            $table->index('id_guru');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_piket');
    }
};
