import type { ReactNode } from "react";

interface PageHeaderProps {
    title?: string;
    description?: string;
    children?: ReactNode;
    className?: string;
}

export default function PageHeader({ title, description, children, className = "" }: PageHeaderProps) {
    return (
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 ${className}`}>
            <div>
                {title && <h1 className="text-[24px] font-bold text-text-primary font-inter leading-tight">{title}</h1>}
                {description && <p className="text-[14px] text-text-secondary font-inter mt-1">{description}</p>}
            </div>
            {children && (
                <div className="flex flex-wrap items-center gap-3 self-start md:self-auto shrink-0">{children}</div>
            )}
        </div>
    );
}
