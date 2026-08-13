import { Head } from "@inertiajs/react";
import type { ReactNode } from "react";

interface PublicLayoutProps {
    title?: string;
    children: ReactNode;
}

export default function PublicLayout({ title, children }: PublicLayoutProps) {
    return (
        <>
            {title && <Head title={title} />}
            <div className="min-h-screen flex flex-col bg-background">
                <main className="flex-1">{children}</main>
            </div>
        </>
    );
}
