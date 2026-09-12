import { Component, type ErrorInfo, type ReactNode } from "react";
import ErrorLayout from "@/Layouts/ErrorLayout";
import { sendToHermesAgent } from "@/services/errorReporter";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    fallbackRender?: (error: Error, reset: () => void) => ReactNode;
    onError?: (error: Error, info: ErrorInfo) => void;
    onReset?: () => void;
    className?: string;
    isRoot?: boolean;
    title?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export interface ErrorDisplayProps {
    error: Error | null;
    errorInfo?: ErrorInfo | null;
    onRetry: () => void;
    className?: string;
    isRoot?: boolean;
    title?: string;
}

export function ErrorDisplay({
    error,
    errorInfo = null,
    onRetry,
    className = "",
    isRoot = false,
    title,
}: ErrorDisplayProps) {
    return (
        <ErrorLayout
            error={error}
            errorInfo={errorInfo}
            onRetry={onRetry}
            className={className}
            isRoot={isRoot}
            title={title}
        />
    );
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error("ErrorBoundary caught:", error, info.componentStack);
        this.setState({ errorInfo: info });
        this.props.onError?.(error, info);
        // Otomatis kirim laporan error ke Sentry & Hermes Agent / OpenClaw sekolah
        sendToHermesAgent(error, { componentStack: info.componentStack });
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null, errorInfo: null });
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
                <ErrorLayout
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                    onRetry={this.handleRetry}
                    isRoot={this.props.isRoot}
                    title={this.props.title}
                    className={this.props.className}
                />
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
    return <ErrorDisplay error={error} onRetry={reset} />;
}
