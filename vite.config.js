import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import { bunny } from "laravel-vite-plugin/fonts";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import checker from "vite-plugin-checker";

const devHost = process.env.VITE_DEV_HOST ?? "localhost";
const hmrHost = process.env.VITE_HMR_HOST ?? devHost;
const checkerEnabled = process.env.VITE_ENABLE_CHECKER === "true";

function manualChunks(id) {
    const normalizedId = id.replaceAll("\\", "/");

    if (!normalizedId.includes("/node_modules/")) {
        if (normalizedId.includes("/resources/js/services/errorReporter")) {
            return "services";
        }

        return undefined;
    }

    if (normalizedId.includes("/@sentry/")) return "vendor-monitoring";
    if (normalizedId.includes("/framer-motion/")) return "vendor-motion";
    if (normalizedId.includes("/chart.js/")) return "vendor-charts";
    if (normalizedId.includes("/react-icons/")) return "vendor-icons";
    if (normalizedId.includes("/zod/")) return "vendor-validation";
    if (
        normalizedId.includes("/react/") ||
        normalizedId.includes("/react-dom/") ||
        normalizedId.includes("/scheduler/") ||
        normalizedId.includes("/@inertiajs/") ||
        normalizedId.includes("/@tanstack/")
    ) {
        return "vendor-react";
    }

    return "vendor";
}

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.tsx"],
            refresh: true,
            fonts: [
                bunny("Instrument Sans", {
                    weights: [400, 500, 600],
                    optimizedFallbacks: false,
                }),
            ],
        }),
        react(),
        tailwindcss(),
        ...(checkerEnabled
            ? [
                  checker({
                      typescript: {
                          tsconfigPath: "./tsconfig.json",
                      },
                      eslint: {
                          lintCommand: 'eslint "./resources/js/**/*.{ts,tsx}"',
                      },
                      overlay: {
                          initialIsOpen: "error",
                          position: "br",
                      },
                      terminal: true,
                      enableBuild: false,
                  }),
              ]
            : []),
    ],
    server: {
        host: "0.0.0.0",
        port: 5173,
        cors: {
            origin: "*",
            methods: ["GET", "OPTIONS", "HEAD"],
        },
        origin: `http://${devHost}:5173`,
        hmr: {
            host: hmrHost,
        },
        watch: {
            usePolling: true,
            ignored: [
                "**/storage/framework/views/**",
                "**/playwright-report/**",
                "**/test-results/**",
            ],
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks,
            },
        },
    },
});
