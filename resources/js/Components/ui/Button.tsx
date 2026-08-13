import { ElementType, ReactNode, forwardRef } from "react";
import type { ButtonVariant, ButtonSize } from "@/types/component";

type PolymorphicProps<E extends ElementType> = React.PropsWithChildren<
    React.ComponentPropsWithoutRef<E> & {
        as?: E;
    }
>;

export type ButtonProps<E extends ElementType = "button"> = PolymorphicProps<E> & {
    variant?: ButtonVariant | "success";
    size?: ButtonSize;
    loading?: boolean;
    icon?: ReactNode;
    disabled?: boolean;
};

const variantStyles: Record<ButtonVariant | "success", string> = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-accent text-primary hover:bg-accent/90 font-bold",
    outline: "border border-primary text-primary hover:bg-primary hover:text-white",
    danger: "bg-danger text-white hover:bg-danger/90",
    success: "bg-success text-white hover:bg-success/90",
    ghost: "text-text-muted hover:bg-background",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-[12px]",
    md: "px-5 py-2.5 text-[14px]",
    lg: "px-6 py-3 text-[16px]",
};

export const Button = forwardRef(
    <E extends ElementType = "button">(
        {
            as,
            variant = "primary",
            size = "md",
            loading = false,
            disabled = false,
            className = "",
            children,
            icon,
            ...props
        }: ButtonProps<E>,
        ref: React.Ref<any>,
    ) => {
        const Component = as || "button";

        // If it's a link but it's disabled, we might still want to apply visual disabling
        const isDisabled = disabled || loading;

        return (
            <Component
                ref={ref}
                className={`inline-flex items-center justify-center gap-2 font-inter font-semibold rounded-lg transition-colors duration-150 text-center
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
    },
) as <E extends ElementType = "button">(props: ButtonProps<E> & { ref?: React.Ref<Element> }) => React.ReactElement;

export default Button;
