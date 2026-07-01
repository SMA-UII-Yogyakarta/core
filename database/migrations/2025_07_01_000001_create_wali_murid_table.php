<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wali_murid', function (Blueprint $table) {
            $table->id('id_wali_murid');
            $table->foreignId('id_user')->constrained('users', 'id')->cascadeOnDelete();
            $table->string('nama', 100);
            $table->string('no_hp', 20)->nullable();
            $table->text('alamat')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wali_murid');
    }
};
