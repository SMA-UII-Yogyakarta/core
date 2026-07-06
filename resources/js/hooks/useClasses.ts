import { router } from "@inertiajs/react";

interface FetchClassesParams {
    tab?: string;
    search?: string;
    page?: number;
    [key: string]: string | number | undefined;
}

interface CreateClassData {
    name: string;
    teacher_id?: number;
    [key: string]: string | number | undefined;
}

interface UpdateClassData extends Partial<CreateClassData> {
    id: number;
}

interface EnrolParams {
    student_id: number | string;
    class_id: number | string;
    [key: string]: string | number | undefined;
}

interface UseClassesOptions {
    onSuccess?: () => void;
    onError?: (errors: Record<string, string>) => void;
    preserveState?: boolean;
}

export function useClasses() {
    const fetchClasses = (
        params: FetchClassesParams = {},
        options?: UseClassesOptions,
    ) => {
        router.get("/admin/master-data", params, {
            preserveState: options?.preserveState ?? true,
            onSuccess: options?.onSuccess,
            onError: options?.onError,
        });
    };

    const createClass = (
        data: CreateClassData,
        options?: UseClassesOptions,
    ) => {
        router.post("/admin/master-data/classes", data, {
            preserveState: options?.preserveState ?? true,
            onSuccess: options?.onSuccess,
            onError: options?.onError,
        });
    };

    const updateClass = (
        data: UpdateClassData,
        options?: UseClassesOptions,
    ) => {
        const { id, ...rest } = data;
        router.put(`/admin/data-master/kelas/${id}`, rest, {
            preserveState: options?.preserveState ?? true,
            onSuccess: options?.onSuccess,
            onError: options?.onError,
        });
    };

    const deleteClass = (id: number, options?: UseClassesOptions) => {
        router.delete(`/admin/data-master/kelas/${id}`, {
            preserveState: options?.preserveState ?? true,
            onSuccess: options?.onSuccess,
            onError: options?.onError,
        });
    };

    const fetchEnrolment = (classId?: string, options?: UseClassesOptions) => {
        router.get(
            "/admin/class-enrolment",
            { class_id: classId || undefined },
            { preserveState: true, ...options },
        );
    };

    const assignStudent = (data: EnrolParams, options?: UseClassesOptions) => {
        router.post("/admin/enrolment-kelas/assign", data, {
            preserveState: options?.preserveState ?? true,
            onSuccess: options?.onSuccess,
            onError: options?.onError,
        });
    };

    const removeStudent = (studentId: number, options?: UseClassesOptions) => {
        router.delete(`/admin/enrolment-kelas/remove/${studentId}`, {
            preserveState: options?.preserveState ?? true,
            onSuccess: options?.onSuccess,
            onError: options?.onError,
        });
    };

    return {
        fetchClasses,
        createClass,
        updateClass,
        deleteClass,
        fetchEnrolment,
        assignStudent,
        removeStudent,
    };
}
