import { execFileSync } from "node:child_process";
import fs from "node:fs";

const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
    .split("\0")
    .filter(Boolean);

const patterns = [
    { id: "private-key", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
    { id: "aws-access-key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
    { id: "github-token", regex: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
    { id: "openrouter-key", regex: /\bsk-or-v1-[A-Za-z0-9]{32,}\b/ },
    { id: "openai-key", regex: /\bsk-[A-Za-z0-9]{32,}\b/ },
    { id: "google-api-key", regex: /\bAIza[0-9A-Za-z_-]{30,}\b/ },
    { id: "slack-token", regex: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/ },
    { id: "generic-secret", regex: /\b(?:api[_-]?key|secret[_-]?key|access[_-]?token)\b\s*[:=]\s*["'][A-Za-z0-9_./+=-]{20,}["']/i }
];

const findings = [];
for (const file of files) {
    if (file.startsWith(".git/") || file.endsWith(".db") || file.endsWith(".wasm")) continue;
    let content;
    try {
        content = fs.readFileSync(file, "utf8");
    } catch {
        continue;
    }
    if (content.includes("\0")) continue;
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
        for (const pattern of patterns) {
            if (pattern.regex.test(line)) {
                findings.push({ file, line: index + 1, type: pattern.id });
            }
        }
    });
}

const trackedEnv = files.filter(file => /(^|\/)\.env(?:$|\.)/.test(file));
const workflowFindings = [];
const workflowFiles = files.filter(file => file.startsWith(".github/workflows/") && /\.ya?ml$/.test(file));
for (const file of workflowFiles) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
        const match = line.match(/^\s*uses:\s*([^\s#]+)/);
        if (!match) return;
        const action = match[1];
        if (action.startsWith("./")) return;
        if (!/@[0-9a-f]{40}$/i.test(action)) {
            workflowFindings.push({ file, line: index + 1, action });
        }
    });
    if (!/^permissions:/m.test(content)) {
        workflowFindings.push({ file, line: 0, action: "missing top-level permissions" });
    }
}

const errors = [];
if (trackedEnv.length) errors.push(`Archivos .env versionados: ${trackedEnv.join(", ")}`);
for (const finding of findings) errors.push(`Posible secreto ${finding.type}: ${finding.file}:${finding.line}`);
for (const finding of workflowFindings) {
    errors.push(`Workflow sin acción fijada/permissions: ${finding.file}:${finding.line || "?"} (${finding.action})`);
}

console.log(`Security scan: ${files.length} archivos versionados, ${workflowFiles.length} workflows.`);
console.log(`Secretos potenciales: ${findings.length}. Workflows con hallazgos: ${workflowFindings.length}.`);

if (errors.length) {
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
}

console.log("OK: sin secretos de alta confianza, .env versionados ni actions sin SHA.");
