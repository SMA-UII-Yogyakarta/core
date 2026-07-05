import type { PropsWithChildren } from 'react';

interface GuruLayoutProps extends PropsWithChildren {
  title?: string;
  user?: { name: string; email: string } | null;
}

export default function GuruLayout({ children, title, user }: GuruLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Mini sidebar — icon only */}
      <aside className="w-16 bg-primary flex flex-col items-center py-4 gap-4 shrink-0">
        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
          <span className="text-primary font-extrabold text-xs">U</span>
        </div>

        <nav className="flex flex-col gap-2 mt-4">
          {[
            { icon: '📊', label: 'Dashboard' },
            { icon: '📋', label: 'Kelas' },
            { icon: '✓', label: 'Verifikasi' },
          ].map((item) => (
            <button
              key={item.label}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              title={item.label}
            >
              <span className="text-sm">{item.icon}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
          <span className="text-sm font-semibold text-text-primary">
            {title ?? 'Dashboard Guru'}
          </span>

          {user && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">{user.name}</span>
              <div className="w-8 h-8 rounded-full bg-background" />
            </div>
          )}
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
