import type { ButtonHTMLAttributes } from "react";
import type { ButtonVariant, ButtonSize } from "@/types/component";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-accent text-primary hover:bg-accent/90 font-bold",
    outline:
        "border border-primary text-primary hover:bg-primary hover:text-white",
    danger: "bg-danger text-white hover:bg-danger/90",
    ghost: "text-text-muted hover:bg-background",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-[12px]",
    md: "px-5 py-2.5 text-[14px]",
    lg: "px-6 py-3 text-[16px]",
};

export default function Button({
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    className = "",
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`font-inter font-semibold rounded-lg transition-colors duration-150
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="inline-flex items-center gap-2">
                    <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                    </svg>
                    Loading...
                </span>
            ) : (
                children
            )}
        </button>
    );
}
