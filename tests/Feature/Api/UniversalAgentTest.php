<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class UniversalAgentTest extends TestCase
{
    use RefreshDatabase;

    public function test_agent_report_error_logs_and_returns_clean_response(): void
    {
        Log::spy();
        Http::fake([
            'http://localhost:18789*' => Http::response(['status' => 'acknowledged'], 200),
        ]);

        $payload = [
            'name' => 'TypeError',
            'message' => 'Cannot read properties of undefined',
            'stack' => 'TypeError: Cannot read properties...',
            'componentStack' => 'in Component at ...',
            'url' => 'http://localhost/dashboard',
        ];

        $response = $this->postJson('/api/v1/agent/report-error', $payload);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('agent_notified', true)
            ->assertJsonStructure([
                'success',
                'incident_id',
                'message',
                'sentry_captured',
                'agent_notified',
                'agent_status',
            ]);
    }

    public function test_agent_report_error_handles_upstream_failure_honestly(): void
    {
        Log::spy();
        Http::fake([
            'http://localhost:18789*' => Http::response(['error' => 'server error'], 500),
        ]);

        $payload = [
            'name' => 'CrashError',
            'message' => 'Internal server error simulated',
        ];

        $response = $this->postJson('/api/v1/agent/report-error', $payload);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('agent_notified', false);
    }

    public function test_agent_ping_returns_status(): void
    {
        Http::fake([
            'http://localhost:18789*' => Http::response('OpenClaw Agent Ready', 200),
        ]);

        $response = $this->postJson('/api/v1/agent/ping', [
            'url' => 'http://localhost:18789/ping',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('detected_agent', 'OpenClaw AI Control Engine');
    }

    public function test_legacy_ai_agent_aliases_are_removed(): void
    {
        $this->postJson('/api/v1/hermes/report-error', ['message' => 'test'])
            ->assertNotFound();

        $this->postJson('/api/v1/openclaw/report-error', ['message' => 'test'])
            ->assertNotFound();
    }
}
