import { router } from "@inertiajs/react";

interface FetchAttendanceParams {
    bulan?: string;
    tahun?: string;
    page?: number;
    [key: string]: string | number | undefined;
}

interface CheckInData {
    latitude: number;
    longitude: number;
    photo_url?: string;
    [key: string]: string | number | undefined;
}

interface UseAttendanceOptions {
    onSuccess?: () => void;
    onError?: (errors: Record<string, string>) => void;
    preserveState?: boolean;
}

export function useAttendance() {
    const fetchHistory = (
        params: FetchAttendanceParams = {},
        options?: UseAttendanceOptions,
    ) => {
        router.get("/student/history", params, {
            preserveState: options?.preserveState ?? true,
            onSuccess: options?.onSuccess,
            onError: options?.onError,
        });
    };

    const checkIn = (data: CheckInData, options?: UseAttendanceOptions) => {
        router.post("/student/live-attendance/checkin", data, {
            preserveState: options?.preserveState ?? true,
            onSuccess: options?.onSuccess,
            onError: options?.onError,
        });
    };

    return { fetchHistory, checkIn };
}
