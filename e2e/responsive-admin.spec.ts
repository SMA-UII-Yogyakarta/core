import { expect, test } from '@playwright/test';

test.describe('Responsive Admin Flow QA Audit', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'password');
        await page.locator('input[name="password"]').press('Enter');
        await page.waitForURL((url) => url.pathname !== '/login', { timeout: 10000 });
    });

    test('admin master data adapts correctly across viewports', async ({ page }, testInfo) => {
        await page.goto('/master-data');
        await expect(page.locator('body')).toContainText(/Manajemen Data Master|Master Data/i);
        await expect(page.locator('main')).toBeVisible();

        // Take QA Audit Screenshot
        await page.screenshot({
            path: `playwright-report/screenshots/admin-master-data-${testInfo.project.name}.png`,
            fullPage: true,
        });
    });

    test('admin can view reports page responsively', async ({ page }, testInfo) => {
        await page.goto('/reports/daily');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('main')).toBeVisible();

        // Take QA Audit Screenshot
        await page.screenshot({
            path: `playwright-report/screenshots/admin-reports-daily-${testInfo.project.name}.png`,
            fullPage: true,
        });
    });
});
