export interface Student {
    id: number;
    name: string;
    nis: string;
    nisn: string;
}

export interface Guardian {
    id: number;
    name: string;
}

export interface LeaveRequest {
    id: number;
    student: Student;
    guardian: Guardian | null;
    category: "Sick" | "Event" | "Competition" | "Other";
    start_date: string;
    end_date: string;
    description: string | null;
    document_url: string | null;
    approval_status: "Pending" | "Approved" | "Rejected";
    rejection_reason?: string | null;
    created_at: string;
    updated_at?: string;
}

export interface PageProps {
    teacher: { id: number; name: string };
    class: { id: number; name: string } | null;
    leaveRequests: LeaveRequest[];
}

export const categoryConfig: Record<
    string,
    { label: string; textColor: string; badgeBgColor: string; borderColor: string }
> = {
    Sick: {
        label: "Sakit",
        textColor: "text-text-medical",
        badgeBgColor: "bg-medical-bg",
        borderColor: "border-l-medical",
    },
    Event: {
        label: "Izin Acara",
        textColor: "text-text-permit",
        badgeBgColor: "bg-permit-bg",
        borderColor: "border-l-permit",
    },
    Competition: {
        label: "Lomba",
        textColor: "text-text-achievement",
        badgeBgColor: "bg-achievement-bg",
        borderColor: "border-l-achievement",
    },
    Other: {
        label: "Lainnya",
        textColor: "text-text-info",
        badgeBgColor: "bg-info-bg",
        borderColor: "border-l-info",
    },
};

export const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

export const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Baru saja";
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays === 1) return "Kemarin";
    return formatDate(dateStr);
};

export const calculateDuration = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
};

export const getDocumentTypeLabel = (url: string | null): string => {
    if (!url) return "Dokumen";
    if (url.includes("doctor") || url.includes("surat")) return "Surat Dokter";
    if (url.includes("invitation") || url.includes("undangan"))
        return "Undangan";
    return "Dokumen";
};

export const daysUntil = (dateStr: string): number => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const getUrgencyInfo = (startDate: string) => {
    const days = daysUntil(startDate);
    if (days < -1) {
        const n = Math.abs(days);
        return { label: `Terlambat ${n} hari`, isOverdue: true };
    }
    if (days === -1) return { label: "Kemarin", isOverdue: true };
    if (days === 0) return { label: "Hari ini", isOverdue: false };
    if (days === 1) return { label: "Besok", isOverdue: false };
    return null;
};
