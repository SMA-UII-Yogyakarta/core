import type { ChartDataPoint } from "@/Components/features/AttendanceChart";
import type { StatusVariant } from "@/types/component";

export interface Stats {
    total_students: number;
    verified_present: number;
    late: number;
    sick_permit: number;
    absent: number;
}

export interface SchoolClass {
    id: number;
    name: string;
}

export interface AttentionStudent {
    id: number;
    name: string;
    nis: string;
    nisn: string;
    status: string;
    check_in_time: string | null;
    keterangan: string | null;
    leave_request_id: number | null;
}

export interface MonthlyTrend {
    year: number;
    months: ChartDataPoint[];
}

export interface WeeklyTrendPoint {
    label: string;
    total: number;
    present: number;
    late: number;
}

export type Period = "Harian" | "Bulanan" | "Semester";

export const STATUS_CONFIG: Record<string, { variant: StatusVariant; label: string; timeColor?: string }> = {
    Present: { variant: "present", label: "HADIR" },
    Late: { variant: "late", label: "TERLAMBAT", timeColor: "text-warning" },
    Absent: { variant: "absent", label: "ALPA" },
    Sick: { variant: "sick", label: "SAKIT" },
    Permission: { variant: "permission", label: "IZIN" },
    Pending: { variant: "pending", label: "PENDING IZIN" },
};
