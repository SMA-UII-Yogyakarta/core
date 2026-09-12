import { Link } from "@inertiajs/react";
import type { ReactNode } from "react";
import { FiChevronRight } from "react-icons/fi";

export type TeacherQuickActionTone = "primary" | "success" | "warning" | "info";

interface TeacherQuickActionProps {
    title: string;
    description: string;
    icon: ReactNode;
    tone?: TeacherQuickActionTone;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
}

const toneStyles: Record<TeacherQuickActionTone, { icon: string; hover: string }> = {
    primary: { icon: "bg-primary/10 text-primary", hover: "hover:border-primary/40" },
    success: { icon: "bg-success-bg text-success", hover: "hover:border-success/40" },
    warning: { icon: "bg-warning-bg text-warning", hover: "hover:border-warning/40" },
    info: { icon: "bg-info-bg text-info", hover: "hover:border-info/40" },
};

function ActionContent({
    icon,
    title,
    description,
    tone,
}: Omit<TeacherQuickActionProps, "href" | "onClick" | "disabled">) {
    const styles = toneStyles[tone ?? "primary"];

    return (
        <>
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-[18px] ${styles.icon}`}>
                {icon}
            </div>
            <div className="flex min-w-0 items-end justify-between gap-2">
                <div className="min-w-0">
                    <span className="block truncate text-[13px] font-bold leading-tight text-text-primary">
                        {title}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-text-muted">{description}</span>
                </div>
                <FiChevronRight className="shrink-0 text-[15px] text-text-inactive transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
        </>
    );
}

export default function TeacherQuickAction({
    title,
    description,
    icon,
    tone = "primary",
    href,
    onClick,
    disabled = false,
}: TeacherQuickActionProps) {
    const styles = toneStyles[tone];
    const className = `group flex min-h-[112px] flex-col justify-between rounded-2xl border border-border bg-surface p-3.5 shadow-card transition-all ${styles.hover} ${
        disabled ? "cursor-not-allowed opacity-50" : "active:scale-[0.98]"
    }`;
    const content = <ActionContent icon={icon} title={title} description={description} tone={tone} />;

    if (href) {
        return (
            <Link
                href={href}
                className={className}
                aria-disabled={disabled || undefined}
                tabIndex={disabled ? -1 : undefined}
            >
                {content}
            </Link>
        );
    }

    return (
        <button type="button" onClick={onClick} disabled={disabled} className={`${className} cursor-pointer text-left`}>
            {content}
        </button>
    );
}
