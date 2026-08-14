/**
 * Pure Node.js CDP (Chrome DevTools Protocol) Driver
 * Runs with native Node.js (v18+) without requiring any external npm dependencies!
 */

async function main() {
    console.log("🌐 [1/7] Menghubungi endpoint Chrome DevTools di http://127.0.0.1:9222/json...");
    
    const versionRes = await fetch("http://127.0.0.1:9222/json/version");
    const version = await versionRes.json();
    console.log(`✅ Terhubung ke: ${version.Browser}`);

    // Get or create a target tab
    const listRes = await fetch("http://127.0.0.1:9222/json/list");
    const tabs = await listRes.json();
    let pageTab = tabs.find(t => t.type === "page");

    if (!pageTab) {
        const newTabRes = await fetch("http://127.0.0.1:9222/json/new?http://smauii-core.remote:8800/login");
        pageTab = await newTabRes.json();
    }

    console.log(`📑 Target Tab ID: ${pageTab.id}, WebSocket: ${pageTab.webSocketDebuggerUrl}`);

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

    let id = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && pending.has(msg.id)) {
            const { resolve, reject } = pending.get(msg.id);
            pending.delete(msg.id);
            if (msg.error) {
                reject(new Error(msg.error.message));
            } else {
                resolve(msg.result);
            }
        }
    };

    await new Promise((resolve, reject) => {
        ws.onopen = resolve;
        ws.onerror = reject;
    });

    function send(method, params = {}) {
        return new Promise((resolve, reject) => {
            const msgId = id++;
            pending.set(msgId, { resolve, reject });
            ws.send(JSON.stringify({ id: msgId, method, params }));
        });
    }

    async function evaluate(expression) {
        const res = await send("Runtime.evaluate", {
            expression,
            returnByValue: true,
            awaitPromise: true,
        });
        return res?.result?.value;
    }

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    // Enable Page, Runtime, DOM
    await send("Page.enable");
    await send("Runtime.enable");
    await send("DOM.enable");

    // Grant Geolocation & Camera Permissions
    try {
        await send("Browser.grantPermissions", {
            permissions: ["geolocation", "videoCapture", "audioCapture"],
            origin: "http://smauii-core.remote:8800",
        });
    } catch {
        // Continue if browser level not supported
    }

    // Set Geolocation to SMA UII coordinates
    await send("Emulation.setGeolocationOverride", {
        latitude: -7.797061,
        longitude: 110.399583,
        accuracy: 10,
    });

    console.log("📍 [2/7] Navigasi ke halaman Login http://smauii-core.remote:8800/login...");
    await send("Page.navigate", { url: "http://smauii-core.remote:8800/login" });
    await sleep(2500);

    console.log("🔑 [3/7] Mengisi form login Siswa (ahmad / password)...");
    await evaluate(`
        (() => {
            const userInp = document.querySelector('input[name="identifier"], input[type="text"]');
            const passInp = document.querySelector('input[name="password"], input[type="password"]');
            if (userInp) {
                userInp.value = 'ahmad';
                userInp.dispatchEvent(new Event('input', { bubbles: true }));
                userInp.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (passInp) {
                passInp.value = 'password';
                passInp.dispatchEvent(new Event('input', { bubbles: true }));
                passInp.dispatchEvent(new Event('change', { bubbles: true }));
            }
        })()
    `);
    await sleep(1000);

    console.log("🖱️ [4/7] Mengklik tombol Masuk...");
    await evaluate(`
        (() => {
            const btn = document.querySelector('button[type="submit"]');
            if (btn) btn.click();
        })()
    `);
    await sleep(3500);

    console.log("🏠 [5/7] Memeriksa halaman Dashboard Siswa di layar monitor...");
    const dashboardTitle = await evaluate(`document.title`);
    console.log(`📄 Judul Halaman: "${dashboardTitle}"`);
    await sleep(2500);

    console.log("🔔 Menguji Popover Notifikasi Facebook-Style di Header...");
    await evaluate(`
        (() => {
            const notifBtn = document.querySelector('[data-testid="notification-popover-trigger"], [data-testid="navbar-notification-btn"], button[aria-label*="notif" i]');
            if (notifBtn) notifBtn.click();
        })()
    `);
    await sleep(2500);
    await evaluate(`
        (() => {
            const notifBtn = document.querySelector('[data-testid="notification-popover-trigger"], [data-testid="navbar-notification-btn"], button[aria-label*="notif" i]');
            if (notifBtn) notifBtn.click();
        })()
    `);
    await sleep(1000);

    console.log("📸 [6/7] Membuka halaman Live Presensi...");
    await send("Page.navigate", { url: "http://smauii-core.remote:8800/student/attendance" });
    await sleep(4000);

    console.log("📅 [7/7] Membuka halaman Riwayat Presensi & Kalender Interaktif...");
    await send("Page.navigate", { url: "http://smauii-core.remote:8800/student/history" });
    await sleep(4000);

    console.log("🎉 SELURUH FLOW BERHASIL DIJALANKAN DI CHROME LOCAL ANDA!");
    ws.close();
}

main().catch(err => {
    console.error("❌ Error:", err);
});
