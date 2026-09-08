import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useClientPagination } from "../hooks/useClientPagination";

describe("useClientPagination", () => {
    const mockData = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Student ${i + 1}` }));

    it("initializes with default page 1 and page size 10", () => {
        const { result } = renderHook(() => useClientPagination(mockData));
        expect(result.current.currentPage).toBe(1);
        expect(result.current.safePage).toBe(1);
        expect(result.current.pageSize).toBe(10);
        expect(result.current.totalPages).toBe(3);
        expect(result.current.paginatedData).toHaveLength(10);
        expect(result.current.paginatedData[0].id).toBe(1);
        expect(result.current.paginatedData[9].id).toBe(10);
    });

    it("changes page correctly when setCurrentPage is called", () => {
        const { result } = renderHook(() => useClientPagination(mockData));
        act(() => {
            result.current.setCurrentPage(2);
        });
        expect(result.current.currentPage).toBe(2);
        expect(result.current.safePage).toBe(2);
        expect(result.current.paginatedData).toHaveLength(10);
        expect(result.current.paginatedData[0].id).toBe(11);
    });

    it("handles last page with partial items", () => {
        const { result } = renderHook(() => useClientPagination(mockData));
        act(() => {
            result.current.setCurrentPage(3);
        });
        expect(result.current.safePage).toBe(3);
        expect(result.current.paginatedData).toHaveLength(5);
        expect(result.current.paginatedData[4].id).toBe(25);
    });

    it("clamps safePage when currentPage is greater than totalPages", () => {
        const { result } = renderHook(() => useClientPagination(mockData, 10));
        expect(result.current.currentPage).toBe(10);
        expect(result.current.totalPages).toBe(3);
        expect(result.current.safePage).toBe(3);
        expect(result.current.paginatedData).toHaveLength(5);
    });

    it("clamps safePage when currentPage is less than 1", () => {
        const { result } = renderHook(() => useClientPagination(mockData, -2));
        expect(result.current.currentPage).toBe(-2);
        expect(result.current.safePage).toBe(1);
        expect(result.current.paginatedData).toHaveLength(10);
    });

    it("handles empty array gracefully", () => {
        const { result } = renderHook(() => useClientPagination([]));
        expect(result.current.totalPages).toBe(1);
        expect(result.current.safePage).toBe(1);
        expect(result.current.paginatedData).toEqual([]);
    });

    it("supports custom page size", () => {
        const { result } = renderHook(() => useClientPagination(mockData, 1, 5));
        expect(result.current.pageSize).toBe(5);
        expect(result.current.totalPages).toBe(5);
        expect(result.current.paginatedData).toHaveLength(5);
    });
});
