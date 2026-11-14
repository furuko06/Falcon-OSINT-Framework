/*
 * Renders the source-health report as a GitHub Actions job summary.
 *
 * The scheduled workflow runs the check and then calls this script, so the
 * result is readable in the Actions run without committing generated reports or
 * adding an upload action. Missing report is reported, not treated as success.
 */
import fs from "node:fs";
import path from "node:path";

const REPORT = path.resolve("docs/audits/source-health.json");

function cell(value) {
    return String(value ?? "—").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function readReport() {
    try {
        return JSON.parse(fs.readFileSync(REPORT, "utf8"));
    } catch {
        return null;
    }
}

const report = readReport();
const lines = ["## Salud de fuentes", ""];

if (!report) {
    lines.push("No se generó `docs/audits/source-health.json` en esta corrida.");
} else {
    const totals = report.totals || {};
    lines.push(`- Fecha del chequeo: ${report.date}`);
    lines.push(`- Modo: ${report.mode}`);
    lines.push(`- Verificadas: ${totals.verified || 0}`);
    lines.push(`- Restringidas para clientes automáticos: ${totals.restricted || 0}`);
    lines.push(`- Rotas: ${totals.broken || 0}`);
    lines.push(`- Sin URL pública: ${totals.unchecked || 0}`);
    lines.push("");

    const broken = (report.entries || []).filter(entry => entry.status === "broken");
    if (broken.length) {
        lines.push("### Entradas rotas", "", "| Entrada | URL | Detalle |", "| --- | --- | --- |");
        for (const entry of broken) {
            lines.push(`| ${cell(entry.name)} | ${cell(entry.url)} | ${cell(entry.error || entry.http)} |`);
        }
    } else {
        lines.push("Sin entradas rotas.");
    }
    lines.push("");
}

lines.push(
    "Este chequeo corre en un workflow programado y sólo publica este informe:",
    "no bloquea el build, el despliegue ni el uso offline de Falcon."
);

console.log(lines.join("\n"));
