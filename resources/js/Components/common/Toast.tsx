import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { Toaster as SonnerToaster, toast } from "sonner";

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
            position="top-right"
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
