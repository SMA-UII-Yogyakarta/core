<?php

namespace App\Permissions;

use App\Models\User;

class PermissionRegistry
{
    /** @return array<string, string[]> routeKey => allowedRoles */
    public static function routes(): array
    {
        return [
            // Executive
            'overview' => ['*'],
            'dashboard' => ['*'], // redirector

            // Operational
            'monitoring' => ['admin', 'teacher:duty'],
            'master-data' => ['admin'],
            'master-data.*' => ['admin'],
            'class-enrolment' => ['admin'],
            'class-enrolment.*' => ['admin'],
            'guardian-assignment' => ['admin'],
            'guardian-assignment.*' => ['admin'],
            'operational-settings' => ['admin'],
            'operational-settings.*' => ['admin'],
            'settings' => ['admin'],
            'settings.*' => ['admin'],
            'attendance-correction' => ['admin'],

            // Leave
            'leave-requests' => ['admin', 'teacher:duty', 'teacher:homeroom'],
            'leave-requests.verification' => ['admin', 'teacher:homeroom'],
            'leave-requests.approve' => ['admin', 'teacher:homeroom'],
            'leave-requests.reject' => ['admin', 'teacher:homeroom'],
            'leave-requests.bulk-verify' => ['admin', 'teacher:homeroom'],

            // Attendance
            'student.attendance' => ['student'],
            'student.attendance.*' => ['student'], // covers check-in

            // Reports
            'reports.daily' => ['admin', 'teacher:duty', 'teacher:homeroom'],
            'reports.monthly' => ['admin', 'teacher:homeroom'],
            'reports.semester' => ['admin', 'teacher:homeroom'],

            // Export
            'export' => ['admin', 'teacher:duty', 'teacher:homeroom'],
            'export.teachers' => ['admin'],
            'export.*' => ['admin', 'teacher:duty', 'teacher:homeroom'],

            // Teacher
            'teacher.duty' => ['teacher:duty'],
            'teacher.homeroom' => ['teacher:homeroom'],

            // Homeroom Teacher Reports
            'reports' => ['teacher:duty', 'teacher:homeroom'],

            // Guardian
            'guardian.dashboard' => ['guardian'],
            'guardian.leave-application' => ['guardian'],
            'guardian.history' => ['guardian'],

            // Student
            'student.dashboard' => ['student'],
            'student.overview' => ['student'],
            'student.history' => ['student'],

            // Auth
            'logout' => ['*'],

            // Notifications
            'notifications' => ['*'],
            'notifications.*' => ['*'],

            // Profile
            'profile' => ['*'],
            'profile.*' => ['*'], // covers session revoke
        ];
    }

    /** @return array<string, mixed> Nav sections for sidebar */
    public static function navSections(): array
    {
        return [
            'utama' => [
                'key' => 'utama',
                'label' => 'Utama',
                'items' => [
                    ['key' => 'dashboard-admin',    'label' => 'Dashboard',      'icon' => 'fa-th-large',    'href' => '/dashboard',               'roles' => ['admin']],
['key' => 'dashboard-piket',    'label' => 'Overview',       'icon' => 'fa-th-large',    'href' => '/teacher/duty',            'roles' => ['teacher:duty']],
                    ['key' => 'dashboard-wali',     'label' => 'Dasbor',    'icon' => 'fa-th-large',    'href' => '/teacher/homeroom',        'roles' => ['teacher:homeroom'], 'labelKey' => 'nav.dasbor'],
                    ['key' => 'dashboard-guardian', 'label' => 'Overview',       'icon' => 'fa-th-large',    'href' => '/guardian',                'roles' => ['guardian']],
                    ['key' => 'dashboard-siswa',    'label' => 'Overview',       'icon' => 'fa-th-large',    'href' => '/student/dashboard',       'roles' => ['student']],

                    ['key' => 'master-data',        'label' => 'Data Master',       'icon' => 'fa-database',          'href' => '/master-data',          'roles' => ['admin']],
                    ['key' => 'class-enrolment',    'label' => 'Enrolment Kelas',   'icon' => 'fa-chalkboard-teacher','href' => '/class-enrolment',      'roles' => ['admin']],
                    ['key' => 'guardian-assignment','label' => 'Relasi Wali Murid', 'icon' => 'fa-users-cog',        'href' => '/guardian-assignment',  'roles' => ['admin']],
                    ['key' => 'operational-settings','label' => 'Atur Waktu & Libur','icon' => 'fa-clock',             'href' => '/operational-settings', 'roles' => ['admin']],
                    ['key' => 'export',             'label' => 'Laporan Rekap',     'icon' => 'fa-file-alt',          'href' => '/export',               'roles' => ['admin', 'teacher:duty']],

['key' => 'pantauan-izin',      'label' => 'Pantauan Izin',     'icon' => 'fa-file-signature',    'href' => '/leave-requests',       'roles' => ['teacher:duty']],
                    ['key' => 'verifikasi-izin',    'label' => 'Verifikasi Izin',   'icon' => 'fa-check-circle',      'href' => '/leave-requests/verification', 'roles' => ['teacher:homeroom'], 'badge' => 'pendingLeaveCount', 'labelKey' => 'nav.verifikasiIzin'],

                    ['key' => 'reports',            'label' => 'Laporan Rekap',     'icon' => 'fa-file-alt',          'href' => '/reports',              'roles' => ['teacher:homeroom'], 'labelKey' => 'nav.laporanRekap'],
                    ['key' => 'reports.daily',      'label' => 'Rekap Harian',      'icon' => 'fa-history',           'href' => '/reports?tab=daily',    'roles' => ['teacher:duty']],

                    ['key' => 'guardian.leave-application', 'label' => 'Pengajuan Izin', 'icon' => 'fa-paper-plane', 'href' => '/guardian/leave-application', 'roles' => ['guardian']],
                    ['key' => 'guardian.history',           'label' => 'Riwayat',        'icon' => 'fa-history',      'href' => '/guardian/history',           'roles' => ['guardian']],

                    ['key' => 'student.attendance', 'label' => 'Live Presensi',  'icon' => 'fa-camera', 'href' => '/student/attendance',   'roles' => ['student']],
                    ['key' => 'student.history',    'label' => 'Riwayat',        'icon' => 'fa-history', 'href' => '/student/history',      'roles' => ['student']],
                ],
            ],
        ];
    }

    public static function can(User $user, string $routeKey): bool
    {
        $allowed = self::routes()[$routeKey] ?? null;

        if ($allowed === null) {
            foreach (self::routes() as $key => $roles) {
                if (str_ends_with($key, '.*') && str_starts_with($routeKey, substr($key, 0, -1))) {
                    $allowed = $roles;
                    break;
                }
            }
        }

        $allowed ??= [];
        if (in_array('*', $allowed)) {
            return true;
        }

        foreach ($allowed as $role) {
            if (str_contains($role, ':')) {
                [$baseRole, $subType] = explode(':', $role);
                if ($user->role === $baseRole) {
                    if ($baseRole === 'teacher' && $user->teacher) {
                        if ($subType === 'both') {
                            return true;
                        }
                        if ($subType === 'homeroom' && $user->teacher->isHomeroom()) {
                            return true;
                        }
                        if ($subType === 'duty' && $user->teacher->isDuty()) {
                            return true;
                        }
                    }
                }
            } elseif ($user->role === $role) {
                return true;
            }
        }
        return false;
    }

    /** @return list<array<string, mixed>> */
    public static function getNavFor(User $user, ?string $activeTeacherRole = null): array
    {
        $sections = [];
        foreach (self::navSections() as $sectionKey => $section) {
            $sectionRoles = $section['roles'] ?? ['*'];
            $hasAccess = in_array('*', $sectionRoles) ||
                collect($sectionRoles)->contains(fn ($r) => self::roleMatches($user, $r, $activeTeacherRole));

            if (! $hasAccess) {
                continue;
            }

            $filteredItems = collect($section['items'])->filter(function ($item) use ($user, $activeTeacherRole) {
                $itemRoles = $item['roles'] ?? ['*'];
                return in_array('*', $itemRoles) ||
                    collect($itemRoles)->contains(fn ($r) => self::roleMatches($user, $r, $activeTeacherRole));
            })->values()->all();

            if (empty($filteredItems)) {
                continue;
            }

            $sections[] = array_merge($section, ['items' => $filteredItems]);
        }
        return $sections;
    }

    private static function roleMatches(User $user, string $role, ?string $activeTeacherRole = null): bool
    {
        if (str_contains($role, ':')) {
            [$baseRole, $subType] = explode(':', $role);
            if ($user->role !== $baseRole) {
                return false;
            }
            if ($baseRole === 'teacher' && $user->teacher) {
                if ($activeTeacherRole) {
                    return $subType === $activeTeacherRole;
                }
                if ($subType === 'homeroom') {
                    return $user->teacher->isHomeroom();
                }
                if ($subType === 'duty') {
                    return $user->teacher->isDuty();
                }
                return true;
            }
            return false;
        }
        return $user->role === $role;
    }
}
