<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class InitSeeder extends Seeder
{
    public function run(): void
    {
        $roles = ['admin', 'student', 'teacher', 'guardian'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        $this->call([RolePermissionSeeder::class]);

        $user = User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Administrator Utama',
                'email' => 'admin@smauii.sch.id',
                'role' => 'admin',
                'password' => bcrypt('password'),
            ],
        );
        $user->assignRole('admin');

        // Buat akun Hanif dan Mahfud sebagai admin
        $hanif = User::updateOrCreate(
            ['username' => 'hanif'],
            [
                'name' => 'Hanif',
                'email' => 'hanif@smauii.sch.id',
                'role' => 'admin',
                'password' => bcrypt('password'),
            ],
        );
        $hanif->assignRole('admin');

        $mahfud = User::updateOrCreate(
            ['username' => 'mahfud'],
            [
                'name' => 'Bpk. Mahfud',
                'email' => 'mahfud@smauii.sch.id',
                'role' => 'admin',
                'password' => bcrypt('password'),
            ],
        );
        $mahfud->assignRole('admin');
    }
}
