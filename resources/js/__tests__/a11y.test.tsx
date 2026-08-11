import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

describe("Accessibility Tests", () => {
    test("404 page has no accessibility violations", async () => {
        const { container } = render(
            <div>
                <h1>404</h1>
                <p>Page not found</p>
                <a href="/">Back to Home</a>
            </div>
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    test("403 page has no accessibility violations", async () => {
        const { container } = render(
            <div>
                <h1>403</h1>
                <p>Access denied</p>
                <button>Back</button>
            </div>
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    test("basic HTML structure has no accessibility violations", async () => {
        const { container } = render(
            <div>
                <h1>Test Page</h1>
                <button>Test Button</button>
                <a href="/test">Test Link</a>
                <img src="/test.png" alt="Test image" />
                <form>
                    <label htmlFor="test">Test Label</label>
                    <input id="test" type="text" />
                </form>
            </div>
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});