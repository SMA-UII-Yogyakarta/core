/**
 * Image Compressor Utility for Client-Side Presensi Photo Offloading
 * Enforces strict <= 20KB payload limit via HTML5 Canvas API
 */

export interface CompressionResult {
    dataUrl: string;
    base64: string;
    sizeInBytes: number;
    sizeInKb: number;
    qualityUsed: number;
}

export function compressCanvasToJpeg(
    canvasElement: HTMLCanvasElement,
    maxBytes: number = 20 * 1024,
    initialQuality: number = 0.7
): CompressionResult {
    let quality = initialQuality;
    let dataUrl = canvasElement.toDataURL("image/jpeg", quality);
    let base64 = dataUrl.split(",")[1] || "";
    let sizeInBytes = Math.round((base64.length * 3) / 4);

    let attempts = 0;
    while (sizeInBytes > maxBytes && quality > 0.1 && attempts < 6) {
        quality -= 0.1;
        dataUrl = canvasElement.toDataURL("image/jpeg", Math.max(quality, 0.1));
        base64 = dataUrl.split(",")[1] || "";
        sizeInBytes = Math.round((base64.length * 3) / 4);
        attempts++;
    }

    return {
        dataUrl,
        base64,
        sizeInBytes,
        sizeInKb: Number((sizeInBytes / 1024).toFixed(2)),
        qualityUsed: Number(quality.toFixed(2)),
    };
}

export function compressImageFromVideo(
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    maxBytes: number = 20 * 1024,
    maxWidth: number = 320,
    maxHeight: number = 240
): CompressionResult {
    canvasElement.width = maxWidth;
    canvasElement.height = maxHeight;
    const ctx = canvasElement.getContext("2d");

    if (!ctx) {
        throw new Error("Unable to obtain 2D canvas context");
    }

    ctx.drawImage(videoElement, 0, 0, maxWidth, maxHeight);
    return compressCanvasToJpeg(canvasElement, maxBytes, 0.7);
}
