import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface FABProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: ReactNode;
    label?: string;
    variant?: "accent" | "primary";
    position?: "bottom-right" | "bottom-left" | "bottom-center";
    dusk?: string;
}

const positionClasses = {
    "bottom-right": "bottom-20 right-5 lg:bottom-8 lg:right-8",
    "bottom-left": "bottom-20 left-5 lg:bottom-8 lg:left-8",
    "bottom-center": "bottom-20 left-1/2 -translate-x-1/2",
};

const variantClasses = {
    accent: "bg-accent text-primary hover:bg-accent-hover active:scale-95 shadow-xl shadow-accent/20",
    primary: "bg-primary text-white hover:bg-primary-hover active:scale-95 shadow-xl shadow-primary/20",
};

export default function FAB({
    icon,
    label,
    variant = "accent",
    position = "bottom-right",
    className = "",
    dusk,
    children,
    ...props
}: FABProps) {
    const isExtended = Boolean(label);

    return (
        <button
            type="button"
            className={`fixed z-30 flex items-center justify-center font-inter font-bold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-accent/40
                ${positionClasses[position]}
                ${variantClasses[variant]}
                ${isExtended ? "px-5 py-3.5 rounded-full text-[13px] gap-2.5" : "w-14 h-14 rounded-full text-xl"}
                ${className}`}
            dusk={dusk}
            data-testid={dusk}
            aria-label={label || "Floating Action"}
            {...props}
        >
            {icon || <i className="fas fa-plus" />}
            {label && <span>{label}</span>}
            {children}
        </button>
    );
}
