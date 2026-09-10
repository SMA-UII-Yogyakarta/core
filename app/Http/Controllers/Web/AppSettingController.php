<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\SchoolLocationSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppSettingController extends Controller
{
    public function index(): Response
    {
        $locationSetting = SchoolLocationSetting::find(1);

        return Inertia::render('Admin/SystemSettings', [
            'locationSetting' => $locationSetting,
            'systemInfo' => [
                'appName' => AppSetting::get('app_name', config('app.name', 'SMA UII Core Backend')),
                'version' => AppSetting::get('version', '1.2.0-stable'),
                'schoolName' => AppSetting::get('school_name', config('app.school_name', '')),
                'npsn' => AppSetting::get('npsn', ''),
                'accreditation' => AppSetting::get('accreditation', ''),
                'academicYear' => AppSetting::get('academic_year', ''),
                'principalName' => AppSetting::get('principal_name', ''),
                'address' => AppSetting::get('address', ''),
                'phone' => AppSetting::get('phone', ''),
                'email' => AppSetting::get('email', ''),
                'environment' => config('app.env', 'production'),
                'storageDriver' => config('filesystems.default', 'local'),
                'waGatewayStatus' => AppSetting::get('wa_gateway_status', 'Inactive'),
                'maintenanceMode' => (bool) AppSetting::get('maintenance_mode', false),
                'mfaEnforced' => (bool) AppSetting::get('mfa_enforced', false),
                'defaultPageLimit' => (int) AppSetting::get('default_page_limit', 10),
                'sessionTimeoutMinutes' => (int) AppSetting::get('session_timeout_minutes', 120),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
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
            'maintenanceMode' => 'sometimes|boolean',
            'mfaEnforced' => 'sometimes|boolean',
        ]);

        AppSetting::setMany([
            'school_name' => $validated['schoolName'],
            'npsn' => $validated['npsn'],
            'accreditation' => $validated['accreditation'],
            'academic_year' => $validated['academicYear'],
            'principal_name' => $validated['principalName'],
            'address' => $validated['address'] ?? '',
            'phone' => $validated['phone'] ?? '',
            'email' => $validated['email'] ?? '',
            'default_page_limit' => (string) $validated['defaultPageLimit'],
            'session_timeout_minutes' => (string) $validated['sessionTimeoutMinutes'],
            'maintenance_mode' => $request->boolean('maintenanceMode') ? '1' : '0',
            'mfa_enforced' => $request->boolean('mfaEnforced') ? '1' : '0',
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
