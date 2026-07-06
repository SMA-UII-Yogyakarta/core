<?php

use App\Http\Controllers\Api\AcademicCalendarApiController;
use App\Http\Controllers\Api\AttendanceApiController;
use App\Http\Controllers\Api\AttendanceTimeSettingApiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientLogController;
use App\Http\Controllers\Api\DutyScheduleApiController;
use App\Http\Controllers\Api\GuardianController;
use App\Http\Controllers\Api\ImportController;
use App\Http\Controllers\Api\LeaveRequestApiController;
use App\Http\Controllers\Api\SchoolClassController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;
use Illuminate\Support\Facades\Route;

// ─── Client Log (tanpa auth — throttle saja) ───
Route::post("/log-client-error", ClientLogController::class)->middleware(
    "throttle:60,1",
);

// ─── Public ───
Route::post("/login", [AuthController::class, "login"])->name("api.login");

// ─── Authenticated ───
Route::middleware("auth:sanctum")->group(function () {
    Route::post("/logout", [AuthController::class, "logout"])->name(
        "api.logout",
    );
    Route::get("/user", [AuthController::class, "user"])->name("api.user");

    // ── Master Data API ──
    Route::apiResource("students", StudentController::class);
    Route::apiResource("teachers", TeacherController::class);
    Route::apiResource("classes", SchoolClassController::class);
    Route::apiResource("guardians", GuardianController::class);

    // ── Attendance API ──
    Route::prefix("attendances")->group(function () {
        Route::get("/", [AttendanceApiController::class, "index"])->name(
            "api.attendances.index",
        );
        Route::get("/today", [AttendanceApiController::class, "today"])->name(
            "api.attendances.today",
        );
        Route::post("/check-in", [
            AttendanceApiController::class,
            "checkIn",
        ])->name("api.attendances.check-in")
        ->middleware('throttle:api-attendance-checkin');
        Route::get("/history", [
            AttendanceApiController::class,
            "history",
        ])->name("api.attendances.history");
        Route::get("/stats", [AttendanceApiController::class, "stats"])->name(
            "api.attendances.stats",
        );
    });

    // ── Leave Request API ──
    Route::prefix("leave-requests")->group(function () {
        Route::get("/", [LeaveRequestApiController::class, "index"])->name(
            "api.leave-requests.index",
        );
        Route::post("/", [LeaveRequestApiController::class, "store"])->name(
            "api.leave-requests.store",
        );
        Route::get("/{id}", [LeaveRequestApiController::class, "show"])->name(
            "api.leave-requests.show",
        );
        Route::patch("/{id}/verify", [
            LeaveRequestApiController::class,
            "verify",
        ])->name("api.leave-requests.verify");
    });

    // ── Academic Calendar API ──
    Route::prefix("academic-calendars")->group(function () {
        Route::get("/", [AcademicCalendarApiController::class, "index"])->name(
            "api.academic-calendars.index",
        );
        Route::get("/all", [AcademicCalendarApiController::class, "all"])->name(
            "api.academic-calendars.all",
        );
        Route::post("/", [AcademicCalendarApiController::class, "store"])->name(
            "api.academic-calendars.store",
        );
        Route::get("/{id}", [
            AcademicCalendarApiController::class,
            "show",
        ])->name("api.academic-calendars.show");
        Route::put("/{id}", [
            AcademicCalendarApiController::class,
            "update",
        ])->name("api.academic-calendars.update");
        Route::delete("/{id}", [
            AcademicCalendarApiController::class,
            "destroy",
        ])->name("api.academic-calendars.destroy");
    });

    // ── Attendance Time Settings API ──
    Route::prefix("attendance-time-settings")->group(function () {
        Route::get("/", [
            AttendanceTimeSettingApiController::class,
            "index",
        ])->name("api.attendance-time-settings.index");
        Route::put("/", [
            AttendanceTimeSettingApiController::class,
            "bulkUpdate",
        ])->name("api.attendance-time-settings.bulk-update");
    });

    // ── Duty Schedule API ──
    Route::prefix("duty-schedules")->group(function () {
        Route::get("/", [DutyScheduleApiController::class, "index"])->name(
            "api.duty-schedules.index",
        );
        Route::post("/", [DutyScheduleApiController::class, "store"])->name(
            "api.duty-schedules.store",
        );
        Route::get("/{id}", [DutyScheduleApiController::class, "show"])->name(
            "api.duty-schedules.show",
        );
        Route::put("/{id}", [DutyScheduleApiController::class, "update"])->name(
            "api.duty-schedules.update",
        );
        Route::delete("/{id}", [
            DutyScheduleApiController::class,
            "destroy",
        ])->name("api.duty-schedules.destroy");
    });

    // ── Import API ──
    Route::prefix("import")->group(function () {
        Route::post("/students", [
            ImportController::class,
            "importStudents",
        ])->name("api.import.students");
        Route::post("/teachers", [
            ImportController::class,
            "importTeachers",
        ])->name("api.import.teachers");
    });
});
