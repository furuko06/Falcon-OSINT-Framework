/*
 * Aggregates the repeatable release gates into one command.
 * Browser gates start a local preview and use the real production build.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { startPreview } from "./lib/preview.mjs";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const SKIP_BROWSER = args.includes("--skip-browser");
const REQUIRE_REAL = args.includes("--require-real");
const REPORT = path.join(ROOT, "docs/audits/GATES_REPORT.md");

function run(command, commandArgs = [], env = {}) {
    console.log(`\n$ ${command} ${commandArgs.join(" ")}`);
    const result = spawnSync(command, commandArgs, {
        cwd: ROOT,
        stdio: "inherit",
        env: { ...process.env, ...env },
        shell: process.platform === "win32"
    });
    return result.status === 0;
}

function readJson(file) {
    try {
        return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
    } catch {
        return null;
    }
}

function statusLine(label, status, detail = "") {
    const state = typeof status === "string" ? status : status ? "PASS" : "FAIL";
    return `| ${label} | ${state} | ${detail} |`;
}

async function main() {
    const results = [];
    let server = null;
    let buildOk = false;
    let perf = null;
    let a11yOk = false;
    let evalReport = null;

    try {
        results.push(["Tests unitarios e integración", run("npx", ["vitest", "run"])]);
        results.push(["Escaneo de secretos y workflows", run("npm", ["run", "security:scan"])]);
        results.push(["Auditoría de dependencias", run("npm", ["audit", "--audit-level=high"])]);
        results.push(["Validación de datos", run("npm", ["run", "db:validate"])]);

        buildOk = run("npm", ["run", "build"]);
        results.push(["Build de producción", buildOk]);

        if (buildOk && !SKIP_BROWSER) {
            server = await startPreview({ port: Number(process.env.GATES_PORT || 4173) });
            const env = { FALCON_URL: server.url, A11Y_URL: server.url };
            const perfOk = run("npm", ["run", "perf"], env);
            perf = readJson("docs/audits/perf-report.json");
            results.push(["Presupuestos de rendimiento", perfOk, perf ? `${perf.status}` : "sin informe"]);

            a11yOk = run("npm", ["run", "a11y"], env);
            results.push(["Auditoría de accesibilidad", a11yOk]);
        } else if (SKIP_BROWSER) {
            results.push(["Presupuestos de rendimiento", false, "omitido con --skip-browser"]);
            results.push(["Auditoría de accesibilidad", false, "omitido con --skip-browser"]);
        }

        const evalFlags = ["--max-real-ms", String(process.env.GATES_EVAL_MAX_MS || 240000)];
        if (REQUIRE_REAL) evalFlags.push("--require-real");
        const evalArgs = ["run", "eval:model", "--", ...evalFlags];
        const evalOk = run("npm", evalArgs);
        evalReport = readJson("docs/audits/model-eval-report.json");
        results.push([
            "Evaluación offline del asistente",
            evalOk && evalReport?.offline?.status === "PASS",
            evalReport?.offline?.status || "sin informe"
        ]);
        const realStatus = evalReport?.real?.status || "sin informe";
        const realOk = realStatus === "PASS" || (!REQUIRE_REAL && realStatus === "BLOCKED");
        results.push([
            "Evaluación de modelo real",
            realOk,
            realStatus === "BLOCKED" ? `BLOCKED: ${evalReport.real.reason}` : realStatus
        ]);
    } finally {
        server?.stop();
    }

    const failed = results.filter(([, ok]) => !ok);
    const blockedReal = evalReport?.real?.status === "BLOCKED";
    const overall = failed.length ? "FAIL" : blockedReal ? "PASS_WITH_BLOCKED" : "PASS";
    const rows = results.map(([label, ok, detail]) => {
        const blocked = ok && String(detail || "").startsWith("BLOCKED");
        return statusLine(label, blocked ? "BLOCKED" : ok, detail || "");
    }).join("\n");
    const markdown = `# Release gates

- Fecha: ${new Date().toISOString()}
- Versión: ${readJson("package.json")?.version || "desconocida"}
- Estado global: **${overall}**
- Gate real: ${REQUIRE_REAL ? "obligatorio" : "informativo (BLOCKED no bloquea el build)"}

| Gate | Estado | Evidencia |
| --- | --- | --- |
${rows}

## Artefactos

- Rendimiento: \`docs/audits/PERF_REPORT.md\` y \`docs/audits/perf-report.json\`
- Accesibilidad: \`docs/audits/A11Y_AUDIT.md\`
- Modelo: \`docs/audits/MODEL_EVAL.md\` y \`docs/audits/model-eval-report.json\`
- Seguridad: \`docs/security/CIS_CONTROLS.md\`

## Reproducción

\`\`\`bash
npm run gates
npm run gates -- --require-real
\`\`\`

Un gate real bloqueado se muestra como BLOCKED y no se presenta como aprobado.
Para exigirlo en una release, usar \`--require-real\` con Ollama o
\`OPENROUTER_API_KEY\` configurados.
`;
    fs.mkdirSync(path.dirname(REPORT), { recursive: true });
    fs.writeFileSync(REPORT, markdown);
    console.log(`\nGates: ${overall}. Informe: ${REPORT}`);
    if (failed.length) process.exitCode = 1;
}

main().catch(error => {
    console.error(`Gates fallaron: ${error.message}`);
    process.exitCode = 1;
});
