import { router, usePage } from "@inertiajs/react";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "@/utils/translations";

type Language = "id" | "en";

interface LanguageContextType {
    locale: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Cookie helper
const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
};

const setCookie = (name: string, value: string): void => {
    document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
};

const VALID_LOCALES: Language[] = ["id", "en"];

const isValidLocale = (val: unknown): val is Language =>
    typeof val === "string" && (VALID_LOCALES as string[]).includes(val);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { locale: serverLocale } = usePage().props as { locale?: string };

    const getInitialLanguage = (): Language => {
        // Priority: server-side locale (most authoritative) > cookie > default
        if (isValidLocale(serverLocale)) return serverLocale;
        const cookieLang = getCookie("app_locale");
        if (isValidLocale(cookieLang)) return cookieLang;
        return "id";
    };

    const [locale, setLocaleState] = useState<Language>(getInitialLanguage);

    // Sync when server locale changes (e.g. after Inertia reload with new locale)
    useEffect(() => {
        if (isValidLocale(serverLocale) && serverLocale !== locale) {
            setLocaleState(serverLocale);
        }
    }, [serverLocale]);

    const setLanguage = (lang: Language) => {
        // 1. Set cookie so Laravel backend can read it on next request
        setCookie("app_locale", lang);

        // 2. Update local state
        setLocaleState(lang);

        // 3. Reload Inertia page so backend applies the new locale
        router.reload({
            only: ["locale", "flash", "errors"],
        });
    };

    // Translation function (supports nested key if needed, or simple direct key lookup)
    const t = (key: string, params?: Record<string, string | number>): string => {
        const dict = translations[locale] || translations.id;
        let value = dict[key] || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
            });
        }
        return value;
    };

    return <LanguageContext.Provider value={{ locale, setLanguage, t }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        // Fallback gracefully to default Indonesian locale when rendered outside LanguageProvider (e.g. tests/Storybook)
        const t = (key: string, params?: Record<string, string | number>): string => {
            const dict = translations.id;
            let value = dict[key] || key;
            if (params) {
                Object.entries(params).forEach(([k, v]) => {
                    value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
                });
            }
            return value;
        };
        return {
            locale: "id" as Language,
            setLanguage: () => {},
            t,
        };
    }
    return context;
};
