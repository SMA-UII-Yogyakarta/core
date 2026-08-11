import { createInertiaApp } from "@inertiajs/react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { LanguageProvider } from "@/Contexts/LanguageContext";
import { ThemeProvider } from "@/Contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./bootstrap";

const appName = import.meta.env.VITE_APP_NAME || "SMAUII Core";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
        },
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob("./Pages/**/*.tsx"),
        ),
    setup({ el, App, props }) {
        const rootElement = (
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
        );

        if (import.meta.env.DEV) {
            createRoot(el).render(rootElement);
            return;
        }

        hydrateRoot(el, rootElement);
    },
    progress: {
        color: "#f53003",
    },
});
