import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import initSqlJs from "sql.js";

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
    return { inserted, updated, skipped };
}

async function main() {
    const SQL = await initSqlJs({ locateFile: f => path.resolve("node_modules/sql.js/dist", f) });
    const db = new SQL.Database(fs.readFileSync(DB_PATH));
    const { inserted, updated, skipped } = importTools(db, readToolFiles());
    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
    db.close();
    console.log(`Imported tools: ${inserted} inserted, ${updated} updated, ${skipped} unchanged.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main();
}
