import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
    const subscribe = (callback: () => void) => {
        if (typeof window === "undefined") return () => {};

        const mediaQuery = window.matchMedia(query);
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", callback);
            return () => mediaQuery.removeEventListener("change", callback);
        } else {
            mediaQuery.addListener(callback);
            return () => mediaQuery.removeListener(callback);
        }
    };

    const getSnapshot = () => {
        if (typeof window === "undefined") return false;
        return window.matchMedia(query).matches;
    };

    const getServerSnapshot = () => false;

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
