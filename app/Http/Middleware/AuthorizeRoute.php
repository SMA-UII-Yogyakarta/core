<?php

namespace App\Http\Middleware;

use App\Permissions\PermissionRegistry;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthorizeRoute
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
                'errors' => null,
                'data' => null,
            ], 401);
        }

        // Get route key from current route name
        $routeName = $request->route()?->getName();
        if (! $routeName) {
            return $next($request); // Allow if no named route
        }

        // Strip .index, .store, etc suffixes for permission check
        $routeKey = $this->normalizeRouteKey($routeName);

        if (! PermissionRegistry::can($user, $routeKey)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses ke halaman ini.',
                    'errors' => null,
                    'data' => null,
                ], 403);
            }

            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        return $next($request);
    }

    private function normalizeRouteKey(string $routeName): string
    {
        // Remove HTTP verb suffixes and common CRUD suffixes.
        // approve/reject are intentionally kept so leave-requests can
        // grant read access (e.g. guru piket) without verification rights.
        return preg_replace('/\.(index|create|store|show|edit|update|destroy|verify)$/', '', $routeName);
    }
}
