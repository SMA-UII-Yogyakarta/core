import type { ReactNode } from "react";

export interface ReportToolbarProps {
    children: ReactNode;
    className?: string;
}

export default function ReportToolbar({ children, className = "" }: ReportToolbarProps) {
    return (
        <div
            className={`hidden sm:flex flex-row items-center justify-between gap-3 mb-4 shrink-0 font-inter ${className}`}
        >{children}</div>
    );
}
