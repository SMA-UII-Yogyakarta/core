export type User = App.Data.UserData;
export type Teacher = App.Data.TeacherData;
export type Guardian = App.Data.GuardianData;
export type Student = App.Data.StudentData;
export type SchoolClass = App.Data.SchoolClassData;
export type Attendance = App.Data.AttendanceData;
export type LeaveRequest = App.Data.LeaveRequestData;
export type NotificationItem = App.Data.NotificationData;
export type AcademicCalendar = App.Data.AcademicCalendarData;
export type TeacherType = App.Enums.TeacherType;

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}
