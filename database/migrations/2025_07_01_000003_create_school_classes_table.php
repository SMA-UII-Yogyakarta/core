<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::create('school_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers', 'id')->nullOnDelete();
            $table->string('name', 50);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_classes');
    }
};
