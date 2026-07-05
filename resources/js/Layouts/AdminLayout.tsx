import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import Sidebar from '../Components/ui/Sidebar';
import Navbar from '../Components/ui/Navbar';
import { FaTimes } from 'react-icons/fa';

interface AdminLayoutProps extends PropsWithChildren {
  title?: string;
  user?: { name: string; email: string } | null;
}

export default function AdminLayout({ children, title, user }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Desktop — fixed */}
      <Sidebar className="hidden lg:flex w-60 fixed left-0 top-0 z-30" />

      {/* Sidebar Mobile — overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
          fixed left-0 top-0 h-full z-50 lg:hidden transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `.trim()}
      >
        <div className="relative h-full">
          <Sidebar />
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 -right-10 w-8 h-8 bg-surface rounded-r-md flex items-center justify-center shadow"
            aria-label="Close sidebar"
          >
            <FaTimes className="w-3 h-3 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Main area — offset for desktop sidebar */}
      <div className="flex-1 flex flex-col lg:ml-60">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {title && (
            <h1 className="text-lg font-bold text-text-primary mb-4">{title}</h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
