import type { ButtonHTMLAttributes } from "react";

type ActionVariant = "detail" | "edit" | "delete" | "import" | "add";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant: ActionVariant;
    icon?: string;
    label: string;
}

const variantStyles: Record<ActionVariant, string> = {
    detail:
        "bg-background text-primary hover:bg-primary-light border border-border",
    edit: "bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200",
    delete:
        "bg-danger-bg text-danger hover:bg-danger-light border border-danger-light",
    import:
        "bg-accent text-text-primary hover:bg-accent/90 font-bold border-0",
    add: "bg-primary text-white hover:bg-primary/90 font-semibold border-0",
};

const sizeStyles = {
    sm: "px-[10px] py-[6px] text-[12px] gap-[5px]",
    md: "px-[15px] py-[8px] text-[13px] gap-[6px]",
};

export default function ActionButton({
    variant,
    icon,
    label,
    className = "",
    ...props
}: ActionButtonProps) {
    return (
        <button
            className={`inline-flex items-center justify-center rounded-md font-inter font-semibold transition-colors duration-150
                ${variantStyles[variant]}
                ${sizeStyles.sm}
                ${className}`}
            type="button"
            {...props}
        >
            {icon && <i className={`fas ${icon} text-[12px]`} />}
            <span>{label}</span>
        </button>
    );
}
