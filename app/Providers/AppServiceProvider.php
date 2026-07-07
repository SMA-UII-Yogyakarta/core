<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        RateLimiter::for('attendance-checkin', function (Request $request) {
            $key = $request->user()?->id ?: $request->ip();

            return Limit::perMinutes(5, 1)
                ->by('checkin:' . $key)
                ->response(fn() => back()->with('error', 'Anda sudah melakukan presensi. Silakan tunggu 5 menit.'));
        });

        RateLimiter::for('api-attendance-checkin', function (Request $request) {
            $key = $request->user()?->id ?: $request->ip();

            return Limit::perMinutes(5, 1)
                ->by('api-checkin:' . $key)
                ->response(fn() => response()->json([
                    'message' => 'Anda sudah melakukan presensi. Silakan tunggu 5 menit.',
                ], 429));
        });

        RateLimiter::for('api-login', function (Request $request) {
            return Limit::perMinute(5)->by('api-login:' . $request->ip())
                ->response(fn() => response()->json([
                    'message' => 'Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit.',
                ], 429));
        });

        RateLimiter::for('web-login', function (Request $request) {
            return Limit::perMinute(5)->by('web-login:' . $request->ip())
                ->response(fn() => back()->with('error', 'Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit.'));
        });

        RateLimiter::for('leave-request', function (Request $request) {
            $key = $request->user()?->id ?: $request->ip();

            return Limit::perMinutes(5, 3)->by('leave-request:' . $key)
                ->response(fn() => back()->with('error', 'Terlalu banyak pengajuan izin. Silakan tunggu 5 menit.'));
        });
    }
}
