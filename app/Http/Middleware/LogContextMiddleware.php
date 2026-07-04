<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class LogContextMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Menambahkan correlation ID dan konteks request ke semua log
     * yang ditulis selama request berlangsung.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Generate atau ambil correlation ID dari header (untuk frontend/API client)
        $correlationId = $request->header('X-Correlation-ID') ?? (string) Str::uuid();

        // Context global — semua log di request ini otomatis punya ini
        Log::withContext([
            'request_id' => $correlationId,
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => $request->user()?->id,
        ]);

        // Waktu mulai untuk mengukur durasi request
        $start = microtime(true);

        $response = $next($request);

        // Tambah durasi setelah request selesai
        $duration = (microtime(true) - $start) * 1000;
        Log::withContext(['duration_ms' => round($duration, 2)]);

        // Sertakan correlation ID di response header untuk debugging
        $response->headers->set('X-Request-ID', $correlationId);

        return $response;
    }
}
