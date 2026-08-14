import { expect, test } from '@playwright/test';

test.describe('Student Portal & Attendance End-to-End Flow', () => {
    test.beforeEach(async ({ page, context }) => {
        // Grant permissions for camera and geolocation
        await context.grantPermissions(['camera', 'geolocation']);
        await context.setGeolocation({
            latitude: -7.797061,
            longitude: 110.399583,
        });

        await page.goto('/login');
        await page.fill('input[name="identifier"], input[type="text"]', 'ahmad');
        await page.fill('input[name="password"], input[type="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/student/);
    });

    test('student lands on dashboard and views profile greeting and stats', async ({ page }) => {
        await page.goto('/student/dashboard');
        const greeting = page.locator('[data-testid="student-greeting-card"], h1');
        await expect(greeting.first()).toBeVisible();

        // Check stat indicators
        const stats = page.locator('[data-testid="stat-hadir"], [data-testid="desktop-stat-hadir"]');
        await expect(stats.first()).toBeVisible();
    });

    test('student can navigate to live attendance page with camera and geofence status', async ({ page }) => {
        await page.goto('/student/attendance');
        
        // Webcam container or success badge
        const webcam = page.locator('[data-testid="webcam-container"], [data-testid="attendance-status-success"]');
        await expect(webcam.first()).toBeVisible();
    });

    test('student can view attendance history with composable calendar and table', async ({ page }) => {
        await page.goto('/student/history');
        
        // Calendar or table container
        const calendar = page.locator('[data-testid="student-attendance-calendar"], [data-testid="mobile-attendance-calendar"]');
        await expect(calendar.first()).toBeVisible();

        // Filter button
        const filterBtn = page.locator('[data-testid="btn-filter-history"]');
        await expect(filterBtn).toBeVisible();
    });
});
