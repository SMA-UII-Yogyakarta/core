<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckTeacherType
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $type): Response
    {
        $user = Auth::user();

        if (! $user || $user->role !== 'teacher') {
            abort(403, 'Hanya guru yang dapat mengakses halaman ini.');
        }

        $teacher = $user->teacher;

        if (! $teacher) {
            abort(403, 'Data guru tidak ditemukan.');
        }

        $allowed = match ($type) {
            'duty' => $teacher->isDuty(),
            'homeroom' => $teacher->isHomeroom(),
            default => false,
        };

        if (! $allowed) {
            abort(403, "Anda tidak memiliki akses sebagai {$type}.");
        }

        return $next($request);
    }
}
