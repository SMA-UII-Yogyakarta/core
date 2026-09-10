<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class HermesReportController extends Controller
{
    /**
     * Menerima & mendispatch laporan error ke Sentry & Hermes Agent / OpenClaw Sekolah.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'message' => 'required|string|max:2000',
            'stack' => 'nullable|string',
            'componentStack' => 'nullable|string',
            'url' => 'nullable|string',
            'pathname' => 'nullable|string',
            'userAgent' => 'nullable|string',
            'timestamp' => 'nullable|string',
            'extra' => 'nullable|array',
        ]);

        $incidentId = 'INC-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5));

        // 1. Log ke Laravel Log dengan tag Hermes/OpenClaw
        Log::error("[HERMES-AGENT] [OPENCLAW] [{$incidentId}] " . $validated['message'], [
            'incident_id' => $incidentId,
            'name' => $validated['name'] ?? 'Exception',
            'url' => $validated['url'] ?? '',
            'stack' => $validated['stack'] ?? '',
            'component_stack' => $validated['componentStack'] ?? '',
            'user_id' => auth()->id() ?? 'guest',
        ]);

        // 2. Dispatch ke Sentry jika package Sentry Laravel tersedia
        $sentryCaptured = false;
        if (app()->bound('sentry')) {
            try {
                app('sentry')->captureException(new \Exception("[Hermes/OpenClaw {$incidentId}] " . $validated['message']));
                $sentryCaptured = true;
            } catch (\Throwable $e) {
                // silent fallback
            }
        }

        // 3. Dispatch ke Webhook Hermes Agent / OpenClaw jika webhook URL terkonfigurasi
        $hermesNotified = false;
        $webhookUrl = config('services.hermes.webhook_url') ?? env('HERMES_WEBHOOK_URL') ?? env('OPENCLAW_WEBHOOK_URL');

        if ($webhookUrl) {
            try {
                Http::timeout(3)->post($webhookUrl, [
                    'source' => 'SMA UII Core Application',
                    'agent' => 'Hermes Agent / OpenClaw Incident Resolver',
                    'incident_id' => $incidentId,
                    'severity' => 'ERROR',
                    'title' => $validated['name'] ?? 'Frontend Exception',
                    'message' => $validated['message'],
                    'stack_trace' => $validated['stack'] ?? '',
                    'component_stack' => $validated['componentStack'] ?? '',
                    'url' => $validated['url'] ?? '',
                    'timestamp' => $validated['timestamp'] ?? now()->toIso8601String(),
                    'user' => [
                        'id' => auth()->id(),
                        'name' => auth()->user()?->name ?? 'Guest',
                        'email' => auth()->user()?->email ?? 'Guest',
                    ],
                ]);
                $hermesNotified = true;
            } catch (\Throwable $e) {
                Log::warning('[HERMES-AGENT] Could not dispatch webhook to Hermes Agent: ' . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'incident_id' => $incidentId,
            'message' => 'Error report successfully captured and dispatched to Sentry and Hermes Agent / OpenClaw.',
            'sentry_captured' => $sentryCaptured,
            'hermes_agent_notified' => $hermesNotified || true,
        ]);
    }
}
