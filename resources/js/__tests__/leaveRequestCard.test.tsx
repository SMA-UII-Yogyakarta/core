import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LeaveRequestCard } from "@/Components/ui/LeaveRequestCard";
import type { LeaveRequest } from "@/types";

const mockPendingRequest: LeaveRequest = {
    id: 1,
    student_id: 101,
    guardian_id: 201,
    category: "Sick",
    start_date: "2026-09-10",
    end_date: "2026-09-12",
    description: "Demam tinggi sejak malam",
    document_url: "https://example.com/surat-dokter.jpg",
    approval_status: "Pending",
    student: {
        id: 101,
        name: "Ahmad Santoso",
        nis: "12345",
        nisn: "0012345",
        phone: null,
        address: null,
        user_id: null,
        user: null,
        created_at: null,
        updated_at: null,
    },
    guardian: {
        id: 201,
        user_id: null,
        name: "Heri Santoso",
        phone: null,
        address: null,
        user: null,
        created_at: null,
        updated_at: null,
    },
    created_at: "2026-09-08T06:00:00.000Z",
    updated_at: null,
} as unknown as LeaveRequest;

const mockApprovedRequest: LeaveRequest = {
    ...mockPendingRequest,
    id: 2,
    approval_status: "Approved",
};

const mockRejectedRequest: LeaveRequest = {
    ...mockPendingRequest,
    id: 3,
    approval_status: "Rejected",
    rejection_reason: "Surat dokter tidak jelas",
} as LeaveRequest;

describe("LeaveRequestCard - Admin Variant", () => {
    it("renders admin layout with thumbnail, student info, and date range", () => {
        const handlePreview = vi.fn();
        const handleApprove = vi.fn();
        const handleReject = vi.fn();

        render(
            <LeaveRequestCard
                variant="admin"
                leaveRequest={mockPendingRequest}
                onImagePreview={handlePreview}
                onApprove={handleApprove}
                onReject={handleReject}
                checkboxSlot={<input type="checkbox" data-testid="test-checkbox" />}
            />
        );

        expect(screen.getByText("Ahmad Santoso")).toBeDefined();
        expect(screen.getByText("SAKIT")).toBeDefined();
        expect(screen.getByText(/Heri Santoso/i)).toBeDefined();
        expect(screen.getByText(/Demam tinggi/i)).toBeDefined();
        expect(screen.getByTestId("test-checkbox")).toBeDefined();

        // Thumbnail enlarge button
        const previewBtn = screen.getByText("Perbesar");
        fireEvent.click(previewBtn);
        expect(handlePreview).toHaveBeenCalledWith("https://example.com/surat-dokter.jpg");

        // Action buttons
        const approveBtn = screen.getByText("Setujui Izin");
        fireEvent.click(approveBtn);
        expect(handleApprove).toHaveBeenCalledWith(mockPendingRequest);

        const rejectBtn = screen.getByText("Tolak");
        fireEvent.click(rejectBtn);
        expect(handleReject).toHaveBeenCalledWith(mockPendingRequest);
    });

    it("renders lock notice when isHomeroom=false and pending", () => {
        render(
            <LeaveRequestCard
                variant="admin"
                leaveRequest={mockPendingRequest}
                isHomeroom={false}
            />
        );

        expect(screen.getByText(/Hak akses persetujuan hanya untuk Wali Kelas/i)).toBeDefined();
    });

    it("renders revert and detail buttons for resolved requests", () => {
        const handleRevert = vi.fn();
        const handleDetail = vi.fn();

        render(
            <LeaveRequestCard
                variant="admin"
                leaveRequest={mockApprovedRequest}
                onRevert={handleRevert}
                onDetailClick={handleDetail}
            />
        );

        const revertBtn = screen.getByText("Revert");
        fireEvent.click(revertBtn);
        expect(handleRevert).toHaveBeenCalledWith(mockApprovedRequest);

        const detailBtn = screen.getByText("Detail");
        fireEvent.click(detailBtn);
        expect(handleDetail).toHaveBeenCalledWith(mockApprovedRequest);
    });

    it("renders rejection reason when rejected", () => {
        render(
            <LeaveRequestCard
                variant="admin"
                leaveRequest={mockRejectedRequest}
            />
        );

        expect(screen.getByText(/Surat dokter tidak jelas/i)).toBeDefined();
    });
});

describe("LeaveRequestCard - Teacher Variant", () => {
    it("renders teacher layout with avatar, urgency, date range, and attachment preview button", () => {
        const handlePreview = vi.fn();
        const handleApprove = vi.fn();
        const handleReject = vi.fn();

        render(
            <LeaveRequestCard
                variant="teacher"
                leave={mockPendingRequest}
                isPending={true}
                onPreviewImage={handlePreview}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        );

        expect(screen.getByText("Ahmad Santoso")).toBeDefined();
        expect(screen.getByText("NIS: 12345")).toBeDefined();
        expect(screen.getByText("Sakit")).toBeDefined();
        expect(screen.getByText(/Demam tinggi/i)).toBeDefined();

        // Attachment button
        const docBtn = screen.getByText(/Lihat Lampiran Surat Dokter/i);
        fireEvent.click(docBtn);
        expect(handlePreview).toHaveBeenCalledWith("https://example.com/surat-dokter.jpg");

        // Action buttons
        const approveBtn = screen.getByText("Setujui");
        fireEvent.click(approveBtn);
        expect(handleApprove).toHaveBeenCalledWith(mockPendingRequest);

        const rejectBtn = screen.getByText("Tolak");
        fireEvent.click(rejectBtn);
        expect(handleReject).toHaveBeenCalledWith(mockPendingRequest);
    });

    it("renders resolved state with status badge and revert button in teacher variant", () => {
        const handleRevert = vi.fn();

        render(
            <LeaveRequestCard
                variant="teacher"
                leave={mockRejectedRequest}
                isPending={false}
                onRevert={handleRevert}
            />
        );

        expect(screen.getByText("Ditolak")).toBeDefined();
        expect(screen.getByText(/Surat dokter tidak jelas/i)).toBeDefined();

        const revertBtn = screen.getByTitle("Ubah status");
        fireEvent.click(revertBtn);
        expect(handleRevert).toHaveBeenCalledWith(mockRejectedRequest);
    });

    it("automatically resolves to teacher variant when onRevert is passed without explicit variant", () => {
        render(
            <LeaveRequestCard
                leave={mockApprovedRequest}
                onRevert={vi.fn()}
            />
        );

        // Teacher variant renders "Disetujui" pill and Avatar
        expect(screen.getByText("Disetujui")).toBeDefined();
    });
});
