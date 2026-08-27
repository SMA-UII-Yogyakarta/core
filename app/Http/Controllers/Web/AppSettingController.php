<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\SchoolLocationSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppSettingController extends Controller
{
    public function index(): Response
    {
        $locationSetting = SchoolLocationSetting::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'SMA UII Yogyakarta',
                'address' => 'Jl. Taman Siswa No.158, Wirogunan, Kec. Mergangsan, Kota Yogyakarta, D.I. Yogyakarta 55151',
                'latitude' => -7.814257,
                'longitude' => 110.375944,
                'radius_meters' => 100,
                'is_active' => true,
            ],
        );

        return Inertia::render('Admin/SystemSettings', [
            'locationSetting' => $locationSetting,
            'systemInfo' => [
                'appName' => 'SMA UII Core Backend',
                'version' => '1.2.0-stable',
                'schoolName' => config('app.school_name', 'SMA UII Yogyakarta'),
                'npsn' => '20403178',
                'accreditation' => 'A (Unggul)',
                'academicYear' => '2025/2026 - Ganjil',
                'principalName' => 'Drs. H. M. Suparno, M.Pd.',
                'address' => 'Jl. Sorowajan Baru No. 12, Banguntapan, Bantul, DIY',
                'phone' => '(0274) 555-1234',
                'email' => 'info@smauii.sch.id',
                'environment' => config('app.env', 'production'),
                'storageDriver' => config('filesystems.default', 's3'),
                'waGatewayStatus' => 'Active',
                'maintenanceMode' => false,
                'mfaEnforced' => true,
                'defaultPageLimit' => 10,
                'sessionTimeoutMinutes' => 120,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'schoolName' => 'required|string|max:255',
            'npsn' => 'required|string|max:50',
            'accreditation' => 'required|string|max:50',
            'academicYear' => 'required|string|max:50',
            'principalName' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'defaultPageLimit' => 'required|integer|min:5|max:100',
            'sessionTimeoutMinutes' => 'required|integer|min:15|max:1440',
        ]);

        return redirect()->back()->with('success', 'Pengaturan Sistem SMA UII Core berhasil diperbarui.');
    }

    public function updateLocation(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius_meters' => 'required|integer|min:10|max:5000',
            'is_active' => 'sometimes|boolean',
        ]);

        SchoolLocationSetting::updateOrCreate(
            ['id' => 1],
            $validated,
        );

        return redirect()->back()->with('success', 'Pengaturan titik lokasi presensi & geofence berhasil diperbarui.');
    }
}
