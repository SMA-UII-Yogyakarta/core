import type { ReactNode } from "react";

export interface TabItem {
    key: string;
    label: ReactNode;
    icon?: ReactNode;
    count?: number;
    badge?: ReactNode;
    disabled?: boolean;
}

export interface TabSwitcherProps {
    tabs: TabItem[];
    activeKey: string;
    onChange: (key: string) => void;
    variant?: "segmented" | "underline" | "pills";
    size?: "sm" | "md" | "lg";
    className?: string;
    fullWidth?: boolean;
    itemClassName?: string;
}

export default function TabSwitcher({
    tabs,
    activeKey,
    onChange,
    variant = "segmented",
    size = "md",
    className = "",
    fullWidth = false,
    itemClassName = "",
}: TabSwitcherProps) {
    if (variant === "pills") {
        return (
            <div className={`flex flex-wrap items-center gap-2 font-inter select-none ${className}`}>
                {tabs.map((tab) => {
                    const isActive = activeKey === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            disabled={tab.disabled}
                            onClick={() => !tab.disabled && onChange(tab.key)}
                            className={`h-9 sm:h-10 px-4 sm:px-5 text-[13px] font-bold rounded-xl transition-all inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                                isActive
                                    ? "bg-primary text-white shadow-xs font-bold"
                                    : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-muted/40"
                            } ${tab.disabled ? "opacity-40 cursor-not-allowed" : ""} ${itemClassName}`}
                        >
                            {tab.icon && <span className="shrink-0 flex items-center">{tab.icon}</span>}
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span
                                    className={`ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold ${
                                        isActive ? "bg-white/20 text-white" : "bg-muted text-text-muted border border-border"
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            )}
                            {tab.badge}
                        </button>
                    );
                })}
            </div>
        );
    }

    if (variant === "underline") {
        return (
            <div className={`flex gap-2 sm:gap-4 border-b border-border overflow-x-auto no-scrollbar scrollbar-none font-inter select-none ${className}`}>
                {tabs.map((tab) => {
                    const isActive = activeKey === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            disabled={tab.disabled}
                            onClick={() => !tab.disabled && onChange(tab.key)}
                            className={`px-4 sm:px-5 py-2.5 text-[13px] sm:text-[14px] font-bold transition-all border-b-2 -mb-px inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer rounded-t-lg focus:outline-none focus:ring-0 ${
                                isActive
                                    ? "text-primary border-primary font-bold bg-primary/5"
                                    : "text-text-inactive border-transparent hover:text-text-primary hover:bg-muted/40"
                            } ${tab.disabled ? "opacity-40 cursor-not-allowed" : ""} ${itemClassName}`}
                        >
                            {tab.icon && <span className="shrink-0 flex items-center">{tab.icon}</span>}
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span
                                    className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold ${
                                        isActive ? "bg-primary/10 text-primary" : "bg-muted text-text-muted"
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            )}
                            {tab.badge}
                        </button>
                    );
                })}
            </div>
        );
    }

    // Default: "segmented"
    const sizeContainerClasses = {
        sm: "h-9 rounded-lg",
        md: "h-10 rounded-xl",
        lg: "h-11 rounded-xl",
    };

    const sizeButtonClasses = {
        sm: "px-3 sm:px-4 text-[12px]",
        md: "px-4 sm:px-5 text-[13px]",
        lg: "px-5 sm:px-6 text-[14px]",
    };

    return (
        <div
            className={`${
                fullWidth
                    ? "flex w-full"
                    : "inline-flex w-fit max-w-full overflow-x-auto no-scrollbar"
            } items-center ${sizeContainerClasses[size]} border border-border bg-surface overflow-hidden shadow-xs shrink-0 p-0 font-inter select-none ${className}`}
        >
            {tabs.map((tab) => {
                const isActive = activeKey === tab.key;
                return (
                    <button
                        key={tab.key}
                        type="button"
                        disabled={tab.disabled}
                        onClick={() => !tab.disabled && onChange(tab.key)}
                        className={`${
                            fullWidth ? "flex-1" : "flex-initial shrink-0"
                        } h-full ${sizeButtonClasses[size]} font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap text-center ${
                            isActive
                                ? "bg-primary text-white font-bold shadow-xs"
                                : "text-text-muted hover:text-text-primary hover:bg-muted/50"
                        } ${tab.disabled ? "opacity-40 cursor-not-allowed" : ""} ${itemClassName}`}
                    >
                        {tab.icon && <span className="shrink-0 flex items-center">{tab.icon}</span>}
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                            <span
                                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold ${
                                    isActive
                                        ? "bg-white/20 text-white"
                                        : "bg-muted text-text-secondary border border-border"
                                }`}
                            >
                                {tab.count}
                            </span>
                        )}
                        {tab.badge}
                    </button>
                );
            })}
        </div>
    );
}
