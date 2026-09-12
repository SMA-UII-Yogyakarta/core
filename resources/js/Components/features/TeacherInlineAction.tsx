import { Link } from "@inertiajs/react";
import type { ReactNode } from "react";

interface TeacherInlineActionProps {
    href: string;
    children: ReactNode;
    className?: string;
}

const baseClassName =
    "inline-flex min-h-8 items-center justify-center rounded-lg bg-primary px-3.5 py-1.5 text-[12px] font-bold text-white shadow-xs transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.98]";

export default function TeacherInlineAction({ href, children, className = "" }: TeacherInlineActionProps) {
    return (
        <Link href={href} className={`${baseClassName} ${className}`.trim()}>
            {children}
        </Link>
    );
}
