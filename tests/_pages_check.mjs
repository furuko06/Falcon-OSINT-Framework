import { chromium } from "playwright-core";

const url = process.argv[2];
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const cards = await page.locator("#cards .card, #cards > *").count();
console.log("cards:", cards);
console.log("errors:", errors.length ? errors : "none");
await browser.close();
