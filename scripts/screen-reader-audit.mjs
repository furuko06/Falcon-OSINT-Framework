#!/usr/bin/env node
// G4 screen-reader pass, automated part: reads the same accessibility tree a
// screen reader consumes (Chrome DevTools Protocol) and checks names, roles,
// headings, landmarks, dialogs and live regions on every view.
// It does not replace an NVDA/VoiceOver session; see docs/audits/SCREEN_READER_AUDIT.md.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const BASE = process.env.A11Y_URL || "http://localhost:4173/";
const REPORT = path.resolve("docs/audits/SCREEN_READER_AUDIT.md");

const INTERACTIVE = new Set([
    "button", "link", "textbox", "searchbox", "combobox", "checkbox", "radio",
    "switch", "tab", "menuitem", "menuitemcheckbox", "menuitemradio", "slider",
    "spinbutton", "listbox", "option", "treeitem"
]);

const SCENARIOS = [
    { id: "home", label: "Catálogo", action: null },
    { id: "assistant", label: "Asistente IA", action: '[data-action="assistant"]', wait: ".assistant-panel" },
    { id: "settings", label: "Ajustes y backup", action: '[data-action="settings"]', wait: ".settings-panel" },
    { id: "privacy", label: "Políticas y privacidad", action: '[data-action="privacy"]', wait: ".policy-panel" },
    { id: "academy", label: "Academy", action: '[data-action="academy"]', wait: ".academy-panel" },
    { id: "playbooks", label: "Playbooks", action: '[data-action="playbooks"]', wait: ".playbooks-panel" },
    { id: "graph", label: "Knowledge Graph", action: '[data-action="graph"]', wait: ".graph-panel" },
    { id: "ioc", label: "IOC Workspace", action: '[data-action="ioc"]', wait: ".ioc-panel" }
];

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

function analyze(nodes) {
    const live = nodes.filter(node => !node.ignored);
    const interactive = live.filter(node => INTERACTIVE.has(node.role?.value));
    const unnamed = interactive.filter(node => !String(node.name?.value || "").trim());
    const headings = live.filter(node => node.role?.value === "heading");
    const h1 = headings.filter(node => node.properties?.find(p => p.name === "level")?.value?.value === 1);
    const landmarks = {
        main: live.filter(node => node.role?.value === "main").length,
        navigation: live.filter(node => node.role?.value === "navigation").length,
        banner: live.filter(node => node.role?.value === "banner").length,
        contentinfo: live.filter(node => node.role?.value === "contentinfo").length
    };
    const dialogs = live.filter(node => ["dialog", "alertdialog"].includes(node.role?.value));
    const unnamedDialogs = dialogs.filter(node => !String(node.name?.value || "").trim());
    const liveRegions = live.filter(node => ["status", "alert", "log"].includes(node.role?.value));

    const spoken = live
        .filter(node => ["heading", "link", "button", "textbox", "searchbox", "combobox", "tab", "status"].includes(node.role?.value))
        .slice(0, 14)
        .map(node => {
            const level = node.properties?.find(p => p.name === "level")?.value?.value;
            const name = String(node.name?.value || "").trim();
            return `${node.role?.value}${level ? ` ${level}` : ""}: ${name || "(sin nombre)"}`;
        });

    const problems = [];
    for (const node of unnamed) {
        problems.push(`elemento ${node.role?.value} sin nombre accesible`);
    }
    if (h1.length !== 1) problems.push(`encabezado de nivel 1: ${h1.length} (se espera 1)`);
    if (landmarks.main !== 1) problems.push(`landmark main: ${landmarks.main} (se espera 1)`);
    if (landmarks.navigation < 1) problems.push("sin landmark navigation");
    for (const node of unnamedDialogs) problems.push("diálogo sin nombre accesible");

    return {
        interactive: interactive.length,
        unnamed: unnamed.length,
        headings: headings.map(node => ({
            level: node.properties?.find(p => p.name === "level")?.value?.value || "?",
            name: String(node.name?.value || "").trim()
        })),
        landmarks,
        dialogs: dialogs.length,
        liveRegions: liveRegions.length,
        spoken,
        problems
    };
}

const executablePath = chromePath();
if (!executablePath) {
    console.error("No se encontró Chrome/Chromium. Definí CHROME_PATH.");
    process.exit(2);
}

const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pageErrors = [];
page.on("pageerror", error => pageErrors.push(error.message));
const session = await page.context().newCDPSession(page);

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForSelector(".tool-card", { timeout: 60000 });
await page.waitForTimeout(1200);
await session.send("Accessibility.enable");

const results = [];
for (const scenario of SCENARIOS) {
    if (scenario.action) {
        await page.locator(scenario.action).click();
        if (scenario.wait) await page.waitForSelector(scenario.wait);
        await page.waitForTimeout(400);
    }
    const { nodes } = await session.send("Accessibility.getFullAXTree");
    results.push({ ...scenario, ...analyze(nodes) });
}

await browser.close();

const failing = results.filter(result => result.problems.length);
const totalInteractive = results.reduce((sum, result) => sum + result.interactive, 0);
const totalUnnamed = results.reduce((sum, result) => sum + result.unnamed, 0);
const lines = [
    "# Screen-reader audit",
    "",
    `- Fecha: ${new Date().toISOString()}`,
    `- Árbol de accesibilidad: Chrome DevTools Protocol (\`Accessibility.getFullAXTree\`)`,
    `- Vistas: ${results.length}`,
    `- Elementos interactivos inspeccionados: ${totalInteractive}`,
    `- Sin nombre accesible: ${totalUnnamed}`,
    `- Resultado: ${failing.length ? `**${failing.length} vista(s) con problemas**` : "**0 problemas en las 8 vistas**"}`,
    ""
];

for (const result of results) {
    lines.push(`## ${result.label} (\`${result.id}\`)`, "");
    lines.push(`- Interactivos: ${result.interactive} · sin nombre: ${result.unnamed}`);
    lines.push(`- Encabezados: ${result.headings.map(heading => `h${heading.level} ${heading.name}`).join(" · ") || "ninguno"}`);
    lines.push(`- Landmarks: main ${result.landmarks.main} · navigation ${result.landmarks.navigation} · banner ${result.landmarks.banner} · contentinfo ${result.landmarks.contentinfo}`);
    lines.push(`- Diálogos: ${result.dialogs} · regiones vivas: ${result.liveRegions}`);
    lines.push(`- Announcement inicial: ${result.spoken.slice(0, 6).join(" | ") || "vacío"}`);
    lines.push("", result.problems.length ? `Problemas: ${result.problems.join("; ")}` : "Sin problemas.", "");
}

lines.push(
    "## Lo que NO cubre esta auditoría",
    "",
    "El árbol de accesibilidad es la entrada que consume un lector de pantalla, pero esta",
    "auditoría no reemplaza una sesión humana con NVDA o VoiceOver: no verifica la",
    "pronunciación, el orden de foco percibido ni la lectura continua con un lector real.",
    "Pasos para cerrarla: abrir el build de producción con NVDA (Windows) o VoiceOver",
    "(macOS), recorrer Catálogo, Asistente, Ajustes, Políticas, Academy, Playbooks, Grafo",
    "e IOC con Tab y flechas, y anotar cualquier anuncio confuso o elemento inalcanzable.",
    "",
    pageErrors.length ? `Errores de página durante la corrida: ${pageErrors.join(" | ")}` : "Sin errores de página durante la corrida."
);

fs.writeFileSync(REPORT, `${lines.join("\n")}\n`);

for (const result of results) {
    console.log(`${result.problems.length ? "FAIL" : "PASS"} ${result.label}: ${result.interactive} interactivos, ${result.unnamed} sin nombre, h1 ${result.headings.filter(h => String(h.level) === "1").length}`);
    for (const problem of result.problems) console.log(`     ${problem}`);
}
console.log(`\nInforme: ${path.relative(process.cwd(), REPORT)}`);
process.exit(failing.length || pageErrors.length ? 1 : 0);
