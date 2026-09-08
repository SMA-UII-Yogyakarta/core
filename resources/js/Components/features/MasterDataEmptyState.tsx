import type { ReactNode } from "react";
import { FiPlus } from "react-icons/fi";
import Card from "@/Components/ui/Card";
import Button from "@/Components/ui/Button";

export interface MasterDataEmptyStateProps {
    icon: ReactNode;
    iconContainerClassName?: string;
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
    className?: string;
}

export default function MasterDataEmptyState({
    icon,
    iconContainerClassName = "bg-blue-500/10 border-blue-500/20 text-primary",
    title,
    description,
    actionLabel,
    onAction,
    className = "",
}: MasterDataEmptyStateProps) {
    return (
        <Card className={`p-8 text-center text-text-inactive font-inter flex flex-col items-center justify-center ${className}`}>
            <div
                className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-3 ${iconContainerClassName}`}
            >
                {icon}
            </div>
            <h3 className="text-[14px] font-bold text-text-primary mb-1">
                {title}
            </h3>
            <p className="text-[12px] text-text-secondary max-w-xs mb-4">
                {description}
            </p>
            <Button
                variant="primary"
                size="sm"
                onClick={onAction}
                icon={<FiPlus className="text-[14px]" />}
            >
                {actionLabel}
            </Button>
        </Card>
    );
}
