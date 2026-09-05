export type RowStatus = "alpa" | "terlambat" | "pending" | "diizinkan" | "hadir";

const BASE_PRIORITY: Record<Exclude<RowStatus, "alpa">, number> = {
    pending: 2,
    diizinkan: 4,
    terlambat: 5,
    hadir: 6,
};

export function attentionPriority(status: RowStatus, consecutiveAbsences: number): number {
    if (status === "alpa") {
        return consecutiveAbsences >= 3 ? 1 : 3;
    }
    return BASE_PRIORITY[status];
}