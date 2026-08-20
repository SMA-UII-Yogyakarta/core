import { expect, test } from '@playwright/test';

test.describe('Authentication & Multi-Role Routing', () => {
    test('renders welcome page with login button', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/SMA UII/i);
        const loginLink = page.getByRole('link', { name: /masuk/i }).first();
        await expect(loginLink).toBeVisible();
    });

    test('admin can login and redirects to admin overview/dashboard via /overview', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'password');
        await page.locator('input[name="password"]').press('Enter');

        await page.waitForURL((url) => url.pathname !== '/login', { timeout: 10000 });
        await page.goto('/overview');
        await expect(page).toHaveURL(/\/(overview|dashboard|master-data)/);
    });

    test('teacher can login and redirects to teacher portal via /overview', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="username"]', 'budi');
        await page.fill('input[name="password"]', 'password');
        await page.locator('input[name="password"]').press('Enter');

        await page.waitForURL((url) => url.pathname !== '/login', { timeout: 10000 });
        await page.goto('/overview');
        await expect(page).toHaveURL(/\/teacher/);
    });

    test('guardian can login and redirects to guardian portal via /overview', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="username"]', 'wahyu');
        await page.fill('input[name="password"]', 'password');
        await page.locator('input[name="password"]').press('Enter');

        await page.waitForURL((url) => url.pathname !== '/login', { timeout: 10000 });
        await page.goto('/overview');
        await expect(page).toHaveURL(/\/guardian/);
    });

    test('student can login and redirects to student portal via /overview', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="username"]', 'ahmad');
        await page.fill('input[name="password"]', 'password');
        await page.locator('input[name="password"]').press('Enter');

        await page.waitForURL((url) => url.pathname !== '/login', { timeout: 10000 });
        await page.goto('/overview');
        await expect(page).toHaveURL(/\/student/);
    });
});
