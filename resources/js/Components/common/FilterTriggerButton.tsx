import { FiFilter } from "react-icons/fi";
import Button, { type ButtonProps } from "@/Components/ui/Button";

interface FilterTriggerButtonProps extends Omit<ButtonProps, "children" | "icon"> {
    label?: string;
    active?: boolean;
}

/** Shared text filter trigger for desktop/tablet toolbars. Header icons use HeaderIconButton. */
export default function FilterTriggerButton({
    label = "Filter",
    active = false,
    className = "",
    ...props
}: FilterTriggerButtonProps) {
    return (
        <Button
            {...props}
            variant="accent"
            size="md"
            aria-pressed={active}
            data-filter-trigger="true"
            icon={<FiFilter className="text-[13px]" />}
            className={`h-10 px-3.5 text-[13px] font-bold rounded-xl shrink-0 whitespace-nowrap ${
                active ? "ring-2 ring-primary/20" : ""
            } ${className}`}
        >
            {label}
        </Button>
    );
}
