<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Composite indexes for attendances table
        Schema::table('attendances', function (Blueprint $table) {
            // Primary query pattern: student_id + attendance_date (classDetail, studentDetail, classMonthlyReport)
            $table->index(['student_id', 'attendance_date'], 'idx_att_student_date');

            // Query pattern: attendance_date + status (schoolOverview, monthlyTrend, weeklyTrend)
            $table->index(['attendance_date', 'status'], 'idx_att_date_status');

            // Query pattern: attendance_date + student_id + status (classMonthlyReport daily breakdown)
            $table->index(['attendance_date', 'student_id', 'status'], 'idx_att_date_student_status');

            // Query pattern: student_id + year + month (studentDetail, studentMonthlyTrend)
            $table->index(['student_id', 'attendance_date'], 'idx_att_student_date_ym');
        });

        // Composite indexes for leave_requests table
        Schema::table('leave_requests', function (Blueprint $table) {
            // Query pattern: student_id + start_date + end_date + approval_status (classDetail, classMonthlyReport)
            $table->index(['student_id', 'start_date', 'end_date', 'approval_status'], 'idx_lr_student_dates_status');

            // Query pattern: start_date + end_date + approval_status (schoolOverview, ExportService)
            $table->index(['start_date', 'end_date', 'approval_status'], 'idx_lr_dates_status');

            // Query pattern: student_id + approval_status (studentDetail)
            $table->index(['student_id', 'approval_status'], 'idx_lr_student_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex('idx_att_student_date');
            $table->dropIndex('idx_att_date_status');
            $table->dropIndex('idx_att_date_student_status');
            $table->dropIndex('idx_att_student_date_ym');
        });

        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropIndex('idx_lr_student_dates_status');
            $table->dropIndex('idx_lr_dates_status');
            $table->dropIndex('idx_lr_student_status');
        });
    }
};
