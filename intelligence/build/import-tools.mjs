import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import initSqlJs from "sql.js";
import { runMigrations } from "../../framework/database/migrations.js";

const ROOT = path.resolve("intelligence");
const DB_PATH = path.resolve("database/falcon.db");

const COLUMNS = [
    "name", "category", "subcategory", "description", "country",
    "website", "github", "license", "status",
    "offline", "api", "docker", "vpn_friendly", "tor_friendly",
    "opsec_score", "quality_score", "last_verified"
];

const INTEGER_COLUMNS = new Set([
    "offline", "api", "docker", "vpn_friendly", "tor_friendly", "opsec_score", "quality_score"
]);

const STATUS_VALUES = new Set(["verified", "beta", "restricted", "broken", "deprecated", "unchecked"]);

function isHttpUrl(value) {
    try {
        const url = new URL(String(value));
        return url.protocol === "https:" || url.protocol === "http:";
    } catch {
        return false;
    }
}

/**
 * Checks the whole batch before anything is written. A catalog entry without a
 * name used to be imported as the literal tool "undefined", a duplicate name was
 * dropped silently and a `javascript:` URL reached the interface, so invalid data
 * is refused here instead of being discovered after the database was rewritten.
 *
 * @returns {string[]} one human-readable problem per invalid entry
 */
export function validateTools(tools) {
    const problems = [];
    const seen = new Map();

    if (!Array.isArray(tools)) return ["el catálogo no es una lista"];

    tools.forEach((tool, index) => {
        const where = `entrada ${index + 1}`;
        if (!tool || typeof tool !== "object" || Array.isArray(tool)) {
            problems.push(`${where}: no es un objeto`);
            return;
        }

        const name = typeof tool.name === "string" ? tool.name.trim() : "";
        if (!name) {
            problems.push(`${where}: falta "name"`);
        } else {
            const key = name.toLowerCase();
            if (seen.has(key)) problems.push(`${where}: "${name}" repite la entrada ${seen.get(key)}`);
            else seen.set(key, index + 1);
        }

        if (tool.website != null && String(tool.website).trim() && !isHttpUrl(tool.website)) {
            problems.push(`${where}: "website" no es una URL http(s)`);
        }
        if (tool.docs != null && String(tool.docs).trim() && !isHttpUrl(tool.docs)) {
            problems.push(`${where}: "docs" no es una URL http(s)`);
        }
        if (tool.status != null && !STATUS_VALUES.has(String(tool.status))) {
            problems.push(`${where}: estado desconocido "${tool.status}"`);
        }
        for (const column of INTEGER_COLUMNS) {
            const value = tool[column];
            if (value == null || typeof value === "boolean") continue;
            if (!Number.isInteger(Number(value))) {
                problems.push(`${where}: "${column}" no es un entero`);
            }
        }
    });

    return problems;
}

function jsonFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(f => f.endsWith(".json"))
        .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8").replace(/^\uFEFF/, "")));
}

/** Reads the global catalog plus every country pack, so the database stays reproducible from JSON. */
export function readToolFiles(root = ROOT) {
    const countries = path.join(root, "countries");
    const packs = fs.existsSync(countries)
        ? fs.readdirSync(countries, { withFileTypes: true })
            .filter(entry => entry.isDirectory())
            .flatMap(entry => jsonFiles(path.join(countries, entry.name)))
        : [];
    return [...jsonFiles(path.join(root, "tools")).flat(), ...packs.flat()];
}

export function importTools(db, tools) {
    // All or nothing: an invalid entry cancels the import before the first row is
    // written, so the database is never left half updated.
    const problems = validateTools(tools);
    if (problems.length) {
        const error = new Error(
            `Import cancelado: ${problems.length} entrada(s) inválida(s).\n${problems.slice(0, 10).join("\n")}`
        );
        error.problems = problems;
        throw error;
    }

    // An empty catalog is almost always a failed read, not an empty corpus.
    // Importing it would delete every row, so it is refused like invalid data.
    if (!tools.length) {
        const error = new Error("Import cancelado: el catálogo está vacío (¿falló la lectura de los JSON?).");
        error.problems = [error.message];
        throw error;
    }

    const existing = new Map();
    const rows = db.exec(`SELECT id, ${COLUMNS.join(",")} FROM tools`)[0];
    for (const row of rows?.values ?? []) {
        const [id, ...values] = row;
        existing.set(String(values[0]).toLowerCase(), { id, values });
    }

    const insert = db.prepare(
        `INSERT INTO tools (${COLUMNS.join(",")}) VALUES (${COLUMNS.map(() => "?").join(",")})`
    );
    const update = db.prepare(
        `UPDATE tools SET ${COLUMNS.map(c => `${c} = ?`).join(", ")} WHERE id = ?`
    );

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const catalog = new Set(tools.map(tool => String(tool.name).toLowerCase()));

    for (const tool of tools) {
        const values = COLUMNS.map(c => {
            const v = tool[c];
            if (typeof v === "boolean") return v ? 1 : 0;
            if (v !== undefined && v !== null) return v;
            if (c === "status") return "verified";
            return INTEGER_COLUMNS.has(c) ? 0 : null;
        });
        const key = String(tool.name).toLowerCase();
        const current = existing.get(key);

        if (!current) {
            insert.run(values);
            existing.set(key, { values });
            inserted++;
            continue;
        }

        // Duplicate name inside the same JSON batch: the first entry wins.
        if (current.id === undefined) {
            skipped++;
            continue;
        }

        const changed = COLUMNS.some((column, index) =>
            String(current.values[index] ?? "") !== String(values[index] ?? "")
        );
        if (!changed) {
            skipped++;
            continue;
        }

        update.run([...values, current.id]);
        current.values = values;
        updated++;
    }

    insert.free();
    update.free();

    // The database is a build artifact of the JSON catalog, not an append-only
    // copy: an entry deleted from JSON has to disappear from the next build too.
    // This runs after validation, so a rejected batch never deletes anything.
    let removed = 0;
    for (const [key, entry] of existing) {
        if (catalog.has(key) || entry.id === undefined) continue;
        db.run("DELETE FROM tools WHERE id = ?", [entry.id]);
        removed++;
    }

    return { inserted, updated, skipped, removed };
}

async function main() {
    const SQL = await initSqlJs({ locateFile: f => path.resolve("node_modules/sql.js/dist", f) });
    const db = new SQL.Database(fs.readFileSync(DB_PATH));
    try {
        const { inserted, updated, skipped, removed } = importTools(db, readToolFiles());
        const migration = runMigrations(db);
        fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
        console.log(`Schema: ${migration.from} → ${migration.to}`);
        console.log(`Imported tools: ${inserted} inserted, ${updated} updated, ${skipped} unchanged, ${removed} removed.`);
    } catch (error) {
        // The database file keeps the previous contents: nothing was written.
        console.error(error.message);
        process.exitCode = 1;
    } finally {
        db.close();
    }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main();
}
