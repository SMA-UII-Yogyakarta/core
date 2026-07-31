import type { ReactNode } from "react";

interface PageHeaderProps {
    title?: string;
    children?: ReactNode;
    className?: string;
}

function PageHeader({ title, children, className = "" }: PageHeaderProps) {
    return (
        <div
            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 ${className}`}
        >
            {title && (
                <h2 className="text-lg font-semibold text-primary font-inter">
                    {title}
                </h2>
            )}
            {children && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {children}
                </div>
            )}
        </div>
    );
}

interface PageHeaderFilterProps {
    children?: ReactNode;
    className?: string;
}

function PageHeaderFilter({ children, className = "" }: PageHeaderFilterProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>{children}</div>
    );
}

PageHeader.Filter = PageHeaderFilter;

export default PageHeader;
