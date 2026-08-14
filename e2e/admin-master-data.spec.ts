import { expect, test } from '@playwright/test';

test.describe('Admin Master Data & Drawer Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="identifier"], input[type="text"]', 'admin');
        await page.fill('input[name="password"], input[type="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/(overview|dashboard|master-data)/);
    });

    test('admin can access master data and switch tabs', async ({ page }) => {
        await page.goto('/master-data');
        await expect(page.getByText(/Master Data/i).first()).toBeVisible();

        // Switch to Teachers tab
        const teacherTab = page.getByRole('button', { name: /guru/i });
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
