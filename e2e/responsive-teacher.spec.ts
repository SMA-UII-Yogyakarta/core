import { expect, test } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Responsive Teacher Portals QA Audit', () => {
    test('duty teacher (piket) views duty dashboard responsively', async ({ page }, testInfo) => {
        await loginAs(page, 'dimas_kom');

        await page.goto('/teacher/duty');
        await expect(page.locator('body')).toContainText(/Guru Piket|Piket|Overview/i);

        // Take QA Screenshot
        await page.screenshot({
            path: `playwright-report/screenshots/teacher-duty-dashboard-${testInfo.project.name}.png`,
            fullPage: true,
        });
    });

    test('homeroom teacher (wali) views homeroom dashboard responsively', async ({ page }, testInfo) => {
        await loginAs(page, 'budi');

        await page.goto('/teacher/homeroom');
        await expect(page.locator('body')).toContainText(/Wali Kelas|Kelas|Overview/i);

        // Take QA Screenshot
        await page.screenshot({
            path: `playwright-report/screenshots/teacher-homeroom-dashboard-${testInfo.project.name}.png`,
            fullPage: true,
        });
    });
});
