import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';

export default function AppLayout({ children }: PropsWithChildren) {
    return (
        <div className="bg-[#FDFDFC] dark:bg-[#0a0a0a] text-[#1b1b18] flex p-6 lg:p-8 items-center lg:justify-center min-h-screen flex-col">
            <header className="w-full lg:max-w-4xl max-w-[335px] text-sm mb-6">
                <nav className="flex items-center justify-end gap-4">
                    <Link
                        href="/"
                        className="inline-block px-5 py-1.5 dark:text-[#EDEDEC] text-[#1b1b18] border border-transparent hover:border-[#19140035] dark:hover:border-[#3E3E3A] rounded-sm text-sm leading-normal"
                    >
                        Home
                    </Link>
                </nav>
            </header>

            <main className="w-full flex items-center justify-center lg:grow">
                {children}
            </main>

            <footer className="w-full lg:max-w-4xl max-w-[335px] text-sm mt-8 text-center text-[#706f6c] dark:text-[#A1A09A]">
                &copy; {new Date().getFullYear()} SMA UII Yogyakarta &mdash;
                PT Koneksi Jaringan Indonesia
            </footer>
        </div>
    );
}
