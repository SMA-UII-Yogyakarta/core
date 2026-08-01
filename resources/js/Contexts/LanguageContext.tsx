import React, { createContext, useContext, useState } from "react";
import { router } from "@inertiajs/react";
import { translations } from "@/utils/translations";

type Language = "id" | "en";

interface LanguageContextType {
    locale: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Cookie helper
const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const getInitialLanguage = (): Language => {
        const cookieLang = getCookie("app_locale");
        if (cookieLang === "id" || cookieLang === "en") return cookieLang as Language;
        return "id";
    };

    const [locale, setLocaleState] = useState<Language>(getInitialLanguage);

    const setLanguage = (lang: Language) => {
        // 1. Set cookie so Laravel backend can read it on next request
        document.cookie = `app_locale=${lang}; path=/; max-age=31536000; SameSite=Lax`;
        
        // 2. Update local state
        setLocaleState(lang);

        // 3. Reload Inertia page so backend applies the new locale
        router.reload({
            only: ["locale", "flash", "errors"],
        });
    };

    // Translation function (supports nested key if needed, or simple direct key lookup)
    const t = (key: string): string => {
        const dict = translations[locale] || translations.id;
        return dict[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
