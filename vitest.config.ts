import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./resources/js/__tests__/setup.ts"],
        include: ["**/__tests__/**/*.test.{ts,tsx}"],
        server: {
            deps: {
                inline: ["zod"],
            },
        },
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "./resources/js"),
        },
    },
});