declare namespace App {
    namespace Data {
        export type AcademicCalendarData = {
            id: number;
            holiday_date: string;
            description: string | null;
            is_holiday: boolean;
            created_at: string | null;
            updated_at: string | null;
        };
        export type AttendanceData = {
            id: number;
            student_id: number;
            date: string;
            status: string;
            check_in_time: string | null;
            photo_url: string | null;
            latitude: number | null;
            longitude: number | null;
            student: App.Data.StudentData | null;
            created_at: string | null;
            updated_at: string | null;
        };
        export type GuardianData = {
            id: number;
            user_id: number | null;
            name: string;
            phone: string | null;
            address: string | null;
            user: App.Data.UserData | null;
            created_at: string | null;
            updated_at: string | null;
        };
        export type LeaveRequestData = {
            id: number;
            student_id: number;
            guardian_id: number | null;
            category: string;
            start_date: string;
            end_date: string;
            description: string | null;
            document_url: string | null;
            approval_status: string;
            student: App.Data.StudentData | null;
            guardian: App.Data.GuardianData | null;
            created_at: string | null;
            updated_at: string | null;
        };
        export type NotificationData = {
            id: number;
            sender_id: number | null;
            recipient_id: number | null;
            target_group: string | null;
            title: string;
            content: string;
            is_read: boolean;
            sender: App.Data.UserData | null;
            created_at: string | null;
        };
        export type SchoolClassData = {
            id: number;
            name: string;
            level: string;
            capacity: number;
            teacher_id: number | null;
            teacher: App.Data.TeacherData | null;
            students_count: number | null;
            created_at: string | null;
            updated_at: string | null;
        };
        export type StudentData = {
            id: number;
            user_id: number | null;
            class_id: number | null;
            nis: string;
            nisn: string;
            name: string;
            birth_date: string | null;
            phone: string | null;
            address: string | null;
            enrollment_year: number;
            status: string;
            guardian_id: number | null;
            class: App.Data.SchoolClassData | null;
            guardian: App.Data.GuardianData | null;
            user: App.Data.UserData | null;
            created_at: string | null;
            updated_at: string | null;
        };
        export type TeacherData = {
            id: number;
            user_id: number | null;
            teacher_code: string;
            name: string;
            phone: string | null;
            teacher_type: App.Enums.TeacherType | null;
            user: App.Data.UserData | null;
            created_at: string | null;
            updated_at: string | null;
        };
        export type UserData = {
            id: number;
            name: string;
            email: string;
            role: string;
            avatar: string | null;
            created_at: string | null;
            updated_at: string | null;
        };
    }
    namespace Enums {
        export type TeacherType = "piket" | "wali" | "both";
    }
}
