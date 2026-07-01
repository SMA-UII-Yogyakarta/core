<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students', 'id')->cascadeOnDelete();
            $table->foreignId('guardian_id')->constrained('guardians', 'id')->cascadeOnDelete();
            $table->string('category', 20); // Sick, Event, Competition
            $table->date('start_date');
            $table->date('end_date');
            $table->string('document_url', 500)->nullable();
            $table->string('approval_status', 20)->index(); // Pending, Approved, Rejected

            $table->index('student_id');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};
