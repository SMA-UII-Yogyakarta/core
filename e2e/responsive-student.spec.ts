import { expect, test } from '@playwright/test';

test.describe('Responsive Student Portal QA Audit', () => {
    test.beforeEach(async ({ page, context }) => {
        await context.grantPermissions(['camera', 'geolocation']);
        await context.setGeolocation({
            latitude: -7.797061,
            longitude: 110.399583,
        });

        await page.goto('/login');
        await page.fill('input[name="username"]', 'ahmad');
        await page.fill('input[name="password"]', 'password');
        await page.locator('input[name="password"]').press('Enter');
        await page.waitForURL((url) => url.pathname !== '/login', { timeout: 10000 });
    });

    test('student views dashboard responsively', async ({ page }, testInfo) => {
        await page.goto('/student/dashboard');
        await page.waitForLoadState('networkidle');

        // Take QA Audit Screenshot
        await page.screenshot({
            path: `playwright-report/screenshots/student-dashboard-${testInfo.project.name}.png`,
            fullPage: true,
        });
    });

    test('student views live attendance camera view responsively', async ({ page }, testInfo) => {
        await page.goto('/student/attendance');
        await page.waitForLoadState('networkidle');

        // Take QA Audit Screenshot
        await page.screenshot({
            path: `playwright-report/screenshots/student-live-attendance-${testInfo.project.name}.png`,
            fullPage: true,
        });
    });

    test('student views attendance history responsively', async ({ page }, testInfo) => {
        await page.goto('/student/history');
        await page.waitForLoadState('networkidle');

        // Take QA Audit Screenshot
        await page.screenshot({
            path: `playwright-report/screenshots/student-history-${testInfo.project.name}.png`,
            fullPage: true,
        });
    });
});
