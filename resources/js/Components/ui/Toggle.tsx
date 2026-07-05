import type { InputHTMLAttributes } from "react";
import { FaCheck, FaCircle, FaChevronDown } from "react-icons/fa";

export type ToggleVariant = "toggle" | "chevron" | "checkbox" | "radio";

interface ToggleProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "onChange"
> {
    variant?: ToggleVariant;
    label?: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
}

const baseButton =
    "w-[30px] h-[30px] flex items-center justify-center rounded-md transition-colors duration-150";

export default function Toggle({
    variant = "toggle",
    label,
    checked = false,
    onChange,
    className = "",
    disabled,
    ...props
}: ToggleProps) {
    const handleClick = () => {
        if (!disabled && onChange) {
            onChange(!checked);
        }
    };

    /* Toggle / Chevron — hover vs non-hover via group */
    if (variant === "toggle") {
        return (
            <button
                type="button"
                onClick={handleClick}
                disabled={disabled}
                className={`
          group
          ${baseButton}
          ${
              checked
                  ? "bg-background border border-border"
                  : "bg-surface border border-border hover:bg-background"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${className}
        `.trim()}
                {...(props as any)}
            >
                <FaChevronDown
                    className={`
            w-3 h-3 text-text-secondary transition-transform
            ${checked ? "rotate-180" : ""}
          `.trim()}
                />
            </button>
        );
    }

    /* Chevron variant (variant 2) */
    if (variant === "chevron") {
        return (
            <button
                type="button"
                onClick={handleClick}
                disabled={disabled}
                className={`
          group
          ${baseButton}
          ${
              checked
                  ? "bg-background border border-border"
                  : "bg-surface border border-border hover:bg-background"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${className}
        `.trim()}
                {...(props as any)}
            >
                <span
                    className={`
            text-xs font-medium text-text-secondary
          `.trim()}
                >
                    {label ?? (checked ? "✓" : "")}
                </span>
            </button>
        );
    }

    /* Checkbox variant (variant 3 / 4) */
    if (variant === "checkbox") {
        return (
            <button
                type="button"
                onClick={handleClick}
                disabled={disabled}
                className={`
          ${baseButton}
          ${
              checked
                  ? "bg-primary border border-primary text-white"
                  : "bg-surface border border-border text-transparent hover:bg-background"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${className}
        `.trim()}
                {...(props as any)}
            >
                {checked && <FaCheck className="w-3 h-3 text-white" />}
            </button>
        );
    }

    /* Radio variant (variant 3 variant) */
    if (variant === "radio") {
        return (
            <button
                type="button"
                onClick={handleClick}
                disabled={disabled}
                className={`
          ${baseButton} rounded-full
          ${
              checked
                  ? "bg-primary border border-primary text-white"
                  : "bg-surface border border-border text-transparent hover:bg-background"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${className}
        `.trim()}
                {...(props as any)}
            >
                {checked && <FaCircle className="w-2 h-2 text-white" />}
            </button>
        );
    }

    return null;
}
