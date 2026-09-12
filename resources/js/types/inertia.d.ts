import type { User } from "@/types";

declare module "@inertiajs/react" {
    interface PageProps {
        auth: {
            user: User | null;
        };
        locale?: "id" | "en";
        translations?: Record<string, string>;
        [key: string]: unknown;
    }
}
