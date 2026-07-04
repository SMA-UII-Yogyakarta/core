<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'create-presensi',
            'view-laporan',
            'manage-user',
            'manage-kelas',
            'approve-izin',
            'manage-presensi',
            'manage-pengaturan',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        $admin = Role::findByName('admin');
        $admin->syncPermissions($permissions);

        $teacher = Role::findByName('teacher');
        $teacher->syncPermissions([
            'create-presensi',
            'view-laporan',
            'approve-izin',
        ]);

        $guardian = Role::findByName('guardian');
        $guardian->syncPermissions(['view-laporan']);

        $student = Role::findByName('student');
        $student->syncPermissions(['create-presensi', 'view-laporan']);
    }
}
