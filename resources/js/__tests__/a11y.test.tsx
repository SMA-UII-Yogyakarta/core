import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, test } from "vitest";
import {
    AttendanceCalendar,
    Avatar,
    Button,
    ExportButtonGroup,
    IconButton,
    LiveBadge,
    MetricPill,
    MobileNativePagination,
    MobileSectionHeader,
    Pagination,
    StatCard,
    StatusBadge,
    TableFooter,
} from "@/Components";

expect.extend(toHaveNoViolations);

describe("Accessibility (A11y) Tests", () => {
    test("Button component passes axe audit", async () => {
        const { container } = render(<Button variant="primary">Tombol Akses</Button>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    test("IconButton component passes axe audit", async () => {
        const { container } = render(<IconButton icon={<span aria-hidden="true">×</span>} label="Tutup" />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    test("StatusBadge component passes axe audit", async () => {
        const { container } = render(<StatusBadge variant="Present" />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    test("StatCard component passes axe audit", async () => {
        const { container } = render(<StatCard label="Kehadiran" value="98%" subtitle="Bulan ini" color="blue" />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    test("Avatar component passes axe audit", async () => {
        const { container } = render(<Avatar name="Ahmad Dahlan" size="md" />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    test("LiveBadge component passes axe audit", async () => {
        const { container } = render(<LiveBadge label="LIVE" variant="success" />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    test("MetricPill component passes axe audit", async () => {
        const { container } = render(<MetricPill label="HADIR" value={20} variant="success" />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    test("AttendanceCalendar component passes axe audit", async () => {
        const { container } = render(<AttendanceCalendar month={8} year={2026} attendances={[]} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    test("ExportButtonGroup component passes axe audit", async () => {
        const { container } = render(
            <ExportButtonGroup onExportExcel={() => {}} onExportPdf={() => {}} onPrint={() => {}} />,
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    test("TableFooter component passes axe audit", async () => {
        const { container } = render(
            <TableFooter
                currentPage={1}
                totalPages={3}
                totalItems={25}
                perPage={10}
                onPageChange={() => {}}
                itemLabel="siswa"
            />,
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    test("Pagination component passes axe audit", async () => {
        const { container } = render(
            <Pagination currentPage={2} totalPages={5} totalItems={50} onPageChange={() => {}} />,
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    test("MobileNativePagination component passes axe audit", async () => {
        const { container } = render(
            <MobileNativePagination
                currentPage={1}
                totalPages={3}
                totalItems={25}
                perPage={10}
                onPageChange={() => {}}
            />,
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    test("MobileSectionHeader component passes axe audit", async () => {
        const { container } = render(
            <MobileSectionHeader title="Daftar Siswa" description="Kelola dan pantau seluruh data siswa aktif." />,
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
