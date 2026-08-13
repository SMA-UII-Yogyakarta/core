import { useEffect, useRef, useState, useCallback } from "react";
import { router } from "@inertiajs/react";

export interface InertiaPollingOptions {
    /**
     * List of Inertia prop keys to partially reload.
     * Example: ['classStats', 'attentionStudents', 'totals']
     */
    only: string[];

    /**
     * Polling interval in milliseconds.
     * Default: 10000 (10 seconds)
     */
    intervalMs?: number;

    /**
     * Whether polling is initially active.
     * Default: true
     */
    enabled?: boolean;

    /**
     * Pause polling automatically when the browser tab is hidden/inactive.
     * Default: true
     */
    onlyWhenVisible?: boolean;

    /**
     * Optional callback fired after a successful poll reload.
     */
    onSuccess?: () => void;
}

export function useInertiaPolling({
    only,
    intervalMs = 10000,
    enabled: initialEnabled = true,
    onlyWhenVisible = true,
    onSuccess,
}: InertiaPollingOptions) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(() => new Date());

    const isRefreshingRef = useRef(false);
    const onSuccessRef = useRef(onSuccess);

    useEffect(() => {
        onSuccessRef.current = onSuccess;
    }, [onSuccess]);

    const triggerRefresh = useCallback(() => {
        if (isRefreshingRef.current) return;

        isRefreshingRef.current = true;
        setIsRefreshing(true);

        router.reload({
            only,
            onFinish: () => {
                isRefreshingRef.current = false;
                setIsRefreshing(false);
                setLastUpdated(new Date());
                onSuccessRef.current?.();
            },
        });
    }, [only]);

    const togglePolling = useCallback(() => {
        setEnabled((prev) => !prev);
    }, []);

    useEffect(() => {
        if (!enabled) return;

        const intervalId = setInterval(() => {
            if (onlyWhenVisible && document.hidden) {
                return;
            }
            triggerRefresh();
        }, intervalMs);

        // Also trigger on window focus if tab becomes visible after being hidden
        const handleVisibilityChange = () => {
            if (onlyWhenVisible && document.visibilityState === "visible") {
                triggerRefresh();
            }
        };

        if (onlyWhenVisible) {
            document.addEventListener("visibilitychange", handleVisibilityChange);
        }

        return () => {
            clearInterval(intervalId);
            if (onlyWhenVisible) {
                document.removeEventListener("visibilitychange", handleVisibilityChange);
            }
        };
    }, [enabled, intervalMs, onlyWhenVisible, triggerRefresh]);

    return {
        enabled,
        setEnabled,
        togglePolling,
        isRefreshing,
        lastUpdated,
        triggerRefresh,
    };
}
