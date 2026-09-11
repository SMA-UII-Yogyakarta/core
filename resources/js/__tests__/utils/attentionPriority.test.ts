import { describe, expect, it } from "vitest";
import { attentionPriority } from "../../utils/attentionPriority";

describe("Attention Priority Utility", () => {
    it("ranks absent streak >= 3 as highest priority", () => {
        expect(attentionPriority("absent", 3)).toBe(1);
        expect(attentionPriority("absent", 5)).toBe(1);
    });

    it("ranks absent streak 1-2 below pending", () => {
        expect(attentionPriority("absent", 1)).toBe(3);
        expect(attentionPriority("absent", 2)).toBe(3);
    });

    it("keeps other statuses on their base priority", () => {
        expect(attentionPriority("pending", 0)).toBe(2);
        expect(attentionPriority("permitted", 0)).toBe(4);
        expect(attentionPriority("late", 0)).toBe(5);
        expect(attentionPriority("present", 0)).toBe(6);
    });
});