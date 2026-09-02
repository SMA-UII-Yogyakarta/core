<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->index(['attendance_date', 'student_id'], 'idx_attendances_date_student');
            $table->index(['status', 'attendance_date'], 'idx_attendances_status_date');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->index(['class_id', 'status'], 'idx_students_class_status');
        });

        Schema::table('leave_requests', function (Blueprint $table) {
            $table->index(['approval_status', 'start_date', 'end_date'], 'idx_leave_status_dates');
            $table->index(['student_id', 'start_date', 'end_date'], 'idx_leave_student_dates');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex('idx_attendances_date_student');
            $table->dropIndex('idx_attendances_status_date');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex('idx_students_class_status');
        });

        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropIndex('idx_leave_status_dates');
            $table->dropIndex('idx_leave_student_dates');
        });
    }
};
