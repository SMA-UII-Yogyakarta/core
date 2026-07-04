import { Component, type ErrorInfo, type ReactNode } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import Button from "@/Components/ui/Button";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
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
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex flex-col items-center justify-center gap-4 py-16">
                    <FaExclamationTriangle className="w-12 h-12 text-[#f59e0b]" />
                    <h2 className="text-[18px] font-bold text-[#1e293b]">Terjadi Kesalahan</h2>
                    <p className="text-[14px] text-[#64748b] max-w-md text-center">
                        {this.state.error?.message ?? "Terjadi kesalahan yang tidak terduga."}
                    </p>
                    <Button variant="primary" onClick={this.handleRetry}>
                        Coba Lagi
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
