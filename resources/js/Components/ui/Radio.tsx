import type { InputHTMLAttributes } from "react";
import { FaCircle } from "react-icons/fa";

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
}

export default function Radio({
    checked,
    onChange,
    label,
    disabled,
    value,
    name,
    className = "",
    ...props
}: RadioProps) {
    return (
        <label
            className={`inline-flex items-center gap-2 cursor-pointer select-none ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
            } ${className}`}
        >
            <input
                type="radio"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                value={value}
                name={name}
                className="sr-only peer"
                {...props}
            />
            <span
                className={`inline-flex items-center justify-center w-[30px] h-[30px] rounded-full border transition-colors duration-150
                    ${
                        checked
                            ? "bg-primary border-primary text-white"
                            : "bg-surface border-border text-text-secondary hover:bg-background"
                    }
                `}
            >
                {checked && <FaCircle className="text-[8px]" />}
            </span>
            {label && (
                <span className="text-[13px] text-text-primary font-inter font-medium">
                    {label}
                </span>
            )}
        </label>
    );
}

// ─── Radio Group ───

interface RadioOption<T extends string> {
    value: T;
    label: string;
}

interface RadioGroupProps<T extends string> {
    name: string;
    options: RadioOption<T>[];
    value: T;
    onChange: (value: T) => void;
    disabled?: boolean;
    direction?: "horizontal" | "vertical";
    className?: string;
}

export function RadioGroup<T extends string>({
    name,
    options,
    value,
    onChange,
    disabled,
    direction = "vertical",
    className = "",
}: RadioGroupProps<T>) {
    return (
        <div
            className={`inline-flex gap-3 ${
                direction === "vertical" ? "flex-col" : "flex-row flex-wrap"
            } ${className}`}
        >
            {options.map((opt) => (
                <Radio
                    key={opt.value}
                    name={name}
                    value={opt.value}
                    checked={value === opt.value}
                    onChange={() => onChange(opt.value)}
                    label={opt.label}
                    disabled={disabled}
                />
            ))}
        </div>
    );
}
