import type { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';

interface AuthLayoutProps {
    title?: string;
    children: ReactNode;
}

export default function AuthLayout({ title, children }: AuthLayoutProps) {
    return (
        <>
            {title && <Head title={title} />}

            <div className="min-h-screen bg-background flex items-center justify-center p-4 lg:p-8">
                {children}
            </div>

            <footer className="fixed bottom-0 left-0 right-0 flex justify-center py-3 bg-surface border-t border-border">
                <Link
                    href="/"
                    className="text-[13px] text-text-muted font-inter hover:text-primary transition-colors"
                >
                    &larr; Kembali ke Beranda
                </Link>
            </footer>
        </>
    );
}
