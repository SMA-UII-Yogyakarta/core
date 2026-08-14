import { chromium } from "playwright";

async function runSelfClickDemo() {
    console.log("🚀 Menghubungkan ke Google Chrome di komputer lokal via CDP (port 9222)...");
    
    const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
    const contexts = browser.contexts();
    const context = contexts.length > 0 ? contexts[0] : await browser.newContext();

    // Set permissions & GPS coordinates
    await context.grantPermissions(["camera", "geolocation"], {
        origin: "http://smauii-core.remote:8800",
    });
    await context.setGeolocation({
        latitude: -7.797061,
        longitude: 110.399583,
    });

    const pages = context.pages();
    const page = pages.length > 0 ? pages[0] : await context.newPage();

    // Set viewport size for optimal desktop view
    await page.setViewportSize({ width: 1280, height: 800 });

    console.log("📍 [1/6] Membuka halaman Login SMA UII Core...");
    await page.goto("http://smauii-core.remote:8800/login", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    console.log("🔑 [2/6] Mengisi kredensial Siswa (ahmad)...");
    const identifierInput = page.locator('input[name="identifier"], input[type="text"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

    await identifierInput.click();
    await identifierInput.fill("ahmad");
    await page.waitForTimeout(600);

    await passwordInput.click();
    await passwordInput.fill("password");
    await page.waitForTimeout(600);

    console.log("🖱️ [3/6] Mengklik tombol Masuk...");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/student/**", { timeout: 10000 });
    await page.waitForTimeout(2000);

    console.log("🏠 [4/6] Berada di Dashboard Siswa. Meninjau kartu sapaan dan metrik...");
    await page.waitForTimeout(2000);

    // Popover Notifikasi Test di Header
    console.log("🔔 [5/6] Menguji Popover Notifikasi Facebook-Style di Header...");
    const notifTrigger = page.locator('[data-testid="notification-popover-trigger"], [data-testid="navbar-notification-btn"]').first();
    if (await notifTrigger.isVisible()) {
        await notifTrigger.click();
        await page.waitForTimeout(2000);
        // Tutup kembali
        await notifTrigger.click();
        await page.waitForTimeout(1000);
    }

    // Masuk ke Live Presensi
    console.log("📸 [6/6] Menavigasi ke Live Presensi...");
    await page.goto("http://smauii-core.remote:8800/student/attendance", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    // Masuk ke Riwayat Presensi
    console.log("📅 Menavigasi ke Riwayat Presensi & Kalender...");
    await page.goto("http://smauii-core.remote:8800/student/history", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    console.log("✨ Automated Self-Click Demo selesai dengan sukses!");
}

runSelfClickDemo().catch((err) => {
    console.error("❌ Error saat menjalankan Self-Click Demo:", err);
    process.exit(1);
});
