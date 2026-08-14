import { z } from "zod";

export function validateForm<T extends z.ZodTypeAny>(
    schema: T,
    data: unknown,
):
    | { success: true; data: z.infer<T> }
    | { success: false; errors: Partial<Record<keyof z.infer<T>, string>> } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors: Partial<Record<keyof z.infer<T>, string>> = {};
    for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof z.infer<T>;
        if (path && !errors[path]) {
            errors[path] = issue.message;
        }
    }
    return { success: false, errors };
}
