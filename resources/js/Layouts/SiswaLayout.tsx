import type { PropsWithChildren } from 'react';

interface SiswaLayoutProps extends PropsWithChildren {
  title?: string;
}

export default function SiswaLayout({ children, title }: SiswaLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile header */}
      <header className="lg:hidden bg-primary text-white px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-sm">SMA UII</span>
        <span className="text-xs text-white/70">Siswa</span>
      </header>

      {/* Navbar (desktop) */}
      <div className="hidden lg:flex h-16 bg-surface border-b border-border items-center px-6">
        <span className="font-bold text-primary">SMA UII YOGYAKARTA</span>
      </div>

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {title && (
          <h1 className="text-lg font-bold text-text-primary mb-4">{title}</h1>
        )}
        {children}
      </main>
    </div>
  );
}
