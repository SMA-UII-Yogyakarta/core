<?php

namespace Tests\Feature\Web;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExportPageTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_export_index_renders_with_default_preview(): void
    {
        SchoolClass::factory()->create(['name' => 'X-A']);

        $this->actingAs($this->admin())
            ->get('/export')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Reports/Export')
                ->has('classes')
                ->has('preview')
                ->where('selectedPeriod', 'bulanan')
                ->where('selectedClassId', null));
    }

    public function test_export_index_accepts_period_filters(): void
    {
        $class = SchoolClass::factory()->create(['name' => 'X-B']);
        Student::factory()->create([
            'class_id' => $class->id,
            'user_id' => User::factory()->create(['role' => 'student'])->id,
        ]);

        $this->actingAs($this->admin())
            ->get('/export?period=harian&date=2026-01-05&class_id=' . $class->id)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Reports/Export')
                ->where('selectedPeriod', 'harian')
                ->where('selectedDate', '2026-01-05')
                ->where('selectedClassId', $class->id));

        $this->actingAs($this->admin())
            ->get('/export?period=semester&semester=2&year=2026')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Reports/Export')
                ->where('selectedPeriod', 'semester')
                ->where('selectedSemester', 2)
                ->where('selectedYear', 2026));
    }

    public function test_semester_recap_excel_download(): void
    {
        SchoolClass::factory()->create();

        $this->actingAs($this->admin())
            ->get('/export/semester-recap?semester=1&year=2026')
            ->assertOk();
    }

    public function test_semester_recap_pdf_download(): void
    {
        SchoolClass::factory()->create();

        $this->actingAs($this->admin())
            ->get('/export/semester-recap-pdf?semester=1&year=2026')
            ->assertOk();
    }

    public function test_daily_and_monthly_recap_pdf_download(): void
    {
        SchoolClass::factory()->create();

        $this->actingAs($this->admin())
            ->get('/export/daily-recap-pdf?date=2026-01-05')
            ->assertOk();

        $this->actingAs($this->admin())
            ->get('/export/monthly-recap-pdf?month=1&year=2026')
            ->assertOk();
    }
}
