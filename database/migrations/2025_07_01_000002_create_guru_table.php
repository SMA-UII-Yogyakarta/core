<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guru', function (Blueprint $table) {
            $table->id('id_guru');
            $table->foreignId('id_user')->constrained('users', 'id')->cascadeOnDelete();
            $table->string('nama', 100);
            $table->string('kode_guru', 20)->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guru');
    }
};
