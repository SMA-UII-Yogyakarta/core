import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ErrorBoundary, { ErrorDisplay } from "@/Components/common/ErrorBoundary";
import ErrorLayout from "@/Layouts/ErrorLayout";

function BuggyComponent({ shouldThrow }: { shouldThrow?: boolean }) {
    if (shouldThrow) {
        throw new Error("Simulated Test Crash");
    }
    return <div>Normal Content Loaded</div>;
}

describe("ErrorBoundary & ErrorLayout", () => {
    it("renders children normally when no error occurs", () => {
        render(
            <ErrorBoundary>
                <BuggyComponent shouldThrow={false} />
            </ErrorBoundary>
        );
        expect(screen.getByText("Normal Content Loaded")).toBeDefined();
    });

    it("catches errors and renders ErrorLayout with details", () => {
        // Suppress console.error in test output
        const spy = vi.spyOn(console, "error").mockImplementation(() => {});

        render(
            <ErrorBoundary>
                <BuggyComponent shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText("Simulated Test Crash")).toBeDefined();
        expect(screen.getByText("Kendala Teknis Terdeteksi")).toBeDefined();
        expect(screen.getByText("Pusat Diagnostik & Pemulihan Sistem")).toBeDefined();
        expect(screen.getByText("Stack Trace")).toBeDefined();
        expect(screen.getByText("Component Stack")).toBeDefined();
        expect(screen.getByText("Lingkungan")).toBeDefined();

        spy.mockRestore();
    });

    it("allows switching tabs between Stack Trace, Component Stack, and Lingkungan", () => {
        const testError = new Error("Custom Test Error");
        testError.stack = "Error: Custom Test Error\n    at BuggyComponent (http://localhost/Buggy.tsx:10:5)";

        render(
            <ErrorLayout
                error={testError}
                errorInfo={{ componentStack: "\n    in BuggyComponent\n    in ErrorBoundary" }}
            />
        );

        // Initially on Stack Trace
        expect(screen.getByText("Stack Trace")).toBeDefined();

        // Switch to Component Stack tab
        const componentTabBtn = screen.getByRole("button", { name: /Component Stack/i });
        fireEvent.click(componentTabBtn);
        expect(screen.getByText(/in BuggyComponent/i)).toBeDefined();

        // Switch to Lingkungan tab
        const systemTabBtn = screen.getByRole("button", { name: /Lingkungan/i });
        fireEvent.click(systemTabBtn);
        expect(screen.getByText(/Informasi Eksekusi & Waktu/i)).toBeDefined();
        expect(screen.getByText(/Resolusi Monitor:/i)).toBeDefined();
    });

    it("invokes onRetry callback when Coba Lagi is clicked", () => {
        const onRetryMock = vi.fn();
        render(
            <ErrorDisplay
                error={new Error("Retry test")}
                onRetry={onRetryMock}
            />
        );

        const retryButtons = screen.getAllByRole("button", { name: /Coba Lagi/i });
        fireEvent.click(retryButtons[0]);
        expect(onRetryMock).toHaveBeenCalledTimes(1);
    });
});
