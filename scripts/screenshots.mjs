#!/usr/bin/env node
// Regenerates the README screenshots from the production build.
// Usage: npm run build && npm run preview  (in another shell)
//        FALCON_URL=http://localhost:4173/ node scripts/screenshots.mjs
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const BASE = process.env.FALCON_URL || "http://localhost:4173/";
const OUT = path.resolve("docs/assets/screenshots");
const SHOTS = [
    { name: "catalogo", action: null, wait: ".tool-card" },
    { name: "playbooks", action: '[data-action="playbooks"]', wait: ".playbooks-panel" },
    { name: "asistente", action: '[data-action="assistant"]', wait: ".assistant-panel" },
    { name: "ajustes", action: '[data-action="settings"]', wait: ".settings-panel" }
];

function chromePath() {
    return [
        process.env.CHROME_PATH,
        chromium.executablePath(),
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
        "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser"
    ].filter(Boolean).find(candidate => fs.existsSync(candidate));
}

const executablePath = chromePath();
if (!executablePath) {
    console.error("No se encontró Chrome/Chromium. Definí CHROME_PATH.");
    process.exit(2);
}

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 860 }, deviceScaleFactor: 1 });
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForSelector(".tool-card", { timeout: 60000 });
await page.waitForTimeout(1200);

for (const shot of SHOTS) {
    if (shot.action) {
        await page.locator(shot.action).click();
        if (shot.wait) await page.waitForSelector(shot.wait);
        await page.waitForTimeout(600);
    }
    const file = path.join(OUT, `${shot.name}.png`);
    await page.screenshot({ path: file });
    console.log(`${path.relative(process.cwd(), file)} (${(fs.statSync(file).size / 1024).toFixed(0)} KB)`);
}

await browser.close();
