import { chromium } from "playwright";

async function main() {
    console.log("Connecting...");
    const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
    console.log("Connected!");
    const contexts = browser.contexts();
    console.log("Contexts count:", contexts.length);
    const context = contexts[0];
    const pages = context.pages();
    console.log("Pages count:", pages.length);
    
    let page = pages[0];
    if (!page) {
        page = await context.newPage();
    }
    
    console.log("Current page URL:", page.url());
    console.log("Navigating to login...");
    await page.goto("http://smauii-core.remote:8800/login", { waitUntil: "domcontentloaded", timeout: 15000 });
    console.log("Navigated to:", page.url());
    
    console.log("Typing login...");
    await page.locator('input[name="identifier"], input[type="text"]').first().fill("ahmad");
    await page.locator('input[name="password"], input[type="password"]').first().fill("password");
    console.log("Clicking submit...");
    await page.locator('button[type="submit"]').click();
    
    console.log("Waiting for dashboard...");
    await page.waitForTimeout(3000);
    console.log("Current URL after login:", page.url());
    
    console.log("Done!");
}

main().catch(console.error);
