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
use App\Http\Controllers\Web\GuardianWebController;
use App\Http\Controllers\Web\LeaveRequestController;
use App\Http\Controllers\Web\MonthlyReportController;
use App\Http\Controllers\Web\OverviewController;
use App\Http\Controllers\Web\ProfileController;
use App\Http\Controllers\Web\SchoolClassController;
use App\Http\Controllers\Web\SemesterReportController;
use App\Http\Controllers\Web\StudentController;
use App\Http\Controllers\Web\StudentWebController;
use App\Http\Controllers\Web\TeacherController;
use App\Http\Controllers\Web\TeacherWebController;
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
    Route::get('/master-data/teachers', [TeacherController::class, 'index'])->name('master-data.teachers');
    Route::post('/master-data/teachers', [TeacherController::class, 'store'])->name('master-data.teachers.store');
    Route::get('/master-data/classes', [SchoolClassController::class, 'index'])->name('master-data.classes');
    Route::post('/master-data/classes', [SchoolClassController::class, 'store'])->name('master-data.classes.store');
    Route::patch('/master-data/classes/{id}', [SchoolClassController::class, 'update'])->name('master-data.classes.update');
    Route::get('/master-data/guardians', [GuardianController::class, 'index'])->name('master-data.guardians');
    Route::post('/master-data/guardians', [GuardianController::class, 'store'])->name('master-data.guardians.store');
    Route::delete('/master-data/students/{id}', [StudentController::class, 'destroy'])->name('master-data.students.destroy');
    Route::delete('/master-data/teachers/{id}', [TeacherController::class, 'destroy'])->name('master-data.teachers.destroy');
    Route::delete('/master-data/classes/{id}', [SchoolClassController::class, 'destroy'])->name('master-data.classes.destroy');
    Route::delete('/master-data/guardians/{id}', [GuardianController::class, 'destroy'])->name('master-data.guardians.destroy');

    // Class Enrolment
    Route::get('/class-enrolment', [ClassEnrolmentController::class, 'index'])->name('class-enrolment');
    Route::post('/class-enrolment/assign', [ClassEnrolmentController::class, 'assignStudent'])->name('class-enrolment.assign');
    Route::delete('/class-enrolment/remove/{studentId}', [ClassEnrolmentController::class, 'removeStudent'])->name('class-enrolment.remove');

    // Settings (Waktu & Libur)
    Route::get('/settings', [AttendanceSettingController::class, 'index'])->name('settings');
    Route::post('/settings/time-settings', [AttendanceSettingController::class, 'updateTimeSettings'])->name('settings.time-settings');
    Route::post('/settings/holidays', [AttendanceSettingController::class, 'storeHoliday'])->name('settings.holidays');
    Route::delete('/settings/holidays/{id}', [AttendanceSettingController::class, 'deleteHoliday'])->name('settings.holidays.destroy');

    // Leave Requests
    Route::prefix('leave-requests')->name('leave-requests.')->group(function () {
        Route::get('/', [LeaveRequestController::class, 'index'])->name('index');
        Route::get('/verification', [LeaveRequestController::class, 'verification'])->name('verification');
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
        Route::get('/duty', [TeacherWebController::class, 'dutyDashboard'])->name('duty')->middleware('teacher.type:piket');
        Route::get('/homeroom', [TeacherWebController::class, 'homeroomDashboard'])->name('homeroom')->middleware('teacher.type:wali');
    });

    // Guardian
    Route::prefix('guardian')->name('guardian.')->group(function () {
        Route::get('/', [GuardianWebController::class, 'dashboard'])->name('dashboard');
        Route::get('/leave-application', [GuardianWebController::class, 'leaveApplication'])->name('leave-application');
        Route::post('/leave-application', [GuardianWebController::class, 'storeLeaveApplication'])->name('leave-application.store');
        Route::get('/history', [GuardianWebController::class, 'history'])->name('history');
    });

    // Student
    Route::prefix('student')->name('student.')->group(function () {
        Route::get('/dashboard', [StudentWebController::class, 'dashboard'])->name('dashboard');
        Route::get('/attendance', [StudentWebController::class, 'liveAttendance'])->name('attendance');
        Route::post('/attendance/check-in', [StudentWebController::class, 'checkIn'])->name('attendance.check-in')
            ->middleware('throttle:attendance-checkin');
        Route::get('/history', [StudentWebController::class, 'history'])->name('history');
    });

    // Profile
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile/sessions/{id}', [ProfileController::class, 'revokeSession'])->name('profile.sessions.revoke');
});
