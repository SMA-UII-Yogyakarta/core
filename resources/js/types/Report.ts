export interface DailyStudent {
    id: number;
    name: string;
    nis: string;
    status: string;
    check_in_time: string | null;
}

export interface RecapStudent {
    id: number;
    name: string;
    nis: string;
    present: number;
    permission: number;
    sick: number;
    pending: number;
    absent: number;
    on_time: number;
    late: number;
    discipline_rate: number;
    attendance_rate: number;
}

export type StudentRecap = RecapStudent;

export interface Summary {
    on_time: number;
    late: number;
    permission: number;
    sick: number;
    pending: number;
    absent: number;
    attendance_rate: number;
    total_students?: number;
    school_days?: number;
    discipline_rate?: number;
}

export interface DailyBreakdown {
    date: string;
    label: string;
    on_time: number;
    late: number;
    permission: number;
    sick: number;
    pending: number;
    absent: number;
    is_non_school?: boolean;
    is_past?: boolean;
    note?: string;
}

export interface MonthlyBreakdown {
    month_label: string;
    on_time: number;
    late: number;
    permission: number;
    sick: number;
    pending: number;
    absent: number;
}
