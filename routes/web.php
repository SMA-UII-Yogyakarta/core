<?php

use App\Http\Controllers\Web\AttendanceController;
use App\Http\Controllers\Web\AttendanceSettingController;
use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\DutyScheduleController;
use App\Http\Controllers\Web\EnrolmentKelasController;
use App\Http\Controllers\Web\AttendanceOverrideController;
use App\Http\Controllers\Web\ExportController;
use App\Http\Controllers\Web\GuardianController;
use App\Http\Controllers\Web\GuruController;
use App\Http\Controllers\Web\LeaveRequestController;
use App\Http\Controllers\Web\LeaveRequestViewController;
use App\Http\Controllers\Web\RekapBulananController;
use App\Http\Controllers\Web\RekapHarianController;
use App\Http\Controllers\Web\SchoolClassController;
use App\Http\Controllers\Web\SiswaController;
use App\Http\Controllers\Web\StudentController;
use App\Http\Controllers\Web\TeacherController;
use App\Http\Controllers\Web\WaliMuridController;
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
    );
});

// ─── Authenticated Routes ───
Route::middleware(['auth'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name(
        'dashboard',
    );

    // Master Data
    Route::prefix('/admin/data-master')->group(function () {
        Route::get('/', [StudentController::class, 'index'])->name(
            'admin.data-master',
        );
        Route::post('/siswa', [StudentController::class, 'store'])->name(
            'admin.data-master.siswa.store',
        );
        Route::patch('/siswa/{student}', [
            StudentController::class,
            'update',
        ])->name('admin.data-master.siswa.update');
        Route::delete('/siswa/{student}', [
            StudentController::class,
            'destroy',
        ])->name('admin.data-master.siswa.destroy');
        Route::patch('/siswa/{student}/toggle-status', [
            StudentController::class,
            'toggleStatus',
        ])->name('admin.data-master.siswa.toggle');

        Route::get('/guru', [TeacherController::class, 'index'])->name(
            'admin.data-master.guru',
        );
        Route::post('/guru', [TeacherController::class, 'store'])->name(
            'admin.data-master.guru.store',
        );
        Route::patch('/guru/{teacher}', [
            TeacherController::class,
            'update',
        ])->name('admin.data-master.guru.update');
        Route::delete('/guru/{teacher}', [
            TeacherController::class,
            'destroy',
        ])->name('admin.data-master.guru.destroy');

        Route::get('/kelas', [SchoolClassController::class, 'index'])->name(
            'admin.data-master.kelas',
        );
        Route::post('/kelas', [SchoolClassController::class, 'store'])->name(
            'admin.data-master.kelas.store',
        );
        Route::patch('/kelas/{schoolClass}', [
            SchoolClassController::class,
            'update',
        ])->name('admin.data-master.kelas.update');
        Route::delete('/kelas/{schoolClass}', [
            SchoolClassController::class,
            'destroy',
        ])->name('admin.data-master.kelas.destroy');

        Route::get('/wali', [GuardianController::class, 'index'])->name(
            'admin.data-master.wali',
        );
        Route::post('/wali', [GuardianController::class, 'store'])->name(
            'admin.data-master.wali.store',
        );
        Route::patch('/wali/{guardian}', [
            GuardianController::class,
            'update',
        ])->name('admin.data-master.wali.update');
        Route::delete('/wali/{guardian}', [
            GuardianController::class,
            'destroy',
        ])->name('admin.data-master.wali.destroy');
    });

    // Live Monitoring
    Route::get('/admin/monitoring', [
        AttendanceController::class,
        'monitoring',
    ])->name('admin.monitoring');

    // Leave Verification
    Route::prefix('/admin/verifikasi-izin')->group(function () {
        Route::get('/', [LeaveRequestController::class, 'verification'])->name(
            'admin.verifikasi-izin',
        );
        Route::patch('/{id}/approve', [
            LeaveRequestController::class,
            'approve',
        ])->name('admin.verifikasi-izin.approve');
        Route::patch('/{id}/reject', [
            LeaveRequestController::class,
            'reject',
        ])->name('admin.verifikasi-izin.reject');
    });

    // Pengajuan Izin (Admin View)
    Route::get('/admin/pengajuan-izin', [
        LeaveRequestViewController::class,
        'index',
    ])->name('admin.pengajuan-izin');

    // Manajemen Master Kelas (Standalone)
    Route::prefix('/admin/master-kelas')->group(function () {
        Route::get('/', [SchoolClassController::class, 'masterIndex'])->name(
            'admin.master-kelas',
        );
        Route::post('/', [SchoolClassController::class, 'store'])->name(
            'admin.master-kelas.store',
        );
        Route::put('/{id}', [SchoolClassController::class, 'update'])->name(
            'admin.master-kelas.update',
        );
        Route::delete('/{id}', [SchoolClassController::class, 'destroy'])->name(
            'admin.master-kelas.destroy',
        );
    });

    // Rekap Bulanan
    Route::get('/admin/rekap-bulanan', [
        RekapBulananController::class,
        'index',
    ])->name('admin.rekap-bulanan');

    // Rekap Harian
    Route::get('/admin/rekap-harian', [
        RekapHarianController::class,
        'index',
    ])->name('admin.rekap-harian');

    // Enrolment Kelas
    Route::prefix('/admin/enrolment-kelas')->group(function () {
        Route::get('/', [EnrolmentKelasController::class, 'index'])->name(
            'admin.enrolment-kelas',
        );
        Route::post('/assign', [
            EnrolmentKelasController::class,
            'assignStudent',
        ])->name('admin.enrolment-kelas.assign');
        Route::delete('/remove/{student}', [
            EnrolmentKelasController::class,
            'removeStudent',
        ])->name('admin.enrolment-kelas.remove');
    });

    // Duty Schedule
    Route::prefix('/admin/jadwal-piket')->group(function () {
        Route::get('/', [DutyScheduleController::class, 'index'])->name(
            'admin.jadwal-piket',
        );
        Route::post('/', [DutyScheduleController::class, 'store'])->name(
            'admin.jadwal-piket.store',
        );
        Route::patch('/{id}', [DutyScheduleController::class, 'update'])->name(
            'admin.jadwal-piket.update',
        );
        Route::delete('/{id}', [
            DutyScheduleController::class,
            'destroy',
        ])->name('admin.jadwal-piket.destroy');
    });

    // Attendance Settings + Academic Calendar
    Route::prefix('/admin/pengaturan')->group(function () {
        Route::get('/', [AttendanceSettingController::class, 'index'])->name(
            'admin.pengaturan',
        );
        Route::post('/time-settings', [
            AttendanceSettingController::class,
            'updateTimeSettings',
        ])->name('admin.pengaturan.time-settings');
        Route::post('/holidays', [
            AttendanceSettingController::class,
            'storeHoliday',
        ])->name('admin.pengaturan.holidays.store');
        Route::delete('/holidays/{id}', [
            AttendanceSettingController::class,
            'deleteHoliday',
        ])->name('admin.pengaturan.holidays.delete');
    });

    // ─── Export Routes ───
    Route::prefix('/admin/export')->group(function () {
        Route::get('/siswa', [ExportController::class, 'students'])->name(
            'admin.export.siswa',
        );
        Route::get('/guru', [ExportController::class, 'teachers'])->name(
            'admin.export.guru',
        );
        Route::get('/rekap-harian', [
            ExportController::class,
            'rekapHarian',
        ])->name('admin.export.rekap-harian');
        Route::get('/rekap-bulanan', [
            ExportController::class,
            'rekapBulanan',
        ])->name('admin.export.rekap-bulanan');
        Route::get('/rekap-harian/pdf', [
            ExportController::class,
            'rekapHarianPdf',
        ])->name('admin.export.rekap-harian-pdf');
        Route::get('/rekap-bulanan/pdf', [
            ExportController::class,
            'rekapBulananPdf',
        ])->name('admin.export.rekap-bulanan-pdf');
    });

    Route::prefix('/admin/koreksi-absensi')->group(function () {
        Route::get('/', [AttendanceOverrideController::class, 'index'])->name(
            'admin.attendance.override',
        );
        Route::post(
            '/',
            [AttendanceOverrideController::class, 'store'],
        )->name('admin.attendance.override.store');
        Route::delete(
            '/{id}',
            [AttendanceOverrideController::class, 'destroy'],
        )->name('admin.attendance.override.destroy');
    });

    // ─── Role-based Pages ───

    // Siswa
    Route::middleware('role:student')->prefix('/siswa')->group(function () {
        Route::get('/dashboard', [SiswaController::class, 'dashboard'])->name(
            'siswa.dashboard',
        );
        Route::get('/live-presensi', [
            SiswaController::class,
            'livePresensi',
        ])->name('siswa.live-presensi');
        Route::post('/live-presensi/checkin', [
            SiswaController::class,
            'checkIn',
        ])->name('siswa.live-presensi.checkin')
        ->middleware('throttle:attendance-checkin');
        Route::get('/riwayat', [SiswaController::class, 'riwayat'])->name(
            'siswa.riwayat',
        );
    });

    // Guru
    Route::middleware('role:teacher')->prefix('/guru')->group(function () {
        Route::get('/piket', [GuruController::class, 'piket'])->name(
            'guru.piket',
        );
        Route::get('/wali-kelas', [GuruController::class, 'waliKelas'])->name(
            'guru.wali-kelas',
        );
    });

    // Wali Murid
    Route::middleware('role:guardian')->prefix('/wali-murid')->group(function () {
        Route::get('/', [WaliMuridController::class, 'dashboard'])->name(
            'wali-murid.dashboard',
        );
        Route::get('/pengajuan-izin', [
            WaliMuridController::class,
            'pengajuanIzin',
        ])->name('wali-murid.pengajuan-izin');
        Route::post('/pengajuan-izin/store', [
            WaliMuridController::class,
            'storePengajuanIzin',
        ])->name('wali-murid.pengajuan-izin.store');
    });
});
