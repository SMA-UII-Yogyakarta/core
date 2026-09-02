<?php

namespace Tests\Feature\Web;

use App\Models\SchoolClass;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ImportWebTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    public function test_admin_can_download_import_templates(): void
    {
        foreach (['students', 'teachers', 'classes', 'guardians'] as $entity) {
            $response = $this->actingAs($this->admin)->get(route('master-data.import.template', ['entity' => $entity]));
            $response->assertOk();
            $response->assertHeader('Content-Disposition', "attachment; filename=template_import_{$entity}.csv");
        }
    }

    public function test_admin_can_import_students_via_csv_with_custom_password(): void
    {
        $csvContent = "nis,nisn,name,class,birth_date,phone,address,enrollment_year,email,password\n999111,00999111,Siswa Import Test,,2009-01-01,08123456789,Jl. Test No. 1,2024,testimport@siswa.smauii.sch.id,CustomPass123\n";
        $file = UploadedFile::fake()->createWithContent('students.csv', $csvContent);

        $response = $this->actingAs($this->admin)->post(route('master-data.import', ['entity' => 'students']), [
            'file' => $file,
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['success_count', 'error_count', 'errors', 'success']);
        $this->assertDatabaseHas('students', ['nis' => '999111', 'name' => 'Siswa Import Test']);

        $user = User::where('username', '999111')->first();
        $this->assertNotNull($user);
        $this->assertTrue(Hash::check('CustomPass123', $user->password));
    }

    public function test_admin_can_import_students_with_default_password_fallback(): void
    {
        $csvContent = "nis,nisn,name,class,birth_date,phone,address,enrollment_year,email,password\n999222,00999222,Siswa Fallback Test,,2009-01-01,08123456789,Jl. Test No. 2,2024,testfallback@siswa.smauii.sch.id,\n";
        $file = UploadedFile::fake()->createWithContent('students.csv', $csvContent);

        $response = $this->actingAs($this->admin)->post(route('master-data.import', ['entity' => 'students']), [
            'file' => $file,
            'default_password' => 'FallbackPass456',
        ]);

        $response->assertOk();
        $user = User::where('username', '999222')->first();
        $this->assertNotNull($user);
        $this->assertTrue(Hash::check('FallbackPass456', $user->password));
    }

    public function test_admin_can_import_teachers_with_roles_and_passwords(): void
    {
        $csvContent = "teacher_code,name,email,teacher_type,password\nTCH-901,Guru Wali Saja,guruwali@smauii.sch.id,wali,GuruWaliPass123\nTCH-902,Guru Piket Saja,gurupiket@smauii.sch.id,piket,GuruPiketPass123\nTCH-903,Guru Dual Role,gurudual@smauii.sch.id,both,GuruDualPass123\n";
        $file = UploadedFile::fake()->createWithContent('teachers.csv', $csvContent);

        $response = $this->actingAs($this->admin)->post(route('master-data.import', ['entity' => 'teachers']), [
            'file' => $file,
        ]);

        $response->assertOk();

        $t1 = Teacher::where('teacher_code', 'TCH-901')->first();
        $this->assertNotNull($t1);
        $this->assertTrue($t1->isHomeroom());
        $this->assertFalse($t1->isDuty());
        $this->assertTrue(Hash::check('GuruWaliPass123', $t1->user->password));

        $t2 = Teacher::where('teacher_code', 'TCH-902')->first();
        $this->assertNotNull($t2);
        $this->assertTrue($t2->isDuty());
        $this->assertFalse($t2->isHomeroom());

        $t3 = Teacher::where('teacher_code', 'TCH-903')->first();
        $this->assertNotNull($t3);
        $this->assertTrue($t3->isHomeroom());
        $this->assertTrue($t3->isDuty());
    }

    public function test_admin_can_import_classes_with_same_name_different_academic_years(): void
    {
        $csvContent = "name,level,academic_year,capacity,teacher_code\nX-A,X,2024/2025,36,\nX-A,X,2025/2026,36,\n";
        $file = UploadedFile::fake()->createWithContent('classes.csv', $csvContent);

        $response = $this->actingAs($this->admin)->post(route('master-data.import', ['entity' => 'classes']), [
            'file' => $file,
        ]);

        $response->assertOk();
        $this->assertEquals(2, SchoolClass::where('name', 'X-A')->count());
        $this->assertDatabaseHas('school_classes', ['name' => 'X-A', 'academic_year' => '2024/2025']);
        $this->assertDatabaseHas('school_classes', ['name' => 'X-A', 'academic_year' => '2025/2026']);
    }

    public function test_non_admin_cannot_access_import(): void
    {
        $studentUser = User::factory()->create(['role' => 'student']);
        $file = UploadedFile::fake()->create('test.csv', 10);

        $response = $this->actingAs($studentUser)->post(route('master-data.import', ['entity' => 'students']), [
            'file' => $file,
        ]);

        $response->assertForbidden();
    }
}
