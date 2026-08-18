import type { ReactNode } from "react";

interface StickyContainerProps {
    children: ReactNode;
    className?: string;
}

export default function StickyContainer({ children, className = "" }: StickyContainerProps) {
    return (
        <div className={`sticky top-0 z-30 bg-background pt-2.5 pb-0 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-6 lg:px-6 mb-4 ${className}`}>
            {children}
        </div>
    );
}
