#!/usr/bin/env node
// Validates the frozen 1.0 contracts (G6) against the shipped data.
// No external schema library: only the keywords used by contracts/*.json.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTRACTS = path.join(ROOT, "contracts");
const LOCK = path.join(CONTRACTS, "contract-lock.json");

export function loadJson(file) {
    return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

export function schemaFiles() {
    return fs.readdirSync(CONTRACTS).filter(name => name.endsWith(".schema.json")).sort();
}

export function schemaHash(file) {
    return createHash("sha256").update(fs.readFileSync(path.join(CONTRACTS, file))).digest("hex");
}

function matchesType(value, type) {
    if (type === "null") return value === null;
    if (type === "array") return Array.isArray(value);
    if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
    if (type === "integer") return Number.isInteger(value);
    if (type === "number") return typeof value === "number" && Number.isFinite(value);
    return typeof value === type;
}

export function validate(value, schema, where = "$") {
    const errors = [];
    const check = (node, rule, at) => {
        if (!rule || typeof rule !== "object") return;
        if (rule.type) {
            const types = Array.isArray(rule.type) ? rule.type : [rule.type];
            if (!types.some(type => matchesType(node, type))) {
                errors.push(`${at}: se esperaba ${types.join("|")}, llegó ${Array.isArray(node) ? "array" : node === null ? "null" : typeof node}`);
                return;
            }
        }
        if (rule.const !== undefined && node !== rule.const) errors.push(`${at}: se esperaba ${JSON.stringify(rule.const)}`);
        if (rule.enum && !rule.enum.some(item => item === node)) {
            errors.push(`${at}: valor ${JSON.stringify(node)} fuera del enum`);
        }
        if (typeof node === "string") {
            if (rule.minLength !== undefined && node.length < rule.minLength) errors.push(`${at}: menos de ${rule.minLength} caracteres`);
            if (rule.maxLength !== undefined && node.length > rule.maxLength) errors.push(`${at}: más de ${rule.maxLength} caracteres`);
            if (rule.pattern && !new RegExp(rule.pattern).test(node)) errors.push(`${at}: no cumple ${rule.pattern}`);
        }
        if (typeof node === "number") {
            if (rule.minimum !== undefined && node < rule.minimum) errors.push(`${at}: menor que ${rule.minimum}`);
            if (rule.maximum !== undefined && node > rule.maximum) errors.push(`${at}: mayor que ${rule.maximum}`);
        }
        if (Array.isArray(node)) {
            if (rule.minItems !== undefined && node.length < rule.minItems) errors.push(`${at}: menos de ${rule.minItems} elementos`);
            if (rule.uniqueItems) {
                const seen = new Set(node.map(item => JSON.stringify(item)));
                if (seen.size !== node.length) errors.push(`${at}: elementos duplicados`);
            }
            if (rule.items) node.forEach((item, index) => check(item, rule.items, `${at}[${index}]`));
        }
        if (node !== null && typeof node === "object" && !Array.isArray(node)) {
            for (const key of rule.required || []) {
                if (!(key in node)) errors.push(`${at}: falta "${key}"`);
            }
            const properties = rule.properties || {};
            for (const [key, child] of Object.entries(node)) {
                if (properties[key]) {
                    check(child, properties[key], `${at}.${key}`);
                    continue;
                }
                const patternKey = Object.keys(rule.patternProperties || {}).find(pattern => new RegExp(pattern).test(key));
                if (patternKey) {
                    check(child, rule.patternProperties[patternKey], `${at}.${key}`);
                    continue;
                }
                if (rule.additionalProperties === false) errors.push(`${at}: propiedad no declarada "${key}"`);
                else if (rule.additionalProperties && typeof rule.additionalProperties === "object") {
                    check(child, rule.additionalProperties, `${at}.${key}`);
                }
            }
        }
    };
    check(value, schema, where);
    return errors;
}

function readCatalog() {
    const tools = [];
    const walk = directory => {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            const full = path.join(directory, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (entry.name.endsWith(".json")) tools.push(...loadJson(full));
        }
    };
    walk(path.join(ROOT, "intelligence/tools"));
    walk(path.join(ROOT, "intelligence/countries"));
    return tools;
}

export async function runChecks() {
    const problems = [];
    const version = loadJson(path.join(CONTRACTS, "contract-version.json"));

    if (!version.frozen) problems.push("contract-version.json no está marcado como frozen");
    if (!fs.existsSync(LOCK)) {
        problems.push("falta contracts/contract-lock.json: corré npm run contracts:freeze");
    } else {
        const lock = loadJson(LOCK);
        for (const file of schemaFiles()) {
            if (!lock.schemas?.[file]) problems.push(`contract-lock.json no cubre ${file}`);
            else if (lock.schemas[file] !== schemaHash(file)) {
                problems.push(`${file} cambió sin regenerar el lock: subí contract-version.json y corré npm run contracts:freeze`);
            }
        }
        for (const file of Object.keys(lock.schemas || {})) {
            if (!schemaFiles().includes(file)) problems.push(`contract-lock.json referencia un esquema ausente: ${file}`);
        }
    }

    const schemas = {};
    for (const file of schemaFiles()) {
        const schema = loadJson(path.join(CONTRACTS, file));
        schemas[file] = schema;
        if (!schema.$id) problems.push(`${file} no declara $id`);
        if (schema.contractVersion !== version.version) {
            problems.push(`${file} declara contrato ${schema.contractVersion} y contract-version.json dice ${version.version}`);
        }
        if (schema.required?.length && validate({}, schema).length === 0) {
            problems.push(`${file} acepta un objeto vacío: revisá required`);
        }
    }

    const tools = readCatalog();
    const toolErrors = [];
    for (const tool of tools) toolErrors.push(...validate(tool, schemas["tool.schema.json"], tool.name || "tool"));
    problems.push(...toolErrors);

    const moduleUrl = relative => pathToFileURL(path.join(ROOT, relative)).href;
    const { PLAYBOOKS } = await import(moduleUrl("framework/modules/playbooks/playbooks.js"));
    const playbookErrors = [];
    for (const playbook of PLAYBOOKS) playbookErrors.push(...validate(playbook, schemas["playbook.schema.json"], playbook.id || "playbook"));
    problems.push(...playbookErrors);
    problems.push(...validate(
        { "search-operators": { state: null, favorite: false, checked: [] } },
        schemas["playbook-state.schema.json"],
        "playbook-state"
    ));

    const { PLUGIN_CATALOG } = await import(moduleUrl("framework/modules/plugins/catalog.js"));
    for (const manifest of PLUGIN_CATALOG) {
        problems.push(...validate(manifest, schemas["plugin-manifest.schema.json"], `plugin ${manifest.id}`));
    }

    const { createCollection } = await import(moduleUrl("framework/modules/collections/collections.js"));
    problems.push(...validate(createCollection({ name: "Caso de contrato", tags: "dominio, email" }), schemas["case.schema.json"], "case"));

    const { addIndicator } = await import(moduleUrl("framework/modules/ioc/ioc.js"));
    problems.push(...validate(
        addIndicator({ type: "Dominio", value: "example.com", source: "test", confidence: "media", severity: "media" }),
        schemas["ioc.schema.json"],
        "ioc"
    ));

    return { problems, counts: { tools: tools.length, playbooks: PLAYBOOKS.length, plugins: PLUGIN_CATALOG.length } };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    const { problems, counts } = await runChecks();
    if (problems.length) {
        console.error(`Contratos: ${problems.length} problema(s).`);
        for (const problem of problems.slice(0, 40)) console.error(` - ${problem}`);
        process.exit(1);
    }
    console.log(`Contratos 1.0 congelados: ${counts.tools} tools, ${counts.playbooks} playbooks, ${counts.plugins} plugins.`);
}
