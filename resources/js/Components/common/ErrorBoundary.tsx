import { Component, type ErrorInfo, type ReactNode } from "react";
import { FiAlertTriangle, FiRefreshCw, FiHome, FiCopy, FiMail } from "react-icons/fi";
import Button from "@/Components/ui/Button";
import { cn } from "@/utils/helpers";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    fallbackRender?: (error: Error, reset: () => void) => ReactNode;
    onError?: (error: Error, info: ErrorInfo) => void;
    onReset?: () => void;
    className?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error("ErrorBoundary caught:", error, info.componentStack);
        this.props.onError?.(error, info);
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
        this.props.onReset?.();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallbackRender) {
                return this.props.fallbackRender(this.state.error!, this.handleRetry);
            }

            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className={cn("flex flex-col items-center justify-center gap-4 py-16 px-4", this.props.className)}>
                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-amber/10 rounded-2xl">
                        <FiAlertTriangle className="w-8 h-8 text-amber-500" />
                    </div>

                    <h2 className="text-xl font-bold text-text-primary mb-2">Terjadi Kesalahan</h2>

                    <p className="text-text-muted text-center max-w-md mb-6">
                        {this.state.error?.message ??
                            "Terjadi kesalahan yang tidak terduga. Tim teknis kami telah diberitahu."}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-xs">
                        <Button variant="primary" onClick={this.handleRetry} className="flex-1 sm:flex-none">
                            <FiRefreshCw className="w-4 h-4 mr-2" />
                            Coba Lagi
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => (window.location.href = "/")}
                            className="flex-1 sm:flex-none"
                        >
                            <FiHome className="w-4 h-4 mr-2" />
                            Beranda
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => {
                                window.open(
                                    `mailto:support@smauii.sch.id?subject=Error%20Report&body=${encodeURIComponent(
                                        `Error: ${this.state.error?.message}\nStack: ${this.state.error?.stack}`,
                                    )}`,
                                    "_blank",
                                );
                            }}
                            className="flex-1 sm:flex-none"
                        >
                            <FiMail className="w-4 h-4 mr-2" />
                            Laporkan
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    `Error: ${this.state.error?.message}\nStack: ${this.state.error?.stack}`,
                                );
                            }}
                            className="flex-1 sm:flex-none"
                        >
                            <FiCopy className="w-4 h-4 mr-2" />
                            Salin Error
                        </Button>
                    </div>

                    <details className="mt-6 w-full max-w-md text-left">
                        <summary className="text-sm text-text-muted cursor-pointer select-none">
                            Detail Teknis (Klik untuk Buka)
                        </summary>
                        <pre className="mt-2 p-3 bg-background border border-border rounded-lg text-xs text-text-muted overflow-auto max-h-48">
                            {this.state.error?.stack ?? "No stack trace available"}
                        </pre>
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<Props, "children">,
) {
    return function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary {...errorBoundaryProps}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}

export function ErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 px-4">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-amber/10 rounded-2xl">
                <FiAlertTriangle className="w-8 h-8 text-amber-500" />
            </div>

            <h2 className="text-xl font-bold text-text-primary mb-2">Terjadi Kesalahan</h2>

            <p className="text-text-muted text-center max-w-md mb-6">
                {error?.message ?? "Terjadi kesalahan yang tidak terduga."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-xs">
                <Button variant="primary" onClick={reset}>
                    <FiRefreshCw className="w-4 h-4 mr-2" />
                    Coba Lagi
                </Button>

                <Button variant="outline" onClick={() => (window.location.href = "/")}>
                    <FiHome className="w-4 h-4 mr-2" />
                    Beranda
                </Button>
            </div>

            <details className="mt-6 w-full max-w-md text-left">
                <summary className="text-sm text-text-muted cursor-pointer select-none">
                    Detail Teknis (Klik untuk Buka)
                </summary>
                <pre className="mt-2 p-3 bg-background border border-border rounded-lg text-xs text-text-muted overflow-auto max-h-48">
                    {error?.stack ?? "No stack trace available"}
                </pre>
            </details>
        </div>
    );
}
