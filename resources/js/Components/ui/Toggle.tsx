import type { InputHTMLAttributes } from "react";
import { FaCheck } from "react-icons/fa";

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
    label?: string;
    size?: "sm" | "md";
}

const sizeMap = {
    sm: "w-[24px] h-[24px] text-[10px]",
    md: "w-[30px] h-[30px] text-[12px]",
};

export default function Toggle({
    checked,
    onChange,
    label,
    size = "md",
    disabled,
    className = "",
    ...props
}: ToggleProps) {
    const sizeClass = sizeMap[size];

    return (
        <label
            className={`inline-flex items-center gap-2 cursor-pointer select-none ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
            } ${className}`}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="sr-only peer"
                {...props}
            />
            <span
                className={`inline-flex items-center justify-center ${sizeClass} rounded-md border transition-colors duration-150 font-inter font-medium
                    ${
                        checked
                            ? "bg-primary border-primary text-white"
                            : "bg-surface border-border text-text-secondary hover:bg-background"
                    }
                `}
            >
                {checked && <FaCheck className="text-[10px]" />}
            </span>
            {label && (
                <span className="text-[13px] text-text-primary font-inter font-medium">
                    {label}
                </span>
            )}
        </label>
    );
}
