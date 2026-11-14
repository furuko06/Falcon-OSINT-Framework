import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright-core";

const BASE = process.env.A11Y_URL || "http://localhost:4173/";
const AXE_PATH = path.resolve("node_modules/axe-core/axe.min.js");
const REPORT = path.resolve("docs/audits/A11Y_AUDIT.md");
const AXE = fs.readFileSync(AXE_PATH, "utf8");
const axeVersion = JSON.parse(fs.readFileSync("node_modules/axe-core/package.json", "utf8")).version;
const appVersion = JSON.parse(fs.readFileSync("package.json", "utf8")).version;
const commit = (() => {
    try {
        return execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
    } catch {
        return "unknown";
    }
})();

function chromePath() {
    const candidates = [
        process.env.CHROME_PATH,
        chromium.executablePath(),
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
        "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser"
    ].filter(Boolean);
    return candidates.find(candidate => fs.existsSync(candidate));
}

const scenarios = [
    { id: "home", label: "Catálogo", action: null },
    { id: "assistant", label: "Asistente IA", action: '[data-action="assistant"]', wait: ".assistant-panel" },
    { id: "settings", label: "Ajustes y backup", action: '[data-action="settings"]', wait: ".settings-panel" },
    { id: "privacy", label: "Políticas y privacidad", action: '[data-action="privacy"]', wait: ".policy-panel" },
    { id: "academy", label: "Academy", action: '[data-action="academy"]', wait: ".academy-panel" },
    { id: "playbooks", label: "Playbooks", action: '[data-action="playbooks"]', wait: ".playbooks-panel" },
    { id: "graph", label: "Knowledge Graph", action: '[data-action="graph"]', wait: ".graph-panel" },
    { id: "ioc", label: "IOC Workspace", action: '[data-action="ioc"]', wait: ".ioc-panel" }
];

const executablePath = chromePath();
if (!executablePath) {
    console.error("No se encontró Chrome/Chromium. Definí CHROME_PATH.");
    process.exit(2);
}

const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const manual = [];
const manualCheck = (label, ok, detail = "") => manual.push({ label, ok, detail });
const consoleErrors = [];
page.on("pageerror", error => consoleErrors.push(error.message));
page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(message.text());
});

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

// axe is injected through Runtime.evaluate so the audit still runs under CSP.
await page.evaluate(AXE);

const results = [];
for (const scenario of scenarios) {
    if (scenario.action) {
        await page.locator(scenario.action).click();
        if (scenario.wait) await page.waitForSelector(scenario.wait);
        await page.waitForTimeout(500);
    }
    const result = await page.evaluate(async () => {
        const audit = await window.axe.run(document, {
            runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]
            }
        });
        return {
            violations: audit.violations.map(item => ({
                id: item.id,
                impact: item.impact,
                description: item.description,
                help: item.help,
                helpUrl: item.helpUrl,
                nodes: item.nodes.map(node => ({
                    target: node.target.join(" "),
                    html: node.html,
                    failureSummary: node.failureSummary
                }))
            })),
            passes: audit.passes.length,
            incomplete: audit.incomplete.length
        };
    });
    results.push({ ...scenario, ...result });
}

// Keyboard and reduced-motion checks that axe cannot cover.
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.keyboard.press("Tab");
const firstFocus = await page.evaluate(() => ({
    className: document.activeElement?.className || "",
    text: document.activeElement?.textContent?.trim() || ""
}));
manualCheck("El primer Tab llega al skip link", firstFocus.className.includes("skip-link"), firstFocus.text);
const focusVisible = await page.evaluate(() => {
    const el = document.querySelector(".skip-link");
    return el ? el.getBoundingClientRect().top >= 0 && getComputedStyle(el).top !== "-52px" : false;
});
manualCheck("El skip link se hace visible al enfocar", focusVisible);
await page.keyboard.press("Enter");
manualCheck("El skip link mueve el foco al contenido principal", await page.evaluate(() => document.activeElement?.id === "main-content"));

const reducedContext = await browser.newContext({ reducedMotion: "reduce" });
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(BASE, { waitUntil: "networkidle" });
await reducedPage.waitForTimeout(1500);
const reduced = await reducedPage.evaluate(() => {
    const card = document.querySelector(".tool-card");
    if (!card) return "";
    const style = getComputedStyle(card);
    return { transition: style.transitionDuration, animation: style.animationDuration };
});
const reducedValues = [reduced.transition, reduced.animation].filter(Boolean);
const reducedOk = reducedValues.length > 0 && reducedValues.every(value => parseFloat(value) < 0.05);
manualCheck("prefers-reduced-motion desactiva transiciones", reducedOk, reducedValues.join(" / "));
await reducedContext.close();

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const mobilePage = await mobileContext.newPage();
await mobilePage.goto(BASE, { waitUntil: "networkidle" });
await mobilePage.waitForTimeout(1500);
await mobilePage.locator('[data-action="assistant"]').click();
await mobilePage.waitForSelector(".assistant-panel");
const smallTargets = await mobilePage.evaluate(() => {
    const buttons = [...document.querySelectorAll(".assistant-panel button, .sidebar-item")];
    return buttons
        .filter(button => button.getClientRects().length)
        .map(button => ({ text: button.textContent.trim().slice(0, 30), height: button.getBoundingClientRect().height }))
        .filter(item => item.height < 44);
});
manualCheck("Objetivos táctiles de 44 px en móvil", smallTargets.length === 0, smallTargets.map(item => `${item.text}:${item.height}`).join(", "));
await mobileContext.close();

await browser.close();

const allViolations = results.flatMap(scenario =>
    scenario.violations.map(violation => ({ scenario: scenario.label, ...violation }))
);
const totalNodes = allViolations.reduce((sum, item) => sum + item.nodes.length, 0);
const generatedAt = new Date().toISOString();
const manualFailed = manual.filter(check => !check.ok);
const failed = allViolations.length > 0 || manualFailed.length > 0;

const impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
allViolations.sort((a, b) => (impactOrder[a.impact] ?? 9) - (impactOrder[b.impact] ?? 9));

const lines = [
    "# Auditoría de accesibilidad",
    "",
    `- Fecha: ${generatedAt}`,
    `- Versión: ${appVersion}`,
    `- Base Git: \`${commit}\` + cambios de la auditoría`,
    `- URL: ${BASE}`,
    `- Alcance: WCAG 2.2 A/AA, 8 vistas principales`,
    `- Motor: axe-core ${axeVersion} en Chrome headless`,
    `- Resultado: **${allViolations.length} violaciones** (${totalNodes} nodos)`,
    "",
    "## Resumen por vista",
    "",
    "| Vista | Violaciones | Nodos | Pases | Incompletos |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...results.map(result => {
        const nodes = result.violations.reduce((sum, item) => sum + item.nodes.length, 0);
        return `| ${result.label} | ${result.violations.length} | ${nodes} | ${result.passes} | ${result.incomplete} |`;
    }),
    "",
    "## Comprobaciones manuales",
    "",
    "| Comprobación | Resultado | Detalle |",
    "| --- | --- | --- |",
    ...manual.map(check => `| ${check.label} | ${check.ok ? "PASA" : "FALLA"} | ${check.detail || ""} |`),
    "",
    "## Hallazgos",
    ""
];

if (!allViolations.length) {
    lines.push("No se detectaron violaciones automatizadas para las etiquetas WCAG 2.2 A/AA.");
} else {
    for (const violation of allViolations) {
        lines.push(`### ${violation.id} — ${violation.impact}`);
        lines.push("");
        lines.push(`- Vista: ${violation.scenario}`);
        lines.push(`- Regla: ${violation.help}`);
        lines.push(`- Nodos: ${violation.nodes.length}`);
        lines.push(`- Referencia: ${violation.helpUrl}`);
        lines.push("");
        for (const node of violation.nodes.slice(0, 8)) {
            lines.push(`  - \`${node.target}\``);
            if (node.failureSummary) lines.push(`    - ${node.failureSummary.replace(/\n/g, " ")}`);
        }
        if (violation.nodes.length > 8) lines.push(`  - … ${violation.nodes.length - 8} nodos más`);
        lines.push("");
    }
}

lines.push(
    "## Cómo reproducir",
    "",
    "```bash",
    "npm run build",
    "npm run preview -- --port 4173 --strictPort",
    "npm run a11y",
    "```",
    "",
    "El informe se regenera en `docs/audits/A11Y_AUDIT.md`. Un resultado distinto de cero",
    "hace fallar el comando. La auditoría automatizada no sustituye una prueba manual con",
    "teclado, zoom al 200% ni lector de pantalla.",
    "",
    "## Límites",
    "",
    "- axe-core detecta reglas automatizables; no evalúa toda la semántica ni la experiencia real.",
    "- No se ejecutó un lector de pantalla (NVDA/VoiceOver) en este entorno.",
    "- El contraste se evalúa sobre el tema oscuro por defecto.",
    ""
);

fs.mkdirSync(path.dirname(REPORT), { recursive: true });
fs.writeFileSync(REPORT, lines.join("\n"), "utf8");

console.log(`A11y: ${allViolations.length} violaciones (${totalNodes} nodos) en ${results.length} vistas.`);
console.log(`Manual: ${manual.filter(check => check.ok).length}/${manual.length} comprobaciones OK.`);
if (consoleErrors.length) {
    console.log(`Consola: ${consoleErrors.length} error(es).`);
    console.log(consoleErrors.slice(0, 5).join("\n"));
}
console.log(`Informe: ${REPORT}`);

if (failed) process.exit(1);
