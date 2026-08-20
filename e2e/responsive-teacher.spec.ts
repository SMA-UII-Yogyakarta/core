import { expect, test } from '@playwright/test';

test.describe('Responsive Teacher Portals QA Audit', () => {
    test('duty teacher (piket) views duty dashboard responsively', async ({ page }, testInfo) => {
        await page.goto('/login');
        await page.fill('input[name="username"]', 'dimas_kom');
        await page.fill('input[name="password"]', 'password');
        await page.locator('input[name="password"]').press('Enter');
        await page.waitForURL((url) => url.pathname !== '/login', { timeout: 10000 });

        await page.goto('/teacher/duty');
        await expect(page.locator('body')).toContainText(/Guru Piket|Piket|Overview/i);

        // Take QA Screenshot
        await page.screenshot({
            path: `playwright-report/screenshots/teacher-duty-dashboard-${testInfo.project.name}.png`,
            fullPage: true,
        });
    });

    test('homeroom teacher (wali) views homeroom dashboard responsively', async ({ page }, testInfo) => {
        await page.goto('/login');
        await page.fill('input[name="username"]', 'budi');
        await page.fill('input[name="password"]', 'password');
        await page.locator('input[name="password"]').press('Enter');
        await page.waitForURL((url) => url.pathname !== '/login', { timeout: 10000 });

        await page.goto('/teacher/homeroom');
        await expect(page.locator('body')).toContainText(/Wali Kelas|Kelas|Overview/i);

        // Take QA Screenshot
        await page.screenshot({
            path: `playwright-report/screenshots/teacher-homeroom-dashboard-${testInfo.project.name}.png`,
            fullPage: true,
        });
    });
});
