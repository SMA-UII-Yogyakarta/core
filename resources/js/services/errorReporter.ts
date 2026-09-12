import * as Sentry from "@sentry/react";

export interface ErrorReportPayload {
    name: string;
    message: string;
    stack?: string;
    componentStack?: string;
    url: string;
    pathname: string;
    userAgent: string;
    timestamp: string;
    extra?: Record<string, unknown>;
}

export interface AgentReportResponse {
    success: boolean;
    incident_id?: string;
    message?: string;
    sentry_captured?: boolean;
    agent_notified?: boolean;
    agent_status?: string;
}

export interface AgentPingResponse {
    success: boolean;
    detected_agent: string;
    http_status: number;
    latency_ms: number;
    target_url: string;
    message: string;
}

let isSentryInitialized = false;

/**
 * Inisialisasi Sentry SDK di frontend.
 */
export function initSentry(): void {
    if (isSentryInitialized) return;

    const dsn = import.meta.env.VITE_SENTRY_DSN || "";
    if (dsn) {
        try {
            Sentry.init({
                dsn,
                environment: import.meta.env.MODE || "development",
                tracesSampleRate: 1.0,
            });
            isSentryInitialized = true;
            console.info("[Sentry] Frontend Sentry initialized successfully.");
        } catch (e) {
            console.warn("[Sentry] Failed to initialize Sentry:", e);
        }
    }
}

/**
 * Laporkan error ke Sentry.
 */
export function captureSentryException(error: Error, extraInfo?: Record<string, unknown>): void {
    initSentry();
    try {
        Sentry.captureException(error, {
            extra: {
                url: typeof window !== "undefined" ? window.location.href : "",
                ...extraInfo,
            },
        });
        console.info("[Sentry] Error captured by Sentry.");
    } catch (e) {
        console.warn("[Sentry] Could not send error to Sentry:", e);
    }
}

/**
 * Laporkan error ke Universal Agent AI (Hermes / OpenClaw / Custom).
 */
export async function sendToUniversalAgent(
    error: Error | null,
    extraInfo?: Record<string, unknown>,
): Promise<AgentReportResponse> {
    const payload: ErrorReportPayload = {
        name: error?.name || "Frontend Exception",
        message: error?.message || "Terjadi kendala teknis pada komponen antarmuka.",
        stack: error?.stack || "",
        componentStack: (extraInfo?.componentStack as string) || "",
        url: typeof window !== "undefined" ? window.location.href : "Unknown",
        pathname: typeof window !== "undefined" ? window.location.pathname : "Unknown",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
        timestamp: new Date().toISOString(),
        extra: extraInfo,
    };

    // Kirim ke Sentry jika tersedia
    if (error) {
        captureSentryException(error, extraInfo);
    }

    try {
        const response = await fetch("/api/v1/agent/report-error", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            const result: AgentReportResponse = await response.json();
            console.info("[Agent Telemetry] Error reported to Universal Agent:", result);
            return result;
        }

        throw new Error(`Server returned HTTP ${response.status}`);
    } catch (err) {
        console.warn("[Agent Telemetry] Fallback reporting to client error log:", err);
        try {
            await fetch("/api/v1/log-client-error", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    level: "error",
                    message: `[Universal Agent Dispatch] ${payload.message}`,
                    context: payload as unknown as Record<string, unknown>,
                }),
            });
        } catch {
            // silent fail
        }

        return {
            success: false,
            message: "Dispatched to local telemetry log.",
            sentry_captured: true,
            agent_notified: false,
        };
    }
}

/**
 * Backward compatibility alias
 */
export const sendToHermesAgent = sendToUniversalAgent;

/**
 * Tes koneksi / ping ke Agent AI (Hermes / OpenClaw).
 */
export async function pingAgentConnection(configParams?: {
    url?: string;
    provider?: string;
    secret?: string;
    deploymentMode?: string;
}): Promise<AgentPingResponse> {
    try {
        const response = await fetch("/api/v1/agent/ping", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(configParams || {}),
        });

        const data: AgentPingResponse = await response.json();
        return data;
    } catch (err) {
        return {
            success: false,
            detected_agent: "Offline / Timeout",
            http_status: 0,
            latency_ms: 0,
            target_url: configParams?.url || "http://localhost:18789",
            message: `Koneksi gagal: ${(err as Error).message || "Agent tidak merespon"}`,
        };
    }
}
