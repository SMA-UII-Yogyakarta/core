/**
 * Logger — Utility untuk logging client-side.
 *
 * Menyediakan method debug/info/warn/error.
 * Di production, error level otomatis dikirim ke backend
 * via POST /api/log-client-error untuk monitoring.
 *
 * @see docs/error-handling-patterns.md — §3.5 Frontend Logging Strategy
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
    level: LogLevel;
    message: string;
    context?: Record<string, unknown>;
    timestamp: string;
    url: string;
    userAgent: string;
}

class Logger {
    private async sendToBackend(entry: LogEntry): Promise<void> {
        try {
            await fetch("/api/log-client-error", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry),
            });
        } catch {
            // Silent fail — jangan bikin error tambahan
        }
    }

    private log(
        level: LogLevel,
        message: string,
        context?: Record<string, unknown>,
    ): void {
        const entry: LogEntry = {
            level,
            message,
            context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
        };

        // Selalu log ke console
        const fn =
            level === "error"
                ? console.error
                : level === "warn"
                  ? console.warn
                  : level === "info"
                    ? console.info
                    : console.debug;
        fn(`[${level.toUpperCase()}] ${message}`, context);

        // Hanya error yang dikirim ke backend (untuk production)
        if (level === "error" && import.meta.env.PROD) {
            this.sendToBackend(entry);
        }
    }

    debug(message: string, context?: Record<string, unknown>): void {
        this.log("debug", message, context);
    }

    info(message: string, context?: Record<string, unknown>): void {
        this.log("info", message, context);
    }

    warn(message: string, context?: Record<string, unknown>): void {
        this.log("warn", message, context);
    }

    error(message: string, context?: Record<string, unknown>): void {
        this.log("error", message, context);
    }
}

export const logger = new Logger();
