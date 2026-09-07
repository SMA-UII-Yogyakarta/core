export interface ProfileUser {
    id: number;
    name: string;
    email: string | null;
    role: string;
    avatar?: string | null;
    avatar_url?: string | null;
    teacher?: { id: number; name: string; teacher_code: string; teacher_type: string[] } | null;
    student?: {
        id: number;
        nis: string;
        nisn: string;
        name: string;
        class?: { id: number; name: string } | null;
    } | null;
    guardian?: { id: number; name: string; phone: string | null } | null;
}

export interface ProfileSession {
    id: number;
    name: string;
    last_used_at: string | null;
    created_at: string | null;
}

export type ProfileSubPage = "profile" | "security" | "notifications" | "sessions";

export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    leave: boolean;
    attendance: boolean;
}
