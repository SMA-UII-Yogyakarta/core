import type { ElementType, ReactNode, ComponentPropsWithRef } from "react";
import type { ButtonVariant, ButtonSize } from "@/types/component";

export type ButtonProps<E extends ElementType = "button"> = {
    as?: E;
    variant?: ButtonVariant | "success";
    size?: ButtonSize;
    loading?: boolean;
    icon?: ReactNode;
    disabled?: boolean;
    dusk?: string;
    className?: string;
    children?: ReactNode;
} & Omit<
    ComponentPropsWithRef<E>,
    "as" | "variant" | "size" | "loading" | "icon" | "disabled" | "className" | "children"
>;

const variantStyles: Record<ButtonVariant | "success", string> = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-xs",
    secondary: "bg-accent text-primary hover:bg-accent/90 font-bold border border-border/50",
    outline: "border border-primary text-primary hover:bg-primary hover:text-white",
    danger: "bg-danger text-white hover:bg-danger/90 shadow-xs",
    "danger-outline":
        "border border-danger text-danger hover:bg-danger hover:text-white",
    success: "bg-success text-white hover:bg-success/90 shadow-xs",
    ghost: "text-text-muted hover:text-text-primary hover:bg-muted/40",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-[12px] rounded-lg font-semibold",
    md: "h-10 px-4 text-[13px] rounded-xl font-bold",
    lg: "h-12 px-6 text-[14px] sm:text-[15px] rounded-xl font-bold",
};

export function Button<E extends ElementType = "button">({
    as,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    className = "",
    children,
    icon,
    ...props
}: ButtonProps<E>) {
    const Component = as || "button";
    const isDisabled = disabled || loading;

    return (
        <Component
            className={`inline-flex items-center justify-center gap-2 font-inter transition-all duration-150 text-center select-none active:scale-[0.98]
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"}
                ${className}`}
            disabled={isDisabled && Component === "button" ? true : undefined}
            {...props}
        >
            {loading ? (
                <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Loading...
                </span>
            ) : (
                <>
                    {icon}
                    {children}
                </>
            )}
        </Component>
    );
}

export default Button;
