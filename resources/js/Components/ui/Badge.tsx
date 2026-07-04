interface BadgeProps {
    count: number;
    variant?: "danger" | "default";
}

const variantStyles: Record<string, string> = {
    danger: "bg-danger text-white",
    default: "bg-text-muted text-white",
};

export default function Badge({ count, variant = "danger" }: BadgeProps) {
    if (count <= 0) return null;

    return (
        <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded-[10px] text-[10px] leading-3 font-inter font-normal ${variantStyles[variant]}`}
        >
            {count > 99 ? "99+" : count}
        </span>
    );
}
