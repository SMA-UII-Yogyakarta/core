<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::create('academic_calendars', function (Blueprint $table) {
            $table->id();
            $table->date('holiday_date');
            $table->string('description', 200)->nullable();
            $table->boolean('is_holiday');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_calendars');
    }
};
