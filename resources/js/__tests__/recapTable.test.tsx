import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RecapTable from "../Pages/Teacher/Reports/RecapTable";
import MonthlyTable from "../Pages/Teacher/Reports/MonthlyTable";
import SemesterTable from "../Pages/Teacher/Reports/SemesterTable";
import type { StudentRecap, Summary, DailyBreakdown, MonthlyBreakdown } from "@/types/Report";

vi.mock("@/Components/features/AttendanceChart", () => ({
    default: vi.fn((props) => (
        <div
            data-testid="attendance-chart"
            data-show-holiday-bar={props.showHolidayBar ? "true" : "false"}
            data-points-count={props.data?.length}
        >
            Chart
        </div>
    )),
}));

const mockStudents: StudentRecap[] = [
    {
        id: 1,
        name: "Ahmad Santoso",
        nis: "1001",
        present: 20,
        permission: 1,
        sick: 1,
        pending: 0,
        absent: 0,
        on_time: 18,
        late: 2,
        discipline_rate: 90,
        attendance_rate: 91,
    },
    {
        id: 2,
        name: "Budi Pratama",
        nis: "1002",
        present: 15,
        permission: 0,
        sick: 2,
        pending: 1,
        absent: 3,
        on_time: 12,
        late: 3,
        discipline_rate: 60,
        attendance_rate: 75,
    },
];

const mockSummary: Summary = {
    on_time: 30,
    late: 5,
    permission: 1,
    sick: 3,
    pending: 1,
    absent: 3,
    attendance_rate: 83,
    discipline_rate: 75,
    total_students: 2,
    school_days: 20,
};

const mockDailyBreakdown: DailyBreakdown[] = [
    {
        date: "2026-01-05",
        label: "05 Jan",
        on_time: 2,
        late: 0,
        permission: 0,
        sick: 0,
        pending: 0,
        absent: 0,
        is_non_school: false,
    },
];

const mockMonthlyBreakdown: MonthlyBreakdown[] = [
    {
        month_label: "Jan",
        on_time: 30,
        late: 5,
        permission: 1,
        sick: 3,
        pending: 1,
        absent: 3,
    },
];

describe("RecapTable Component", () => {
    it("renders monthly mode with title, stats, table rows, and showHolidayBar=true", () => {
        const handlePdf = vi.fn();
        const handleExcel = vi.fn();

        render(
            <RecapTable
                mode="monthly"
                students={mockStudents}
                summary={mockSummary}
                chartData={mockDailyBreakdown}
                month={1}
                year={2026}
                onExportPdf={handlePdf}
                onExportExcel={handleExcel}
            />
        );

        // Title verification
        expect(screen.getByText(/Data Rekapitulasi Siswa \(Januari 2026\)/i)).toBeDefined();

        // Summary ratios
        expect(screen.getAllByText("83%").length).toBeGreaterThan(0);
        expect(screen.getAllByText("75%").length).toBeGreaterThan(0);

        // Students in table
        expect(screen.getAllByText("Ahmad Santoso").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Budi Pratama").length).toBeGreaterThan(0);
        expect(screen.getAllByText("1001").length).toBeGreaterThan(0);

        // Chart integration
        const chart = screen.getByTestId("attendance-chart");
        expect(chart).toBeDefined();
        expect(chart.getAttribute("data-show-holiday-bar")).toBe("true");
        expect(chart.getAttribute("data-points-count")).toBe("1");

        // Export button actions
        const pdfBtn = screen.getByRole("button", { name: /PDF/i });
        const excelBtn = screen.getByRole("button", { name: /Excel/i });
        fireEvent.click(pdfBtn);
        expect(handlePdf).toHaveBeenCalledTimes(1);
        fireEvent.click(excelBtn);
        expect(handleExcel).toHaveBeenCalledTimes(1);
    });

    it("renders semester mode with title, stats, table rows, and showHolidayBar=false", () => {
        render(
            <RecapTable
                mode="semester"
                students={mockStudents}
                summary={mockSummary}
                chartData={mockMonthlyBreakdown}
                semester="1"
                year={2026}
            />
        );

        // Title verification for semester 1 (Ganjil)
        expect(screen.getByText(/Data Rekapitulasi Siswa \(Semester Ganjil 2026\/2027\)/i)).toBeDefined();

        // Chart integration with showHolidayBar=false
        const chart = screen.getByTestId("attendance-chart");
        expect(chart).toBeDefined();
        expect(chart.getAttribute("data-show-holiday-bar")).toBe("false");
        expect(chart.getAttribute("data-points-count")).toBe("1");
    });

    it("renders even semester title correctly", () => {
        render(
            <RecapTable
                mode="semester"
                students={mockStudents}
                summary={mockSummary}
                semester="2"
                year={2026}
            />
        );

        // Title verification for semester 2 (Genap)
        expect(screen.getByText(/Data Rekapitulasi Siswa \(Semester Genap 2025\/2026\)/i)).toBeDefined();
    });

    it("displays empty state message when students list is empty", () => {
        render(
            <RecapTable
                mode="monthly"
                students={[]}
                month={1}
                year={2026}
            />
        );

        expect(screen.getAllByText("Belum ada data untuk periode ini.").length).toBeGreaterThan(0);
    });
});

describe("MonthlyTable wrapper component", () => {
    it("renders via MonthlyTable thin wrapper", () => {
        render(
            <MonthlyTable
                students={mockStudents}
                summary={mockSummary}
                month={5}
                year={2026}
            />
        );

        expect(screen.getByText(/Data Rekapitulasi Siswa \(Mei 2026\)/i)).toBeDefined();
        expect(screen.getAllByText("Ahmad Santoso").length).toBeGreaterThan(0);
    });
});

describe("SemesterTable wrapper component", () => {
    it("renders via SemesterTable thin wrapper", () => {
        render(
            <SemesterTable
                students={mockStudents}
                summary={mockSummary}
                semester="1"
                year={2026}
            />
        );

        expect(screen.getByText(/Data Rekapitulasi Siswa \(Semester Ganjil 2026\/2027\)/i)).toBeDefined();
        expect(screen.getAllByText("Ahmad Santoso").length).toBeGreaterThan(0);
    });
});
