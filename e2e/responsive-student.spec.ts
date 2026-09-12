import { test } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Responsive Student Portal QA Audit', () => {
    test.setTimeout(45_000);

    test.beforeEach(async ({ page, context }) => {
        await context.grantPermissions(['camera', 'geolocation']);
        await context.setGeolocation({
            latitude: -7.814450,
            longitude: 110.375944,
        });

        await loginAs(page, 'ahmad');
    });

    test('student views dashboard responsively', async ({ page }, testInfo) => {
        await page.goto('/student/dashboard', { waitUntil: 'domcontentloaded' });

        // Take QA Audit Screenshot
        await page.screenshot({
            path: `/home/dev/.gemini/antigravity-cli/brain/9a4d14c7-625b-4622-a0ba-0a01663204a1/screenshots/student-dashboard-${testInfo.project.name}.png`,
            fullPage: true,
        });
    });

    test('student views live attendance camera view responsively', async ({ page }, testInfo) => {
        await page.goto('/student/attendance', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        // Take QA Audit Screenshot inside radius
        await page.screenshot({
            path: `/home/dev/.gemini/antigravity-cli/brain/9a4d14c7-625b-4622-a0ba-0a01663204a1/screenshots/student-live-attendance-${testInfo.project.name}.png`,
            fullPage: false,
        });
    });

    test('student views live attendance outside geofence radius', async ({ page, context }, testInfo) => {
        if (testInfo.project.name !== 'desktop-fhd') return;

        // Set location 160m away (60m outside 100m radius)
        await context.setGeolocation({
            latitude: -7.815700,
            longitude: 110.375944,
        });

        await page.goto('/student/attendance', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        await page.screenshot({
            path: `/home/dev/.gemini/antigravity-cli/brain/9a4d14c7-625b-4622-a0ba-0a01663204a1/screenshots/student-live-attendance-outside-radius.png`,
            fullPage: false,
        });
    });

    test('student views live attendance with GPS not detected', async ({ page, context }, testInfo) => {
        if (testInfo.project.name !== 'desktop-fhd') return;

        await context.clearPermissions();
        await page.goto('/student/attendance', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        await page.screenshot({
            path: `/home/dev/.gemini/antigravity-cli/brain/9a4d14c7-625b-4622-a0ba-0a01663204a1/screenshots/student-live-attendance-no-gps.png`,
            fullPage: false,
        });
    });

    test('student views attendance history responsively', async ({ page }, testInfo) => {
        await page.goto('/student/history', { waitUntil: 'domcontentloaded' });

        // Take QA Audit Screenshot
        await page.screenshot({
            path: `/home/dev/.gemini/antigravity-cli/brain/9a4d14c7-625b-4622-a0ba-0a01663204a1/screenshots/student-history-${testInfo.project.name}.png`,
            fullPage: true,
        });
    });
});
