import type { ReactNode } from "react";
import TruncatedText from "./TruncatedText";

interface PageHeaderProps {
    title?: string;
    description?: string;
    children?: ReactNode;
    className?: string;
}

export default function PageHeader({ title, description, children, className = "" }: PageHeaderProps) {
    return (
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 shrink-0 ${className}`}>
            <div className="min-w-0 flex-1">
                {title && (
                    <TruncatedText
                        as="h1"
                        text={title}
                        className="text-[20px] sm:text-[24px] font-bold text-text-primary font-inter leading-tight block"
                        tooltipPosition="bottom"
                    />
                )}
                {description && (
                    <TruncatedText
                        as="p"
                        text={description}
                        className="text-[13px] sm:text-[14px] text-text-secondary font-inter mt-0.5 block"
                        tooltipPosition="bottom"
                    />
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
