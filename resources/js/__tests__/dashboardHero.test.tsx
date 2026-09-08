import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DashboardHero from "@/Components/ui/DashboardHero";

describe("DashboardHero Component", () => {
    it("renders title, subtitle, and description", () => {
        render(
            <DashboardHero
                title="Pantauan Presensi Real-Time"
                subtitle="Senin, 8 September 2026"
                description="SMA UII Yogyakarta"
            />,
        );

        expect(screen.getByText("Pantauan Presensi Real-Time")).toBeDefined();
        expect(screen.getByText("Senin, 8 September 2026")).toBeDefined();
        expect(screen.getByText("SMA UII Yogyakarta")).toBeDefined();
    });

    it("renders digital clock with specified time and timezone", () => {
        render(
            <DashboardHero
                title="Selamat Datang"
                time="07:30"
                timezone="WIB"
            />,
        );

        expect(screen.getByText("07:30")).toBeDefined();
        expect(screen.getByText("WIB")).toBeDefined();
    });

    it("hides clock badge when showClock is false", () => {
        render(
            <DashboardHero
                title="Selamat Datang"
                time="07:30"
                timezone="WIB"
                showClock={false}
            />,
        );

        expect(screen.queryByText("07:30")).toBeNull();
        expect(screen.queryByText("WIB")).toBeNull();
    });

    it("renders custom badges with labels and icons", () => {
        render(
            <DashboardHero
                title="Dashboard Wali"
                badges={[
                    { label: "3 Siswa Terdaftar" },
                    { label: "Tahun Ajaran 2026/2027" },
                ]}
            />,
        );

        expect(screen.getByText("3 Siswa Terdaftar")).toBeDefined();
        expect(screen.getByText("Tahun Ajaran 2026/2027")).toBeDefined();
    });

    it("attaches dusk and data-testid attributes", () => {
        const { container } = render(
            <DashboardHero
                title="Ahmad Dahlan"
                dusk="student-greeting-card"
            />,
        );

        const hero = container.firstElementChild as HTMLElement;
        expect(hero.getAttribute("dusk")).toBe("student-greeting-card");
        expect(hero.getAttribute("data-testid")).toBe("student-greeting-card");
    });
});
