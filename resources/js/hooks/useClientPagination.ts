import { useMemo, useState } from "react";

export interface UseClientPaginationResult<T> {
    currentPage: number;
    setCurrentPage: (page: number) => void;
    totalPages: number;
    safePage: number;
    paginatedData: T[];
    pageSize: number;
}

export function useClientPagination<T>(
    data: T[],
    initialPage = 1,
    pageSize = 10
): UseClientPaginationResult<T> {
    const [currentPage, setCurrentPage] = useState(initialPage);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(data.length / pageSize)),
        [data.length, pageSize]
    );

    const safePage = useMemo(
        () => Math.min(Math.max(1, currentPage), totalPages),
        [currentPage, totalPages]
    );

    const paginatedData = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, safePage, pageSize]);

    return {
        currentPage,
        setCurrentPage,
        totalPages,
        safePage,
        paginatedData,
        pageSize,
    };
}