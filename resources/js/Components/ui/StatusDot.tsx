import { getStatusDotClass, type StatusInput } from "./StatusBadge";

export interface StatusDotProps {
    status: StatusInput;
    size?: "xs" | "sm" | "md" | "lg";
    pulse?: boolean;
    className?: string;
    title?: string;
}

const sizeClasses: Record<string, string> = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
};

export default function StatusDot({ status, size = "sm", pulse = false, className = "", title }: StatusDotProps) {
    const colorClass = getStatusDotClass(status);
    const sizeClass = sizeClasses[size] ?? sizeClasses.sm;

    return (
        <span
            title={title}
            className={`inline-block rounded-full shrink-0 ${sizeClass} ${colorClass} ${
                pulse ? "animate-pulse" : ""
            } ${className}`}
        />
    );
}
