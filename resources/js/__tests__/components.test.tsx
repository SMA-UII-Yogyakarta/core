import { render, screen } from "@testing-library/react";
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

    it("renders StatusBadge with normalized variants", () => {
        const { unmount } = render(<StatusBadge variant="Present" />);
        expect(screen.getByText(/Hadir/i)).toBeDefined();
        unmount();

        render(<StatusBadge variant="Late" />);
        expect(screen.getByText(/Terlambat/i)).toBeDefined();
    });

    it("renders StatCard with label, value, and subtitle", () => {
        render(
            <StatCard
                label="Total Hadir"
                value="25 Hari"
                subtitle="Bulan Ini"
                color="green"
            />,
        );
        expect(screen.getByText("Total Hadir")).toBeDefined();
        expect(screen.getByText("25 Hari")).toBeDefined();
        expect(screen.getByText("Bulan Ini")).toBeDefined();
    });

    it("renders Button polymorphically", () => {
        render(<Button variant="primary">Kirim Data</Button>);
        expect(screen.getByText("Kirim Data")).toBeDefined();
    });

    it("renders AttendanceCalendar with days of the month", () => {
        render(
            <AttendanceCalendar
                month={8}
                year={2026}
                attendances={[
                    {
                        id: 1,
                        attendance_date: "2026-08-14",
                        status: "Present",
                        check_in_time: "06:30:00",
                    },
                ]}
            />,
        );
        expect(screen.getByText(/Agustus 2026/i)).toBeDefined();
        expect(screen.getByText("14")).toBeDefined();
    });

    it("renders ExportButtonGroup with export options", () => {
        render(
            <ExportButtonGroup
                onExportExcel={() => {}}
                onExportPdf={() => {}}
                onPrint={() => {}}
            />,
        );
        expect(screen.getByText("Unduh Excel")).toBeDefined();
        expect(screen.getByText("Unduh PDF")).toBeDefined();
        expect(screen.getByText("Cetak")).toBeDefined();
    });
});
