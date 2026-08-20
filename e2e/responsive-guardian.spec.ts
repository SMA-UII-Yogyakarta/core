import { expect, test } from '@playwright/test';

test.describe('Responsive Guardian Portal QA Audit', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="username"]', 'wahyu');
        await page.fill('input[name="password"]', 'password');
        await page.locator('input[name="password"]').press('Enter');
        await page.waitForURL((url) => url.pathname !== '/login', { timeout: 10000 });
    });

    test('guardian views dashboard responsively', async ({ page }, testInfo) => {
        await page.goto('/guardian');
        await expect(page.locator('body')).toContainText(/Wali Murid|Kehadiran|Anak/i);

        // Take QA Audit Screenshot
        await page.screenshot({
            path: `playwright-report/screenshots/guardian-dashboard-${testInfo.project.name}.png`,
            fullPage: true,
        });
    });

    test('guardian views attendance history responsively', async ({ page }, testInfo) => {
        await page.goto('/guardian/history');
        await page.waitForLoadState('networkidle');

        // Take QA Audit Screenshot
        await page.screenshot({
            path: `playwright-report/screenshots/guardian-history-${testInfo.project.name}.png`,
            fullPage: true,
        });
    });

    test('guardian views leave application form responsively', async ({ page }, testInfo) => {
        await page.goto('/guardian/leave-application');
        await page.waitForLoadState('networkidle');

        // Take QA Audit Screenshot
        await page.screenshot({
            path: `playwright-report/screenshots/guardian-leave-application-${testInfo.project.name}.png`,
            fullPage: true,
        });
    });
});
