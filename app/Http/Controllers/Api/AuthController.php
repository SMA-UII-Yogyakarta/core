<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserIdpResource;
use App\Models\User;
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

        $user = User::where('username', $request->username)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Incorrect username or password.'],
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

        $user->load(['student.class', 'teacher.schoolClasses', 'guardian.students.class']);

        return response()->json([
            'token' => $token,
            'expires_at' => $expiration?->toIso8601String(),
            'user' => new UserIdpResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['student.class', 'teacher.schoolClasses', 'guardian.students.class']);

        return response()->json([
            'data' => new UserIdpResource($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return $this->user($request);
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
