import type { StatusVariant } from "@/types/component";

interface StatusBadgeProps {
    variant: StatusVariant;
    label?: string;
}

const config: Record<
    StatusVariant,
    { bg: string; text: string; defaultLabel: string }
> = {
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
};

export default function StatusBadge({ variant, label }: StatusBadgeProps) {
    const { bg, text, defaultLabel } = config[variant];
    return (
        <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[12px] font-semibold font-inter ${bg} ${text}`}
        >
            {label ?? defaultLabel}
        </span>
    );
}
