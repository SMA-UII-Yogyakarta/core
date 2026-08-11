import { cn } from "@/utils/helpers";

interface SkeletonProps {
    variant?: "text" | "card" | "table-row" | "circle" | "avatar" | "button" | "input" | "stat-card" | "table-header" | "card-header";
    count?: number;
    className?: string;
    width?: string | number;
    height?: string | number;
}

const base = "animate-pulse bg-[#e2e8f0] dark:bg-[#334155] rounded";

const variants: Record<string, string> = {
    text: "h-4 w-full",
    card: "h-32 w-full rounded-lg",
    "table-row": "h-12 w-full",
    circle: "h-10 w-10 rounded-full",
    avatar: "h-12 w-12 rounded-full",
    button: "h-10 w-24 rounded-lg",
    input: "h-10 w-full rounded-lg",
    "stat-card": "h-36 w-full rounded-xl",
    "table-header": "h-10 w-full",
    "card-header": "h-8 w-full",
};

export default function Skeleton({
    variant = "text",
    count = 1,
    className = "",
    width,
    height,
}: SkeletonProps) {
    const baseClasses = cn(base, variants[variant] || variants.text, className);
    const style = { width, height };

    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={baseClasses} style={style} />
            ))}
        </>
    );
}