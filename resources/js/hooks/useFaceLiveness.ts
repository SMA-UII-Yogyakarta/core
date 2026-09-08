import { useCallback, useEffect, useRef, useState } from "react";

export interface FaceLandmark {
    x: number;
    y: number;
    z?: number;
}

export type LivenessStatus = "initializing" | "searching" | "aligning" | "blinking" | "verified" | "unsupported";

export interface FaceLivenessResult {
    status: LivenessStatus;
    isModelLoaded: boolean;
    faceDetected: boolean;
    isHeadAligned: boolean;
    hasBlinked: boolean;
    isLivenessVerified: boolean;
    feedbackMessage: string;
    earValue: number;
    resetLiveness: () => void;
}

interface FaceMeshInstance {
    setOptions: (options: Record<string, unknown>) => void;
    onResults: (callback: (results: { multiFaceLandmarks?: FaceLandmark[][] }) => void) => void;
    send: (input: { image: HTMLVideoElement }) => Promise<void>;
    close?: () => void;
}

declare global {
    interface Window {
        FaceMesh?: new (config: { locateFile: (file: string) => string }) => FaceMeshInstance;
    }
}

// Landmark Indices based on MediaPipe 468/478 mesh
const NOSE_TIP = 1;
const FOREHEAD = 10;
const CHIN = 152;
const LEFT_CHEEK = 234;
const RIGHT_CHEEK = 454;

// Eye Landmarks
const LEFT_EYE = { p1: 33, p2: 160, p3: 158, p4: 133, p5: 153, p6: 144 };
const RIGHT_EYE = { p1: 362, p2: 385, p3: 387, p4: 263, p5: 380, p6: 373 };

const EAR_CLOSED_THRESHOLD = 0.2;
const EAR_OPEN_THRESHOLD = 0.25;

function calculateEAR(landmarks: FaceLandmark[], eye: typeof LEFT_EYE): number {
    const p1 = landmarks[eye.p1];
    const p2 = landmarks[eye.p2];
    const p3 = landmarks[eye.p3];
    const p4 = landmarks[eye.p4];
    const p5 = landmarks[eye.p5];
    const p6 = landmarks[eye.p6];

    if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6) return 0.3;

    const distA = Math.hypot(p2.x - p6.x, p2.y - p6.y);
    const distB = Math.hypot(p3.x - p5.x, p3.y - p5.y);
    const distC = Math.hypot(p1.x - p4.x, p1.y - p4.y);

    return (distA + distB) / (2.0 * Math.max(distC, 0.001));
}

export function useFaceLiveness(
    videoRef: React.RefObject<HTMLVideoElement | null> | React.RefObject<HTMLVideoElement | null>[],
    cameraReady: boolean,
): FaceLivenessResult {
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [isHeadAligned, setIsHeadAligned] = useState(false);
    const [hasBlinked, setHasBlinked] = useState(false);
    const [earValue, setEarValue] = useState(0.3);
    const [status, setStatus] = useState<LivenessStatus>("initializing");
    const [feedbackMessage, setFeedbackMessage] = useState("Memuat AI Face Recognition...");

    const faceMeshRef = useRef<FaceMeshInstance | null>(null);
    const blinkStateRef = useRef<"OPEN" | "CLOSING" | "CLOSED">("OPEN");
    const blinkStartTimestampRef = useRef<number>(0);
    const animationFrameIdRef = useRef<number | null>(null);
    const isProcessingRef = useRef(false);

    const resetLiveness = useCallback(() => {
        setIsHeadAligned(false);
        setHasBlinked(false);
        blinkStateRef.current = "OPEN";
        blinkStartTimestampRef.current = 0;
        setStatus("searching");
        setFeedbackMessage("Posisikan wajah Anda tepat di dalam lingkaran.");
    }, []);

    // 1. Inject & Load MediaPipe FaceMesh Script
    useEffect(() => {
        let isMounted = true;

        if (typeof window === "undefined") return;

        if (window.FaceMesh) {
            queueMicrotask(() => {
                if (isMounted) setIsModelLoaded(true);
            });
            return;
        }

        const scriptId = "mediapipe-facemesh-script";
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;
        if (!script) {
            script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js";
            script.crossOrigin = "anonymous";
            script.onload = () => {
                if (isMounted) setIsModelLoaded(true);
            };
            script.onerror = () => {
                if (isMounted) {
                    // Fallback if CDN unreachable / offline
                    setIsModelLoaded(false);
                    setStatus("unsupported");
                    setFeedbackMessage("Posisikan wajah Anda di dalam lingkaran.");
                }
            };
            document.body.appendChild(script);
        } else {
            const checkTimer = setInterval(() => {
                if (window.FaceMesh && isMounted) {
                    clearInterval(checkTimer);
                    setIsModelLoaded(true);
                }
            }, 100);
            return () => clearInterval(checkTimer);
        }

        return () => {
            isMounted = false;
        };
    }, []);

    // 2. Initialize FaceMesh model instance
    useEffect(() => {
        if (!isModelLoaded || !window.FaceMesh || faceMeshRef.current) return;

        try {
            const faceMesh = new window.FaceMesh({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`,
            });

            faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            faceMesh.onResults((results) => {
                if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
                    setFaceDetected(false);
                    setIsHeadAligned(false);
                    setStatus("searching");
                    setFeedbackMessage("Wajah belum terdeteksi. Posisikan wajah di depan kamera.");
                    return;
                }

                setFaceDetected(true);
                const landmarks = results.multiFaceLandmarks[0];

                const nose = landmarks[NOSE_TIP];
                const forehead = landmarks[FOREHEAD];
                const chin = landmarks[CHIN];
                const leftCheek = landmarks[LEFT_CHEEK];
                const rightCheek = landmarks[RIGHT_CHEEK];

                if (!nose || !forehead || !chin || !leftCheek || !rightCheek) return;

                // A. Head Alignment Calculation
                const noseDistFromCenter = Math.hypot(nose.x - 0.5, nose.y - 0.48);
                const faceHeight = Math.abs(chin.y - forehead.y);
                const faceWidth = Math.abs(rightCheek.x - leftCheek.x);

                const isCentered = noseDistFromCenter < 0.16;
                const isGoodDistance = faceHeight >= 0.28 && faceHeight <= 0.68 && faceWidth >= 0.2;

                let aligned = false;
                if (!isCentered) {
                    setFeedbackMessage("Arahkan wajah Anda ke tengah lingkaran.");
                    setStatus("aligning");
                } else if (faceHeight < 0.28) {
                    setFeedbackMessage("Wajah terlalu jauh. Silakan mendekat ke kamera.");
                    setStatus("aligning");
                } else if (faceHeight > 0.68) {
                    setFeedbackMessage("Wajah terlalu dekat. Mundur sedikit.");
                    setStatus("aligning");
                } else if (isGoodDistance && isCentered) {
                    aligned = true;
                    setIsHeadAligned(true);
                }

                // B. Eye Blink / Liveness Detection (EAR)
                const leftEAR = calculateEAR(landmarks, LEFT_EYE);
                const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
                const avgEAR = (leftEAR + rightEAR) / 2;
                setEarValue(parseFloat(avgEAR.toFixed(3)));

                const now = Date.now();
                if (blinkStateRef.current === "OPEN") {
                    if (avgEAR < EAR_CLOSED_THRESHOLD) {
                        blinkStateRef.current = "CLOSING";
                        blinkStartTimestampRef.current = now;
                    }
                } else if (blinkStateRef.current === "CLOSING") {
                    if (avgEAR > EAR_OPEN_THRESHOLD) {
                        const blinkDuration = now - blinkStartTimestampRef.current;
                        if (blinkDuration >= 80 && blinkDuration <= 700) {
                            setHasBlinked(true);
                        }
                        blinkStateRef.current = "OPEN";
                    }
                }

                // C. Set Feedback & Status
                if (aligned) {
                    setHasBlinked((prevBlinked) => {
                        if (prevBlinked) {
                            setStatus("verified");
                            setFeedbackMessage("Liveness Terverifikasi! Silakan kirim presensi.");
                        } else {
                            setStatus("blinking");
                            setFeedbackMessage("Posisi wajah pas! Silakan kedipkan mata Anda 1x.");
                        }
                        return prevBlinked;
                    });
                }
            });

            faceMeshRef.current = faceMesh;
        } catch (err) {
            console.warn("FaceMesh initialization fallback:", err);
        }

        return () => {
            if (faceMeshRef.current) {
                faceMeshRef.current.close?.();
                faceMeshRef.current = null;
            }
        };
    }, [isModelLoaded]);

    // 3. Continuous Video Processing Loop
    useEffect(() => {
        let isRunning = true;

        const getActiveVideo = (): HTMLVideoElement | null => {
            const refs = Array.isArray(videoRef) ? videoRef : [videoRef];
            // 1. Try to find a visible video element with readyState >= 2
            for (const ref of refs) {
                const v = ref?.current;
                if (v && v.readyState >= 2 && v.videoWidth > 0 && v.offsetParent !== null) {
                    return v;
                }
            }
            // 2. Fallback to any ready video element
            for (const ref of refs) {
                const v = ref?.current;
                if (v && v.readyState >= 2 && v.videoWidth > 0) {
                    return v;
                }
            }
            return null;
        };

        const processVideo = async () => {
            if (!isRunning) return;

            const video = getActiveVideo();
            const faceMesh = faceMeshRef.current;

            if (cameraReady && video && faceMesh && !isProcessingRef.current) {
                try {
                    isProcessingRef.current = true;
                    await faceMesh.send({ image: video });
                } catch {
                    // Ignore transient frame send error
                } finally {
                    isProcessingRef.current = false;
                }
            }

            if (isRunning) {
                animationFrameIdRef.current = requestAnimationFrame(processVideo);
            }
        };

        if (cameraReady && isModelLoaded) {
            animationFrameIdRef.current = requestAnimationFrame(processVideo);
        }

        return () => {
            isRunning = false;
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, [cameraReady, isModelLoaded, videoRef]);

    const isLivenessVerified = isHeadAligned && hasBlinked;

    return {
        status: isLivenessVerified ? "verified" : status,
        isModelLoaded,
        faceDetected,
        isHeadAligned,
        hasBlinked,
        isLivenessVerified,
        feedbackMessage,
        earValue,
        resetLiveness,
    };
}
