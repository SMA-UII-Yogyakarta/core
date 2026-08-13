import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    children: ReactNode;
}

export function Card({ className = "", children, ...props }: CardProps) {
    return (
        <div
            className={`bg-surface border border-border rounded-2xl shadow-dropdown overflow-hidden flex flex-col ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className = "", children, ...props }: CardProps) {
    return (
        <div className={`px-[20px] py-[15px] border-b border-border bg-surface ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardBody({ className = "", children, ...props }: CardProps) {
    return (
        <div className={`p-[20px] flex-1 ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ className = "", children, ...props }: CardProps) {
    return (
        <div className={`px-[20px] py-[15px] border-t border-border bg-surface/50 mt-auto ${className}`} {...props}>
            {children}
        </div>
    );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
