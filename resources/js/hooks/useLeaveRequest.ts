import { router } from "@inertiajs/react";

interface CreateLeaveData {
    student_id: string | number;
    category: string;
    start_date: string;
    end_date: string;
    description?: string;
    [key: string]: string | number | undefined;
}

interface ApproveRejectData {
    /** Status keputusan: approved (terima) atau rejected (tolak) */
    status: "approved" | "rejected";
    /** Catatan opsional dari approver */
    notes?: string;
    [key: string]: string | undefined;
}

interface FetchLeaveParams {
    page?: number;
    status?: string;
    search?: string;
    [key: string]: string | number | undefined;
}

interface UseLeaveRequestOptions {
    onSuccess?: () => void;
    onError?: (errors: Record<string, string>) => void;
    preserveState?: boolean;
}

export function useLeaveRequest() {
    const fetchRequests = (
        params: FetchLeaveParams = {},
        options?: UseLeaveRequestOptions,
    ) => {
        router.get("/admin/leave-requests", params, {
            preserveState: options?.preserveState ?? true,
            onSuccess: options?.onSuccess,
            onError: options?.onError,
        });
    };

    const createRequest = (
        data: CreateLeaveData,
        options?: UseLeaveRequestOptions,
    ) => {
        router.post("/guardian/leave-application", data, {
            preserveState: options?.preserveState ?? true,
            onSuccess: options?.onSuccess,
            onError: options?.onError,
        });
    };

    const approveRequest = (
        id: number,
        data?: ApproveRejectData,
        options?: UseLeaveRequestOptions,
    ) => {
        router.patch(
            `/admin/leave-verification/${id}`,
            data ?? { status: "approved" },
            {
                preserveState: options?.preserveState ?? true,
                onSuccess: options?.onSuccess,
                onError: options?.onError,
            },
        );
    };

    const rejectRequest = (
        id: number,
        data?: ApproveRejectData,
        options?: UseLeaveRequestOptions,
    ) => {
        router.patch(
            `/admin/leave-verification/${id}`,
            data ?? { status: "rejected" },
            {
                preserveState: options?.preserveState ?? true,
                onSuccess: options?.onSuccess,
                onError: options?.onError,
            },
        );
    };

    return { fetchRequests, createRequest, approveRequest, rejectRequest };
}
