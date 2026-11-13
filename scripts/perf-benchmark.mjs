/*
 * Falcon performance gate.
 *
 * Measures the real production build in Chrome and a deterministic 1,000
 * document assistant corpus in Node. Budgets live in config/perf-budgets.json.
 * Run with: npm run perf
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { chromium } from "playwright-core";
import initSqlJs from "sql.js";
import { buildDocuments, retrieve } from "../framework/modules/assistant/assistant.js";
import { startPreview } from "./lib/preview.mjs";

const ROOT = process.cwd();
const BUDGETS = JSON.parse(fs.readFileSync(path.join(ROOT, "config/perf-budgets.json"), "utf8")).budgets;
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const OUT_JSON = path.join(ROOT, "docs/audits/perf-report.json");
const OUT_MD = path.join(ROOT, "docs/audits/PERF_REPORT.md");
const URL = process.env.FALCON_URL || "";
const CHROME = process.env.CHROME_PATH || [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    chromium.executablePath()
].find(candidate => candidate && fs.existsSync(candidate));

const QUERIES = [
    "verificar fecha de un video",
    "geolocalizar una foto sin metadatos",
    "enumerar subdominios de un dominio",
    "buscar servicios expuestos",
    "analizar una empresa",
    "detectar un perfil falso",
    "correo filtrado",
    "imagen generada por IA",
    "sanciones y registros públicos",
    "metadata de un documento",
    "cuenta de Instagram",
    "verificar una afirmación viral",
    "mapa de relaciones",
    "playbook de dominio",
    "OSINT de personas",
    "análisis de infraestructura",
    "evidencia archivada",
    "línea de tiempo",
    "riesgo de suplantación",
    "fuente primaria"
];

function round(value, digits = 2) {
    return value == null ? null : Math.round(value * 10 ** digits) / 10 ** digits;
}

function percentile(values, p) {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
    return sorted[index];
}

function walk(directory, base = directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const full = path.join(directory, entry.name);
        if (entry.isDirectory()) return walk(full, base);
        return [path.relative(base, full).split(path.sep).join("/")];
    });
}

function gzipKb(file) {
    return zlib.gzipSync(fs.readFileSync(file)).length / 1024;
}

function readSizes() {
    const dist = path.join(ROOT, "dist");
    if (!fs.existsSync(path.join(dist, "index.html"))) {
        throw new Error("dist/index.html no existe. Ejecutá npm run build antes de perf.");
    }
    const files = walk(dist);
    const js = files.filter(file => file.startsWith("assets/") && file.endsWith(".js"));
    const css = files.filter(file => file.startsWith("assets/") && file.endsWith(".css"));
    const totalBytes = files.reduce((sum, file) => sum + fs.statSync(path.join(dist, file)).size, 0);
    return {
        jsGzipKb: round(js.reduce((sum, file) => sum + gzipKb(path.join(dist, file)), 0)),
        cssGzipKb: round(css.reduce((sum, file) => sum + gzipKb(path.join(dist, file)), 0)),
        totalDistKb: round(totalBytes / 1024),
        jsFiles: js.length,
        cssFiles: css.length,
        databaseKb: round(fs.statSync(path.join(dist, "database/falcon.db")).size / 1024)
    };
}

async function loadCatalogTools() {
    const SQL = await initSqlJs({
        locateFile: file => path.join(ROOT, "node_modules/sql.js/dist", file)
    });
    const db = new SQL.Database(fs.readFileSync(path.join(ROOT, "database/falcon.db")));
    const statement = db.prepare(`
        SELECT name, category, subcategory, description, website
        FROM tools
        ORDER BY quality_score DESC
    `);
    const tools = [];
    while (statement.step()) tools.push(statement.getAsObject());
    statement.free();
    db.close();
    return tools;
}

function measureRetrieval(documents) {
    for (const query of QUERIES) retrieve(documents, query);
    const timings = [];
    for (let roundIndex = 0; roundIndex < 25; roundIndex++) {
        for (const query of QUERIES) {
            const start = performance.now();
            retrieve(documents, query);
            timings.push(performance.now() - start);
        }
    }
    return {
        samples: timings.length,
        p50Ms: round(percentile(timings, 50), 3),
        p95Ms: round(percentile(timings, 95), 3),
        maxMs: round(Math.max(...timings), 3)
    };
}

function measureMemory(fn) {
    if (typeof global.gc === "function") global.gc();
    const before = process.memoryUsage().heapUsed;
    const value = fn();
    if (typeof global.gc === "function") global.gc();
    return {
        value,
        deltaMb: round((process.memoryUsage().heapUsed - before) / (1024 * 1024))
    };
}

async function measureBrowser(url) {
    if (!CHROME) throw new Error("No se encontró Chrome/Chromium para el benchmark.");
    const browser = await chromium.launch({
        executablePath: CHROME,
        headless: true,
        args: ["--enable-precise-memory-info"]
    });
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => {
        if (message.type() === "error" && /Content Security Policy|Refused to/i.test(message.text())) {
            errors.push(message.text());
        }
    });
    try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
        await page.waitForSelector(".tool-card", { timeout: 60000 });
        await page.waitForFunction(
            () => performance.getEntriesByName("falcon:catalog-painted").length > 0,
            null,
            { timeout: 15000 }
        ).catch(() => {});
        const metrics = await page.evaluate(() => {
            const duration = name => {
                const entry = performance.getEntriesByName(name).at(-1);
                return entry ? Math.round(entry.duration * 100) / 100 : null;
            };
            const paint = performance.getEntriesByType("paint").find(entry => entry.name === "first-contentful-paint");
            const navigation = performance.getEntriesByType("navigation")[0];
            return {
                cards: document.querySelectorAll(".tool-card").length,
                dbOpenMs: duration("falcon:db-open"),
                toolsQueryMs: duration("falcon:tools-query"),
                catalogRenderMs: duration("falcon:catalog-render"),
                catalogReadyMs: duration("falcon:catalog-ready"),
                fcpMs: paint ? Math.round(paint.startTime * 100) / 100 : null,
                domContentLoadedMs: navigation ? Math.round(navigation.domContentLoadedEventEnd * 100) / 100 : null,
                heapBytes: performance.memory?.usedJSHeapSize ?? null,
                cspErrors: 0
            };
        });
        metrics.cspErrors = errors.length;
        return metrics;
    } finally {
        await browser.close();
    }
}

function evaluate(metrics) {
    const checks = [
        { id: "catalogReadyMs", label: "Primer render del catálogo", measured: metrics.browser.catalogReadyMs, budget: BUDGETS.catalogReadyMs, unit: "ms", rule: "max" },
        { id: "dbOpenMs", label: "Apertura de SQLite", measured: metrics.browser.dbOpenMs, budget: BUDGETS.dbOpenMs, unit: "ms", rule: "max" },
        { id: "retrievalP95Ms", label: "Retrieval p95 (1.000 docs)", measured: metrics.retrieval.p95Ms, budget: BUDGETS.retrievalP95Ms, unit: "ms", rule: "max" },
        { id: "jsGzipKb", label: "JavaScript gzip", measured: metrics.sizes.jsGzipKb, budget: BUDGETS.jsGzipKb, unit: "KB", rule: "max" },
        { id: "cssGzipKb", label: "CSS gzip", measured: metrics.sizes.cssGzipKb, budget: BUDGETS.cssGzipKb, unit: "KB", rule: "max" },
        { id: "totalDistKb", label: "Artefacto dist completo", measured: metrics.sizes.totalDistKb, budget: BUDGETS.totalDistKb, unit: "KB", rule: "max" },
        { id: "heap165Mb", label: "Heap con 165 herramientas", measured: metrics.browser.heapBytes == null ? null : round(metrics.browser.heapBytes / (1024 * 1024)), budget: BUDGETS.heap165Mb, unit: "MB", rule: "max" },
        { id: "heap1000DocsMb", label: "Heap corpus de 1.000 documentos", measured: metrics.retrieval1000.deltaMb, budget: BUDGETS.heap1000DocsMb, unit: "MB", rule: "max" }
    ];
    for (const check of checks) {
        check.status = check.measured == null ? "SKIP" : check.measured <= check.budget ? "PASS" : "FAIL";
    }
    return checks;
}

function writeReport(metrics, checks) {
    const generatedAt = new Date().toISOString();
    const failed = checks.filter(check => check.status === "FAIL");
    const skipped = checks.filter(check => check.status === "SKIP");
    const report = {
        version: PKG.version,
        generated_at: generatedAt,
        environment: {
            platform: `${os.platform()} ${os.release()}`,
            cpu: os.cpus()[0]?.model || "unknown",
            cores: os.cpus().length,
            memory_gb: round(os.totalmem() / 1024 ** 3, 1),
            browser: CHROME,
            url: metrics.url
        },
        budgets: BUDGETS,
        metrics,
        checks,
        status: failed.length ? "FAIL" : skipped.length ? "PASS_WITH_SKIPS" : "PASS"
    };
    fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
    fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);

    const rows = checks.map(check => {
        const measured = check.measured == null ? "no disponible" : `${check.measured} ${check.unit}`;
        return `| ${check.label} | ${measured} | ${check.budget} ${check.unit} | ${check.status} |`;
    }).join("\n");

    const markdown = `# Performance report

- Fecha: ${generatedAt}
- Versión: ${PKG.version}
- Entorno: ${report.environment.cpu}, ${report.environment.cores} cores, ${report.environment.memory_gb} GB RAM, ${report.environment.platform}
- Navegador: Chrome headless
- URL: ${metrics.url}
- Estado: **${report.status}**

Este informe mide una máquina de desarrollo, no un portátil normalizado. Los
números son reproducibles con \`npm run perf\`, pero no deben compararse entre
hardware distinto como si fueran una garantía absoluta.

## Presupuestos

| Métrica | Medido | Presupuesto | Estado |
| --- | ---: | ---: | --- |
${rows}

## Detalle

- Catálogo: ${metrics.browser.cards} tarjetas.
- SQLite: ${metrics.sizes.databaseKb} KB; apertura ${metrics.browser.dbOpenMs ?? "n/d"} ms.
- Consulta de herramientas: ${metrics.browser.toolsQueryMs ?? "n/d"} ms.
- Primer contenido: ${metrics.browser.fcpMs ?? "n/d"} ms; DOMContentLoaded: ${metrics.browser.domContentLoadedMs ?? "n/d"} ms.
- Retrieval de 1.000 documentos: p50 ${metrics.retrieval.p50Ms} ms, p95 ${metrics.retrieval.p95Ms} ms, máximo ${metrics.retrieval.maxMs} ms (${metrics.retrieval.samples} muestras).
- Memoria del corpus de 1.000 documentos: +${metrics.retrieval1000.deltaMb} MB.
- JS gzip: ${metrics.sizes.jsGzipKb} KB; CSS gzip: ${metrics.sizes.cssGzipKb} KB; dist: ${metrics.sizes.totalDistKb} KB.

## Reproducción

\`\`\`bash
npm run build
npm run perf
\`\`\`

El comando abre un preview local, mide con Chrome y devuelve código de salida
distinto de cero si un presupuesto falla. La evidencia JSON está en
\`docs/audits/perf-report.json\`.
`;

    fs.writeFileSync(OUT_MD, markdown);
    console.log(`Perf: ${report.status} — ${failed.length} fallos, ${skipped.length} métricas no disponibles.`);
    console.log(`Informe: ${OUT_MD}`);
    return report;
}

async function main() {
    let server;
    try {
        const url = URL || (server = await startPreview({ port: Number(process.env.PERF_PORT || 4173) })).url;
        const tools = await loadCatalogTools();
        const documents = buildDocuments({ tools });
        const retrieval = measureRetrieval(documents);

        const syntheticTools = Array.from({ length: 1000 }, (_, index) => ({
            name: `Synthetic tool ${index}`,
            category: index % 2 ? "Verification" : "Infrastructure",
            subcategory: index % 3 ? "Analysis" : "Discovery",
            description: `Synthetic record ${index} for deterministic retrieval and memory budgets.`,
            website: ""
        }));
        const memory1000 = measureMemory(() => buildDocuments({ tools: syntheticTools }));
        const retrieval1000 = measureRetrieval(memory1000.value);

        const browser = await measureBrowser(url);
        const sizes = readSizes();
        const metrics = {
            url,
            browser,
            sizes,
            retrieval,
            retrieval1000: {
                documents: memory1000.value.length,
                deltaMb: memory1000.deltaMb,
                p50Ms: retrieval1000.p50Ms,
                p95Ms: retrieval1000.p95Ms,
                maxMs: retrieval1000.maxMs,
                samples: retrieval1000.samples
            }
        };
        const checks = evaluate(metrics);
        const report = writeReport(metrics, checks);
        if (report.status === "FAIL") process.exitCode = 1;
    } finally {
        server?.stop();
    }
}

main().catch(error => {
    console.error(`Perf falló: ${error.message}`);
    process.exitCode = 1;
});
