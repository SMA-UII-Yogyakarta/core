import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for SMART Absen SMA UII.
 * Configured with GPS Geolocation presets and Virtual Camera emulation.
 */
export default defineConfig({
    testDir: './e2e',
    timeout: 30 * 1000,
    expect: {
        timeout: 5000,
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [['html', { open: 'never' }], ['list']],
    use: {
        baseURL: process.env.APP_URL || 'http://localhost:8800',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        // Geolocation preset: SMA UII Yogyakarta (Sorowajan Baru)
        geolocation: {
            latitude: -7.797061,
            longitude: 110.399583,
        },
        permissions: ['geolocation', 'camera'],
        launchOptions: {
            args: [
                '--use-fake-ui-for-media-stream',
                '--use-fake-device-for-media-stream',
            ],
        },
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
