<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::factory()->create([
            'username' => 'admin',
            'name' => 'Administrator',
            'email' => 'admin@smauii.sch.id',
            'role' => 'admin',
        ]);

        // Roles
        $roles = ['admin', 'siswa', 'guru', 'walimurid'];
        foreach ($roles as $role) {
            Role::create(['name' => $role]);
        }

        // Default jam presensi
        \App\Models\PengaturanJamPresensi::factory()->create();
    }
}
