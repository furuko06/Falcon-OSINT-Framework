// Browser smoke test for the Explorer. Run with the dev server on :5173.
// Usage: node tests/explorer-browser.mjs
import { chromium } from "playwright-core";

const URL = process.env.FALCON_URL || "http://localhost:5173/";
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";

const failures = [];
function check(name, ok, detail = "") {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` (${detail})` : ""}`);
    if (!ok) failures.push(name);
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
const pageErrors = [];
page.on("pageerror", e => pageErrors.push(e.message));

try {
    await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForSelector(".tool-card", { timeout: 60000 });

    const total = await page.locator(".tool-card").count();
    check("cards render", total > 0, `${total} cards`);

    const badge = await page.locator(".tool-card .health-badge").first().innerText();
    check("health badge renders", badge.trim().length > 0, badge.trim());

    await page.fill("#search-input", "Sherlock");
    await page.waitForTimeout(300);
    const searched = await page.locator(".tool-card").count();
    check("search narrows results", searched >= 1 && searched < total, `${searched}/${total}`);
    const hasSherlock = await page.locator(".tool-card h3", { hasText: "Sherlock" }).count();
    check("search finds Sherlock", hasSherlock >= 1);
    await page.fill("#search-input", "");
    await page.waitForTimeout(300);

    const target = await page.$$eval("#filter-category option", opts =>
        opts.map(o => o.value).find(v => v)
    );
    if (target) {
        await page.selectOption("#filter-category", target);
        await page.waitForTimeout(300);
        const filtered = await page.locator(".tool-card").count();
        check("category filter narrows results", filtered > 0 && filtered < total, `${target}: ${filtered}/${total}`);
        await page.click("#clear-filters");
        await page.waitForTimeout(300);
    } else {
        check("category filter has options", false);
    }

    await page.click("[data-view=list]");
    await page.waitForTimeout(200);
    const listClass = await page.locator("#cards").getAttribute("class");
    check("list view toggles", (listClass || "").includes("cards-list"), listClass);

    const widgetLabels = await page.locator(".dashboard-widget-label").allInnerTexts();
    const expected = ["Total Tools", "Offline Ready", "APIs", "Docker", "Recently Verified", "Broken Tools", "Deprecated", "Community Health"];
    const missing = expected.filter(l => !widgetLabels.includes(l));
    check("dashboard widgets render", missing.length === 0, missing.join(", ") || `${widgetLabels.length} widgets`);
    const totalValue = await page.locator('[data-widget="total"] .dashboard-widget-value').innerText();
    check("dashboard total matches catalog", Number(totalValue) === total, `${totalValue} vs ${total}`);

    check("no page errors", pageErrors.length === 0, pageErrors.join(" | "));
} catch (err) {
    check("browser test ran without exception", false, err.message);
} finally {
    await browser.close();
}

if (failures.length) {
    console.error(`\n${failures.length} check(s) failed.`);
    process.exit(1);
}
console.log("\nAll Explorer browser checks passed.");
