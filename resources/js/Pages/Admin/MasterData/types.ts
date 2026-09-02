export interface SchoolClass {
    id: number;
    name: string;
    level: string;
    academic_year?: string;
    capacity: number;
    teacher: { id: number; name: string } | null;
    students_count: number;
}

export interface Student {
    id: number;
    nis: string;
    nisn: string;
    name: string;
    birth_date?: string;
    phone?: string | null;
    address?: string | null;
    enrollment_year?: number;
    guardian_id?: number | null;
    class: { id: number; name: string } | null;
    status: string;
    user?: { email?: string; username?: string } | null;
}

export interface Teacher {
    id: number;
    teacher_code: string;
    name: string;
    teacher_type?: string[] | string;
    user: { email?: string } | null;
    school_classes?: SchoolClass[];
}

export interface Guardian {
    id: number;
    name: string;
    phone: string | null;
    address?: string | null;
    user: { email?: string } | null;
    students?: Student[];
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export interface SearchConfig {
    mode: "client" | "server";
    allData?: SchoolClass[];
}

export interface ClassOption {
    id: number;
    name: string;
}

export interface MasterDataProps {
    students?: PaginatedData<Student>;
    teachers?: PaginatedData<Teacher>;
    allTeachers?: Teacher[];
    schoolClasses?: PaginatedData<SchoolClass>;
    classOptions?: ClassOption[];
    allGuardians?: { id: number; name: string }[];
    guardians?: PaginatedData<Guardian>;
    searchConfig?: SearchConfig;
    activeTab?: string;
    filters?: Record<string, string | undefined>;
}
