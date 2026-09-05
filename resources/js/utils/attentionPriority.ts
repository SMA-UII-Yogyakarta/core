export type RowStatus = "absent" | "late" | "pending" | "permitted" | "present";

const BASE_PRIORITY: Record<Exclude<RowStatus, "absent">, number> = {
    pending: 2,
    permitted: 4,
    late: 5,
    present: 6,
};

export function attentionPriority(status: RowStatus, consecutiveAbsences: number): number {
    if (status === "absent") {
        return consecutiveAbsences >= 3 ? 1 : 3;
    }
    return BASE_PRIORITY[status];
}