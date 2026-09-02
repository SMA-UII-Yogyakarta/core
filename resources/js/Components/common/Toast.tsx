import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { Toaster as SonnerToaster, toast } from "sonner";

export type ToastPosition =
    | "top-left"
    | "top-right"
    | "top-center"
    | "bottom-left"
    | "bottom-right"
    | "bottom-center";

export const TOAST_POSITION_KEY = "smauii_toast_position";

export function getSavedToastPosition(): ToastPosition {
    if (typeof window === "undefined") return "bottom-right";
    try {
        const saved = localStorage.getItem(TOAST_POSITION_KEY) as ToastPosition | null;
        if (
            saved &&
            [
                "top-left",
                "top-right",
                "top-center",
                "bottom-left",
                "bottom-right",
                "bottom-center",
            ].includes(saved)
        ) {
            return saved;
        }
    } catch {
        // Ignore localStorage error in restricted environments
    }
    return "bottom-right";
}

export function setSavedToastPosition(position: ToastPosition) {
    if (typeof window !== "undefined") {
        try {
            localStorage.setItem(TOAST_POSITION_KEY, position);
        } catch {
            // Ignore error
        }
        window.dispatchEvent(
            new CustomEvent("toast-position-changed", { detail: position }),
        );
    }
}

interface Flash {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export { toast };

export default function Toast() {
    const { props } = usePage();
    const flash = props.flash as Flash | undefined;
    const [position, setPosition] = useState<ToastPosition>(getSavedToastPosition);

    useEffect(() => {
        const handlePositionChange = (e: Event) => {
            const customEvent = e as CustomEvent<ToastPosition>;
            if (customEvent.detail) {
                setPosition(customEvent.detail);
            } else {
                setPosition(getSavedToastPosition());
            }
        };

        window.addEventListener("toast-position-changed", handlePositionChange);
        window.addEventListener("storage", handlePositionChange);

        return () => {
            window.removeEventListener("toast-position-changed", handlePositionChange);
            window.removeEventListener("storage", handlePositionChange);
        };
    }, []);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        } else if (flash?.error) {
            toast.error(flash.error);
        } else if (flash?.warning) {
            toast.warning(flash.warning);
        } else if (flash?.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    return (
        <SonnerToaster
            position={position}
            richColors
            closeButton
            duration={4000}
            toastOptions={{
                className: "font-inter text-[13px] rounded-xl shadow-lg border border-border",
                style: {
                    fontFamily: "Inter, sans-serif",
                },
            }}
        />
    );
}
