import type { ButtonHTMLAttributes, ReactNode } from "react";

type ActionVariant = "detail" | "edit" | "delete" | "import" | "add";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant: ActionVariant;
    icon?: string | ReactNode;
    label: string;
    iconOnly?: boolean;
}

const variantStyles: Record<ActionVariant, string> = {
    detail: "bg-background text-primary hover:bg-primary-light border border-border",
    edit: "bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200",
    delete: "bg-danger-bg text-danger hover:bg-danger-light border border-danger-light",
    import: "bg-accent text-text-primary hover:bg-accent/90 font-bold border-0",
    add: "bg-primary text-white hover:bg-primary/90 font-semibold border-0",
};

export default function ActionButton({
    variant,
    icon,
    label,
    iconOnly = false,
    className = "",
    ...props
}: ActionButtonProps) {
    return (
        <button
            title={label}
            aria-label={label}
            type="button"
            className={`inline-flex items-center justify-center rounded-md font-inter font-semibold transition-all duration-150 cursor-pointer ${
                variantStyles[variant]
            } ${
                iconOnly
                    ? "w-8 h-8 text-[13px] shrink-0"
                    : "px-2.5 py-1.5 text-[12px] gap-1.5"
            } ${className}`}
            {...props}
        >
            {icon &&
                (typeof icon === "string" ? (
                    <i className={`fas ${icon} text-[13px]`} />
                ) : (
                    <span className="flex items-center justify-center text-[13px]">{icon}</span>
                ))}
            {!iconOnly && <span>{label}</span>}
        </button>
    );
}
