<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\LogContextMiddleware;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Session\TokenMismatchException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        channels: __DIR__ . "/../routes/channels.php",
        api: __DIR__ . "/../routes/api.php",
        web: __DIR__ . "/../routes/web.php",
        commands: __DIR__ . "/../routes/console.php",
        health: "/up",
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Global middleware — semua request
        $middleware->append(LogContextMiddleware::class);

        // Web middleware group
        $middleware->web(append: [HandleInertiaRequests::class]);

        // Alias middleware untuk route role guard
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn(Request $request) => $request->is("api/*"),
        );

        // ── Inertia-specific Exception Rendering ──
        // 404 — Not Found
        $exceptions->renderable(function (
            NotFoundHttpException $e,
            Request $request,
        ) {
            if ($request->inertia()) {
                return redirect()
                    ->back()
                    ->with("error", "Data tidak ditemukan.");
            }
        });

        // 403 — Forbidden / Authorization
        $exceptions->renderable(function (
            AuthorizationException $e,
            Request $request,
        ) {
            if ($request->inertia()) {
                return redirect()
                    ->back()
                    ->with("error", "Anda tidak memiliki izin untuk aksi ini.");
            }
        });

        // 419 — Session Expired (TokenMismatch)
        $exceptions->renderable(function (
            TokenMismatchException $e,
            Request $request,
        ) {
            if ($request->inertia()) {
                return redirect()
                    ->route("login")
                    ->with("error", "Sesi berakhir. Silakan login ulang.");
            }
        });

        // 401 — Unauthenticated
        $exceptions->renderable(function (
            AuthenticationException $e,
            Request $request,
        ) {
            if ($request->inertia()) {
                return redirect()->route("login");
            }

            if ($request->is("api/*")) {
                return response()->json(["message" => "Unauthenticated."], 401);
            }
        });

        // 429 — Rate Limited
        $exceptions->renderable(function (
            ThrottleRequestsException $e,
            Request $request,
        ) {
            if ($request->inertia()) {
                return redirect()
                    ->back()
                    ->with("error", "Terlalu banyak permintaan. Silakan tunggu beberapa saat.");
            }

            if ($request->is("api/*")) {
                return response()->json([
                    "message" => "Terlalu banyak permintaan. Silakan tunggu beberapa saat.",
                ], 429);
            }
        });

        // 500 — Server Error
        $exceptions->renderable(function (
            HttpException $e,
            Request $request,
        ) {
            if ($e->getStatusCode() !== 500) {
                return;
            }

            if ($request->inertia()) {
                return redirect()
                    ->back()
                    ->with("error", "Terjadi kesalahan server. Silakan coba lagi.");
            }

            if ($request->is("api/*")) {
                return response()->json([
                    "message" => "Terjadi kesalahan server.",
                ], 500);
            }
        });
    })
    ->create();
