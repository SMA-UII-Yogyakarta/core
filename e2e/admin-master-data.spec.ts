import { expect, test } from '@playwright/test';

test.describe('Admin Master Data & Drawer Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'password');
        await page.locator('input[name="password"]').press('Enter');
        await page.waitForURL((url) => url.pathname !== '/login', { timeout: 10000 });
    });

    test('admin can access master data and switch tabs', async ({ page }) => {
        await page.goto('/master-data');
        await expect(page.locator('body')).toContainText(/Manajemen Data Master|Master Data/i);

        // Switch to Teachers tab ("Master Guru")
        const teacherTab = page.getByText(/Master Guru/i).first();
        if (await teacherTab.isVisible()) {
            await teacherTab.click();
            await expect(page).toHaveURL(/tab=teachers/);
        }
    });

    test('admin can open and close Action Drawer', async ({ page }) => {
        await page.goto('/master-data');
        const addButton = page.getByRole('button', { name: /tambah/i }).first();
        if (await addButton.isVisible()) {
            await addButton.click();
            // Drawer should open
            const closeBtn = page.getByRole('button', { name: /batal|tutup/i }).first();
            await expect(closeBtn).toBeVisible();
            await closeBtn.click();
        }
    });
});
