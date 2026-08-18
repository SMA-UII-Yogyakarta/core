interface Tab {
    key: string;
    label: string;
    count?: number;
}

interface TabSwitcherProps {
    tabs: Tab[];
    activeKey: string;
    onChange: (key: string) => void;
    className?: string;
}

export default function TabSwitcher({ tabs, activeKey, onChange, className = "" }: TabSwitcherProps) {
    return (
        <div className={`flex gap-2 sm:gap-3 border-b border-border overflow-x-auto no-scrollbar scrollbar-none ${className}`}>
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onChange(tab.key)}
                    className={`px-4 sm:px-5 py-2.5 text-[13px] sm:text-[14px] font-inter font-medium transition-all border-b-2 -mb-px inline-flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer rounded-t-lg focus:outline-none focus:ring-0 ${
                        activeKey === tab.key
                            ? "text-primary border-primary font-bold bg-primary/5"
                            : "text-text-inactive border-transparent hover:text-text-primary hover:bg-muted/50"
                    }`}
                    type="button"
                >
                    {tab.label}
                    {tab.count !== undefined && (
                        <span
                            className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold ${
                                activeKey === tab.key ? "bg-accent text-primary" : "bg-background text-text-muted"
                            }`}
                        >
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
