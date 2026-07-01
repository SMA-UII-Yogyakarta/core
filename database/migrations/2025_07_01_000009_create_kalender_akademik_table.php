<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kalender_akademik', function (Blueprint $table) {
            $table->id('id_libur');
            $table->date('tanggal');
            $table->string('keterangan', 200)->nullable();
            $table->boolean('status_libur');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kalender_akademik');
    }
};
