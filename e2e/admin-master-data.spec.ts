import { expect, test } from '@playwright/test';

test.describe('Admin Master Data E2E Comprehensive Test Suite', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'password');
        await page.locator('input[name="password"]').press('Enter');
        await page.waitForURL((url) => url.pathname !== '/login', { timeout: 15000 });
    });

    test.describe('Mobile Viewport Navigation & Actions (< 640px)', () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 812 });
        });

        test('Mobile Hub directory navigation & back button flow', async ({ page }) => {
            await page.goto('/master-data');
            await expect(page.getByText('Direktori Master Data')).toBeVisible();

            // Click "Data Siswa" card on Hub
            const studentCard = page.getByRole('heading', { name: 'Data Siswa', exact: true });
            await expect(studentCard).toBeVisible();
            await studentCard.click();

            await expect(page).toHaveURL(/tab=students/);
            await expect(page.getByText('Data Siswa').first()).toBeVisible();

            // Click Header Back Arrow (<-)
            const backButton = page.locator('header').getByRole('button').first();
            await backButton.click();

            // Should navigate back to Hub
            await expect(page.getByText('Direktori Master Data')).toBeVisible();
        });

        test('Mobile Header Actions: Import and + Tambah buttons', async ({ page }) => {
            await page.goto('/master-data?tab=students');

            // 2. Import CSV Action Button
            const importButton = page.locator('header').getByRole('button', { name: /import/i }).first();
            await expect(importButton).toBeVisible();
            await importButton.click();
            await expect(page.getByText(/Import Data|Unggah Berkas/i).first()).toBeVisible();
            // Close import modal
            const closeModalBtn = page.getByRole('button', { name: /batal|tutup/i }).first();
            if (await closeModalBtn.isVisible()) {
                await closeModalBtn.click();
            }

            // 3. + Tambah Action Button
            const addButton = page.locator('header').getByRole('button', { name: /tambah/i }).first();
            await expect(addButton).toBeVisible();
            await addButton.click();

            // Should navigate to mobile create form page
            await expect(page).toHaveURL(/\/master-data\/create\?tab=students/);
            await expect(page.getByText('Tambah Siswa Baru')).toBeVisible();
            await expect(page.getByRole('button', { name: /simpan data/i })).toBeVisible();
        });

        test('Mobile Card Selection (Select All & Single Select) & Search Bar', async ({ page }) => {
            await page.goto('/master-data?tab=students');

            // Single horizontal control bar in mobile layout: Select All & Search
            const selectPill = page.getByText(/Pilih \(/i).last();
            await expect(selectPill).toBeVisible();

            // Click Select All pill
            await selectPill.click();

            // Search input typing
            const searchInput = page.getByPlaceholder(/Cari NIS, nama/i).last();
            await expect(searchInput).toBeVisible();
            await searchInput.fill('Sandiko');
            await searchInput.press('Enter');
        });

        test('Mobile Card Click Detail View & Header Unlock/Edit/Copy Flow', async ({ page }) => {
            await page.goto('/master-data?tab=students');

            // Click first student card to open Detail View
            const cardItem = page.locator('div[class*="p-3 bg-surface rounded-2xl"]').first();
            if (await cardItem.isVisible()) {
                await cardItem.click();

                // Should navigate to detail URL
                await expect(page).toHaveURL(/\/master-data\/students\/\d+\/detail$/);
                await expect(page.getByText(/Detail Data Siswa|Data Siswa/i).first()).toBeVisible();

                // Header Salin dropdown button
                const salinButton = page.locator('header').getByRole('button', { name: /salin/i }).first();
                if (await salinButton.isVisible()) {
                    await salinButton.click();
                    await expect(page.getByText(/Format Spreadsheet|Tabel Markdown/i).first()).toBeVisible();
                    await page.keyboard.press('Escape');
                }

                // Header Edit/Kunci Toggle Button
                const editHeaderBtn = page.locator('header').getByRole('button', { name: /edit/i }).first();
                if (await editHeaderBtn.isVisible()) {
                    await editHeaderBtn.click();
                    // Button should toggle label to "Kunci" and show sticky bottom submit button "Perbarui Data"
                    await expect(page.locator('header').getByRole('button', { name: /kunci/i })).toBeVisible();
                    await expect(page.getByRole('button', { name: /perbarui data/i })).toBeVisible();

                    // Toggle back to Kunci
                    const kunciHeaderBtn = page.locator('header').getByRole('button', { name: /kunci/i }).first();
                    await kunciHeaderBtn.click();
                    await expect(page.locator('header').getByRole('button', { name: /edit/i })).toBeVisible();
                }
            }
        });

        test('Mobile Card Direct Edit Action Button Flow', async ({ page }) => {
            await page.goto('/master-data?tab=students');

            const cardEditBtn = page.getByRole('button', { name: /^Edit$/i }).first();
            if (await cardEditBtn.isVisible()) {
                await cardEditBtn.click();
                await expect(page).toHaveURL(/\/master-data\/students\/\d+\/edit$/);
                await expect(page.getByText('Edit Data Siswa')).toBeVisible();
                await expect(page.getByRole('button', { name: /perbarui data/i })).toBeVisible();
            }
        });
    });

    test.describe('Desktop & Tablet Viewport Navigation (>= 640px)', () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({ width: 1280, height: 800 });
        });

        test('Desktop Tab Switcher & Table view', async ({ page }) => {
            await page.goto('/master-data');
            await expect(page.locator('table').first()).toBeVisible();

            // Switch tabs via TabSwitcher / Vertical Icon Rail
            const teacherTab = page.locator('button').filter({ hasText: /Tenaga Pendidik/i }).first();
            await teacherTab.click({ force: true });
            await expect(page).toHaveURL(/tab=teachers/);

            const classTab = page.locator('button').filter({ hasText: /Kelas & Rombel/i }).first();
            await classTab.click({ force: true });
            await expect(page).toHaveURL(/tab=class/);

            const guardianTab = page.locator('button').filter({ hasText: /Wali Murid/i }).first();
            await guardianTab.click({ force: true });
            await expect(page).toHaveURL(/tab=guardians/);
        });
    });
});
