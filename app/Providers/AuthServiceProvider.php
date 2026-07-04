<?php

namespace App\Providers;

use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Policies\AttendancePolicy;
use App\Policies\LeaveRequestPolicy;
use App\Policies\SchoolClassPolicy;
use App\Policies\StudentPolicy;
use App\Policies\TeacherPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Student::class => StudentPolicy::class,
        Teacher::class => TeacherPolicy::class,
        SchoolClass::class => SchoolClassPolicy::class,
        Attendance::class => AttendancePolicy::class,
        LeaveRequest::class => LeaveRequestPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
