<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('monitoring.{classId}', function (User $user, int $classId) {
    // Allow if user has role admin or teacher
    return $user->hasRole(['admin', 'teacher']);
});

Broadcast::channel('students.{studentId}', function (User $user, int $studentId) {
    // Students can only listen to their own channel
    if ($user->hasRole('student')) {
        $student = $user->student;
        return $student && $student->id === $studentId;
    }

    // Admin and teachers can access all student channels
    return $user->hasRole(['admin', 'teacher']);
});
