import { expect, test } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Authentication & Multi-Role Routing', () => {
    test('renders welcome page with login button', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/SMA UII/i);
        const loginLink = page.getByRole('link', { name: /masuk|login/i }).first();
        await expect(loginLink).toBeVisible();
    });

    test('admin can login and redirects to admin overview/dashboard via /overview', async ({ page }) => {
        await loginAs(page, 'admin');
        await page.goto('/overview');
        await expect(page).toHaveURL(/\/(overview|dashboard|master-data)/);
    });

    test('teacher can login and redirects to teacher portal via /overview', async ({ page }) => {
        await loginAs(page, 'budi');
        await page.goto('/overview');
        await expect(page).toHaveURL(/\/teacher/);
    });

    test('guardian can login and redirects to guardian portal via /overview', async ({ page }) => {
        await loginAs(page, 'wahyu');
        await page.goto('/overview');
        await expect(page).toHaveURL(/\/guardian/);
    });

    test('student can login and redirects to student portal via /overview', async ({ page }) => {
        await loginAs(page, 'ahmad');
        await page.goto('/overview');
        await expect(page).toHaveURL(/\/student/);
    });
});
