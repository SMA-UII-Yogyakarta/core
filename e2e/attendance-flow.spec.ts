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
        await page.fill('input[name="username"]', 'ahmad');
        await page.fill('input[name="password"]', 'password');
        await page.locator('input[name="password"]').press('Enter');
        await page.waitForURL((url) => url.pathname !== '/login', { timeout: 10000 });
    });

    test('student lands on dashboard and views profile greeting and stats', async ({ page }) => {
        await page.goto('/student/dashboard');
        await expect(page.locator('body')).toContainText(/Ahmad Dahlan|Overview Siswa|Presensi/i);
    });

    test('student can navigate to live attendance page with camera and geofence status', async ({ page }) => {
        await page.goto('/student/attendance');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Presensi|Kamera|Lokasi|Hadir/i);
    });

    test('student can view attendance history with composable calendar and table', async ({ page }) => {
        await page.goto('/student/history');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toContainText(/Riwayat|Presensi|Bulan|Tahun/i);
    });
});
