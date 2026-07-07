<?php

use App\Http\Controllers\Web\AttendanceController;
use App\Http\Controllers\Web\AttendanceSettingController;
use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\ClassEnrolmentController;
use App\Http\Controllers\Web\DailyRecapController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\DutyScheduleController;
use App\Http\Controllers\Web\AttendanceOverrideController;
use App\Http\Controllers\Web\ExportController;
use App\Http\Controllers\Web\GuardianController;
use App\Http\Controllers\Web\GuardianWebController;
use App\Http\Controllers\Web\LeaveRequestController;
use App\Http\Controllers\Web\LeaveRequestViewController;
use App\Http\Controllers\Web\MonthlyRecapController;
use App\Http\Controllers\Web\SchoolClassController;
use App\Http\Controllers\Web\StudentController;
use App\Http\Controllers\Web\StudentWebController;
use App\Http\Controllers\Web\TeacherController;
use App\Http\Controllers\Web\TeacherWebController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ─── Public Routes ───
Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/login', [AuthController::class, 'authenticate'])->name(
        'login.authenticate',
    )->middleware('throttle:web-login');
});

// ─── Authenticated Routes ───
Route::middleware(['auth'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name(
        'dashboard',
    );

    // Master Data
    Route::prefix('/admin/master-data')->group(function () {
        Route::get('/', [StudentController::class, 'index'])->name(
            'admin.master-data',
        );
        Route::post('/students', [StudentController::class, 'store'])->name(
            'admin.master-data.students.store',
        );
        Route::patch('/students/{student}', [
            StudentController::class,
            'update',
        ])->name('admin.master-data.students.update');
        Route::delete('/students/{student}', [
            StudentController::class,
            'destroy',
        ])->name('admin.master-data.students.destroy');
        Route::patch('/students/{student}/toggle-status', [
            StudentController::class,
            'toggleStatus',
        ])->name('admin.master-data.students.toggle');

        Route::get('/teachers', [TeacherController::class, 'index'])->name(
            'admin.master-data.teachers',
        );
        Route::post('/teachers', [TeacherController::class, 'store'])->name(
            'admin.master-data.teachers.store',
        );
        Route::patch('/teachers/{teacher}', [
            TeacherController::class,
            'update',
        ])->name('admin.master-data.teachers.update');
        Route::delete('/teachers/{teacher}', [
            TeacherController::class,
            'destroy',
        ])->name('admin.master-data.teachers.destroy');

        Route::get('/classes', [SchoolClassController::class, 'index'])->name(
            'admin.master-data.classes',
        );
        Route::post('/classes', [SchoolClassController::class, 'store'])->name(
            'admin.master-data.classes.store',
        );
        Route::patch('/classes/{schoolClass}', [
            SchoolClassController::class,
            'update',
        ])->name('admin.master-data.classes.update');
        Route::delete('/classes/{schoolClass}', [
            SchoolClassController::class,
            'destroy',
        ])->name('admin.master-data.classes.destroy');

        Route::get('/guardians', [GuardianController::class, 'index'])->name(
            'admin.master-data.guardians',
        );
        Route::post('/guardians', [GuardianController::class, 'store'])->name(
            'admin.master-data.guardians.store',
        );
        Route::patch('/guardians/{guardian}', [
            GuardianController::class,
            'update',
        ])->name('admin.master-data.guardians.update');
        Route::delete('/guardians/{guardian}', [
            GuardianController::class,
            'destroy',
        ])->name('admin.master-data.guardians.destroy');
    });

    // Live Monitoring
    Route::get('/admin/monitoring', [
        AttendanceController::class,
        'monitoring',
    ])->name('admin.monitoring');

    // Leave Verification
    Route::prefix('/admin/leave-verification')->group(function () {
        Route::get('/', [LeaveRequestController::class, 'verification'])->name(
            'admin.leave-verification',
        );
        Route::patch('/{id}/approve', [
            LeaveRequestController::class,
            'approve',
        ])->name('admin.leave-verification.approve');
        Route::patch('/{id}/reject', [
            LeaveRequestController::class,
            'reject',
        ])->name('admin.leave-verification.reject');
    });

    // Leave Requests (Admin View)
    Route::get('/admin/leave-requests', [
        LeaveRequestViewController::class,
        'index',
    ])->name('admin.leave-requests');

    // Classes Management (Standalone)
    Route::prefix('/admin/classes')->group(function () {
        Route::get('/', [SchoolClassController::class, 'masterIndex'])->name(
            'admin.classes',
        );
        Route::post('/', [SchoolClassController::class, 'store'])->name(
            'admin.classes.store',
        );
        Route::put('/{id}', [SchoolClassController::class, 'update'])->name(
            'admin.classes.update',
        );
        Route::delete('/{id}', [SchoolClassController::class, 'destroy'])->name(
            'admin.classes.destroy',
        );
    });

    // Monthly Recap
    Route::get('/admin/monthly-recap', [
        MonthlyRecapController::class,
        'index',
    ])->name('admin.monthly-recap');

    // Daily Recap
    Route::get('/admin/daily-recap', [
        DailyRecapController::class,
        'index',
    ])->name('admin.daily-recap');

    // Class Enrolment
    Route::prefix('/admin/class-enrolment')->group(function () {
        Route::get('/', [ClassEnrolmentController::class, 'index'])->name(
            'admin.class-enrolment',
        );
        Route::post('/assign', [
            ClassEnrolmentController::class,
            'assignStudent',
        ])->name('admin.class-enrolment.assign');
        Route::delete('/remove/{student}', [
            ClassEnrolmentController::class,
            'removeStudent',
        ])->name('admin.class-enrolment.remove');
    });

    // Duty Schedules
    Route::prefix('/admin/duty-schedules')->group(function () {
        Route::get('/', [DutyScheduleController::class, 'index'])->name(
            'admin.duty-schedules',
        );
        Route::post('/', [DutyScheduleController::class, 'store'])->name(
            'admin.duty-schedules.store',
        );
        Route::patch('/{id}', [DutyScheduleController::class, 'update'])->name(
            'admin.duty-schedules.update',
        );
        Route::delete('/{id}', [
            DutyScheduleController::class,
            'destroy',
        ])->name('admin.duty-schedules.destroy');
    });

    // Attendance Settings + Academic Calendar
    Route::prefix('/admin/settings')->group(function () {
        Route::get('/', [AttendanceSettingController::class, 'index'])->name(
            'admin.settings',
        );
        Route::post('/time-settings', [
            AttendanceSettingController::class,
            'updateTimeSettings',
        ])->name('admin.settings.time-settings');
        Route::post('/holidays', [
            AttendanceSettingController::class,
            'storeHoliday',
        ])->name('admin.settings.holidays.store');
        Route::delete('/holidays/{id}', [
            AttendanceSettingController::class,
            'deleteHoliday',
        ])->name('admin.settings.holidays.delete');
    });

    // ─── Export Routes ───
    Route::prefix('/admin/export')->group(function () {
        Route::get('/students', [ExportController::class, 'students'])->name(
            'admin.export.students',
        );
        Route::get('/teachers', [ExportController::class, 'teachers'])->name(
            'admin.export.teachers',
        );
        Route::get('/daily-recap', [
            ExportController::class,
            'dailyRecap',
        ])->name('admin.export.daily-recap');
        Route::get('/monthly-recap', [
            ExportController::class,
            'monthlyRecap',
        ])->name('admin.export.monthly-recap');
        Route::get('/daily-recap/pdf', [
            ExportController::class,
            'dailyRecapPdf',
        ])->name('admin.export.daily-recap-pdf');
        Route::get('/monthly-recap/pdf', [
            ExportController::class,
            'monthlyRecapPdf',
        ])->name('admin.export.monthly-recap-pdf');
    });

    Route::prefix('/admin/attendance-correction')->group(function () {
        Route::get('/', [AttendanceOverrideController::class, 'index'])->name(
            'admin.attendance.correction',
        );
        Route::post(
            '/',
            [AttendanceOverrideController::class, 'store'],
        )->name('admin.attendance.correction.store');
        Route::delete(
            '/{id}',
            [AttendanceOverrideController::class, 'destroy'],
        )->name('admin.attendance.correction.destroy');
    });

    // ─── Role-based Pages ───

    // Student
    Route::middleware('role:student')->prefix('/student')->group(function () {
        Route::get('/dashboard', [StudentWebController::class, 'dashboard'])->name(
            'student.dashboard',
        );
        Route::get('/live-attendance', [
            StudentWebController::class,
            'liveAttendance',
        ])->name('student.live-attendance');
        Route::post('/live-attendance/checkin', [
            StudentWebController::class,
            'checkIn',
        ])->name('student.live-attendance.checkin')
        ->middleware('throttle:attendance-checkin');
        Route::get('/history', [StudentWebController::class, 'history'])->name(
            'student.history',
        );
    });

    // Teacher
    Route::middleware('role:teacher')->prefix('/teacher')->group(function () {
        Route::get('/duty', [TeacherWebController::class, 'dutyDashboard'])->name(
            'teacher.duty',
        );
        Route::get('/homeroom', [TeacherWebController::class, 'homeroomDashboard'])->name(
            'teacher.homeroom',
        );
    });

    // Guardian
    Route::middleware('role:guardian')->prefix('/guardian')->group(function () {
        Route::get('/', [GuardianWebController::class, 'dashboard'])->name(
            'guardian.dashboard',
        );
        Route::get('/leave-application', [
            GuardianWebController::class,
            'leaveApplication',
        ])->name('guardian.leave-application');
        Route::post('/leave-application/store', [
            GuardianWebController::class,
            'storeLeaveApplication',
        ])->name('guardian.leave-application.store')
        ->middleware('throttle:leave-request');
    });
});
