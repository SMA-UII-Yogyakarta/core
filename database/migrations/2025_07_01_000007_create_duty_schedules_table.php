<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('duty_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers', 'id')->cascadeOnDelete();
            $table->string('duty_day', 20)->index(); // Monday, Tuesday, Wednesday, Thursday, Friday

            $table->index('teacher_id');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('duty_schedules');
    }
};
