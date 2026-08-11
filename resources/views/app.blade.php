<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'SMAUII Core') }}</title>

        <link rel="icon" type="image/png" sizes="192x192" href="/images/logo-sma-uii.png">
        <link rel="apple-touch-icon" href="/images/logo-sma-uii.png">

        {{-- Font Awesome 5 Free — via CDN untuk icon di Layouts, Sidebar, Navbar, dan ActionButton --}}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />

        {{-- PWA Manifest --}}
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#2e3391">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="SMART Absen">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body>
        @inertia
    </body>
</html>
