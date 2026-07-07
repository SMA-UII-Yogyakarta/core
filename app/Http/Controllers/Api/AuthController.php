<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SessionService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        protected SessionService $sessionService,
    ) {
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
            'device_name' => 'nullable|string',
        ]);

        $user = \App\Models\User::where('username', $request->username)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Username atau password salah.'],
            ]);
        }

        $expiration = config('sanctum.expiration')
            ? Carbon::now()->addMinutes(config('sanctum.expiration'))
            : null;

        $token = $user->createToken(
            $request->device_name ?? 'sanctum-token',
            ['*'],
            $expiration,
        )->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user->load(['student', 'teacher', 'guardian']),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Berhasil logout.']);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->load(['student', 'teacher', 'guardian']),
        );
    }

    public function refresh(Request $request): JsonResponse
    {
        $newToken = $this->sessionService->refresh($request);

        return response()->json([
            'token' => $newToken,
            'message' => 'Token refreshed.',
        ]);
    }

    public function sessions(Request $request): JsonResponse
    {
        $currentTokenId = $request->user()->currentAccessToken()->id;

        $sessions = $request->user()
            ->tokens()
            ->orderBy('last_used_at', 'desc')
            ->get()
            ->map(fn ($token) => [
                'id' => $token->id,
                'device_name' => $token->name,
                'created_at' => $token->created_at->toIso8601String(),
                'last_used_at' => $token->last_used_at?->toIso8601String(),
                'expires_at' => $token->expires_at?->toIso8601String(),
                'is_current' => $token->id === $currentTokenId,
            ]);

        return response()->json(['sessions' => $sessions]);
    }

    public function revokeSession(Request $request, int $id): JsonResponse
    {
        $deleted = $this->sessionService->revokeSession($request->user(), $id);

        if (! $deleted) {
            return response()->json(['message' => 'Session not found.'], 404);
        }

        return response()->json(['message' => 'Session revoked.']);
    }
}
