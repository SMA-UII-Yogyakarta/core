import { router } from "@inertiajs/react";

interface FetchStudentsParams {
    tab?: string;
    search?: string;
    page?: number;
    [key: string]: string | number | undefined;
}

interface CreateStudentData {
    nis: string;
    nisn: string;
    name: string;
    class_id?: number;
    birth_date?: string;
    phone?: string;
    address?: string;
    enrollment_year?: number;
    guardian_id?: number;
    email?: string;
    password?: string;
    [key: string]: string | number | undefined;
}

interface UpdateStudentData extends Partial<CreateStudentData> {
    id: number;
}

interface UseStudentsOptions {
    onSuccess?: () => void;
    onError?: (errors: Record<string, string>) => void;
    preserveState?: boolean;
}

export function useStudents() {
    const fetchStudents = (
        params: FetchStudentsParams = {},
        options?: UseStudentsOptions,
    ) => {
        router.get("/admin/data-master", params, {
            preserveState: options?.preserveState ?? true,
            onSuccess: options?.onSuccess,
            onError: options?.onError,
        });
    };

    const createStudent = (
        data: CreateStudentData,
        options?: UseStudentsOptions,
    ) => {
        router.post("/admin/data-master/siswa", data, {
            preserveState: options?.preserveState ?? true,
            onSuccess: options?.onSuccess,
            onError: options?.onError,
        });
    };

    const updateStudent = (
        data: UpdateStudentData,
        options?: UseStudentsOptions,
    ) => {
        const { id, ...rest } = data;
        router.put(`/admin/data-master/siswa/${id}`, rest, {
            preserveState: options?.preserveState ?? true,
            onSuccess: options?.onSuccess,
            onError: options?.onError,
        });
    };

    const deleteStudent = (id: number, options?: UseStudentsOptions) => {
        router.delete(`/admin/data-master/siswa/${id}`, {
            preserveState: options?.preserveState ?? true,
            onSuccess: options?.onSuccess,
            onError: options?.onError,
        });
    };

    return { fetchStudents, createStudent, updateStudent, deleteStudent };
}
