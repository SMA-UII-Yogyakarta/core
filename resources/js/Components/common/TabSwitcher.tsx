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
    size?: "xs" | "sm" | "md" | "lg";
    theme?: "light" | "dark";
    className?: string;
    fullWidth?: boolean | "mobile-only";
    itemClassName?: string;
    inHeader?: boolean;
    shrinkable?: boolean;
}

export default function TabSwitcher({
    tabs,
    activeKey,
    onChange,
    variant = "segmented",
    size = "md",
    theme = "light",
    className = "",
    fullWidth = false,
    itemClassName = "",
    inHeader,
    shrinkable = false,
}: TabSwitcherProps) {
    const isDark = theme === "dark";
    const hasInnerPadding = inHeader ?? isDark;

    const sizeBadgeClasses = {
        xs: "min-w-[16px] h-4 px-1 text-[9.5px]",
        sm: "min-w-[18px] h-4.5 px-1.5 text-[10.5px]",
        md: "min-w-[20px] h-5 px-1.5 text-[11px]",
        lg: "min-w-[22px] h-5.5 px-2 text-[11.5px]",
    };

    if (variant === "pills") {
        return (
            <div
                role="tablist"
                aria-orientation="horizontal"
                className={`flex flex-wrap items-center gap-2 font-inter select-none ${className}`}
            >
                {tabs.map((tab) => {
                    const isActive = activeKey === tab.key;
                    return (
                        <button
                            key={tab.key}
                            id={`tab-${tab.key}`}
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`tabpanel-${tab.key}`}
                            type="button"
                            disabled={tab.disabled}
                            onClick={() => !tab.disabled && onChange(tab.key)}
                            className={`h-9 sm:h-10 px-4 sm:px-5 text-[13px] font-bold rounded-xl transition-colors duration-150 inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none [-webkit-tap-highlight-color:transparent] ${
                                isActive
                                    ? isDark
                                        ? "bg-white text-primary shadow-xs font-bold border border-transparent"
                                        : "bg-primary text-white shadow-xs font-bold border border-transparent"
                                    : isDark
                                      ? "bg-white/10 border border-white/20 text-white/80 hover:text-white hover:bg-white/20"
                                      : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-muted/40"
                            } ${tab.disabled ? "opacity-40 cursor-not-allowed" : ""} ${itemClassName}`}
                        >
                            {tab.icon && <span className="shrink-0 flex items-center">{tab.icon}</span>}
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span
                                    className={`ml-1 inline-flex items-center justify-center ${sizeBadgeClasses[size]} rounded-full font-bold ${
                                        isActive
                                            ? isDark
                                                ? "bg-primary/10 text-primary"
                                                : "bg-white/20 text-white"
                                            : isDark
                                              ? "bg-white/15 text-white/90"
                                              : "bg-muted text-text-muted border border-border"
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
            <div
                role="tablist"
                aria-orientation="horizontal"
                className={`flex gap-2 sm:gap-4 border-b border-border ${
                    shrinkable ? "overflow-hidden min-w-0" : "overflow-x-auto no-scrollbar scrollbar-none"
                } font-inter select-none ${className}`}
            >
                {tabs.map((tab) => {
                    const isActive = activeKey === tab.key;
                    const labelString = typeof tab.label === "string" ? tab.label : undefined;
                    return (
                        <button
                            key={tab.key}
                            id={`tab-${tab.key}`}
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`tabpanel-${tab.key}`}
                            type="button"
                            disabled={tab.disabled}
                            title={labelString}
                            onClick={() => !tab.disabled && onChange(tab.key)}
                            className={`px-4 sm:px-5 py-2.5 text-[13px] sm:text-[14px] font-bold transition-colors duration-150 border-b-2 -mb-px inline-flex items-center justify-center gap-2 whitespace-nowrap ${
                                shrinkable ? "shrink min-w-0" : "shrink-0"
                            } cursor-pointer rounded-t-lg outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none [-webkit-tap-highlight-color:transparent] ${
                                isActive
                                    ? isDark
                                        ? "text-white border-white font-bold bg-white/10"
                                        : "text-primary border-primary font-bold bg-primary/5"
                                    : isDark
                                      ? "text-white/70 border-transparent hover:text-white hover:bg-white/10"
                                      : "text-text-inactive border-transparent hover:text-text-primary hover:bg-muted/40"
                            } ${tab.disabled ? "opacity-40 cursor-not-allowed" : ""} ${itemClassName}`}
                        >
                            {tab.icon && <span className="shrink-0 flex items-center">{tab.icon}</span>}
                            <span className={shrinkable ? "truncate min-w-0" : ""}>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span
                                    className={`inline-flex items-center justify-center shrink-0 ${sizeBadgeClasses[size]} rounded-full font-bold ${
                                        isActive
                                            ? isDark
                                                ? "bg-white/20 text-white"
                                                : "bg-primary/10 text-primary"
                                            : isDark
                                              ? "bg-white/10 text-white/80"
                                              : "bg-muted text-text-muted"
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
    const sizeContainerClasses = hasInnerPadding
        ? {
              xs: "h-8 rounded-xl p-0.5",
              sm: "h-9 rounded-xl p-1",
              md: "h-10 rounded-xl p-1",
              lg: "h-11 rounded-xl p-1",
          }
        : {
              xs: "h-8 rounded-xl",
              sm: "h-9 rounded-xl",
              md: "h-10 rounded-xl",
              lg: "h-11 rounded-xl",
          };

    const sizeButtonClasses = hasInnerPadding
        ? {
              xs: "px-2 text-[11px] rounded-lg",
              sm: "px-2 sm:px-3 text-[11.5px] sm:text-[12px] rounded-lg",
              md: "px-2.5 sm:px-3.5 text-[12px] sm:text-[13px] rounded-lg",
              lg: "px-3.5 sm:px-5 text-[13px] sm:text-[14px] rounded-lg",
          }
        : {
              xs: "px-2.5 text-[11px]",
              sm: "px-3 text-[11.5px] sm:text-[12px]",
              md: "px-3.5 sm:px-4 text-[12px] sm:text-[13px]",
              lg: "px-4 sm:px-5 text-[13px] sm:text-[14px]",
          };

    const containerWidthClass =
        fullWidth === true
            ? "flex w-full"
            : fullWidth === "mobile-only"
              ? "flex w-full sm:inline-flex sm:w-fit max-w-full"
              : shrinkable
                ? "inline-flex w-fit max-w-full min-w-0 shrink"
                : "inline-flex w-fit max-w-full";

    return (
        // Outer: visual border + rounded corners (inner padding only if hasInnerPadding)
        <div
            role="tablist"
            aria-orientation="horizontal"
            className={`${containerWidthClass} ${sizeContainerClasses[size]} ${
                hasInnerPadding
                    ? isDark
                        ? "border border-white/20 bg-white/10"
                        : "border border-border bg-muted/80"
                    : isDark
                      ? "border border-white/20 bg-white/5"
                      : "border border-border bg-surface shadow-xs"
            } overflow-hidden font-inter select-none ${className}`}
        >
            {/* Inner row: segmented pills with gap if hasInnerPadding, or flush divide-x if not */}
            <div
                className={`${
                    shrinkable ? "overflow-hidden min-w-0" : "overflow-x-auto no-scrollbar scrollbar-none"
                } w-full h-full ${
                    hasInnerPadding
                        ? "flex items-center gap-1"
                        : `flex items-stretch divide-x ${isDark ? "divide-white/20" : "divide-border"}`
                }`}
            >
                {tabs.map((tab) => {
                    const isActive = activeKey === tab.key;
                    const labelString = typeof tab.label === "string" ? tab.label : undefined;
                    const isManyTabs = tabs.length > 2;

                    const buttonWidthClass = shrinkable
                        ? "flex-initial shrink min-w-0"
                        : fullWidth === true
                            ? isManyTabs
                                ? "flex-1 shrink-0 min-w-max"
                                : "flex-1 min-w-0 shrink"
                            : fullWidth === "mobile-only"
                              ? isManyTabs
                                  ? "flex-1 shrink-0 min-w-max sm:flex-initial sm:min-w-0"
                                  : "flex-1 min-w-0 shrink sm:flex-initial"
                              : isManyTabs
                                ? "flex-initial shrink-0 min-w-max"
                                : "flex-initial shrink min-w-0";

                    return (
                        <button
                            key={tab.key}
                            id={`tab-${tab.key}`}
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`tabpanel-${tab.key}`}
                            type="button"
                            disabled={tab.disabled}
                            title={labelString}
                            onClick={() => !tab.disabled && onChange(tab.key)}
                            className={`${buttonWidthClass} h-full ${sizeButtonClasses[size]} transition-colors duration-150 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap text-center outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none [-webkit-tap-highlight-color:transparent] ${
                                isActive
                                    ? isDark
                                        ? "bg-white text-primary font-bold shadow-xs border border-transparent"
                                        : "bg-primary text-white font-bold shadow-xs border border-transparent"
                                    : isDark
                                      ? "text-white/80 hover:text-white hover:bg-white/10 font-semibold bg-transparent border border-transparent"
                                      : hasInnerPadding
                                        ? "text-text-secondary hover:text-text-primary hover:bg-surface/70 font-semibold border border-transparent"
                                        : "text-text-secondary hover:text-text-primary hover:bg-muted/40 font-semibold bg-surface border border-transparent"
                            } ${tab.disabled ? "opacity-40 cursor-not-allowed" : ""} ${itemClassName}`}
                        >
                            {tab.icon && <span className="shrink-0 flex items-center">{tab.icon}</span>}
                            <span className="truncate min-w-0">
                                {tab.label}
                            </span>
                            {tab.count !== undefined && (
                                <span
                                    className={`inline-flex items-center justify-center shrink-0 ${sizeBadgeClasses[size]} rounded-full font-bold ${
                                        isActive
                                            ? isDark
                                                ? "bg-primary/15 text-primary"
                                                : "bg-white/20 text-white"
                                            : isDark
                                              ? "bg-white/15 text-white/90"
                                              : hasInnerPadding
                                                ? "bg-surface text-text-secondary border border-border"
                                                : "bg-muted text-text-muted border border-border"
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
        </div>
    );
}
