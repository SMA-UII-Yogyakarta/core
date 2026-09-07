import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getRecapColumns } from "../Pages/Reports/reportColumns";

describe("getRecapColumns", () => {
    const mockT = (key: string) => {
        const translations: Record<string, string> = {
            "reports.month": "Bulan",
            "reports.present": "Hadir",
            "reports.late": "Terlambat",
            "reports.absent": "Alpa",
            "reports.rate": "Persentase",
        };
        return translations[key] ?? key;
    };

    it("returns 5 columns with proper translated headers", () => {
        const columns = getRecapColumns(mockT);
        expect(columns).toHaveLength(5);
        expect(columns[0].key).toBe("label");
        expect(columns[0].header).toBe("Bulan");
        expect(columns[1].key).toBe("present");
        expect(columns[2].key).toBe("late");
        expect(columns[3].key).toBe("absent");
        expect(columns[4].key).toBe("rate");
    });

    it("calculates rate correctly when total > 0", () => {
        const columns = getRecapColumns(mockT);
        const rateCol = columns.find((c) => c.key === "rate");
        expect(rateCol).toBeDefined();

        const sampleRow = {
            label: "Januari",
            present: 18,
            late: 2,
            absent: 0,
        };
        // (18 + 2) / 20 * 100 = 100.0%
        const rendered = rateCol?.render?.(sampleRow);
        const { container } = render(<>{rendered}</>);
        expect(container.textContent).toBe("100.0%");
    });

    it("returns 0.0% when total attendance is 0", () => {
        const columns = getRecapColumns(mockT);
        const rateCol = columns.find((c) => c.key === "rate");
        const sampleRow = {
            label: "Februari",
            present: 0,
            late: 0,
            absent: 0,
        };
        const rendered = rateCol?.render?.(sampleRow);
        const { container } = render(<>{rendered}</>);
        expect(container.textContent).toBe("0.0%");
    });
});
