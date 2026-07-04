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

export default function TabSwitcher({ tabs, activeKey, onChange, className = '' }: TabSwitcherProps) {
    return (
        <div className={`flex gap-1 border-b border-border ${className}`}>
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onChange(tab.key)}
                    className={`px-4 py-2.5 text-[14px] font-inter font-medium transition-colors border-b-2 -mb-px inline-flex items-center gap-2 ${
                        activeKey === tab.key
                            ? 'text-primary border-primary font-bold'
                            : 'text-text-inactive border-transparent hover:text-text-primary'
                    }`}
                    type="button"
                >
                    {tab.label}
                    {tab.count !== undefined && (
                        <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold ${
                            activeKey === tab.key
                                ? 'bg-accent text-primary'
                                : 'bg-background text-text-muted'
                        }`}>
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
