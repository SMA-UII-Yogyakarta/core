import { ReactNode } from "react";
import { FiInbox, FiAlertCircle, FiSearch, FiShield, FiCamera, FiFileText, FiClock, FiInfo } from "react-icons/fi";
import { FiRefreshCw } from "react-icons/fi";

interface EmptyStateProps {
    variant?: "default" | "no-data" | "no-results" | "no-permission" | "no-camera" | "no-attendance" | "no-leaves" | "no-history" | "loading" | "error";
    title?: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    actionOnClick?: () => void;
    icon?: ReactNode;
    className?: string;
    actionVariant?: "primary" | "secondary" | "ghost" | "outline";
    showRetry?: boolean;
    onRetry?: () => void;
}

const variants: Record<string, { icon: ReactNode; defaultTitle: string; defaultDescription: string }> = {
    "no-data": {
        icon: <FiInbox className="text-4xl" />,
        defaultTitle: "Tidak Ada Data",
        defaultDescription: "Belum ada data yang tersedia saat ini.",
    },
    "no-results": {
        icon: <FiSearch className="text-4xl" />,
        defaultTitle: "Tidak Ditemukan",
        defaultDescription: "Coba ubah filter atau kata kunci pencarian Anda.",
    },
    "no-permission": {
        icon: <FiShield className="text-4xl" />,
        defaultTitle: "Akses Ditolak",
        defaultDescription: "Anda tidak memiliki izin untuk mengakses halaman ini.",
    },
    "no-camera": {
        icon: <FiCamera className="text-4xl" />,
        defaultTitle: "Kamera Tidak Tersedia",
        defaultDescription: "Pastikan kamera diizinkan di pengaturan browser.",
    },
    "no-attendance": {
        icon: <FiClock className="text-4xl" />,
        defaultTitle: "Belum Ada Presensi",
        defaultDescription: "Belum ada data presensi untuk hari ini.",
    },
    "no-leaves": {
        icon: <FiFileText className="text-4xl" />,
        defaultTitle: "Belum Ada Pengajuan Izin",
        defaultDescription: "Belum ada pengajuan izin yang diajukan.",
    },
    "no-history": {
        icon: <FiClock className="text-4xl" />,
        defaultTitle: "Belum Ada Riwayat",
        defaultDescription: "Belum ada riwayat kehadiran untuk periode ini.",
    },
    "loading": {
        icon: <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />,
        defaultTitle: "Memuat...",
        defaultDescription: "Mohon tunggu sebentar.",
    },
    "error": {
        icon: <FiAlertCircle className="text-4xl text-red-500" />,
        defaultTitle: "Terjadi Kesalahan",
        defaultDescription: "Terjadi kesalahan saat memuat data.",
    },
    default: {
        icon: <FiInfo className="text-4xl" />,
        defaultTitle: "Kosong",
        defaultDescription: "Tidak ada data untuk ditampilkan.",
    },
};

interface EmptyStateProps {
    variant?: "default" | "no-data" | "no-results" | "no-permission" | "no-camera" | "no-attendance" | "no-leaves" | "no-history" | "loading" | "error";
    title?: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    actionOnClick?: () => void;
    icon?: ReactNode;
    className?: string;
    actionVariant?: "primary" | "secondary" | "ghost" | "outline";
    showRetry?: boolean;
    onRetry?: () => void;
}

export default function EmptyState({
    variant = "default",
    title,
    description,
    actionLabel,
    actionHref,
    actionOnClick,
    icon,
    className = "",
    actionVariant = "primary",
    showRetry = false,
    onRetry,
}: EmptyStateProps) {
    const config = variants[variant] || variants.default;
    const Icon = icon || config.icon;
    const resolvedTitle = title || config.defaultTitle;
    const resolvedDescription = description || config.defaultDescription;

    const handleAction = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
        if (actionOnClick) {
            e.preventDefault();
            actionOnClick();
        }
    };

    const handleRetry = () => {
        if (onRetry) onRetry();
        else window.location.reload();
    };

    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-primary/10 rounded-2xl">
                {Icon}
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">{resolvedTitle}</h3>
            <p className="text-text-muted mb-6 max-w-md">{resolvedDescription}</p>

            {(actionLabel || showRetry) && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-xs">
                    {actionLabel && (
                        <a
                            href={actionHref || "#"}
                            onClick={handleAction}
                            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                                actionVariant === "primary"
                                    ? "bg-primary text-white hover:bg-primary/90"
                                    : actionVariant === "secondary"
                                    ? "bg-accent text-primary hover:bg-accent/90"
                                    : actionVariant === "outline"
                                    ? "bg-transparent border-2 border-primary text-primary hover:bg-primary/10"
                                    : "bg-surface border border-border text-text-primary hover:bg-background"
                            }`}
                        >
                            {actionLabel}
                        </a>
                    )}
                    {showRetry && (
                        <button
                            onClick={handleRetry}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                        >
                            <FiRefreshCw className="w-4 h-4" />
                            Coba Lagi
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}