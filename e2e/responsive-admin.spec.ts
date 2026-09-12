import { expect, test } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Responsive Admin Flow QA Audit', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, 'admin');
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
        await page.goto('/reports/daily', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('main')).toBeVisible();

        // Take QA Audit Screenshot
        await page.screenshot({
            path: `playwright-report/screenshots/admin-reports-daily-${testInfo.project.name}.png`,
            fullPage: true,
        });
    });
});
