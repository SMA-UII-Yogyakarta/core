<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class SessionService
{
    public function refresh(Request $request): string
    {
        $user = $request->user();
        $currentToken = $request->user()->currentAccessToken();
        $deviceName = $currentToken->name;

        $currentToken->delete();

        $expiration = config('sanctum.expiration')
            ? Carbon::now()->addMinutes(config('sanctum.expiration'))
            : null;

        return $user->createToken($deviceName, ['*'], $expiration)->plainTextToken;
    }

    public function listSessions(User $user): array
    {
        return $user->tokens()
            ->orderBy('last_used_at', 'desc')
            ->get()
            ->map(fn (PersonalAccessToken $token) => [
                'id' => $token->id,
                'device_name' => $token->name,
                'created_at' => $token->created_at->toIso8601String(),
                'last_used_at' => $token->last_used_at?->toIso8601String(),
                'expires_at' => $token->expires_at?->toIso8601String(),
                'is_current' => $token->id === $request?->user()?->currentAccessToken()?->id,
            ])
            ->toArray();
    }

    public function revokeSession(User $user, int $tokenId): bool
    {
        $token = $user->tokens()->find($tokenId);

        if (! $token) {
            return false;
        }

        return $token->delete();
    }

    public function revokeAllExcept(User $user, int $exceptTokenId): int
    {
        return $user->tokens()
            ->where('id', '!=', $exceptTokenId)
            ->delete();
    }
}
