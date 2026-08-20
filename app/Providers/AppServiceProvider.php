<?php

namespace App\Providers;

use App\Helpers\ApiResponse;
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
                ->response(fn () => back()->with('error', 'You have already recorded attendance. Please wait 5 minutes.'));
        });

        RateLimiter::for('api-attendance-checkin', function (Request $request) {
            $key = $request->user()?->id ?: $request->ip();

            return Limit::perMinutes(5, 1)
                ->by('api-checkin:' . $key)
                ->response(fn (Request $request, array $headers) => ApiResponse::error(
                    'You have already recorded attendance. Please wait 5 minutes.',
                    429,
                )->withHeaders($headers));
        });

        RateLimiter::for('api-login', function (Request $request) {
            return Limit::perMinute(5)->by('api-login:' . $request->ip())
                ->response(fn (Request $request, array $headers) => ApiResponse::error(
                    'Too many login attempts. Please try again in 1 minute.',
                    429,
                )->withHeaders($headers));
        });

        RateLimiter::for('web-login', function (Request $request) {
            if (app()->environment(['local', 'testing'])) {
                return Limit::none();
            }

            return Limit::perMinute(5)->by('web-login:' . $request->ip())
                ->response(fn () => back()->with('error', 'Too many login attempts. Please try again in 1 minute.'));
        });

        RateLimiter::for('api-refresh', function (Request $request) {
            $key = $request->user()?->id ?: $request->ip();

            return Limit::perMinute(3)->by('api-refresh:' . $key)
                ->response(fn (Request $request, array $headers) => ApiResponse::error(
                    'Too many refresh attempts. Please try again in 1 minute.',
                    429,
                )->withHeaders($headers));
        });

        RateLimiter::for('leave-request', function (Request $request) {
            $key = $request->user()?->id ?: $request->ip();

            return Limit::perMinutes(5, 3)->by('leave-request:' . $key)
                ->response(fn () => back()->with('error', 'Too many leave requests. Please wait 5 minutes.'));
        });

        RateLimiter::for('api-leave-request', function (Request $request) {
            $key = $request->user()?->id ?: $request->ip();

            return Limit::perMinutes(5, 3)->by('api-leave-request:' . $key)
                ->response(fn (Request $request, array $headers) => ApiResponse::error(
                    'Too many leave requests. Please wait 5 minutes.',
                    429,
                )->withHeaders($headers));
        });

        RateLimiter::for('api', function (Request $request) {
            $key = $request->user()?->id ?: $request->ip();

            return Limit::perMinute(120)->by('api:' . $key);
        });
    }
}
