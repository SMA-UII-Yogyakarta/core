import { router, usePage } from "@inertiajs/react";
import type React from "react";
import { createContext, useContext, useState } from "react";

type Language = "id" | "en";
type TranslationDictionary = Record<string, string>;

interface SharedLanguageProps {
    locale?: string;
    translations?: TranslationDictionary;
}

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

const interpolate = (value: string, params?: Record<string, string | number>): string => {
    if (!params) return value;

    return Object.entries(params).reduce(
        (translated, [key, replacement]) => translated.replace(new RegExp(`\\{${key}\\}`, "g"), String(replacement)),
        value,
    );
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { locale: serverLocale, translations: serverTranslations = {} } = usePage()
        .props as SharedLanguageProps;

    const getInitialLanguage = (): Language => {
        // Priority: server-side locale (most authoritative) > cookie > default
        if (isValidLocale(serverLocale)) return serverLocale;
        const cookieLang = getCookie("app_locale");
        if (isValidLocale(cookieLang)) return cookieLang;
        return "id";
    };

    const [locale, setLocaleState] = useState<Language>(getInitialLanguage);

    // Sync when server locale changes (e.g. after Inertia reload), using the
    // store-an-initializer-from-previous-render pattern to avoid setState-in-effect.
    const [prevServerLocale, setPrevServerLocale] = useState(serverLocale);
    if (isValidLocale(serverLocale) && serverLocale !== prevServerLocale) {
        setPrevServerLocale(serverLocale);
        setLocaleState(serverLocale);
    }

    const setLanguage = (lang: Language) => {
        // 1. Set cookie so Laravel backend can read it on next request
        setCookie("app_locale", lang);

        // 2. Update local state
        setLocaleState(lang);

        // 3. Reload Inertia page so backend applies the new locale
        router.reload({
            only: ["locale", "translations", "flash", "errors"],
        });
    };

    // Translation function (supports nested key if needed, or simple direct key lookup)
    const t = (key: string, params?: Record<string, string | number>): string => {
        return interpolate(serverTranslations[key] ?? key, params);
    };

    return <LanguageContext.Provider value={{ locale, setLanguage, t }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        // Components rendered outside Inertia (tests/Storybook) must remain safe;
        // production translations always come from shared Laravel props.
        const t = (key: string, params?: Record<string, string | number>): string => interpolate(key, params);
        return {
            locale: "id" as Language,
            setLanguage: () => {},
            t,
        };
    }
    return context;
};
