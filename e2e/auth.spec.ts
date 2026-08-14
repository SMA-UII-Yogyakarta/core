import { expect, test } from '@playwright/test';

test.describe('Authentication & Multi-Role Routing', () => {
    test('renders welcome page with login button', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/SMA UII/i);
        const loginLink = page.getByRole('link', { name: /masuk/i }).first();
        await expect(loginLink).toBeVisible();
    });

    test('admin can login and redirects to admin overview/dashboard', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="identifier"], input[type="text"]', 'admin');
        await page.fill('input[name="password"], input[type="password"]', 'password');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/\/(overview|dashboard|master-data)/);
    });

    test('teacher can login and redirects to teacher portal', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="identifier"], input[type="text"]', 'budi');
        await page.fill('input[name="password"], input[type="password"]', 'password');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/\/teacher/);
    });

    test('guardian can login and redirects to guardian portal', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="identifier"], input[type="text"]', 'wahyu');
        await page.fill('input[name="password"], input[type="password"]', 'password');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/\/guardian/);
    });

    test('student can login and redirects to student portal', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="identifier"], input[type="text"]', 'ahmad');
        await page.fill('input[name="password"], input[type="password"]', 'password');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/\/student/);
    });
});
