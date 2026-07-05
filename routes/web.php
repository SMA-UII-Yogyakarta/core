<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public routes
Route::get("/", function () {
    return Inertia::render("Welcome");
});

Route::get("/login", function () {
    return Inertia::render("Auth/Login");
})->name("login");

// Admin routes
Route::prefix("admin")
    ->middleware([])
    ->group(function () {
        Route::get("/dashboard", function () {
            return Inertia::render("Admin/Dashboard");
        })->name("admin.dashboard");

        Route::get("/data-master", function () {
            return Inertia::render("Admin/DataMaster");
        })->name("admin.data-master");

        Route::get("/enrolment-kelas", function () {
            return Inertia::render("Admin/EnrolmentKelas");
        })->name("admin.enrolment-kelas");

        Route::get("/master-kelas", function () {
            return Inertia::render("Admin/MasterKelas");
        })->name("admin.master-kelas");

        Route::get("/pengaturan-waktu", function () {
            return Inertia::render("Admin/PengaturanWaktuLibur");
        })->name("admin.pengaturan-waktu");

        Route::get("/rekap-bulanan", function () {
            return Inertia::render("Admin/RekapBulanan");
        })->name("admin.rekap-bulanan");

        Route::get("/rekap-harian", function () {
            return Inertia::render("Admin/RekapHarian");
        })->name("admin.rekap-harian");

        Route::get("/pengajuan-izin-sakit", function () {
            return Inertia::render("Admin/PengajuanIzinSakit");
        })->name("admin.pengajuan-izin");

        Route::get("/laporan-ekspor", function () {
            return Inertia::render("Admin/LaporanEksporGlobal");
        })->name("admin.laporan-ekspor");

        Route::get("/pantauan-izin", function () {
            return Inertia::render("Admin/PantauanIzin");
        })->name("admin.pantauan-izin");

        Route::get("/ekspor-laporan", function () {
            return Inertia::render("Admin/EksporLaporan");
        })->name("admin.ekspor-laporan");

        Route::get("/ekspor-harian", function () {
            return Inertia::render("Admin/EksporHarian");
        })->name("admin.ekspor-harian");

        Route::get("/simulasi-izin", function () {
            return Inertia::render("Admin/SimulasiIzin");
        })->name("admin.simulasi-izin");
    });

// Siswa routes
Route::prefix("siswa")
    ->middleware([])
    ->group(function () {
        Route::get("/dashboard", function () {
            return Inertia::render("Siswa/Dashboard");
        })->name("siswa.dashboard");

        Route::get("/presensi", function () {
            return Inertia::render("Siswa/LivePresensi");
        })->name("siswa.presensi");

        Route::get("/riwayat", function () {
            return Inertia::render("Siswa/RiwayatKehadiran");
        })->name("siswa.riwayat");
    });

// Wali Murid routes
Route::prefix("wali")
    ->middleware([])
    ->group(function () {
        Route::get("/dashboard", function () {
            return Inertia::render("WaliMurid/Dashboard");
        })->name("wali.dashboard");

        Route::get("/pengajuan-izin", function () {
            return Inertia::render("WaliMurid/PengajuanIzin");
        })->name("wali.pengajuan-izin");
    });

// Guru routes
Route::prefix("guru")
    ->middleware([])
    ->group(function () {
        Route::get("/piket", function () {
            return Inertia::render("Guru/DashboardPiket");
        })->name("guru.piket");

        Route::get("/wali-kelas", function () {
            return Inertia::render("Guru/DashboardWaliKelas");
        })->name("guru.wali-kelas");

        Route::get("/verifikasi-izin", function () {
            return Inertia::render("Guru/VerifikasiIzin");
        })->name("guru.verifikasi-izin");
    });
