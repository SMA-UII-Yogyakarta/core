import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StatusBadge, { resolveStatusVariant } from "@/Components/ui/StatusBadge";
import StatusDot from "@/Components/ui/StatusDot";

describe("StatusDot Component", () => {
    it("renders default sm dot with correct status color", () => {
        const { container } = render(<StatusDot status="present" />);
        const dot = container.firstElementChild as HTMLElement;
        expect(dot).toBeDefined();
        expect(dot.className).toContain("bg-success");
        expect(dot.className).toContain("w-2 h-2");
    });

    it("renders custom sizes (xs, md, lg)", () => {
        const { container: cXs } = render(<StatusDot status="late" size="xs" />);
        expect((cXs.firstElementChild as HTMLElement).className).toContain("w-1.5 h-1.5");
        expect((cXs.firstElementChild as HTMLElement).className).toContain("bg-warning");

        const { container: cMd } = render(<StatusDot status="sick" size="md" />);
        expect((cMd.firstElementChild as HTMLElement).className).toContain("w-2.5 h-2.5");
        expect((cMd.firstElementChild as HTMLElement).className).toContain("bg-primary");

        const { container: cLg } = render(<StatusDot status="absent" size="lg" />);
        expect((cLg.firstElementChild as HTMLElement).className).toContain("w-3 h-3");
        expect((cLg.firstElementChild as HTMLElement).className).toContain("bg-danger");
    });

    it("uses the same semantic color family as the permission badge", () => {
        const { container } = render(<StatusDot status="izin" />);
        expect((container.firstElementChild as HTMLElement).className).toContain("bg-primary");
    });

    it("applies pulse animation when pulse prop is true", () => {
        const { container } = render(<StatusDot status="absent" pulse />);
        const dot = container.firstElementChild as HTMLElement;
        expect(dot.className).toContain("animate-pulse");
    });

    it("applies custom className and title attribute", () => {
        const { container } = render(
            <StatusDot status="pending" className="my-custom-class" title="Status Menunggu" />,
        );
        const dot = container.firstElementChild as HTMLElement;
        expect(dot.className).toContain("my-custom-class");
        expect(dot.getAttribute("title")).toBe("Status Menunggu");
    });
});

describe("StatusBadge Extended Variants", () => {
    it("resolves no_update, no_check_in, and not_open statuses", () => {
        expect(resolveStatusVariant("no_update")).toBe("no_update");
        expect(resolveStatusVariant("-")).toBe("no_update");
        expect(resolveStatusVariant("nocheckin")).toBe("no_check_in");
        expect(resolveStatusVariant("belum absen")).toBe("no_check_in");
        expect(resolveStatusVariant("notopen")).toBe("not_open");
        expect(resolveStatusVariant("belum buka")).toBe("not_open");
    });

    it("renders default labels for newly added variants", () => {
        const { container: cNoUpdate } = render(<StatusBadge variant="no_update" />);
        expect(cNoUpdate.textContent).toBe("-");

        const { container: cNoCheckIn } = render(<StatusBadge variant="no_check_in" />);
        expect(cNoCheckIn.textContent).toBe("Belum Absen");

        const { container: cNotOpen } = render(<StatusBadge variant="not_open" />);
        expect(cNotOpen.textContent).toBe("Belum Buka");
    });

    it("applies custom className and custom label", () => {
        const { container } = render(
            <StatusBadge variant="present" label="Hadir Tepat Waktu" className="uppercase font-bold" />,
        );
        const badge = container.firstElementChild as HTMLElement;
        expect(badge.textContent).toBe("Hadir Tepat Waktu");
        expect(badge.className).toContain("uppercase");
        expect(badge.className).toContain("font-bold");
    });
});
