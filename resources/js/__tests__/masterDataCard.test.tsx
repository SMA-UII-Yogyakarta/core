import { fireEvent, render, screen } from "@testing-library/react";
import { FiBookOpen } from "react-icons/fi";
import { describe, expect, it, vi } from "vitest";
import MasterDataCard from "@/Components/features/MasterDataCard";
import MasterDataEmptyState from "@/Components/features/MasterDataEmptyState";

describe("MasterDataCard Component", () => {
    it("renders card content, title, subtitle, rightBadge, and children", () => {
        const handleOpen = vi.fn();
        const handleEdit = vi.fn();
        const handleSelect = vi.fn();

        render(
            <MasterDataCard
                isSelected={false}
                onSelect={handleSelect}
                onOpenDetail={handleOpen}
                onEdit={handleEdit}
                avatarName="Ahmad Dahlan"
                title="Ahmad Dahlan"
                subtitle={<span>NIS: 12345</span>}
                rightBadge={<span data-testid="status-badge">Aktif</span>}
            >
                <div data-testid="card-child">Kelas: X-A</div>
            </MasterDataCard>,
        );

        expect(screen.getByText("Ahmad Dahlan")).toBeDefined();
        expect(screen.getByText("NIS: 12345")).toBeDefined();
        expect(screen.getByTestId("status-badge")).toBeDefined();
        expect(screen.getByTestId("card-child")).toBeDefined();
        expect(screen.getByText("Edit")).toBeDefined();
        expect(screen.getByText("Ketuk kartu untuk detail & edit")).toBeDefined();
    });

    it("renders without avatar when avatarName is not provided", () => {
        const { container } = render(
            <MasterDataCard
                isSelected={false}
                onSelect={vi.fn()}
                onOpenDetail={vi.fn()}
                onEdit={vi.fn()}
                title="X IPA 1"
            />,
        );

        expect(screen.getByText("X IPA 1")).toBeDefined();
        expect(container.querySelector(".avatar")).toBeNull();
    });

    it("triggers onOpenDetail when card body is clicked", () => {
        const handleOpen = vi.fn();
        render(
            <MasterDataCard
                isSelected={false}
                onSelect={vi.fn()}
                onOpenDetail={handleOpen}
                onEdit={vi.fn()}
                title="Budi Santoso"
            />,
        );

        fireEvent.click(screen.getByText("Budi Santoso"));
        expect(handleOpen).toHaveBeenCalledTimes(1);
    });

    it("triggers onSelect and stops propagation when checkbox wrapper is clicked", () => {
        const handleSelect = vi.fn();
        const handleOpen = vi.fn();

        render(
            <MasterDataCard
                isSelected={false}
                onSelect={handleSelect}
                onOpenDetail={handleOpen}
                onEdit={vi.fn()}
                title="Siti Aminah"
                selectLabel="Pilih Siti Aminah"
            />,
        );

        const checkboxWrapper = screen.getByTitle("Pilih Siti Aminah");
        fireEvent.click(checkboxWrapper);

        expect(handleSelect).toHaveBeenCalledWith(true);
        expect(handleOpen).not.toHaveBeenCalled();
    });

    it("triggers onEdit and stops propagation without firing onOpenDetail", () => {
        const handleEdit = vi.fn();
        const handleOpen = vi.fn();

        render(
            <MasterDataCard
                isSelected={false}
                onSelect={vi.fn()}
                onOpenDetail={handleOpen}
                onEdit={handleEdit}
                title="Budi Santoso"
                editAriaLabel="Edit Budi Santoso"
            />,
        );

        const editBtn = screen.getByLabelText("Edit Budi Santoso");
        fireEvent.click(editBtn);

        expect(handleEdit).toHaveBeenCalledTimes(1);
        expect(handleOpen).not.toHaveBeenCalled();
    });

    it("triggers onDelete and stops propagation without firing onOpenDetail", () => {
        const handleDelete = vi.fn();
        const handleOpen = vi.fn();

        render(
            <MasterDataCard
                isSelected={false}
                onSelect={vi.fn()}
                onOpenDetail={handleOpen}
                onEdit={vi.fn()}
                onDelete={handleDelete}
                title="Budi Santoso"
                deleteAriaLabel="Hapus Budi Santoso"
            />,
        );

        const deleteBtn = screen.getByLabelText("Hapus Budi Santoso");
        fireEvent.click(deleteBtn);

        expect(handleDelete).toHaveBeenCalledTimes(1);
        expect(handleOpen).not.toHaveBeenCalled();
    });

    it("does not render delete button when onDelete is undefined", () => {
        render(
            <MasterDataCard
                isSelected={false}
                onSelect={vi.fn()}
                onOpenDetail={vi.fn()}
                onEdit={vi.fn()}
                title="Budi Santoso"
            />,
        );

        expect(screen.queryByLabelText("Hapus Data")).toBeNull();
    });

    it("applies active selection styling when isSelected is true", () => {
        const { container } = render(
            <MasterDataCard
                isSelected={true}
                onSelect={vi.fn()}
                onOpenDetail={vi.fn()}
                onEdit={vi.fn()}
                title="Selected Card"
            />,
        );

        const card = container.firstChild as HTMLElement;
        expect(card.className).toContain("border-primary/50");
        expect(card.className).toContain("bg-primary/5");
    });
});

describe("MasterDataEmptyState Component", () => {
    it("renders title, description, and calls onAction when clicked", () => {
        const handleAction = vi.fn();

        render(
            <MasterDataEmptyState
                icon={<FiBookOpen data-testid="empty-icon" />}
                title="Belum ada data kelas"
                description="Mulai tambahkan kelas baru dengan menekan tombol di bawah."
                actionLabel="Tambah Kelas"
                onAction={handleAction}
            />,
        );

        expect(screen.getByTestId("empty-icon")).toBeDefined();
        expect(screen.getByText("Belum ada data kelas")).toBeDefined();
        expect(screen.getByText("Mulai tambahkan kelas baru dengan menekan tombol di bawah.")).toBeDefined();

        const actionBtn = screen.getByText("Tambah Kelas");
        expect(actionBtn).toBeDefined();

        fireEvent.click(actionBtn);
        expect(handleAction).toHaveBeenCalledTimes(1);
    });
});
