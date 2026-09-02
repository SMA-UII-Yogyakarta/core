import type { ReactNode } from "react";
import { useState, useRef, useEffect, useId } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
    content: ReactNode;
    children: ReactNode;
    position?: TooltipPosition;
    delay?: number;
    className?: string;
    tooltipClassName?: string;
    disabled?: boolean;
}

export default function Tooltip({
    content,
    children,
    position = "top",
    delay = 150,
    className = "",
    tooltipClassName = "",
    disabled = false,
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const tooltipId = useId();

    const handleMouseEnter = () => {
        if (disabled || !content) return;
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    if (disabled || !content) {
        return <>{children}</>;
    }

    const positionClasses: Record<TooltipPosition, string> = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
    };

    const arrowClasses: Record<TooltipPosition, string> = {
        top: "top-full left-1/2 -translate-x-1/2 border-t-slate-900 dark:border-t-slate-800 border-x-transparent border-b-transparent border-t-4 border-x-4",
        bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 dark:border-b-slate-800 border-x-transparent border-t-transparent border-b-4 border-x-4",
        left: "left-full top-1/2 -translate-y-1/2 border-l-slate-900 dark:border-l-slate-800 border-y-transparent border-r-transparent border-l-4 border-y-4",
        right: "right-full top-1/2 -translate-y-1/2 border-r-slate-900 dark:border-r-slate-800 border-y-transparent border-l-transparent border-r-4 border-y-4",
    };

    const motionVariants: Variants = {
        initial: {
            opacity: 0,
            scale: 0.95,
            y: position === "top" ? 4 : position === "bottom" ? -4 : 0,
            x: position === "left" ? 4 : position === "right" ? -4 : 0,
        },
        animate: {
            opacity: 1,
            scale: 1,
            y: 0,
            x: 0,
            transition: { duration: 0.15, ease: "easeOut" },
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.1, ease: "easeIn" },
        },
    };

    return (
        <div
            className={`relative inline-flex items-center ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}
            aria-describedby={isVisible ? tooltipId : undefined}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        id={tooltipId}
                        role="tooltip"
                        variants={motionVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className={`absolute z-50 pointer-events-none px-2.5 py-1 text-[11px] font-medium font-inter text-white bg-slate-900 dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700/50 whitespace-normal max-w-xs break-words text-center leading-snug ${positionClasses[position]} ${tooltipClassName}`}
                    >
                        {content}
                        <span className={`absolute w-0 h-0 border-solid ${arrowClasses[position]}`} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
