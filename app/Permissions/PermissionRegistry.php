<?php

namespace App\Permissions;

use App\Enums\TeacherType;
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
            'monitoring' => ['admin', 'teacher:piket'],
            'master-data' => ['admin'],
            'master-data.*' => ['admin'],
            'class-enrolment' => ['admin'],
            'class-enrolment.*' => ['admin'],
            'settings' => ['admin'],
            'settings.*' => ['admin'],
            'attendance-correction' => ['admin'],

            // Leave
            'leave-requests' => ['admin', 'teacher:piket', 'teacher:wali'],
            'leave-requests.verification' => ['admin', 'teacher:wali'],
            'leave-requests.approve' => ['admin', 'teacher:wali'],
            'leave-requests.reject' => ['admin', 'teacher:wali'],

            // Attendance
            'student.attendance' => ['student'],
            'student.attendance.*' => ['student'], // covers check-in

            // Reports
            'reports.daily' => ['admin', 'teacher:piket', 'teacher:wali'],
            'reports.monthly' => ['admin', 'teacher:wali'],
            'reports.semester' => ['admin', 'teacher:wali'],

            // Export
            'export' => ['admin', 'teacher:piket', 'teacher:wali'],
            'export.*' => ['admin', 'teacher:piket', 'teacher:wali'],

            // Teacher
            'teacher.duty' => ['teacher:piket'],
            'teacher.homeroom' => ['teacher:wali'],

            // Guardian
            'guardian.dashboard' => ['guardian'],
            'guardian.leave-application' => ['guardian'],
            'guardian.history' => ['guardian'],

            // Student
            'student.dashboard' => ['student'],
            'student.history' => ['student'],

            // Auth
            'logout' => ['*'],

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
                    ['key' => 'dashboard-piket',    'label' => 'Dashboard',      'icon' => 'fa-th-large',    'href' => '/teacher/duty',            'roles' => ['teacher:piket']],
                    ['key' => 'dashboard-wali',     'label' => 'Dashboard',      'icon' => 'fa-th-large',    'href' => '/teacher/homeroom',        'roles' => ['teacher:wali']],
                    ['key' => 'dashboard-guardian', 'label' => 'Dashboard',      'icon' => 'fa-th-large',    'href' => '/guardian',                'roles' => ['guardian']],
                    ['key' => 'dashboard-siswa',    'label' => 'Dashboard',      'icon' => 'fa-th-large',    'href' => '/student/dashboard',       'roles' => ['student']],

                    ['key' => 'master-data',        'label' => 'Data Master',       'icon' => 'fa-database',          'href' => '/master-data',          'roles' => ['admin']],
                    ['key' => 'class-enrolment',    'label' => 'Enrolment Kelas',   'icon' => 'fa-chalkboard-teacher','href' => '/class-enrolment',      'roles' => ['admin']],
                    ['key' => 'settings',           'label' => 'Atur Waktu & Libur','icon' => 'fa-clock',             'href' => '/settings',             'roles' => ['admin']],
                    ['key' => 'export',             'label' => 'Laporan Rekap',     'icon' => 'fa-file-alt',          'href' => '/export',               'roles' => ['admin']],

                    ['key' => 'pantauan-izin',      'label' => 'Pantauan Izin',     'icon' => 'fa-file-signature',    'href' => '/leave-requests',       'roles' => ['teacher:piket']],
                    ['key' => 'verifikasi-izin',    'label' => 'Verifikasi Izin',   'icon' => 'fa-check-circle',      'href' => '/leave-requests/verification', 'roles' => ['teacher:wali']],

                    ['key' => 'reports.daily',      'label' => 'Rekap Harian',      'icon' => 'fa-history',           'href' => '/reports/daily',        'roles' => ['teacher:piket', 'teacher:wali']],
                    ['key' => 'reports.monthly',    'label' => 'Rekap Bulanan',     'icon' => 'fa-file-alt',          'href' => '/reports/monthly',      'roles' => ['teacher:wali']],
                    ['key' => 'reports.semester',   'label' => 'Rekap Semester',    'icon' => 'fa-file-alt',          'href' => '/reports/semester',     'roles' => ['teacher:wali']],

                    ['key' => 'guardian.leave-application', 'label' => 'Pengajuan Izin', 'icon' => 'fa-paper-plane', 'href' => '/guardian/leave-application', 'roles' => ['guardian']],
                    ['key' => 'guardian.history',           'label' => 'Riwayat',        'icon' => 'fa-history',      'href' => '/guardian/history',           'roles' => ['guardian']],

                    ['key' => 'student.attendance', 'label' => 'Live Presensi',  'icon' => 'fa-clock',   'href' => '/student/attendance',   'roles' => ['student']],
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
                        $teacherType = $user->teacher->teacher_type;
                        if ($subType === 'both') {
                            return true;
                        }
                        if ($teacherType === $subType) {
                            return true;
                        }
                        if ($teacherType === TeacherType::BOTH->value) {
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
    public static function getNavFor(User $user): array
    {
        $sections = [];
        foreach (self::navSections() as $sectionKey => $section) {
            $sectionRoles = $section['roles'] ?? ['*'];
            $hasAccess = in_array('*', $sectionRoles) ||
                collect($sectionRoles)->contains(fn ($r) => self::roleMatches($user, $r));

            if (! $hasAccess) {
                continue;
            }

            $filteredItems = collect($section['items'])->filter(function ($item) use ($user) {
                $itemRoles = $item['roles'] ?? ['*'];
                return in_array('*', $itemRoles) ||
                    collect($itemRoles)->contains(fn ($r) => self::roleMatches($user, $r));
            })->values()->all();

            if (empty($filteredItems)) {
                continue;
            }

            $sections[] = array_merge($section, ['items' => $filteredItems]);
        }
        return $sections;
    }

    private static function roleMatches(User $user, string $role): bool
    {
        if (str_contains($role, ':')) {
            [$baseRole, $subType] = explode(':', $role);
            if ($user->role !== $baseRole) {
                return false;
            }
            if ($baseRole === 'teacher' && $user->teacher) {
                $teacherType = $user->teacher->teacher_type;
                return $teacherType === $subType || $teacherType === TeacherType::BOTH->value;
            }
            return false;
        }
        return $user->role === $role;
    }
}
