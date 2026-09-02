import { useState, useRef, useEffect, createElement } from "react";
import Tooltip, { type TooltipPosition } from "./Tooltip";

export interface TruncatedTextProps {
    text: string;
    as?: "span" | "div" | "p" | "h1" | "h2" | "h3" | "h4";
    lines?: number;
    className?: string;
    tooltipPosition?: TooltipPosition;
    tooltipClassName?: string;
}

export default function TruncatedText({
    text,
    as = "span",
    lines = 1,
    className = "",
    tooltipPosition = "top",
    tooltipClassName = "",
}: TruncatedTextProps) {
    const textRef = useRef<HTMLElement>(null);
    const [isTruncated, setIsTruncated] = useState(false);

    const checkTruncation = () => {
        const el = textRef.current;
        if (!el) return;

        if (lines === 1) {
            // Horizontal single-line truncation check
            const hasHorizontalOverflow = el.scrollWidth > el.clientWidth + 1;
            setIsTruncated(hasHorizontalOverflow);
        } else {
            // Multi-line clamp truncation check
            const hasVerticalOverflow = el.scrollHeight > el.clientHeight + 1;
            setIsTruncated(hasVerticalOverflow);
        }
    };

    useEffect(() => {
        checkTruncation();

        const el = textRef.current;
        if (!el) return;

        let resizeObserver: ResizeObserver | null = null;
        if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(() => {
                checkTruncation();
            });
            resizeObserver.observe(el);
        }

        window.addEventListener("resize", checkTruncation);

        return () => {
            if (resizeObserver && el) {
                resizeObserver.unobserve(el);
                resizeObserver.disconnect();
            }
            window.removeEventListener("resize", checkTruncation);
        };
    }, [text, lines]);

    const clampClass = lines === 1 ? "truncate" : `line-clamp-${lines}`;

    const textElement = createElement(
        as,
        {
            ref: textRef,
            className: `${clampClass} ${className} ${isTruncated ? "cursor-help" : ""}`,
        },
        text
    );

    if (!isTruncated) {
        return textElement;
    }

    return (
        <Tooltip
            content={text}
            position={tooltipPosition}
            tooltipClassName={tooltipClassName}
            className="max-w-full"
        >
            {textElement}
        </Tooltip>
    );
}
