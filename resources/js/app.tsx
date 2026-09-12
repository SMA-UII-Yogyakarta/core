import { createInertiaApp } from "@inertiajs/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot, hydrateRoot } from "react-dom/client";
import ErrorBoundary from "@/Components/common/ErrorBoundary";
import { LanguageProvider } from "@/Contexts/LanguageContext";
import { ThemeProvider } from "@/Contexts/ThemeContext";
import { initSentry } from "@/services/errorReporter";
import "./bootstrap";

initSentry();

const appName = import.meta.env.VITE_APP_NAME || "SMAUII Core";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
        },
    },
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob("./Pages/**/*.tsx")),
    setup({ el, App, props }) {
        const rootElement = (
            <ErrorBoundary isRoot={true} title="Sistem Utama SMA UII">
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider>
                        <App {...props}>
                            {({ Component, props, key }) => (
                                <LanguageProvider>
                                    <Component {...props} key={key} />
                                </LanguageProvider>
                            )}
                        </App>
                    </ThemeProvider>
                </QueryClientProvider>
            </ErrorBoundary>
        );

        if (import.meta.env.DEV || !el.hasChildNodes()) {
            createRoot(el).render(rootElement);
            return;
        }

        hydrateRoot(el, rootElement);
    },
    progress: {
        color: "#f53003",
    },
});
