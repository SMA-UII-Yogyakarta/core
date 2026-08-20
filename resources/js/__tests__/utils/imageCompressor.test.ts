import { describe, expect, test } from "vitest";
import { compressCanvasToJpeg } from "../../utils/imageCompressor";

describe("imageCompressor utility", () => {
    test("compressCanvasToJpeg returns compression result object", () => {
        // Mock canvas implementation for node/bun environment
        const mockCanvas = {
            toDataURL: (_type: string, quality: number) => {
                const dummyBase64 = "A".repeat(Math.round(1000 * quality));
                return `data:image/jpeg;base64,${dummyBase64}`;
            },
        } as unknown as HTMLCanvasElement;

        const result = compressCanvasToJpeg(mockCanvas, 20 * 1024, 0.7);

        expect(result).toHaveProperty("dataUrl");
        expect(result).toHaveProperty("base64");
        expect(result).toHaveProperty("sizeInBytes");
        expect(result).toHaveProperty("sizeInKb");
        expect(result).toHaveProperty("qualityUsed");
        expect(result.sizeInBytes).toBeLessThanOrEqual(20 * 1024);
    });

    test("compressCanvasToJpeg reduces quality iteratively if initial size exceeds maxBytes", () => {
        let callCount = 0;
        const mockCanvas = {
            toDataURL: (_type: string, quality: number) => {
                callCount++;
                // First attempt generates > 20KB, subsequent attempt shrinks
                const size = quality > 0.5 ? 30000 : 10000;
                const dummyBase64 = "B".repeat(size);
                return `data:image/jpeg;base64,${dummyBase64}`;
            },
        } as unknown as HTMLCanvasElement;

        const result = compressCanvasToJpeg(mockCanvas, 20 * 1024, 0.7);

        expect(callCount).toBeGreaterThan(1);
        expect(result.qualityUsed).toBeLessThan(0.7);
        expect(result.sizeInBytes).toBeLessThanOrEqual(20 * 1024);
    });
});
