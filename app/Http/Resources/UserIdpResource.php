<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\User
 */
class UserIdpResource extends JsonResource
{
    /**
     * Transform the resource into an array for Identity Provider (IdP) SSO.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $role = (string) $this->role;
        $persona = null;

        if ($role === 'student' && $this->relationLoaded('student') && $this->student) {
            $student = $this->student;
            $persona = [
                'student_id' => $student->id,
                'nis' => $student->nis,
                'nisn' => $student->nisn,
                'class_id' => $student->class_id,
                'class_name' => $student->class?->name,
            ];
        } elseif ($role === 'teacher' && $this->relationLoaded('teacher') && $this->teacher) {
            $teacher = $this->teacher;
            $teacherType = (string) ($teacher->teacher_type ?? 'guru');
            $schoolClass = $teacher->relationLoaded('schoolClasses') ? $teacher->schoolClasses->first() : null;

            $persona = [
                'teacher_id' => $teacher->id,
                'code' => $teacher->teacher_code,
                'teacher_type' => $teacherType,
                'is_duty' => $teacher->isDuty(),
                'is_homeroom' => $teacher->isHomeroom(),
                'is_piket' => $teacher->isDuty(),
                'is_wali' => $teacher->isHomeroom(),
                'class_id' => $schoolClass?->id,
                'class_name' => $schoolClass?->name,
            ];
        } elseif ($role === 'guardian' && $this->relationLoaded('guardian') && $this->guardian) {
            $guardian = $this->guardian;
            $linkedStudents = $guardian->relationLoaded('students')
                ? $guardian->students->map(fn ($std) => [
                    'student_id' => $std->id,
                    'name' => $std->name,
                    'nis' => $std->nis,
                    'class_name' => $std->class?->name,
                ])->toArray()
                : [];

            $persona = [
                'guardian_id' => $guardian->id,
                'phone' => $guardian->phone,
                'linked_students' => $linkedStudents,
            ];
        }

        return [
            'id' => $this->id,
            'username' => $this->username,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $role,
            'persona' => $persona,
        ];
    }
}
