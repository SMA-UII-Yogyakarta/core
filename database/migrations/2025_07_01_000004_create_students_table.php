<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users', 'id')->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('school_classes', 'id')->nullOnDelete();

            $table->string('nis', 30)->unique();
            $table->string('nisn', 30)->unique();
            $table->string('name', 100)->index();
            $table->date('birth_date');
            $table->string('phone', 20)->nullable();
            $table->text('address')->nullable();
            $table->year('enrollment_year');
            $table->string('status', 20)->index(); // Active, Inactive

            $table->foreignId('guardian_id')->nullable()->constrained('guardians', 'id')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
