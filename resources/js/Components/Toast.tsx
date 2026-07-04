import { useEffect, useReducer } from "react";
import { usePage } from "@inertiajs/react";

type ToastType = "success" | "error" | "warning";

interface Flash {
    success?: string;
    error?: string;
    warning?: string;
}

type Action =
    { type: "SHOW"; message: string; toastType: ToastType } | { type: "HIDE" };

interface State {
    visible: boolean;
    message: string;
    type: ToastType;
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "SHOW":
            return {
                visible: true,
                message: action.message,
                type: action.toastType,
            };
        case "HIDE":
            return { ...state, visible: false };
        default:
            return state;
    }
}

const INITIAL: State = {
    visible: false,
    message: "",
    type: "success",
};

export default function Toast() {
    const { props } = usePage();
    const flash = props.flash as Flash | undefined;
    const [toast, dispatch] = useReducer(reducer, INITIAL);

    useEffect(() => {
        if (flash?.success) {
            dispatch({
                type: "SHOW",
                message: flash.success,
                toastType: "success",
            });
        } else if (flash?.error) {
            dispatch({
                type: "SHOW",
                message: flash.error,
                toastType: "error",
            });
        } else if (flash?.warning) {
            dispatch({
                type: "SHOW",
                message: flash.warning,
                toastType: "warning",
            });
        }
    }, [flash]);

    useEffect(() => {
        if (toast.visible) {
            const timer = setTimeout(() => dispatch({ type: "HIDE" }), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.visible]);

    if (!toast.visible) return null;

    const bgColor = {
        success: "bg-success",
        error: "bg-danger",
        warning: "bg-warning",
    }[toast.type];

    return (
        <div
            className={`fixed top-4 right-4 z-[100] ${bgColor} text-white px-5 py-3 rounded-lg shadow-lg font-inter text-[13px] font-medium animate-slide-in`}
        >
            <div className="flex items-center gap-2">
                <i
                    className={`fas ${
                        toast.type === "success"
                            ? "fa-check-circle"
                            : toast.type === "error"
                              ? "fa-exclamation-circle"
                              : "fa-exclamation-triangle"
                    }`}
                />
                <span>{toast.message}</span>
                <button
                    onClick={() => dispatch({ type: "HIDE" })}
                    className="ml-3 text-white/70 hover:text-white"
                    type="button"
                >
                    <i className="fas fa-times" />
                </button>
            </div>
        </div>
    );
}
