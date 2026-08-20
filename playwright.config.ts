import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for SMART Absen SMA UII.
 * Configured with multi-viewport projects using Chromium (Mobile 390px, Mobile Landscape 844px, Tablet 768px, Laptop 1280px, Desktop 1920px),
 * GPS Geolocation presets, Virtual Camera emulation, and Screenshot reporting for QA audit.
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
        screenshot: 'on',
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
            name: 'mobile-portrait',
            use: {
                ...devices['Pixel 7'],
                viewport: { width: 390, height: 844 },
                isMobile: true,
                hasTouch: true,
            },
        },
        {
            name: 'mobile-landscape',
            use: {
                ...devices['Pixel 7'],
                viewport: { width: 844, height: 390 },
                isMobile: true,
                hasTouch: true,
            },
        },
        {
            name: 'tablet',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 768, height: 1024 },
            },
        },
        {
            name: 'laptop',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1280, height: 800 },
            },
        },
        {
            name: 'desktop-fhd',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 },
            },
        },
    ],
});
