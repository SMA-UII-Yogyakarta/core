import type { ReactNode } from "react";

interface StickyContainerProps {
    children: ReactNode;
    className?: string;
}

export default function StickyContainer({ children, className = "" }: StickyContainerProps) {
    return (
        <div className={`sticky top-0 z-40 bg-background py-3 pb-0 -mx-4 px-4 lg:-mx-6 lg:px-6 mb-3 ${className}`}>
            {children}
        </div>
    );
}
