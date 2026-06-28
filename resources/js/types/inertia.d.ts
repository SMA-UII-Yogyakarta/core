import type { User } from '@/types';

declare module '@inertiajs/react' {
    interface PageProps {
        auth: {
            user: User | null;
        };
        [key: string]: unknown;
    }
}

export {};
