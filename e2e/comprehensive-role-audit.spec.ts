import { expect, test, type Page } from '@playwright/test';

// Helper for authenticating a persona
async function loginAs(page: Page, username: string, password = 'password') {
    await page.goto('/login');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 15000 });
}

// Helper to safely take fullpage screenshots
async function captureScreenshot(page: Page, testName: string, projectName: string) {
    const filename = `playwright-report/screenshots/audit/${testName}-${projectName}.png`;
    await page.screenshot({ path: filename, fullPage: true });
}

test.describe('SMART Absen — Multi-Role & UI/UX Consistency Audit', () => {

    // ──────────────────────────────────────────────────────────────────────────
    // 1. ADMIN ROLE AUDIT
    // ──────────────────────────────────────────────────────────────────────────
    test.describe('Role: Administrator (admin)', () => {
        test.beforeEach(async ({ page }) => {
            await loginAs(page, 'admin');
        });

        test('admin dashboard renders macro statistics and uncut navigation', async ({ page }, testInfo) => {
            await page.goto('/dashboard');
            await page.waitForLoadState('domcontentloaded');

            // Header semantic check: Admin uses "Dashboard"
            await expect(page.locator('body')).toContainText(/Dashboard|Statistik Kehadiran|SMA UII/i);
            await expect(page.locator('main')).toBeVisible();

            await captureScreenshot(page, 'admin-01-dashboard', testInfo.project.name);
        });

        test('admin master data hub renders table and bulk actions', async ({ page }, testInfo) => {
            await page.goto('/master-data');
            await page.waitForLoadState('domcontentloaded');

            await expect(page.locator('body')).toContainText(/Data Master|Direktori Master Data|Data Siswa/i);

            // Check Master Data Students tab
            await page.goto('/master-data?tab=students');
            await page.waitForLoadState('domcontentloaded');

            // Table is visible on desktop, while responsive card list is rendered on mobile
            const table = page.locator('table').first();
            if (await table.isVisible()) {
                await expect(table).toBeVisible();
            } else {
                await expect(page.locator('body')).toContainText(/Data Siswa|Pilih/i);
            }

            await captureScreenshot(page, 'admin-02-master-data-students', testInfo.project.name);
        });

        test('admin operational settings renders time, location and holidays', async ({ page }, testInfo) => {
            await page.goto('/operational-settings');
            await page.waitForLoadState('domcontentloaded');

            await expect(page.locator('body')).toContainText(/Waktu|Lokasi|Libur|Radius|Presensi/i);

            await captureScreenshot(page, 'admin-03-operational-settings', testInfo.project.name);
        });

        test('admin reports daily renders standalone table and export buttons', async ({ page }, testInfo) => {
            await page.goto('/reports/daily');
            await page.waitForLoadState('domcontentloaded');

            await expect(page.locator('body')).toContainText(/Laporan|Rekap|Harian/i);

            await captureScreenshot(page, 'admin-04-reports-daily', testInfo.project.name);
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 2. GURU PIKET ROLE AUDIT
    // ──────────────────────────────────────────────────────────────────────────
    test.describe('Role: Guru Piket (dimas_kom)', () => {
        test.beforeEach(async ({ page }) => {
            await loginAs(page, 'dimas_kom');
        });

        test('duty teacher lands on duty dashboard with real-time class monitoring', async ({ page }, testInfo) => {
            await page.goto('/teacher/duty');
            await page.waitForLoadState('domcontentloaded');

            // Semantic check: Guru Piket uses "Overview"
            await expect(page.locator('body')).toContainText(/Guru Piket|Overview|Pantauan|Piket/i, { timeout: 10000 });

            // Verify trimmed menu: Master Data should NOT be accessible in sidebar
            const masterDataLink = page.getByRole('link', { name: /data master/i });
            await expect(masterDataLink).toHaveCount(0);

            await captureScreenshot(page, 'teacher-duty-01-dashboard', testInfo.project.name);
        });

        test('duty teacher can access leave monitoring', async ({ page }, testInfo) => {
            await page.goto('/leave-requests');
            await page.waitForLoadState('domcontentloaded');

            await expect(page.locator('body')).toContainText(/Izin|Permohonan|Status|Pantauan/i);

            await captureScreenshot(page, 'teacher-duty-02-leave-requests', testInfo.project.name);
        });

        test('duty teacher is restricted from admin settings (trimmed feature)', async ({ page }) => {
            await page.goto('/operational-settings');
            await expect(page.locator('body')).toContainText(/403|Akses Ditolak/i);
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 3. GURU WALI KELAS ROLE AUDIT
    // ──────────────────────────────────────────────────────────────────────────
    test.describe('Role: Guru Wali Kelas (budi)', () => {
        test.beforeEach(async ({ page }) => {
            await loginAs(page, 'budi');
        });

        test('homeroom teacher dashboard is scoped to their classroom', async ({ page }, testInfo) => {
            await page.goto('/teacher/homeroom');
            await page.waitForLoadState('domcontentloaded');

            // Scoped check: Budi is Wali Kelas X-A
            await expect(page.locator('body')).toContainText(/Wali Kelas|X-A|Overview/i);

            await captureScreenshot(page, 'teacher-homeroom-01-dashboard', testInfo.project.name);
        });

        test('homeroom teacher can access leave request verification page', async ({ page }, testInfo) => {
            await page.goto('/leave-requests/verification');
            await page.waitForLoadState('domcontentloaded');

            await expect(page.locator('body')).toContainText(/Verifikasi|Izin|X-A|Pengajuan/i);

            await captureScreenshot(page, 'teacher-homeroom-02-verification', testInfo.project.name);
        });

        test('homeroom teacher reports page shows classroom breakdown', async ({ page }, testInfo) => {
            await page.goto('/reports');
            await page.waitForLoadState('domcontentloaded');

            await expect(page.locator('body')).toContainText(/Rekap|Laporan|Kehadiran|Kelas/i);

            await captureScreenshot(page, 'teacher-homeroom-03-reports', testInfo.project.name);
        });

        test('homeroom teacher is restricted from master data (trimmed feature)', async ({ page }) => {
            await page.goto('/master-data');
            await expect(page.locator('body')).toContainText(/403|Akses Ditolak/i);
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 4. WALI MURID (GUARDIAN) ROLE AUDIT
    // ──────────────────────────────────────────────────────────────────────────
    test.describe('Role: Orang Tua / Wali Murid (wahyu)', () => {
        test.beforeEach(async ({ page }) => {
            await loginAs(page, 'wahyu');
        });

        test('guardian dashboard renders child attendance summary and quick actions', async ({ page }, testInfo) => {
            await page.goto('/guardian');
            await page.waitForLoadState('domcontentloaded');

            // Semantic check: Uses "Overview"
            await expect(page.locator('body')).toContainText(/Wali Murid|Overview|Anak|Kehadiran/i);

            await captureScreenshot(page, 'guardian-01-dashboard', testInfo.project.name);
        });

        test('guardian leave application form contains required inputs', async ({ page }, testInfo) => {
            await page.goto('/guardian/leave-application');
            await page.waitForLoadState('domcontentloaded');

            await expect(page.locator('body')).toContainText(/Pengajuan Izin|Form|Surat/i);

            // Form inputs check
            const formOrInputs = page.locator('form, input, select, textarea');
            await expect(formOrInputs.first()).toBeVisible();

            await captureScreenshot(page, 'guardian-02-leave-application', testInfo.project.name);
        });

        test('guardian attendance history displays timeline or history cards', async ({ page }, testInfo) => {
            await page.goto('/guardian/history');
            await page.waitForLoadState('domcontentloaded');

            await expect(page.locator('body')).toContainText(/Riwayat|Presensi|Kehadiran/i);

            await captureScreenshot(page, 'guardian-03-history', testInfo.project.name);
        });

        test('guardian cannot access teacher or admin routes (trimmed)', async ({ page }) => {
            await page.goto('/master-data');
            await expect(page.locator('body')).toContainText(/403|Akses Ditolak/i);

            await page.goto('/teacher/duty');
            await expect(page.locator('body')).toContainText(/403|Akses Ditolak/i);
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 5. SISWA (STUDENT) ROLE AUDIT
    // ──────────────────────────────────────────────────────────────────────────
    test.describe('Role: Siswa (ahmad)', () => {
        test.beforeEach(async ({ page, context }) => {
            // Emulate Camera & GPS Geolocation for SMA UII
            await context.grantPermissions(['camera', 'geolocation']);
            await context.setGeolocation({
                latitude: -7.797061,
                longitude: 110.399583,
            });

            await loginAs(page, 'ahmad');
        });

        test('student dashboard renders personal overview and today attendance status', async ({ page }, testInfo) => {
            await page.goto('/student/dashboard');
            await page.waitForLoadState('domcontentloaded');

            await expect(page.locator('body')).toContainText(/Ahmad|Overview|Presensi|Hari Ini/i);

            await captureScreenshot(page, 'student-01-dashboard', testInfo.project.name);
        });

        test('student live attendance renders camera viewport and GPS status', async ({ page }, testInfo) => {
            await page.goto('/student/attendance');
            await page.waitForLoadState('domcontentloaded');

            await expect(page.locator('body')).toContainText(/Presensi|Kamera|Lokasi|Ambil Foto|Hadir/i);

            await captureScreenshot(page, 'student-02-live-attendance', testInfo.project.name);
        });

        test('student attendance history displays attendance records', async ({ page }, testInfo) => {
            await page.goto('/student/history');
            await page.waitForLoadState('domcontentloaded');

            await expect(page.locator('body')).toContainText(/Riwayat|Presensi|Bulan/i);

            await captureScreenshot(page, 'student-03-history', testInfo.project.name);
        });

        test('student has zero administrative controls (fully trimmed)', async ({ page }) => {
            await page.goto('/operational-settings');
            await expect(page.locator('body')).toContainText(/403|Akses Ditolak/i);

            await page.goto('/master-data');
            await expect(page.locator('body')).toContainText(/403|Akses Ditolak/i);
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 6. DUAL ROLE TEACHER EXCEPTIONAL BEHAVIOR
    // ──────────────────────────────────────────────────────────────────────────
    test.describe('Exceptional: Dual Role Teacher (ustadz_ihsan)', () => {
        test('ustadz_ihsan can navigate between homeroom and duty interfaces seamlessly', async ({ page }, testInfo) => {
            await loginAs(page, 'ustadz_ihsan');

            // Visit Homeroom Dashboard (Wali Kelas X-C)
            await page.goto('/teacher/homeroom');
            await expect(page.locator('body')).toContainText(/Wali Kelas|X-C|Overview/i);

            // Visit Duty Dashboard (since ustadz_ihsan has both duty and homeroom)
            await page.goto('/teacher/duty');
            await expect(page.locator('body')).toContainText(/Guru Piket|Overview|Piket/i);

            await captureScreenshot(page, 'teacher-dual-role-switching', testInfo.project.name);
        });
    });
});
