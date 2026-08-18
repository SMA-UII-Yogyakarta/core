import type { InputHTMLAttributes } from "react";
import { FaCheck } from "react-icons/fa";
import FormError from "./FormError";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
    label?: string;
    error?: string;
    indeterminate?: boolean;
    size?: "sm" | "md";
}

export default function Checkbox({
    checked,
    onChange,
    label,
    error,
    disabled,
    indeterminate,
    size = "sm",
    className = "",
    ...props
}: CheckboxProps) {
    const boxSize = size === "sm" ? "w-[18px] h-[18px] rounded" : "w-[24px] h-[24px] rounded-md";
    const iconSize = size === "sm" ? "text-[10px]" : "text-[12px]";
    const barWidth = size === "sm" ? "w-[10px] h-[2px]" : "w-[14px] h-[2px]";

    return (
        <div className="inline-flex items-center">
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
                    className={`inline-flex items-center justify-center ${boxSize} border transition-colors duration-150 shrink-0
                        ${
                            checked || indeterminate
                                ? "bg-primary border-primary text-white"
                                : "bg-surface border-border text-text-secondary hover:bg-background"
                        }
                    `}
                >
                    {indeterminate ? (
                        <span className={`${barWidth} bg-white rounded`} />
                    ) : checked ? (
                        <FaCheck className={iconSize} />
                    ) : null}
                </span>
                {label && <span className="text-[13px] text-text-primary font-inter font-medium">{label}</span>}
            </label>
            <FormError message={error} />
        </div>
    );
}
