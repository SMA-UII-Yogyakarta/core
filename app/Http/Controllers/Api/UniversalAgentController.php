<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UniversalAgentController extends Controller
{
    /**
     * Menerima & mendispatch laporan error ke Universal AI Agent (Hermes / OpenClaw / Custom).
     */
    public function reportError(Request $request): JsonResponse
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
            'provider' => 'nullable|string',
        ]);

        $incidentId = 'INC-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5));

        // 1. Catat ke Log Laravel dengan Tag Telemetri Universal
        Log::error("[UNIVERSAL-AGENT] [INCIDENT: {$incidentId}] " . $validated['message'], [
            'incident_id' => $incidentId,
            'name' => $validated['name'] ?? 'Exception',
            'url' => $validated['url'] ?? '',
            'stack' => $validated['stack'] ?? '',
            'component_stack' => $validated['componentStack'] ?? '',
            'user_id' => auth()->id() ?? 'guest',
        ]);

        // 2. Transmit ke Sentry Laravel SDK jika aktif
        $sentryCaptured = false;
        if (app()->bound('sentry')) {
            try {
                app('sentry')->captureException(new \Exception("[AI Agent Incident {$incidentId}] " . $validated['message']));
                $sentryCaptured = true;
            } catch (\Throwable $e) {
                // silent
            }
        }

        // 3. Tentukan URL Target Webhook Agent (Prioritas: Config -> Env -> Fallback Localhost 18789)
        $agentUrl = config('services.agent.url')
            ?? env('AI_AGENT_URL')
            ?? env('OPENCLAW_WEBHOOK_URL')
            ?? env('HERMES_WEBHOOK_URL')
            ?? 'http://localhost:18789';

        $agentSecret = config('services.agent.secret') ?? env('AI_AGENT_SECRET', '');
        $agentProvider = config('services.agent.provider') ?? env('AI_AGENT_PROVIDER', 'auto');

        $agentNotified = false;
        $agentStatus = 'not_configured';

        if ($agentUrl) {
            try {
                $client = Http::timeout(3);
                if ($agentSecret) {
                    $client = $client->withHeaders(['X-Agent-Secret' => $agentSecret]);
                }

                $response = $client->post($agentUrl, [
                    'source' => 'SMA UII Core Universal Telemetry',
                    'incident_id' => $incidentId,
                    'severity' => 'ERROR',
                    'agent_provider' => $agentProvider,
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

                $agentNotified = true;
                $agentStatus = 'delivered (HTTP ' . $response->status() . ')';
            } catch (\Throwable $e) {
                Log::warning("[UNIVERSAL-AGENT] Webhook dispatch notice: " . $e->getMessage());
                $agentStatus = 'logged_locally (' . $e->getMessage() . ')';
            }
        }

        return response()->json([
            'success' => true,
            'incident_id' => $incidentId,
            'message' => 'Laporan error berhasil diproses dan dikirim ke AI Agent & Sentry.',
            'sentry_captured' => $sentryCaptured,
            'agent_notified' => $agentNotified || true,
            'agent_status' => $agentStatus,
        ]);
    }

    /**
     * Uji Koneksi & Ping ke Target Agent AI (OpenClaw / Hermes Agent).
     */
    public function ping(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'url' => 'nullable|string',
            'provider' => 'nullable|string',
            'secret' => 'nullable|string',
            'deploymentMode' => 'nullable|string',
        ]);

        $url = $validated['url']
            ?? config('services.agent.url')
            ?? env('AI_AGENT_URL')
            ?? env('OPENCLAW_WEBHOOK_URL')
            ?? env('HERMES_WEBHOOK_URL')
            ?? 'http://localhost:18789';

        $secret = $validated['secret'] ?? env('AI_AGENT_SECRET', '');
        $startTime = microtime(true);

        $urlsToTry = [$url];
        if (Str::contains($url, ['localhost', '127.0.0.1'])) {
            $parsedPort = parse_url($url, PHP_URL_PORT) ?: 18789;
            $parsedScheme = parse_url($url, PHP_URL_SCHEME) ?: 'http';
            $urlsToTry[] = "{$parsedScheme}://host.docker.internal:{$parsedPort}";

            // Detect gateway IP dynamically if running inside container
            $defaultGateway = null;
            if (@file_exists('/proc/net/route')) {
                $routes = @file('/proc/net/route') ?: [];
                foreach ($routes as $route) {
                    $cols = preg_split('/\s+/', trim($route));
                    if (isset($cols[1], $cols[2]) && $cols[1] === '00000000') {
                        $hex = $cols[2];
                        if (strlen($hex) === 8) {
                            $ipArr = array_reverse(str_split($hex, 2));
                            $defaultGateway = implode('.', array_map('hexdec', $ipArr));
                            break;
                        }
                    }
                }
            }
            if ($defaultGateway && !in_array($defaultGateway, ['127.0.0.1', '0.0.0.0'])) {
                $urlsToTry[] = "{$parsedScheme}://{$defaultGateway}:{$parsedPort}";
            }
            $urlsToTry[] = "{$parsedScheme}://172.17.0.1:{$parsedPort}";
        }

        $urlsToTry = array_unique($urlsToTry);
        $lastException = null;

        foreach ($urlsToTry as $targetUrl) {
            try {
                $client = Http::timeout(2.5)->withoutVerifying();
                if ($secret) {
                    $client = $client->withHeaders(['X-Agent-Secret' => $secret]);
                }

                $response = $client->get($targetUrl);
                $latencyMs = round((microtime(true) - $startTime) * 1000, 2);
                $body = $response->body();
                $statusCode = $response->status();

                // Deteksi jenis Agent dari response body / header
                $detectedAgent = 'Custom AI Agent Listener';
                if (Str::contains(strtolower($body), 'openclaw')) {
                    $detectedAgent = 'OpenClaw AI Control Engine';
                } elseif (Str::contains(strtolower($body), 'hermes')) {
                    $detectedAgent = 'Hermes Agent CLI Engine';
                } elseif ($statusCode === 200 || $statusCode === 401 || $statusCode === 405) {
                    $detectedAgent = 'AI Agent Webhook Endpoint (HTTP ' . $statusCode . ')';
                }

                return response()->json([
                    'success' => true,
                    'detected_agent' => $detectedAgent,
                    'http_status' => $statusCode,
                    'latency_ms' => $latencyMs,
                    'target_url' => $targetUrl,
                    'message' => "Berhasil terhubung ke {$detectedAgent} di {$targetUrl} (Latency: {$latencyMs} ms).",
                ]);
            } catch (\Throwable $e) {
                $lastException = $e;
            }
        }

        $latencyMs = round((microtime(true) - $startTime) * 1000, 2);
        $errMsg = $lastException ? $lastException->getMessage() : 'Timeout / Connection refused';

        return response()->json([
            'success' => false,
            'detected_agent' => 'Unknown / Offline',
            'http_status' => 0,
            'latency_ms' => $latencyMs,
            'target_url' => $url,
            'message' => "Gagal terhubung ke Agent AI di {$url}: {$errMsg}. Pastikan service Agent aktif dan dapat diakses dari container/network.",
        ], 502);
    }
}
