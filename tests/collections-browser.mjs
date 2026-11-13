// Browser check for E3 Collections. Requires the dev server on :5173.
// Usage: node tests/collections-browser.mjs
import { chromium } from "playwright-core";

const URL = process.env.FALCON_URL || "http://localhost:5173/";
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";

const failures = [];
function check(name, ok, detail = "") {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` (${detail})` : ""}`);
    if (!ok) failures.push(name);
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const context = await browser.newContext({ acceptDownloads: true });
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", e => pageErrors.push(e.message));
page.on("dialog", d => d.accept());

try {
    await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForSelector(".tool-card", { timeout: 60000 });

    await page.fill("#collection-name", "Investigación A");
    await page.click("#collection-form button[type=submit]");
    await page.waitForSelector("#col-rename", { timeout: 5000 });
    check("collection created", (await page.inputValue("#col-rename")) === "Investigación A");

    await page.locator(".tool-card").first().locator(".collection-add select")
        .selectOption({ index: 1 });
    await page.waitForTimeout(300);
    const detailItems = await page.locator(".collection-tools li").count();
    check("tool added to collection", detailItems === 1, `${detailItems} tool(s)`);

    await page.fill("#col-tags", "Dominio, Email");
    await page.locator("#col-tags").dispatchEvent("change");
    await page.fill("#col-notes", "Caso de prueba");
    await page.locator("#col-notes").dispatchEvent("change");
    await page.waitForTimeout(200);

    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("falcon:collections")));
    check("persisted to localStorage", stored?.[0]?.toolIds?.length === 1 && stored[0].tags.join() === "dominio,email" && stored[0].notes === "Caso de prueba");

    const [jsonDl] = await Promise.all([
        page.waitForEvent("download"),
        page.click("#col-export-json")
    ]);
    check("JSON export downloads", jsonDl.suggestedFilename().endsWith(".json"), jsonDl.suggestedFilename());

    const [mdDl] = await Promise.all([
        page.waitForEvent("download"),
        page.click("#col-export-md")
    ]);
    check("Markdown export downloads", mdDl.suggestedFilename().endsWith(".md"), mdDl.suggestedFilename());

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector(".tool-card");
    await page.locator(".sidebar-item", { hasText: "Investigación A" }).click();
    check("collection survives reload", (await page.locator(".collection-tools li").count()) === 1);

    await page.locator(".favorite-btn").first().click();
    await page.waitForTimeout(200);
    const favs = await page.evaluate(() => JSON.parse(localStorage.getItem("falcon:favorites")));
    check("favorites still work", favs.length === 1);

    check("no page errors", pageErrors.length === 0, pageErrors.join(" | "));
} catch (err) {
    check("collections browser test ran", false, err.message);
} finally {
    await browser.close();
}

if (failures.length) {
    console.error(`\n${failures.length} check(s) failed.`);
    process.exit(1);
}
console.log("\nAll Collections browser checks passed.");
