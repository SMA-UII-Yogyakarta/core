<?php

namespace Tests\Feature\Web;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
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

    public function test_admin_can_import_students_via_csv(): void
    {
        $csvContent = "nis,nisn,name,class,birth_date,phone,address,enrollment_year,email\n999111,00999111,Siswa Import Test,,2009-01-01,08123456789,Jl. Test No. 1,2024,testimport@siswa.smauii.sch.id\n";
        $file = UploadedFile::fake()->createWithContent('students.csv', $csvContent);

        $response = $this->actingAs($this->admin)->post(route('master-data.import', ['entity' => 'students']), [
            'file' => $file,
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['success_count', 'error_count', 'errors', 'success']);
        $this->assertDatabaseHas('students', ['nis' => '999111', 'name' => 'Siswa Import Test']);
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
