import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
    Avatar,
    Button,
    LiveBadge,
    MetricPill,
    StatusBadge,
    StatCard,
    AttendanceCalendar,
    ExportButtonGroup,
    SearchBar,
    Drawer,
} from "@/Components";

describe("Design System Component Tests", () => {
    it("renders Avatar with initials correctly", () => {
        render(<Avatar name="Ahmad Dahlan" size="md" variant="primary" />);
        expect(screen.getByText("AD")).toBeDefined();
    });

    it("renders LiveBadge with live pulse and text", () => {
        render(<LiveBadge label="LIVE WEBCAM" variant="dark" pulse size="md" />);
        expect(screen.getByText("LIVE WEBCAM")).toBeDefined();
    });

    it("renders MetricPill with label and value", () => {
        render(<MetricPill label="HADIR" value={22} variant="success" />);
        expect(screen.getByText("HADIR")).toBeDefined();
        expect(screen.getByText("22")).toBeDefined();
    });

    it("renders StatusBadge with specific status label", () => {
        render(<StatusBadge label="Hadir Tepat Waktu" variant="success" />);
        expect(screen.getByText("Hadir Tepat Waktu")).toBeDefined();
    });

    it("renders StatCard with value and label", () => {
        render(<StatCard label="Total Siswa" value={245} color="blue" />);
        expect(screen.getByText("Total Siswa")).toBeDefined();
        expect(screen.getByText("245")).toBeDefined();
    });

    it("renders Button with icon and text", () => {
        render(
            <Button variant="primary">
                <span>Simpan Perubahan</span>
            </Button>,
        );
        expect(screen.getByText("Simpan Perubahan")).toBeDefined();
    });

    it("renders AttendanceCalendar and navigates month", () => {
        render(
            <AttendanceCalendar
                month={8}
                year={2026}
                attendances={[]}
                holidays={[]}
            />,
        );
        expect(screen.getByText(/Agustus/i)).toBeDefined();
        expect(screen.getByText("14")).toBeDefined();
    });

    it("renders ExportButtonGroup with export options in modal", () => {
        render(
            <ExportButtonGroup
                onExportExcel={() => {}}
                onExportPdf={() => {}}
                onPrint={() => {}}
            />,
        );
        expect(screen.getByText("Unduh Laporan")).toBeDefined();
        fireEvent.click(screen.getByText("Unduh Laporan"));
        expect(screen.getByText("Pilih Format Unduhan")).toBeDefined();
        expect(screen.getByText("Unduh Excel")).toBeDefined();
        expect(screen.getByText("Unduh PDF")).toBeDefined();
        expect(screen.getByText("Cetak")).toBeDefined();
    });

    it("renders SearchBar with role='search' and without <form> wrapper", () => {
        let searchedVal = "";
        const { container } = render(
            <SearchBar
                value="siswa"
                onChange={() => {}}
                onSearch={(val) => {
                    searchedVal = val;
                }}
            />,
        );

        // Must NOT render a <form> tag to prevent invalid HTML nested forms
        expect(container.querySelector("form")).toBeNull();
        expect(screen.getByRole("search")).toBeDefined();

        const input = screen.getByPlaceholderText("Cari data...");
        expect(input).toBeDefined();

        // Pressing Enter must trigger onSearch
        fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
        expect(searchedVal).toBe("siswa");
    });

    it("renders Drawer as div when asForm={false} and allows embedding SearchBar safely", () => {
        const { container } = render(
            <Drawer
                open={true}
                onClose={() => {}}
                title="Pilih Siswa"
                onSubmit={() => {}}
                asForm={false}
            >
                <SearchBar value="" onChange={() => {}} placeholder="Cari di modal..." />
            </Drawer>,
        );

        // Ensures there are ZERO form elements, completely avoiding nested form violation
        expect(container.querySelector("form")).toBeNull();
        expect(screen.getByPlaceholderText("Cari di modal...")).toBeDefined();
    });
});
