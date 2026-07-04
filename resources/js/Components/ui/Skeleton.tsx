interface SkeletonProps {
    variant?: "text" | "card" | "table-row" | "circle";
    count?: number;
    className?: string;
}

const base = "animate-pulse bg-[#e2e8f0] rounded";

const variants: Record<string, string> = {
    text: "h-4 w-full",
    card: "h-32 w-full rounded-lg",
    "table-row": "h-12 w-full",
    circle: "h-10 w-10 rounded-full",
};

export default function Skeleton({ variant = "text", count = 1, className = "" }: SkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`${base} ${variants[variant]} ${className}`} />
            ))}
        </>
    );
}
