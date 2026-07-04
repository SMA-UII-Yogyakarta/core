import type { InputHTMLAttributes } from "react";
import { FaCheck } from "react-icons/fa";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
    indeterminate?: boolean;
}

export default function Checkbox({
    checked,
    onChange,
    label,
    disabled,
    indeterminate,
    className = "",
    ...props
}: CheckboxProps) {
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
                className={`inline-flex items-center justify-center w-[30px] h-[30px] rounded-md border transition-colors duration-150
                    ${
                        checked || indeterminate
                            ? "bg-primary border-primary text-white"
                            : "bg-surface border-border text-text-secondary hover:bg-background"
                    }
                `}
            >
                {indeterminate ? (
                    <span className="w-[12px] h-[2px] bg-white rounded" />
                ) : checked ? (
                    <FaCheck className="text-[12px]" />
                ) : null}
            </span>
            {label && (
                <span className="text-[13px] text-text-primary font-inter font-medium">
                    {label}
                </span>
            )}
        </label>
    );
}
