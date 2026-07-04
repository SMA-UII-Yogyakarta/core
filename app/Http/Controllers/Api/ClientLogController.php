<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ClientLogController extends Controller
{
    /**
     * Menerima log error dari frontend (React/Inertia).
     *
     * Frontend mengirim error logs ke endpoint ini di production
     * agar error client-side bisa dimonitor.
     *
     * @see resources/js/utils/logger.ts
     */
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'level' => 'required|in:debug,info,warn,error',
            'message' => 'required|string|max:500',
            'context' => 'nullable|array',
        ]);

        $level = match ($data['level']) {
            'warn' => 'warning',
            default => $data['level'],
        };

        // Gunakan level yang sesuai
        Log::{$level}('[CLIENT] ' . $data['message'], $data['context'] ?? []);

        return response()->json(['success' => true]);
    }
}
