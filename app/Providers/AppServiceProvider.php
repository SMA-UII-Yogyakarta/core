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
    }
}
