import type { StatusInput } from "./StatusBadge";
import { resolveStatusVariant } from "./StatusBadge";

export interface StatusDotProps {
    status: StatusInput;
    size?: "xs" | "sm" | "md" | "lg";
    pulse?: boolean;
    className?: string;
    title?: string;
}

const dotColors: Record<string, string> = {
    present: "bg-success",
    late: "bg-warning",
    absent: "bg-danger",
    sick: "bg-primary",
    permission: "bg-info",
    active: "bg-success",
    inactive: "bg-danger",
    pending: "bg-warning",
    approved: "bg-success",
    rejected: "bg-danger",
    no_update: "bg-text-muted",
    no_check_in: "bg-text-muted",
    not_open: "bg-text-muted",
    unknown: "bg-text-muted",
};

const sizeClasses: Record<string, string> = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
};

export default function StatusDot({ status, size = "sm", pulse = false, className = "", title }: StatusDotProps) {
    const resolved = resolveStatusVariant(status);
    const colorClass = dotColors[resolved] ?? "bg-text-muted";
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
