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
            'teacher' => $user->teacher?->isWaliKelas()
                ? redirect()->route('teacher.homeroom')
                : redirect()->route('teacher.duty'),
            'guardian' => redirect()->route('guardian.dashboard', $request->query()),
            'student' => redirect()->route('student.dashboard'),
            default => redirect()->route('dashboard'),
        };
    }
}
