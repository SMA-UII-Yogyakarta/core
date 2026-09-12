import type { ReactNode } from "react";
import Button, { type ButtonProps } from "./Button";

type ActionVariant = "detail" | "edit" | "delete" | "import" | "add";

interface ActionButtonProps extends Omit<ButtonProps, "children" | "icon" | "variant" | "size"> {
    variant: ActionVariant;
    icon?: ReactNode;
    label: string;
    iconOnly?: boolean;
}

const variantConfig: Record<ActionVariant, { buttonVariant: "ghost" | "accent" | "primary" | "danger-outline"; className: string }> = {
    detail: { buttonVariant: "ghost", className: "border border-border text-primary hover:bg-primary-light" },
    edit: { buttonVariant: "ghost", className: "border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100" },
    delete: { buttonVariant: "danger-outline", className: "bg-danger-bg hover:bg-danger-light" },
    import: { buttonVariant: "accent", className: "font-bold" },
    add: { buttonVariant: "primary", className: "font-semibold" },
};

export default function ActionButton({
    variant,
    icon,
    label,
    iconOnly = false,
    className = "",
    ...props
}: ActionButtonProps) {
    const config = variantConfig[variant];

    return (
        <Button
            {...props}
            variant={config.buttonVariant}
            size="sm"
            title={props.title ?? label}
            aria-label={props["aria-label"] ?? label}
            icon={icon}
            className={`${config.className} ${iconOnly ? "h-8 w-8 px-0 text-[13px]" : "text-[12px]"} ${className}`}
        >
            {!iconOnly && label}
        </Button>
    );
}
