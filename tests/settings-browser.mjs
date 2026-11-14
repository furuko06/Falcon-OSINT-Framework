// Browser check for the Settings panel: clearing the query history must remove
// the stored records, re-render the count and leave the button disabled.
// Requires the production preview (npm run build && npm run preview).
// Usage: FALCON_URL=http://localhost:4173/ node tests/settings-browser.mjs
import { chromium } from "playwright-core";

const URL = process.env.FALCON_URL || "http://localhost:4173/";
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";

const failures = [];
function check(name, ok, detail = "") {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` (${detail})` : ""}`);
    if (!ok) failures.push(name);
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", error => pageErrors.push(error.message));
page.on("dialog", dialog => dialog.accept());

try {
    await page.addInitScript(() => {
        localStorage.setItem("falcon:query-history", JSON.stringify([
            { question: "consulta de prueba", answer: "respuesta", created_at: "2026-11-13T00:00:00.000Z" }
        ]));
    });

    await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForSelector(".tool-card", { timeout: 60000 });

    await page.click('[data-action="settings"]');
    await page.waitForSelector(".settings-panel", { timeout: 15000 });

    const card = page.locator(".settings-card", { hasText: "Historial de consultas IA" });
    check("history card renders the stored count", (await card.textContent()).includes("1 consulta(s)"));
    check("clear button is enabled with history", await page.locator("[data-clear-history]").isEnabled());

    await page.click("[data-clear-history]");
    await page.waitForTimeout(500);

    const stored = await page.evaluate(() => localStorage.getItem("falcon:query-history"));
    check("history is removed from localStorage", stored === null);
    const refreshed = page.locator(".settings-card", { hasText: "Historial de consultas IA" });
    check("count returns to zero", (await refreshed.textContent()).includes("0 consulta(s)"));
    check("clear button is disabled when empty", await page.locator("[data-clear-history]").isDisabled());

    const sw = await page.evaluate(async () => {
        const response = await fetch("sw.js");
        return response.ok ? response.text() : "";
    });
    check("service worker is built for 1.0.0", /falcon-1\.0\.0-/.test(sw), sw.match(/falcon-[^"]+/)?.[0] || "sin cache");

    check("no page errors", pageErrors.length === 0, pageErrors.join(" | "));
} catch (error) {
    check("settings browser check ran", false, error.message);
} finally {
    await browser.close();
}

console.log(failures.length ? `\n${failures.length} comprobación(es) fallaron.` : "\nTodas las comprobaciones pasaron.");
process.exit(failures.length ? 1 : 0);
