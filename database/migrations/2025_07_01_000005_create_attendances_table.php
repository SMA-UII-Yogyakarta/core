<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students', 'id')->cascadeOnDelete();
            $table->date('tanggal')->index();
            $table->time('check_in_time');
            $table->string('latitude', 20);
            $table->string('longitude', 20);
            $table->string('photo_url', 500);
            $table->string('status', 20)->index(); // Present, Late, Absent

            $table->index(['student_id', 'tanggal']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
