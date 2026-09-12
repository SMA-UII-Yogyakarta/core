<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OverviewController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        if (! $user) {
            return redirect()->route('login');
        }

        return match ($user->role) {
            'teacher' => match (session('active_teacher_role')) {
                'duty' => ($user->teacher?->isDuty()) ? redirect()->route('teacher.duty') : redirect()->route('teacher.homeroom'),
                'homeroom' => ($user->teacher?->isHomeroom()) ? redirect()->route('teacher.homeroom') : redirect()->route('teacher.duty'),
                default => $user->teacher?->isHomeroom()
                    ? redirect()->route('teacher.homeroom')
                    : redirect()->route('teacher.duty'),
            },
            'guardian' => redirect()->route('guardian.dashboard', $request->query()),
            'student' => redirect()->route('student.dashboard'),
            default => redirect()->route('dashboard'),
        };
    }
}
