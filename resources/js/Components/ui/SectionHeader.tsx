import type { ReactNode } from "react";

export interface SectionHeaderProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    divider?: boolean;
    className?: string;
}

export default function SectionHeader({
    title,
    description,
    icon,
    action,
    divider = false,
    className = "",
}: SectionHeaderProps) {
    return (
        <div
            className={`flex min-w-0 flex-col items-stretch justify-between gap-3 font-inter sm:flex-row sm:items-center ${
                divider ? "pb-4 mb-5 border-b border-border" : ""
            } ${className}`.trimEnd()}
        >
            <div className="min-w-0 flex-1">
                <h2 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                    {icon && <span className="text-primary text-[16px] flex items-center shrink-0">{icon}</span>}
                    <span className="truncate">{title}</span>
                </h2>
                {description && <p className="text-[12px] text-text-muted mt-0.5 leading-normal">{description}</p>}
            </div>
            {action && <div className="max-w-full shrink-0">{action}</div>}
        </div>
    );
}
