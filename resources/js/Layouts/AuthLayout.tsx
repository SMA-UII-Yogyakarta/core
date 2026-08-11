import type { ReactNode } from 'react';
import { Head } from '@inertiajs/react';

interface AuthLayoutProps {
    title?: string;
    children: ReactNode;
}

export default function AuthLayout({ title, children }: AuthLayoutProps) {
    return (
        <>
            {title && <Head title={title} />}

            <div className="min-h-dvh bg-background flex p-0 lg:p-6 lg:items-center lg:justify-center">
                {children}
            </div>
        </>
    );
}
