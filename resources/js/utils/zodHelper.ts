import { z } from "zod";

export function validateForm<T extends z.ZodTypeAny>(
    schema: T,
    data: unknown,
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!errors[path]) {
            errors[path] = issue.message;
        }
    }
    return { success: false, errors };
}
