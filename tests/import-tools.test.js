import { describe, it, expect } from "vitest";
import path from "node:path";
import initSqlJs from "sql.js";
import { importTools } from "../intelligence/build/import-tools.mjs";

const SCHEMA = `CREATE TABLE tools (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    description TEXT,
    country TEXT,
    website TEXT,
    github TEXT,
    license TEXT,
    status TEXT DEFAULT 'verified',
    offline INTEGER DEFAULT 0,
    api INTEGER DEFAULT 0,
    docker INTEGER DEFAULT 0,
    vpn_friendly INTEGER DEFAULT 0,
    tor_friendly INTEGER DEFAULT 0,
    opsec_score INTEGER DEFAULT 0,
    quality_score INTEGER DEFAULT 0,
    last_verified TEXT
)`;

async function makeDb() {
    const SQL = await initSqlJs({ locateFile: file => path.resolve("node_modules/sql.js/dist", file) });
    const db = new SQL.Database();
    db.run(SCHEMA);
    return db;
}

function rows(db) {
    return db.exec("SELECT name, description, offline FROM tools ORDER BY name")[0].values;
}

describe("tool importer", () => {
    it("inserts new tools, updates changed fields and skips unchanged ones", async () => {
        const db = await makeDb();
        const tool = { name: "Sample", category: "HUMINT", description: "Texto en inglés.", country: "GLOBAL", offline: true, quality_score: 80 };

        expect(importTools(db, [tool])).toEqual({ inserted: 1, updated: 0, skipped: 0 });
        expect(rows(db)).toEqual([["Sample", "Texto en inglés.", 1]]);

        expect(importTools(db, [tool])).toEqual({ inserted: 0, updated: 0, skipped: 1 });

        expect(importTools(db, [{ ...tool, description: "Texto en español." }])).toEqual({ inserted: 0, updated: 1, skipped: 0 });
        expect(rows(db)).toEqual([["Sample", "Texto en español.", 1]]);
        expect(db.exec("SELECT COUNT(*) FROM tools")[0].values[0][0]).toBe(1);
    });

    it("does not duplicate tools that differ only in name casing", async () => {
        const db = await makeDb();
        importTools(db, [{ name: "CaseTest", description: "Uno." }]);
        expect(importTools(db, [{ name: "casetest", description: "Dos." }])).toEqual({ inserted: 0, updated: 1, skipped: 0 });
        expect(db.exec("SELECT COUNT(*) FROM tools")[0].values[0][0]).toBe(1);
    });
});
