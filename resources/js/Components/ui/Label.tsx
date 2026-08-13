import type { LabelHTMLAttributes, ReactNode } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    children: ReactNode;
}

export default function Label({ children, className = "", ...props }: LabelProps) {
    return (
        <label className={`block text-sm font-medium text-primary mb-1.5 font-inter ${className}`} {...props}>
            {children}
        </label>
    );
}
