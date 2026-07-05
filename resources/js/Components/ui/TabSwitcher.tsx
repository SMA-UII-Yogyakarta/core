interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabSwitcherProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  className?: string;
}

export default function TabSwitcher({
  tabs,
  activeTab,
  onChange,
  className = '',
}: TabSwitcherProps) {
  return (
    <div className={`overflow-x-auto scrollbar-hide ${className}`}>
      <div className="inline-flex items-center gap-1 min-w-max md:justify-center w-full bg-background rounded-lg p-1">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md
                whitespace-nowrap transition-colors duration-150
                ${isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface'
                }
              `.trim()}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`
                    inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold rounded-full px-1
                    ${isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-background text-text-muted'
                    }
                  `.trim()}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
