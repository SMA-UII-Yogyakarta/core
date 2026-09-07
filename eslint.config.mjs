// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
    { ignores: ["**/node_modules/**", "**/vendor/**", "**/public/**", "**/bootstrap.js", "**/build/**", "**/storage/**"] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                window: "readonly",
                document: "readonly",
                navigator: "readonly",
                console: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                fetch: "readonly",
                URL: "readonly",
                URLSearchParams: "readonly",
                HTMLElement: "readonly",
                HTMLInputElement: "readonly",
                HTMLTextAreaElement: "readonly",
                React: "readonly",
            },
        },
        plugins: {
            "react-hooks": reactHooks,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "warn",
            "react-hooks/exhaustive-deps": "warn",
        },
    },
);


