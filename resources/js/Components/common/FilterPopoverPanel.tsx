import type { ReactNode } from "react";

interface FilterPopoverPanelProps {
    title: string;
    children: ReactNode;
    hasActiveFilters?: boolean;
    onReset?: () => void;
    footer?: ReactNode;
    className?: string;
}

/** Canonical content shell for desktop/tablet filter popovers. */
export default function FilterPopoverPanel({
    title,
    children,
    hasActiveFilters = false,
    onReset,
    footer,
    className = "",
}: FilterPopoverPanelProps) {
    return (
        <div className={`flex min-w-0 flex-col gap-4 p-1 font-inter ${className}`}>
            <div className="flex items-center justify-between gap-3 border-b border-border pb-2.5">
                <h4 className="text-[14px] font-bold text-text-primary">{title}</h4>
                {onReset && hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="shrink-0 cursor-pointer text-[11.5px] font-semibold text-danger hover:underline"
                    >
                        Reset Filter
                    </button>
                )}
            </div>

            {children}

            {footer && <div className="flex items-center gap-3 border-t border-border pt-2.5">{footer}</div>}
        </div>
    );
}
