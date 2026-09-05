import { describe, expect, it } from "vitest";
import { attentionPriority } from "../../utils/attentionPriority";

describe("Attention Priority Utility", () => {
    it("ranks alpa streak >= 3 as highest priority", () => {
        expect(attentionPriority("alpa", 3)).toBe(1);
        expect(attentionPriority("alpa", 5)).toBe(1);
    });

    it("ranks alpa streak 1-2 below pending", () => {
        expect(attentionPriority("alpa", 1)).toBe(3);
        expect(attentionPriority("alpa", 2)).toBe(3);
    });

    it("keeps other statuses on their base priority", () => {
        expect(attentionPriority("pending", 0)).toBe(2);
        expect(attentionPriority("diizinkan", 0)).toBe(4);
        expect(attentionPriority("terlambat", 0)).toBe(5);
        expect(attentionPriority("hadir", 0)).toBe(6);
    });
});