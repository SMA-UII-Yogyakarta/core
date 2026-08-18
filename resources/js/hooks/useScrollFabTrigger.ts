import { useState, useEffect, useRef } from "react";

export function useScrollFabTrigger() {
    const triggerRef = useRef<HTMLDivElement | null>(null);
    const [showFab, setShowFab] = useState(false);

    useEffect(() => {
        const target = triggerRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // Show FAB only when trigger button is NOT intersecting (scrolled out of view above)
                setShowFab(!entry.isIntersecting);
            },
            {
                threshold: 0.1,
            },
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, []);

    return { triggerRef, showFab };
}
