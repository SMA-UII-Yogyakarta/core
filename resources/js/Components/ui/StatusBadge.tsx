import type { StatusVariant } from "@/types/component";

export type StatusInput =
    | StatusVariant
    | "hadir"
    | "terlambat"
    | "sakit"
    | "izin"
    | "alpa"
    | "alpha"
    | "permit"
    | "leave"
    | string;

interface StatusBadgeProps {
    variant: StatusInput;
    label?: string;
}

const config: Record<StatusVariant, { bg: string; text: string; defaultLabel: string }> = {
    present: {
        bg: "bg-success-light",
        text: "text-success",
        defaultLabel: "Hadir",
    },
    late: {
        bg: "bg-warning-bg",
        text: "text-warning",
        defaultLabel: "Terlambat",
    },
    absent: { bg: "bg-danger-bg", text: "text-danger", defaultLabel: "Tidak Hadir" },
    sick: {
        bg: "bg-primary-light",
        text: "text-primary",
        defaultLabel: "Sakit",
    },
    permission: {
        bg: "bg-primary-light",
        text: "text-primary",
        defaultLabel: "Izin",
    },
    active: {
        bg: "bg-success-light",
        text: "text-success",
        defaultLabel: "Aktif",
    },
    inactive: {
        bg: "bg-danger-bg",
        text: "text-danger",
        defaultLabel: "Non-Aktif",
    },
    pending: {
        bg: "bg-warning-bg",
        text: "text-warning",
        defaultLabel: "Pending",
    },
    approved: {
        bg: "bg-success-light",
        text: "text-success",
        defaultLabel: "Disetujui",
    },
    rejected: {
        bg: "bg-danger-bg",
        text: "text-danger",
        defaultLabel: "Ditolak",
    },
    no_update: {
        bg: "bg-transparent",
        text: "text-text-muted",
        defaultLabel: "-",
    },
    no_check_in: {
        bg: "bg-background border border-border",
        text: "text-text-muted",
        defaultLabel: "Belum Absen",
    },
    not_open: {
        bg: "bg-background border border-border",
        text: "text-text-muted",
        defaultLabel: "Belum Buka",
    },
};

export function resolveStatusVariant(status: string): StatusVariant {
    const s = status.toLowerCase().trim();
    if (s === "present" || s === "hadir") return "present";
    if (s === "late" || s === "terlambat") return "late";
    if (s === "absent" || s === "alpa" || s === "alpha" || s === "tidak hadir") return "absent";
    if (s === "sick" || s === "sakit") return "sick";
    if (s === "permission" || s === "izin" || s === "permit" || s === "leave" || s === "dispensasi")
        return "permission";
    if (s === "active" || s === "aktif") return "active";
    if (s === "inactive" || s === "non-aktif" || s === "nonaktif") return "inactive";
    if (s === "pending" || s === "menunggu" || s === "belum verifikasi" || s === "unverified") return "pending";
    if (s === "approved" || s === "disetujui" || s === "diizinkan" || s === "approved_leave") return "approved";
    if (s === "rejected" || s === "ditolak") return "rejected";
    if (s === "no_update" || s === "-" || s === "noupdate") return "no_update";
    if (s === "no_check_in" || s === "nocheckin" || s === "belum absen" || s === "belum_absen") return "no_check_in";
    if (s === "not_open" || s === "notopen" || s === "belum buka" || s === "belum_buka") return "not_open";
    return "pending";
}

export default function StatusBadge({ variant, label, className = "" }: StatusBadgeProps & { className?: string }) {
    const resolved = resolveStatusVariant(variant);
    const { bg, text, defaultLabel } = config[resolved] ?? config.pending;
    return (
        <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[12px] font-semibold font-inter ${bg} ${text} ${className}`}
        >
            {label ?? defaultLabel}
        </span>
    );
}
