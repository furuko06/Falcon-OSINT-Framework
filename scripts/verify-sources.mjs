/*
 * Catalog provenance.
 *
 * Every catalog entry must carry a status and the date it was last checked
 * against its own source. `--write` performs that check over the network and
 * records the result in the JSON packs; `--check` validates the recorded
 * provenance offline so CI fails when an entry loses its date or goes stale.
 *
 * Statuses:
 *   verified   the source answered with 2xx/3xx
 *   restricted the source answered but refused this client (400/401/403/429…)
 *   broken     the source answered 404/410/5xx or did not answer at all
 *   deprecated kept on purpose, never overwritten by a check
 *   beta       kept on purpose as a maturity label, never overwritten
 *   unchecked  the entry has no public URL to check (local tools)
 *
 * A check never invents a date: `last_verified` is the day the request ran.
 * Network trouble downgrades an entry, it does not delete it.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve("intelligence");
const REPORT_MD = path.resolve("docs/audits/SOURCE_HEALTH.md");
const REPORT_JSON = path.resolve("docs/audits/source-health.json");
const TIMEOUT_MS = Number(process.env.FALCON_VERIFY_TIMEOUT_MS || 15000);
const CONCURRENCY = Number(process.env.FALCON_VERIFY_CONCURRENCY || 8);
const MAX_AGE_DAYS = Number(process.env.FALCON_PROVENANCE_MAX_AGE_DAYS || 180);
// Some sources answer 400 to unknown clients, so the check presents itself like
// a normal browser visiting the public page.
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36 FalconProvenance/1.0";
const ALLOWED = new Set(["verified", "restricted", "broken", "deprecated", "beta", "unchecked"]);
const PRESERVED = new Set(["deprecated", "beta"]);

function toolFiles(root = ROOT) {
    const files = [];
    const add = dir => {
        if (!fs.existsSync(dir)) return;
        for (const file of fs.readdirSync(dir).filter(name => name.endsWith(".json"))) {
            files.push(path.join(dir, file));
        }
    };
    add(path.join(root, "tools"));
    const countries = path.join(root, "countries");
    if (fs.existsSync(countries)) {
        for (const country of fs.readdirSync(countries)) add(path.join(countries, country));
    }
    return files;
}

export function readToolFile(file) {
    const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    return JSON.parse(raw);
}

/** Keeps the pack layout stable: pretty packs stay pretty, compact packs stay one entry per line. */
export function writeToolFile(file, tools) {
    const current = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    const pretty = /\n {2}\{\n/.test(current);
    const body = pretty
        ? JSON.stringify(tools, null, 2)
        : `[\n${tools.map(tool => `  ${JSON.stringify(tool)}`).join(",\n")}\n]`;
    fs.writeFileSync(file, `${body}\n`);
}

export function classifyHttpStatus(status) {
    const code = Number(status);
    if (!Number.isFinite(code)) return "broken";
    if (code >= 200 && code < 400) return "verified";
    // 4xx without 404/410 means the host is alive and rejected the request:
    // bot protection, rate limits, a missing header or a login wall. That is
    // not link rot, so it must not be reported as a dead source.
    if (code >= 400 && code < 500 && ![404, 410].includes(code)) return "restricted";
    return "broken";
}

export function classifyError() {
    return "broken";
}

export function sourceUrl(tool) {
    const url = String(tool.website || tool.docs || "").trim();
    if (!url) return "";
    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:" ? url : "";
    } catch {
        return "";
    }
}

/**
 * Records one check on one entry. Intent beats automation: a deprecated or
 * beta entry keeps that label, and an entry with no public URL is explicitly
 * unchecked instead of receiving a date it never earned.
 */
export function applyProvenance(tool, { status, date }) {
    const next = { ...tool };
    if (!sourceUrl(tool)) {
        if (!PRESERVED.has(next.status)) next.status = "unchecked";
        return next;
    }
    next.last_verified = date;
    if (!PRESERVED.has(next.status)) next.status = status;
    return next;
}

export async function checkSource(url, fetchImpl = globalThis.fetch) {
    const target = String(url || "").trim();
    if (!target) return { status: "unchecked", http: null, error: "sin URL pública" };

    const request = async () => {
        const response = await fetchImpl(target, {
            method: "GET",
            redirect: "follow",
            signal: AbortSignal.timeout(TIMEOUT_MS),
            headers: {
                "user-agent": USER_AGENT,
                accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8"
            }
        });
        // The body is not needed; releasing it keeps the socket free.
        await response.body?.cancel?.().catch?.(() => {});
        return response.status;
    };

    let lastError = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const http = await request();
            if (http >= 500 && attempt === 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
            return { status: classifyHttpStatus(http), http, error: null };
        } catch (error) {
            lastError = error;
            if (attempt === 1) await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    return { status: classifyError(lastError), http: null, error: String(lastError?.message || lastError) };
}

async function mapLimit(items, limit, worker) {
    const results = new Array(items.length);
    let cursor = 0;
    const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (cursor < items.length) {
            const index = cursor++;
            results[index] = await worker(items[index], index);
        }
    });
    await Promise.all(runners);
    return results;
}

export function provenanceIssues(tools, { today = new Date(), maxAgeDays = MAX_AGE_DAYS } = {}) {
    const issues = [];
    const todayMs = today.getTime();
    for (const tool of tools) {
        const label = tool.name || "(sin nombre)";
        const status = String(tool.status || "");
        if (!status) {
            issues.push(`${label}: sin status`);
        } else if (!ALLOWED.has(status)) {
            issues.push(`${label}: status desconocido "${status}"`);
        }
        if (!sourceUrl(tool) && status !== "unchecked") {
            issues.push(`${label}: sin URL pública pero status "${status}" (debería ser unchecked)`);
        }
        if (status === "unchecked") continue;
        if (!tool.last_verified) {
            issues.push(`${label}: sin last_verified`);
            continue;
        }
        const time = Date.parse(tool.last_verified);
        if (Number.isNaN(time)) {
            issues.push(`${label}: last_verified inválida "${tool.last_verified}"`);
            continue;
        }
        if (time > todayMs) issues.push(`${label}: last_verified en el futuro`);
        else if (todayMs - time > maxAgeDays * 24 * 60 * 60 * 1000) {
            issues.push(`${label}: last_verified vencida (más de ${maxAgeDays} días)`);
        }
    }
    return issues;
}

function summarize(entries) {
    const counts = {};
    for (const entry of entries) counts[entry.status] = (counts[entry.status] || 0) + 1;
    return counts;
}

function writeReport({ date, entries, tools, mode }) {
    const counts = summarize(entries);
    const problems = entries.filter(entry => !["verified", "beta"].includes(entry.status));
    const rows = problems
        .map(entry => `| ${entry.name} | ${entry.category} | ${entry.url || "—"} | ${entry.status} | ${entry.http ?? "—"} | ${entry.error ? entry.error.slice(0, 120) : "—"} |`)
        .join("\n");
    const markdown = `# Salud de fuentes y provenance

- Fecha del chequeo: ${date}
- Modo: ${mode}
- Entradas: ${tools.length}
- Verificadas: ${counts.verified || 0}
- Restringidas para clientes automáticos: ${counts.restricted || 0}
- Rotas: ${counts.broken || 0}
- Deprecadas: ${counts.deprecated || 0}
- Beta conservadas: ${counts.beta || 0}
- Sin URL pública: ${counts.unchecked || 0}

Método: un GET con user-agent de navegador a la URL de cada entrada, con un
reintento ante 5xx o error de red. 2xx/3xx cuenta como verificada; un 4xx
distinto de 404/410 como restringida (el host responde pero rechaza al cliente:
protección anti-bot, rate limit o login); 404/410, 5xx o un error de red como
rota. Un 403 no distingue bloqueo de contenido real, por eso no se marca rota.
El estado se registra junto con la fecha del chequeo en el pack JSON de origen.

${problems.length
    ? `## Entradas que no respondieron 2xx/3xx\n\n| Herramienta | Categoría | URL | Estado | HTTP | Detalle |\n| --- | --- | --- | --- | --- | --- |\n${rows}`
    : "Todas las entradas con URL respondieron 2xx/3xx."}
`;
    fs.mkdirSync(path.dirname(REPORT_MD), { recursive: true });
    fs.writeFileSync(REPORT_MD, markdown);
    fs.writeFileSync(REPORT_JSON, `${JSON.stringify({ date, mode, totals: counts, entries }, null, 2)}\n`);
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes("--dry-run");
    const date = (args.find(arg => arg.startsWith("--date=")) || "").split("=")[1]
        || new Date().toISOString().slice(0, 10);
    const files = toolFiles();

    if (args.includes("--check")) {
        const issues = provenanceIssues(files.flatMap(file => readToolFile(file)));
        if (issues.length) {
            for (const issue of issues) console.error(`PROVENANCE ${issue}`);
            console.error(`\n${issues.length} entradas sin provenance completa.`);
            process.exit(1);
        }
        console.log("Provenance completa: todas las entradas tienen estado y fecha de verificación vigente.");
        return;
    }

    const entries = [];
    const tools = [];
    for (const file of files) {
        const pack = readToolFile(file);
        const checked = await mapLimit(pack, CONCURRENCY, async tool => {
            const url = sourceUrl(tool);
            const result = url
                ? await checkSource(url)
                : { status: "unchecked", http: null, error: "sin URL pública" };
            const applied = applyProvenance(tool, { status: result.status, date });
            entries.push({
                name: tool.name,
                category: tool.category,
                url,
                status: applied.status,
                http: result.http,
                error: result.error
            });
            return applied;
        });
        tools.push(...checked);
        if (!dryRun) writeToolFile(file, checked);
    }

    writeReport({ date, entries, tools, mode: dryRun ? "dry-run (sin escribir packs)" : "write" });
    const counts = summarize(entries);
    console.log(`Verificadas ${counts.verified || 0}, restringidas ${counts.restricted || 0}, ` +
        `rotas ${counts.broken || 0}, sin URL ${counts.unchecked || 0}, deprecadas ${counts.deprecated || 0}.`);
    console.log(`Informe: ${path.relative(process.cwd(), REPORT_MD)}`);
    if (dryRun) console.log("Dry run: los packs JSON no se modificaron.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    await main();
}
