import type { InputHTMLAttributes } from "react";

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
    label?: string;
    size?: "sm" | "md";
}

export default function Toggle({
    checked,
    onChange,
    label,
    size = "md",
    disabled,
    className = "",
    ...props
}: ToggleProps) {
    const isSm = size === "sm";

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
            <div
                className={`relative inline-flex items-center shrink-0 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                    isSm ? "w-9 h-5 p-0.5" : "w-11 h-6 p-0.5"
                } ${
                    checked
                        ? "bg-emerald-500"
                        : "bg-gray-300 dark:bg-gray-600"
                }`}
            >
                <span
                    className={`inline-block rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                        isSm ? "w-4 h-4" : "w-5 h-5"
                    } ${
                        checked
                            ? isSm ? "translate-x-4" : "translate-x-5"
                            : "translate-x-0"
                    }`}
                />
            </div>
            {label && <span className="text-[13px] text-text-primary font-inter font-medium">{label}</span>}
        </label>
    );
}
