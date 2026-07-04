interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    label?: string;
}

const sizeMap: Record<NonNullable<LoadingSpinnerProps["size"]>, string> = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-[3px]",
    lg: "h-10 w-10 border-[4px]",
};

export default function LoadingSpinner({
    size = "md",
    label,
}: LoadingSpinnerProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <div
                className={`animate-spin rounded-full border-primary border-t-transparent ${sizeMap[size]}`}
                role="status"
                aria-label={label ?? "Loading"}
            />
            {label && (
                <span className="text-text-muted text-xs">{label}</span>
            )}
        </div>
    );
}
