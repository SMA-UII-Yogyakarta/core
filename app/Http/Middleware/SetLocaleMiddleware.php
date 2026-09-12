<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocaleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $acceptLanguage = $request->header('Accept-Language');

        $candidate = $request->header('X-Locale')
            ?: $request->cookie('app_locale')
            ?: ($request->hasSession() ? $request->session()->get('locale') : null)
            ?: ($acceptLanguage ? $request->getPreferredLanguage(['id', 'en']) : null);

        $defaultLocale = \App\Models\AppSetting::get('default_locale', config('app.locale', 'id'));
        $locale = in_array($candidate, ['id', 'en'], true) ? $candidate : $defaultLocale;

        if (! in_array($locale, ['id', 'en'], true)) {
            $locale = 'id';
        }

        App::setLocale($locale);

        if ($request->hasSession() && $request->session()->get('locale') !== $locale) {
            $request->session()->put('locale', $locale);
        }

        return $next($request);
    }
}
