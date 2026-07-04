<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::create('attendance_time_settings', function (Blueprint $table) {
            $table->id();
            $table->string('day', 20); // Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
            $table->time('check_in_open');
            $table->time('late_threshold');
            $table->time('check_in_close');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_time_settings');
    }
};
