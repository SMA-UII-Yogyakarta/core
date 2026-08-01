<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

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
