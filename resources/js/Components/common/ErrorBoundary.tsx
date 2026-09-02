import { Component, useState, type ErrorInfo, type ReactNode } from "react";
import {
    FiAlertTriangle,
    FiRefreshCw,
    FiHome,
    FiCopy,
    FiCheck,
    FiMail,
    FiTerminal,
    FiChevronDown,
} from "react-icons/fi";
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

interface ErrorDisplayProps {
    error: Error | null;
    onRetry: () => void;
    className?: string;
}

export function ErrorDisplay({ error, onRetry, className = "" }: ErrorDisplayProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const errorInfo = `Error: ${error?.message || "Unknown error"}\n\nStack Trace:\n${error?.stack || "No stack trace"}`;
        navigator.clipboard.writeText(errorInfo);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReport = () => {
        const subject = encodeURIComponent("Laporan Kendala Sistem SMA UII");
        const body = encodeURIComponent(
            `Halo Tim Teknis,\n\nSaya mengalami kendala pada aplikasi dengan rincian berikut:\n\nURL: ${window.location.href}\nError: ${error?.message || "Unknown"}\n\nStack:\n${error?.stack || ""}\n`
        );
        window.open(`mailto:support@smauii.sch.id?subject=${subject}&body=${body}`, "_blank");
    };

    return (
        <div className={cn("flex-1 min-h-[440px] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter w-full", className)}>
            <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-card flex flex-col items-center text-center relative overflow-hidden transition-all">
                {/* Decorative Ambient Background */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-danger/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

                {/* Warning Icon Badge */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-danger-bg border border-danger/20 flex items-center justify-center text-danger mb-4 shadow-xs shrink-0">
                    <FiAlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-danger" />
                </div>

                {/* Header Text */}
                <h2 className="text-[18px] sm:text-[20px] font-bold text-text-primary tracking-tight font-inter">
                    Terjadi Kendala Teknis
                </h2>

                <p className="text-[13px] text-text-secondary max-w-sm mt-1.5 leading-relaxed">
                    Halaman ini mengalami kendala saat memuat atau memproses data. Silakan muat ulang atau kembali ke halaman utama.
                </p>

                {/* Error Snippet Box */}
                <div className="w-full mt-4 p-3 rounded-xl bg-muted/60 border border-border text-left flex items-start gap-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-danger/10 text-danger text-[11px] font-bold shrink-0 uppercase tracking-wider mt-0.5">
                        Error
                    </span>
                    <p className="text-[12px] font-mono text-text-primary break-all flex-1 select-all font-medium leading-tight">
                        {error?.message || "Terjadi kesalahan yang tidak terduga."}
                    </p>
                </div>

                {/* Responsive Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-5 w-full">
                    <Button
                        variant="primary"
                        onClick={onRetry}
                        className="h-10 px-4 font-bold text-[13px] rounded-xl shadow-xs flex-1 sm:flex-initial justify-center"
                        icon={<FiRefreshCw className="w-4 h-4" />}
                    >
                        Coba Lagi
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => (window.location.href = "/")}
                        className="h-10 px-4 font-bold text-[13px] rounded-xl flex-1 sm:flex-initial justify-center"
                        icon={<FiHome className="w-4 h-4" />}
                    >
                        Beranda
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={handleCopy}
                        className="h-10 px-3.5 text-[13px] font-semibold rounded-xl text-text-secondary hover:text-text-primary hover:bg-muted transition-colors flex-1 sm:flex-initial justify-center"
                        icon={copied ? <FiCheck className="w-4 h-4 text-success" /> : <FiCopy className="w-4 h-4" />}
                    >
                        {copied ? "Tersalin!" : "Salin Info"}
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={handleReport}
                        className="h-10 px-3.5 text-[13px] font-semibold rounded-xl text-text-secondary hover:text-text-primary hover:bg-muted transition-colors flex-1 sm:flex-initial justify-center"
                        icon={<FiMail className="w-4 h-4" />}
                    >
                        Laporkan
                    </Button>
                </div>

                {/* Expandable Technical Details (Stack Trace) */}
                <details className="mt-5 w-full text-left border-t border-border pt-3.5 group">
                    <summary className="text-[12px] font-semibold text-text-muted hover:text-text-primary cursor-pointer select-none flex items-center justify-between transition-colors list-none py-1">
                        <span className="flex items-center gap-1.5">
                            <FiTerminal className="w-3.5 h-3.5 text-primary" />
                            <span>Rincian Teknis (Stack Trace)</span>
                        </span>
                        <FiChevronDown className="w-3.5 h-3.5 text-text-muted group-open:rotate-180 transition-transform duration-200" />
                    </summary>
                    <div className="mt-2 text-left">
                        <pre className="p-3 bg-slate-900 text-slate-200 border border-slate-800 rounded-xl text-[11px] font-mono leading-relaxed overflow-auto max-h-40 select-all scrollbar-thin">
                            {error?.stack || "No stack trace available"}
                        </pre>
                    </div>
                </details>
            </div>
        </div>
    );
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
                <ErrorDisplay
                    error={this.state.error}
                    onRetry={this.handleRetry}
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
