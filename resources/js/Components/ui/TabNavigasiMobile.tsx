interface TabNavigasiMobileProps {
  activeTab: 'anomali' | 'data-izin';
  onChange: (tab: 'anomali' | 'data-izin') => void;
  className?: string;
}

const tabs = [
  { key: 'anomali' as const, label: 'Anomali Absen' },
  { key: 'data-izin' as const, label: 'Data Izin' },
];

export default function TabNavigasiMobile({
  activeTab,
  onChange,
  className = '',
}: TabNavigasiMobileProps) {
  return (
    <div
      className={`flex justify-center bg-surface w-full ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              flex-1 h-[41px] flex flex-col items-center justify-center
              text-[11px] transition-colors duration-150
              ${isActive
                ? 'font-bold text-primary border-b-2 border-primary'
                : 'font-semibold text-text-inactive'
              }
            `.trim()}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
