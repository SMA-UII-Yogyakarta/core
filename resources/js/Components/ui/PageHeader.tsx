import type { ReactNode } from "react";

interface PageHeaderProps {
    title?: string | ReactNode;
    description?: string;
    children?: ReactNode;
    className?: string;
}

export default function PageHeader({ title, description, children, className = "" }: PageHeaderProps) {
    return (
<div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 shrink-0 ${className}`}>
            <div className="min-w-0 flex-1">
                {title && (
                    <h1 className="text-[20px] sm:text-[24px] font-bold text-text-primary font-inter leading-tight truncate">
                        {title}
                    </h1>
                )}
                {description && (
                    <p className="text-[13px] sm:text-[14px] text-text-secondary font-inter mt-0.5 truncate" title={description}>
                        {description}
                    </p>
                )}
            </div>
            {children && (
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 self-start md:self-auto shrink-0">
                    {children}
                </div>
            )}
        </div>
    );
}
