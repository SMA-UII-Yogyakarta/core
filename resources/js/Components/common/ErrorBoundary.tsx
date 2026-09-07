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
import { cn, copyToClipboard } from "@/utils/helpers";

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
        copyToClipboard(errorInfo);
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
        <div
            className={cn(
                "flex-1 min-h-[70vh] flex items-center justify-center p-3.5 sm:p-6 lg:p-8 font-inter w-full",
                className
            )}
        >
            <div className="w-full max-w-lg bg-surface border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-card flex flex-col items-center text-center relative overflow-hidden transition-all">
                {/* Ambient Decorative Glows */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-danger/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                {/* Warning Badge Icon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center text-danger mb-3.5 shadow-xs shrink-0">
                    <FiAlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-danger" />
                </div>

                {/* Heading & Subtitle */}
                <h2 className="text-[17px] sm:text-[20px] font-bold text-text-primary tracking-tight font-inter">
                    Terjadi Kendala Teknis
                </h2>

                <p className="text-[12.5px] sm:text-[13.5px] text-text-secondary max-w-sm mt-1.5 leading-relaxed">
                    Halaman ini mengalami kendala saat memuat atau memproses data. Silakan muat ulang atau kembali ke halaman utama.
                </p>

                {/* Error Snippet Box */}
                <div className="w-full mt-4 p-3 rounded-xl bg-danger/5 border border-danger/15 text-left flex items-start gap-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-danger text-white text-[10px] font-bold shrink-0 uppercase tracking-wider mt-0.5">
                        Error
                    </span>
                    <p className="text-[11.5px] sm:text-[12px] font-mono text-danger-text font-medium break-words leading-snug flex-1 select-all">
                        {error?.message || "Terjadi kesalahan yang tidak terduga."}
                    </p>
                </div>

                {/* Action Buttons Matrix */}
                <div className="w-full space-y-2 mt-5">
                    {/* Primary Actions (Equal Grid on Tablet/Desktop, Full-Width Stack on Mobile) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                        <Button
                            variant="primary"
                            onClick={onRetry}
                            className="h-10 px-4 font-bold text-[13px] rounded-xl shadow-xs justify-center w-full"
                            icon={<FiRefreshCw className="w-4 h-4" />}
                        >
                            Coba Lagi
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => (window.location.href = "/")}
                            className="h-10 px-4 font-bold text-[13px] rounded-xl justify-center w-full"
                            icon={<FiHome className="w-4 h-4" />}
                        >
                            Beranda
                        </Button>
                    </div>

                    {/* Secondary Actions (Equal 2-Col Grid across all screens) */}
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <Button
                            variant="ghost"
                            onClick={handleCopy}
                            className="h-9 px-3 text-[12px] font-semibold rounded-xl text-text-secondary hover:text-text-primary bg-muted/50 hover:bg-muted transition-colors justify-center w-full"
                            icon={copied ? <FiCheck className="w-3.5 h-3.5 text-success" /> : <FiCopy className="w-3.5 h-3.5" />}
                        >
                            {copied ? "Tersalin!" : "Salin Info"}
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={handleReport}
                            className="h-9 px-3 text-[12px] font-semibold rounded-xl text-text-secondary hover:text-text-primary bg-muted/50 hover:bg-muted transition-colors justify-center w-full"
                            icon={<FiMail className="w-3.5 h-3.5" />}
                        >
                            Laporkan
                        </Button>
                    </div>
                </div>

                {/* Expandable Stack Trace Drawer */}
                <details className="mt-4 w-full text-left border-t border-border/80 pt-3 group">
                    <summary className="text-[12px] font-semibold text-text-muted hover:text-text-primary cursor-pointer select-none flex items-center justify-between transition-colors list-none py-1">
                        <span className="flex items-center gap-1.5">
                            <FiTerminal className="w-3.5 h-3.5 text-primary" />
                            <span>Rincian Teknis (Stack Trace)</span>
                        </span>
                        <FiChevronDown className="w-3.5 h-3.5 text-text-muted group-open:rotate-180 transition-transform duration-200" />
                    </summary>
                    <div className="mt-2 text-left">
                        <pre className="p-3 sm:p-3.5 bg-slate-950 text-slate-300 border border-slate-800 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all max-h-48 select-all scrollbar-thin">
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
