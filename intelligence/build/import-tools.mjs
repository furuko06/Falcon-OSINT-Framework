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

export function readToolFiles(root = ROOT) {
    const dir = path.join(root, "tools");
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(f => f.endsWith(".json"))
        .flatMap(f => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8").replace(/^\uFEFF/, "")));
}

export function importTools(db, tools) {
    const existing = new Set(
        (db.exec("SELECT name FROM tools")[0]?.values ?? []).map(r => String(r[0]).toLowerCase())
    );
    const stmt = db.prepare(
        `INSERT INTO tools (${COLUMNS.join(",")}) VALUES (${COLUMNS.map(() => "?").join(",")})`
    );
    let inserted = 0;
    let skipped = 0;
    for (const tool of tools) {
        const key = String(tool.name).toLowerCase();
        if (existing.has(key)) {
            skipped++;
            continue;
        }
        const values = COLUMNS.map(c => {
            const v = tool[c];
            if (typeof v === "boolean") return v ? 1 : 0;
            if (v !== undefined && v !== null) return v;
            if (c === "status") return "verified";
            return INTEGER_COLUMNS.has(c) ? 0 : null;
        });
        stmt.run(values);
        existing.add(key);
        inserted++;
    }
    stmt.free();
    return { inserted, skipped };
}

async function main() {
    const SQL = await initSqlJs({ locateFile: f => path.resolve("node_modules/sql.js/dist", f) });
    const db = new SQL.Database(fs.readFileSync(DB_PATH));
    const { inserted, skipped } = importTools(db, readToolFiles());
    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
    db.close();
    console.log(`Imported tools: ${inserted} inserted, ${skipped} already present.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main();
}
