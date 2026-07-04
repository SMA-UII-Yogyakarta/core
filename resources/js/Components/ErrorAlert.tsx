import { FaExclamationCircle } from "react-icons/fa";
import Button from "@/Components/ui/Button";

interface ErrorAlertProps {
    message: string;
    onRetry?: () => void;
    className?: string;
}

export default function ErrorAlert({
    message,
    onRetry,
    className = "",
}: ErrorAlertProps) {
    return (
        <div
            className={`bg-danger-bg border border-danger-light rounded-lg p-4 flex items-start gap-3 ${className}`}
        >
            <FaExclamationCircle className="text-danger mt-0.5 shrink-0 text-base" />

            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-text-primary">
                    Gagal memuat data
                </p>
                <p className="text-text-muted text-xs mt-0.5">{message}</p>
            </div>

            {onRetry && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="shrink-0"
                >
                    Coba Lagi
                </Button>
            )}
        </div>
    );
}
