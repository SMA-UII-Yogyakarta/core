import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import { bunny } from "laravel-vite-plugin/fonts";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import checker from "vite-plugin-checker";

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
    ],
    server: {
        host: "0.0.0.0",
        port: 5173,
        cors: {
            origin: "*",
            methods: ["GET", "OPTIONS", "HEAD"],
        },
        origin: "http://localhost:5173",
        hmr: {
            host: "localhost",
        },
        watch: {
            usePolling: true,
            ignored: ["**/storage/framework/views/**"],
        },
    },
});
