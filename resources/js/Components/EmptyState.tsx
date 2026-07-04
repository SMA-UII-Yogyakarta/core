import type { ReactNode } from "react";
import { FaInbox } from "react-icons/fa";
import Button from "@/Components/ui/Button";

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export default function EmptyState({
    icon,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="text-text-muted/60 text-5xl">
                {icon ?? <FaInbox />}
            </div>

            <h3 className="text-text-primary text-sm font-semibold">{title}</h3>

            {description && (
                <p className="text-text-muted text-xs max-w-xs text-center">
                    {description}
                </p>
            )}

            {action && (
                <Button variant="outline" size="sm" onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </div>
    );
}
