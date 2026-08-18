<?php

use App\Http\Controllers\Web\AttendanceController;
use App\Http\Controllers\Web\AttendanceOverrideController;
use App\Http\Controllers\Web\AttendanceSettingController;
use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\ClassEnrolmentController;
use App\Http\Controllers\Web\DailyReportController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\ExportController;
use App\Http\Controllers\Web\GuardianController;
use App\Http\Controllers\Web\GuardianPortalController;
use App\Http\Controllers\Web\LeaveRequestController;
use App\Http\Controllers\Web\MonthlyReportController;
use App\Http\Controllers\Web\NotificationController;
use App\Http\Controllers\Web\OverviewController;
use App\Http\Controllers\Web\ProfileController;
use App\Http\Controllers\Web\SchoolClassController;
use App\Http\Controllers\Web\SemesterReportController;
use App\Http\Controllers\Web\StorageProxyController;
use App\Http\Controllers\Web\StudentController;
use App\Http\Controllers\Web\StudentPortalController;
use App\Http\Controllers\Web\TeacherController;
use App\Http\Controllers\Web\TeacherPortalController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ─── PUBLIC ROUTES ───
Route::get('/', function () {
    return Inertia::render('Welcome');
});
Route::get('/login', [AuthController::class, 'login'])->name('login');
Route::post('/login', [AuthController::class, 'authenticate'])->name('login.authenticate')
    ->middleware('throttle:web-login');
Route::get('/health', fn () => response()->json(['status' => 'ok']))->name('health');
Route::get('/storage-s3/{path}', [StorageProxyController::class, 'show'])
    ->where('path', '.*')
    ->name('storage-s3');

// ─── AUTHENTICATED + AUTHORIZED ───
Route::middleware(['auth', 'authorize'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Executive
    Route::get('/overview', [OverviewController::class, 'index'])->name('overview');
    Route::get('/dashboard', [DashboardController::class, 'redirect'])->name('dashboard');

    // Monitoring
    Route::get('/monitoring', [AttendanceController::class, 'monitoring'])->name('monitoring');

    // Master Data
    Route::get('/master-data', [StudentController::class, 'index'])->name('master-data');
    Route::post('/master-data', [StudentController::class, 'store'])->name('master-data.store');
    Route::patch('/master-data/students/{id}', [StudentController::class, 'update'])->name('master-data.students.update');
    Route::post('/master-data/students/bulk-destroy', [StudentController::class, 'bulkDestroy'])->name('master-data.students.bulk-destroy');
    Route::patch('/master-data/students/{id}/toggle-status', [StudentController::class, 'toggleStatus'])->name('master-data.students.toggle');
    Route::get('/master-data/teachers', fn () => redirect()->route('master-data', ['tab' => 'teachers']));
    Route::post('/master-data/teachers', [TeacherController::class, 'store'])->name('master-data.teachers.store');
    Route::patch('/master-data/teachers/{id}', [TeacherController::class, 'update'])->name('master-data.teachers.update');
    Route::get('/master-data/classes', fn () => redirect()->route('master-data', ['tab' => 'class']));
    Route::post('/master-data/classes', [SchoolClassController::class, 'store'])->name('master-data.classes.store');
    Route::patch('/master-data/classes/{id}', [SchoolClassController::class, 'update'])->name('master-data.classes.update');
    Route::get('/master-data/guardians', fn () => redirect()->route('master-data', ['tab' => 'guardians']));
    Route::post('/master-data/guardians', [GuardianController::class, 'store'])->name('master-data.guardians.store');
    Route::patch('/master-data/guardians/{id}', [GuardianController::class, 'update'])->name('master-data.guardians.update');
    Route::delete('/master-data/students/{id}', [StudentController::class, 'destroy'])->name('master-data.students.destroy');
    Route::delete('/master-data/teachers/{id}', [TeacherController::class, 'destroy'])->name('master-data.teachers.destroy');
    Route::delete('/master-data/classes/{id}', [SchoolClassController::class, 'destroy'])->name('master-data.classes.destroy');
    Route::delete('/master-data/guardians/{id}', [GuardianController::class, 'destroy'])->name('master-data.guardians.destroy');

    // Master Data Import & Templates
    Route::post('/master-data/import/{entity}', [\App\Http\Controllers\Web\ImportWebController::class, 'import'])->name('master-data.import');
    Route::get('/master-data/import/template/{entity}', [\App\Http\Controllers\Web\ImportWebController::class, 'template'])->name('master-data.import.template');

    // Class Enrolment
    Route::get('/class-enrolment', [ClassEnrolmentController::class, 'index'])->name('class-enrolment');
    Route::post('/class-enrolment/assign', [ClassEnrolmentController::class, 'assignStudent'])->name('class-enrolment.assign');
    Route::post('/class-enrolment/bulk-assign', [ClassEnrolmentController::class, 'bulkAssign'])->name('class-enrolment.bulk-assign');
    Route::post('/class-enrolment/bulk-remove', [ClassEnrolmentController::class, 'bulkRemove'])->name('class-enrolment.bulk-remove');
    Route::delete('/class-enrolment/remove/{studentId}', [ClassEnrolmentController::class, 'removeStudent'])->name('class-enrolment.remove');

    // Guardian Assignment (Hubungkan Wali Murid dengan Murid)
    Route::get('/guardian-assignment', [\App\Http\Controllers\Web\GuardianAssignmentController::class, 'index'])->name('guardian-assignment');
    Route::post('/guardian-assignment/assign', [\App\Http\Controllers\Web\GuardianAssignmentController::class, 'assignStudent'])->name('guardian-assignment.assign');
    Route::delete('/guardian-assignment/remove/{studentId}', [\App\Http\Controllers\Web\GuardianAssignmentController::class, 'removeStudent'])->name('guardian-assignment.remove');

    // Settings (Waktu & Libur)
    Route::get('/settings', [AttendanceSettingController::class, 'index'])->name('settings');
    Route::post('/settings/time-settings', [AttendanceSettingController::class, 'updateTimeSettings'])->name('settings.time-settings');
    Route::post('/settings/location-settings', [AttendanceSettingController::class, 'updateLocationSettings'])->name('settings.location-settings');
    Route::post('/settings/holidays', [AttendanceSettingController::class, 'storeHoliday'])->name('settings.holidays');
    Route::delete('/settings/holidays/{id}', [AttendanceSettingController::class, 'deleteHoliday'])->name('settings.holidays.destroy');

    // Leave Requests
    Route::prefix('leave-requests')->name('leave-requests.')->group(function () {
        Route::get('/', [LeaveRequestController::class, 'index'])->name('index');
        Route::get('/verification', [LeaveRequestController::class, 'verification'])->name('verification');
        Route::post('/bulk-verify', [LeaveRequestController::class, 'bulkVerify'])->name('bulk-verify');
        Route::get('/{id}', [LeaveRequestController::class, 'show'])->name('show');
        Route::patch('/{id}/approve', [LeaveRequestController::class, 'approve'])->name('approve');
        Route::patch('/{id}/reject', [LeaveRequestController::class, 'reject'])->name('reject');
    });

    // Reports
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/daily', [DailyReportController::class, 'index'])->name('daily');
        Route::get('/monthly', [MonthlyReportController::class, 'index'])->name('monthly');
        Route::get('/semester', [SemesterReportController::class, 'index'])->name('semester');
    });

    // Export
    Route::prefix('export')->name('export.')->group(function () {
        Route::get('/', [ExportController::class, 'index'])->name('index');
        Route::get('/students', [ExportController::class, 'students'])->name('students');
        Route::get('/teachers', [ExportController::class, 'teachers'])->name('teachers');
        Route::get('/daily-recap', [ExportController::class, 'dailyRecap'])->name('daily-recap');
        Route::get('/monthly-recap', [ExportController::class, 'monthlyRecap'])->name('monthly-recap');
        Route::get('/semester-recap', [ExportController::class, 'semesterRecap'])->name('semester-recap');
        Route::get('/daily-recap-pdf', [ExportController::class, 'dailyRecapPdf'])->name('daily-recap-pdf');
        Route::get('/monthly-recap-pdf', [ExportController::class, 'monthlyRecapPdf'])->name('monthly-recap-pdf');
        Route::get('/semester-recap-pdf', [ExportController::class, 'semesterRecapPdf'])->name('semester-recap-pdf');
    });

    // Attendance Correction
    Route::get('/attendance-correction', [AttendanceOverrideController::class, 'index'])->name('attendance-correction');
    Route::post('/attendance-correction', [AttendanceOverrideController::class, 'store'])->name('attendance-correction.store');
    Route::delete('/attendance-correction/{id}', [AttendanceOverrideController::class, 'destroy'])->name('attendance-correction.destroy');

    // Teacher Dashboards
    Route::prefix('teacher')->name('teacher.')->group(function () {
        Route::get('/duty', [TeacherPortalController::class, 'dutyDashboard'])->name('duty')->middleware('teacher.type:piket');
        Route::get('/homeroom', [TeacherPortalController::class, 'homeroomDashboard'])->name('homeroom')->middleware('teacher.type:wali');
    });

    // Guardian
    Route::prefix('guardian')->name('guardian.')->group(function () {
        Route::get('/', [GuardianPortalController::class, 'dashboard'])->name('dashboard');
        Route::get('/leave-application', [GuardianPortalController::class, 'leaveApplication'])->name('leave-application');
        Route::post('/leave-application', [GuardianPortalController::class, 'storeLeaveApplication'])->name('leave-application.store');
        Route::get('/history', [GuardianPortalController::class, 'history'])->name('history');
    });

    // Student
    Route::prefix('student')->name('student.')->group(function () {
        Route::get('/dashboard', [StudentPortalController::class, 'dashboard'])->name('dashboard');
        Route::get('/overview', [StudentPortalController::class, 'dashboard'])->name('overview');
        Route::get('/attendance', [StudentPortalController::class, 'liveAttendance'])->name('attendance');
        Route::post('/attendance/check-in', [StudentPortalController::class, 'checkIn'])->name('attendance.check-in')
            ->middleware('throttle:attendance-checkin');
        Route::get('/history', [StudentPortalController::class, 'history'])->name('history');
    });

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications');
    Route::post('/notifications/store', [NotificationController::class, 'store'])->name('notifications.store');
    Route::post('/notifications/read/all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read.all');
    Route::post('/notifications/read/{id}', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    // Profile
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile/sessions/{id}', [ProfileController::class, 'revokeSession'])->name('profile.sessions.revoke');
});
