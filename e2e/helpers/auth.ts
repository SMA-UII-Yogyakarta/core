import type { Page } from '@playwright/test';

const LOGIN_FORM_TIMEOUT = 10_000;
const LOGIN_REDIRECT_TIMEOUT = 15_000;

/**
 * Authenticate a seeded test persona through the real web login flow.
 *
 * Vite can finish the document navigation before the React form has mounted,
 * especially when several viewport projects start together. Wait for the
 * controls and allow one bounded reload before reporting the failure.
 */
export async function loginAs(page: Page, username: string, password = 'password'): Promise<void> {
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');

    await page.goto('/login', {
        waitUntil: 'domcontentloaded',
        timeout: LOGIN_FORM_TIMEOUT,
    });

    try {
        await usernameInput.waitFor({ state: 'visible', timeout: LOGIN_FORM_TIMEOUT });
    } catch (error) {
        await page.reload({
            waitUntil: 'domcontentloaded',
            timeout: LOGIN_FORM_TIMEOUT,
        });
        try {
            await usernameInput.waitFor({ state: 'visible', timeout: LOGIN_FORM_TIMEOUT });
        } catch {
            throw error;
        }
    }

    await passwordInput.waitFor({ state: 'visible', timeout: LOGIN_FORM_TIMEOUT });
    await usernameInput.fill(username);
    await passwordInput.fill(password);

    const submitButton = page.getByRole('button', { name: /masuk|login/i }).first();
    if (await submitButton.isVisible()) {
        await submitButton.click();
    } else {
        await passwordInput.press('Enter');
    }

    await page.waitForURL((url) => url.pathname !== '/login', {
        timeout: LOGIN_REDIRECT_TIMEOUT,
    });
}
