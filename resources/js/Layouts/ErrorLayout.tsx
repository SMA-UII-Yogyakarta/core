import { type ErrorInfo, useMemo, useState } from "react";
import {
    FiActivity,
    FiAlertTriangle,
    FiArrowLeft,
    FiCheck,
    FiCopy,
    FiCpu,
    FiDownload,
    FiHelpCircle,
    FiHome,
    FiLayers,
    FiMail,
    FiMaximize2,
    FiMinimize2,
    FiRefreshCw,
    FiRotateCw,
    FiTerminal,
} from "react-icons/fi";
import BrandLogo from "@/Components/layout/BrandLogo";
import Button from "@/Components/ui/Button";
import { copyToClipboard } from "@/utils/helpers";

export interface ErrorLayoutProps {
    error: Error | null;
    errorInfo?: ErrorInfo | null;
    onRetry?: () => void;
    isRoot?: boolean;
    title?: string;
    className?: string;
}

type TabType = "stack" | "component" | "system";

export default function ErrorLayout({
    error,
    errorInfo,
    onRetry,
    isRoot = false,
    title = "Pusat Diagnostik & Pemulihan Sistem",
    className = "",
}: ErrorLayoutProps) {
    const [activeTab, setActiveTab] = useState<TabType>("stack");
    const [copiedTab, setCopiedTab] = useState(false);
    const [copiedReport, setCopiedReport] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [troubleshootingOpen, setTroubleshootingOpen] = useState(true);

    const timestamp = useMemo(() => {
        const now = new Date();
        return {
            iso: now.toISOString(),
            formatted:
                new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "full",
                    timeStyle: "medium",
                    timeZone: "Asia/Jakarta",
                }).format(now) + " WIB",
        };
    }, []);

    const systemInfo = useMemo(() => {
        const hasWindow = typeof window !== "undefined";
        const hasNav = typeof navigator !== "undefined";
        return {
            url: hasWindow ? window.location.href : "Unknown",
            pathname: hasWindow ? window.location.pathname : "Unknown",
            userAgent: hasNav ? navigator.userAgent : "Unknown",
            screenResolution: hasWindow
                ? `${window.screen.width} × ${window.screen.height} (DPR: ${window.devicePixelRatio || 1})`
                : "Unknown",
            viewport: hasWindow ? `${window.innerWidth} × ${window.innerHeight} px` : "Unknown",
            networkStatus: hasNav ? (navigator.onLine ? "Online (Terhubung)" : "Offline (Terputus)") : "Unknown",
            language: hasNav ? navigator.language : "Unknown",
            platform: hasNav ? navigator.platform : "Unknown",
        };
    }, []);

    const fullReportText = useMemo(() => {
        return [
            "===========================================================",
            "SMA UII CORE - LAPORAN DIAGNOSTIK KENDALA SISTEM",
            "===========================================================",
            `Waktu Kejadian  : ${timestamp.formatted} (${timestamp.iso})`,
            `Halaman / URL   : ${systemInfo.url}`,
            `Peramban        : ${systemInfo.userAgent}`,
            `Resolusi / View : ${systemInfo.screenResolution} | Viewport: ${systemInfo.viewport}`,
            `Status Jaringan : ${systemInfo.networkStatus}`,
            "",
            "-----------------------------------------------------------",
            "RINCIAN ERROR",
            "-----------------------------------------------------------",
            `Nama Error : ${error?.name || "Error"}`,
            `Pesan      : ${error?.message || "Terjadi kesalahan yang tidak terduga."}`,
            "",
            "-----------------------------------------------------------",
            "STACK TRACE",
            "-----------------------------------------------------------",
            error?.stack || "Tidak ada rincian stack trace.",
            "",
            "-----------------------------------------------------------",
            "REACT COMPONENT STACK",
            "-----------------------------------------------------------",
            errorInfo?.componentStack || "Tidak ada component stack yang tercatat.",
            "===========================================================",
        ].join("\n");
    }, [error, errorInfo, timestamp, systemInfo]);

    const handleCopyReport = async () => {
        const ok = await copyToClipboard(fullReportText);
        if (ok) {
            setCopiedReport(true);
            setTimeout(() => setCopiedReport(false), 2000);
        }
    };

    const handleCopyTabContent = async () => {
        const content =
            activeTab === "stack"
                ? error?.stack || "Tidak ada stack trace."
                : activeTab === "component"
                  ? errorInfo?.componentStack || "Tidak ada component stack."
                  : JSON.stringify(systemInfo, null, 2);

        const ok = await copyToClipboard(content);
        if (ok) {
            setCopiedTab(true);
            setTimeout(() => setCopiedTab(false), 2000);
        }
    };

    const handleDownloadLog = () => {
        const blob = new Blob([fullReportText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const safeDate = timestamp.iso.replace(/[:.]/g, "-");
        link.href = url;
        link.download = `smauii-error-log-${safeDate}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleReportEmail = () => {
        const subject = encodeURIComponent(
            `[Kendala Sistem SMA UII] ${error?.name || "Error"}: ${error?.message || "Laporan Masalah"}`,
        );
        const body = encodeURIComponent(
            `Halo Tim Teknis SMA UII,\n\nSaya mendapati kendala teknis saat menggunakan aplikasi:\n\n${fullReportText}\n`,
        );
        window.open(`mailto:support@smauii.sch.id?subject=${subject}&body=${body}`, "_blank");
    };

    const formattedStackLines = useMemo(() => {
        if (!error?.stack) return [];
        return error.stack.split("\n").map((line, idx) => {
            const isAppCode =
                line.includes("/resources/js/") ||
                line.includes("/Pages/") ||
                line.includes("/Components/") ||
                line.includes("/Layouts/");
            const isAtLine = line.trim().startsWith("at ");
            return {
                id: idx,
                raw: line,
                isAppCode,
                isAtLine,
            };
        });
    }, [error]);

    const containerClasses = isFullscreen
        ? "fixed inset-0 z-50 bg-background overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col font-inter"
        : `w-full flex-1 flex flex-col p-3 sm:p-5 lg:p-6 pb-20 sm:pb-6 font-inter min-h-0 ${className}`;

    return (
        <div className={containerClasses}>
            {/* Top Diagnostics Header / Breadcrumb Bar */}
            <div className="w-full bg-surface border border-border rounded-2xl px-3.5 py-2.5 sm:px-5 sm:py-3.5 shadow-xs mb-4 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <BrandLogo size="sm" badge={false} className="shrink-0" />
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-text-muted">
                                SMA UII Core
                            </span>
                            <span className="text-text-muted/40">•</span>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-semibold bg-danger/10 text-danger border border-danger/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                                <span className="hidden xs:inline">Mode </span>Diagnostik
                            </span>
                        </div>
                        <h1 className="text-[13.5px] sm:text-[16px] font-bold text-text-primary tracking-tight truncate">
                            {title}
                        </h1>
                    </div>
                </div>

                {/* Header Action Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
                    {onRetry && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onRetry}
                            icon={<FiRefreshCw className="w-3.5 h-3.5" />}
                            className="font-bold shadow-xs px-2.5 sm:px-3 h-8"
                            title="Coba Lagi"
                            aria-label="Coba Lagi"
                        >
                            <span className="hidden sm:inline">Coba Lagi</span>
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => (window.location.href = "/")}
                        icon={<FiHome className="w-3.5 h-3.5" />}
                        className="font-semibold px-2.5 sm:px-3 h-8"
                        title="Beranda"
                        aria-label="Beranda"
                    >
                        <span className="hidden sm:inline">Beranda</span>
                    </Button>
                    {!isRoot && (
                        <button
                            type="button"
                            onClick={() => setIsFullscreen((prev) => !prev)}
                            className="p-1.5 sm:p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-muted/80 border border-border/80 transition-colors h-8 w-8 flex items-center justify-center shrink-0"
                            title={isFullscreen ? "Keluar Layar Penuh" : "Buka Layar Penuh"}
                            aria-label={isFullscreen ? "Keluar Layar Penuh" : "Buka Layar Penuh"}
                        >
                            {isFullscreen ? (
                                <FiMinimize2 className="w-3.5 h-3.5" />
                            ) : (
                                <FiMaximize2 className="w-3.5 h-3.5" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Responsive Grid Layout (Full Space Utilization) */}
            <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 min-h-0 items-stretch">
                {/* Left Column: Action & Help Hub (5 cols on lg) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    {/* Primary Status & Action Card */}
                    <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-card relative overflow-hidden flex flex-col">
                        {/* Soft Ambient Light (Non-intrusive) */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-danger/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

                        <div className="flex items-start gap-4">
                            {/* Danger Icon Badge (Never clipped, ample spacing) */}
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-danger/10 border border-danger/25 flex items-center justify-center text-danger shrink-0 shadow-xs">
                                <FiAlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-danger" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-danger text-white text-[10.5px] font-bold uppercase tracking-wider mb-1 shadow-xs">
                                    {error?.name || "Runtime Exception"}
                                </span>
                                <h2 className="text-[16px] sm:text-[18px] font-bold text-text-primary tracking-tight leading-snug">
                                    Kendala Teknis Terdeteksi
                                </h2>
                                <p className="text-[12px] sm:text-[13px] text-text-secondary mt-1 leading-relaxed">
                                    Komponen ini terhenti saat memproses logika atau merender data antarmuka.
                                </p>
                            </div>
                        </div>

                        {/* Error Message Box */}
                        <div className="mt-4 p-3.5 rounded-xl bg-danger/5 border border-danger/20 text-left">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-danger mb-1 flex items-center gap-1.5">
                                <FiActivity className="w-3 h-3" />
                                Pesan Kesalahan
                            </div>
                            <p className="text-[12px] sm:text-[12.5px] font-mono text-danger font-medium break-words leading-relaxed select-all">
                                {error?.message || "Terjadi kesalahan yang tidak terduga pada aplikasi."}
                            </p>
                        </div>

                        {/* Primary Action Matrix */}
                        <div className="mt-5 space-y-2.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {onRetry && (
                                    <Button
                                        variant="primary"
                                        onClick={onRetry}
                                        className="h-10 px-4 font-bold text-[13px] rounded-xl shadow-xs justify-center w-full"
                                        icon={<FiRefreshCw className="w-4 h-4" />}
                                    >
                                        Coba Lagi
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.reload()}
                                    className="h-10 px-4 font-bold text-[13px] rounded-xl justify-center w-full"
                                    icon={<FiRotateCw className="w-4 h-4" />}
                                >
                                    Muat Ulang Halaman
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => (window.location.href = "/")}
                                    className="h-9 px-3 text-[12px] font-semibold rounded-xl text-text-secondary hover:text-text-primary bg-muted/60 hover:bg-muted transition-colors justify-center w-full"
                                    icon={<FiHome className="w-3.5 h-3.5" />}
                                >
                                    Ke Beranda
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => window.history.back()}
                                    className="h-9 px-3 text-[12px] font-semibold rounded-xl text-text-secondary hover:text-text-primary bg-muted/60 hover:bg-muted transition-colors justify-center w-full"
                                    icon={<FiArrowLeft className="w-3.5 h-3.5" />}
                                >
                                    Kembali
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Diagnostic Tools & IT Assistance Card */}
                    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-card flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-text-primary flex items-center gap-1.5">
                                <FiCpu className="w-3.5 h-3.5 text-primary" />
                                Alat Diagnostik & Laporan
                            </span>
                            <span className="text-[11px] text-text-muted font-medium">Untuk Tim IT / Pengembang</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={handleCopyReport}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11.5px] font-semibold bg-muted/70 hover:bg-muted text-text-primary border border-border/80 transition-all active:scale-[0.98]"
                            >
                                {copiedReport ? (
                                    <>
                                        <FiCheck className="w-3.5 h-3.5 text-success" />
                                        <span>Tersalin!</span>
                                    </>
                                ) : (
                                    <>
                                        <FiCopy className="w-3.5 h-3.5 text-text-secondary" />
                                        <span>Salin Laporan</span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadLog}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11.5px] font-semibold bg-muted/70 hover:bg-muted text-text-primary border border-border/80 transition-all active:scale-[0.98]"
                            >
                                <FiDownload className="w-3.5 h-3.5 text-text-secondary" />
                                <span>Unduh Log</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleReportEmail}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11.5px] font-semibold bg-muted/70 hover:bg-muted text-text-primary border border-border/80 transition-all active:scale-[0.98]"
                            >
                                <FiMail className="w-3.5 h-3.5 text-text-secondary" />
                                <span>Kirim Email</span>
                            </button>
                        </div>
                    </div>

                    {/* Troubleshooting Guide Accordion */}
                    <div className="bg-surface border border-border rounded-2xl p-4 shadow-card">
                        <button
                            type="button"
                            onClick={() => setTroubleshootingOpen((prev) => !prev)}
                            className="w-full flex items-center justify-between text-left select-none text-[12px] font-bold text-text-primary"
                        >
                            <span className="flex items-center gap-1.5">
                                <FiHelpCircle className="w-3.5 h-3.5 text-primary" />
                                Panduan Pemecahan Masalah Cepat
                            </span>
                            <span className="text-[11px] text-text-muted font-normal">
                                {troubleshootingOpen ? "Sembunyikan" : "Tampilkan"}
                            </span>
                        </button>

                        {troubleshootingOpen && (
                            <div className="mt-3 space-y-2 text-[11.5px] text-text-secondary leading-relaxed border-t border-border/70 pt-2.5">
                                <div className="flex items-start gap-2">
                                    <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                        1
                                    </span>
                                    <p>
                                        <strong>Coba Lagi:</strong> Klik tombol &quot;Coba Lagi&quot; untuk mereset
                                        komponen dan mengeksekusi ulang fungsi terkait.
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                        2
                                    </span>
                                    <p>
                                        <strong>Segarkan Cache:</strong> Jika aplikasi baru saja diperbarui, klik
                                        &quot;Muat Ulang Halaman&quot; atau tekan Ctrl+F5 (Cmd+Shift+R).
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                        3
                                    </span>
                                    <p>
                                        <strong>Hubungi Tim Teknis:</strong> Salin laporan atau unduh log kendala, lalu
                                        lampirkan ke tim IT SMA UII untuk penanganan.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Technical Inspector / Diagnostic Console (7 cols on lg) */}
                <div className="lg:col-span-7 flex flex-col min-h-[420px] lg:min-h-0 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                    {/* Console Header Bar with macOS-style dots and Tabs */}
                    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 select-none shrink-0">
                        {/* Left: Window Dots & Title */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 font-semibold hidden sm:inline">
                                {"smauii-inspector // v2.0"}
                            </span>
                        </div>

                        {/* Middle: Tab Switcher */}
                        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
                            <button
                                type="button"
                                onClick={() => setActiveTab("stack")}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                                    activeTab === "stack"
                                        ? "bg-slate-800 text-white font-bold shadow-xs"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <FiTerminal className="w-3 h-3 text-red-400" />
                                <span>Stack Trace</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("component")}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                                    activeTab === "component"
                                        ? "bg-slate-800 text-white font-bold shadow-xs"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <FiLayers className="w-3 h-3 text-sky-400" />
                                <span>Component Stack</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("system")}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                                    activeTab === "system"
                                        ? "bg-slate-800 text-white font-bold shadow-xs"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <FiCpu className="w-3 h-3 text-emerald-400" />
                                <span>Lingkungan</span>
                            </button>
                        </div>

                        {/* Right: Tab Quick Action (Copy) */}
                        <button
                            type="button"
                            onClick={handleCopyTabContent}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
                            title="Salin Rincian Tab Ini"
                        >
                            {copiedTab ? (
                                <>
                                    <FiCheck className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400 font-bold">Tersalin</span>
                                </>
                            ) : (
                                <>
                                    <FiCopy className="w-3 h-3" />
                                    <span>Salin Tab</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Console Tab Content Pane */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed select-all scrollbar-thin scrollbar-thumb-slate-800">
                        {activeTab === "stack" && (
                            <div className="space-y-1">
                                {formattedStackLines.length > 0 ? (
                                    formattedStackLines.map((line) => (
                                        <div
                                            key={line.id}
                                            className={`py-0.5 px-2 rounded transition-colors ${
                                                line.isAppCode
                                                    ? "bg-red-950/40 text-red-200 border-l-2 border-red-500 font-semibold"
                                                    : line.isAtLine
                                                      ? "text-slate-400 hover:text-slate-300"
                                                      : "text-red-400 font-bold"
                                            }`}
                                        >
                                            {line.raw}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-slate-500 italic p-3">
                                        Tidak ada data stack trace yang tersedia untuk kesalahan ini.
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "component" && (
                            <div className="space-y-2">
                                {errorInfo?.componentStack ? (
                                    <pre className="text-sky-200 whitespace-pre-wrap leading-relaxed">
                                        {errorInfo.componentStack}
                                    </pre>
                                ) : (
                                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 space-y-2">
                                        <div className="flex items-center gap-2 text-sky-400 font-bold">
                                            <FiLayers className="w-4 h-4" />
                                            <span>Component Stack Belum Tersedia</span>
                                        </div>
                                        <p className="text-[11.5px] leading-relaxed text-slate-300">
                                            Informasi hierarki komponen React tidak tercatat untuk error ini, atau error
                                            terjadi pada runtime di luar siklus lifecycle render komponen React.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "system" && (
                            <div className="space-y-3 text-slate-300">
                                <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-3 space-y-2">
                                    <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                                        Informasi Eksekusi & Waktu
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                        <div>
                                            <span className="text-slate-500 block">Waktu Tercatat (WIB):</span>
                                            <span className="text-slate-200 font-semibold">{timestamp.formatted}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">Timestamp ISO:</span>
                                            <span className="text-slate-200 font-semibold">{timestamp.iso}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-3 space-y-2">
                                    <div className="text-[10px] uppercase font-bold tracking-wider text-sky-400">
                                        Rute & Peramban (Browser)
                                    </div>
                                    <div className="space-y-1.5 text-[11px]">
                                        <div>
                                            <span className="text-slate-500 block">URL Halaman:</span>
                                            <span className="text-sky-300 break-all">{systemInfo.url}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">Pathname:</span>
                                            <span className="text-slate-200">{systemInfo.pathname}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">User Agent:</span>
                                            <span className="text-slate-300 break-all">{systemInfo.userAgent}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-3 space-y-2">
                                    <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                                        Dimensi Layar & Status Jaringan
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                        <div>
                                            <span className="text-slate-500 block">Resolusi Monitor:</span>
                                            <span className="text-slate-200">{systemInfo.screenResolution}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">Ukuran Viewport:</span>
                                            <span className="text-slate-200">{systemInfo.viewport}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">Koneksi Internet:</span>
                                            <span className="text-slate-200">{systemInfo.networkStatus}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">Bahasa Sistem:</span>
                                            <span className="text-slate-200">{systemInfo.language}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Console Footer Status */}
                    <div className="bg-slate-900/80 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[10px] font-mono text-slate-400 shrink-0">
                        <span>Status: EXCEPTION_CAUGHT</span>
                        <span className="text-slate-500">ID: {timestamp.iso.slice(0, 10)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
