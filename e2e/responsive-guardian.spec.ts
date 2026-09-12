import { expect, test } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Responsive Guardian Portal QA Audit', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, 'wahyu');
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
        await page.goto('/guardian/history', { waitUntil: 'domcontentloaded' });

        // Take QA Audit Screenshot
        await page.screenshot({
            path: `playwright-report/screenshots/guardian-history-${testInfo.project.name}.png`,
            fullPage: true,
        });
    });

    test('guardian views leave application form responsively', async ({ page }, testInfo) => {
        await page.goto('/guardian/leave-application', { waitUntil: 'domcontentloaded' });

        // Take QA Audit Screenshot
        await page.screenshot({
            path: `playwright-report/screenshots/guardian-leave-application-${testInfo.project.name}.png`,
            fullPage: true,
        });
    });
});
