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
            enableBuild: true,
        }),
    ],
    server: {
        watch: {
            ignored: ["**/storage/framework/views/**"],
        },
    },
});
