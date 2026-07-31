import { createInertiaApp } from "@inertiajs/react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { LanguageProvider } from "@/Contexts/LanguageContext";
import "./bootstrap";

const appName = import.meta.env.VITE_APP_NAME || "SMAUII Core";

createInertiaApp({
    title: (title) => `${title} — ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob("./Pages/**/*.tsx"),
        ),
    setup({ el, App, props }) {
        const rootElement = (
            <App {...props}>
                {({ Component, props, key }) => (
                    <LanguageProvider>
                        <Component {...props} key={key} />
                    </LanguageProvider>
                )}
            </App>
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
